import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import api, { API_BASE_URL } from "../services/api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.7);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const abortControllerRef = useRef(null);

  // Fetch available AI models
  const fetchModels = async () => {
    try {
      const res = await api.get("/models");
      setModels(res.data);
      // Select the first active/enabled model if available
      const active = res.data.find(m => m.active);
      if (active) setSelectedModel(active.id);
    } catch (err) {
      console.error("Error loading models", err);
    }
  };

  // Fetch conversation sessions
  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    setLoadingHistory(true);
    try {
      const res = await api.get("/chat/history");
      setConversations(res.data);
    } catch (err) {
      console.error("Error loading history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load messages for the selected conversation
  const fetchMessages = async (convoId) => {
    if (!convoId) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/${convoId}`);
      setMessages(res.data.messages);
      if (res.data.model) setSelectedModel(res.data.model);
      if (res.data.temperature !== null && res.data.temperature !== undefined) {
        setTemperature(res.data.temperature);
      }
    } catch (err) {
      console.error("Error loading messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Trigger reloading of history and models when logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
      fetchModels();
    } else {
      setConversations([]);
      setActiveConvoId(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (activeConvoId) {
      fetchMessages(activeConvoId);
    } else {
      setMessages([]);
    }
  }, [activeConvoId]);

  // Create clean conversation session
  const createNewChat = () => {
    if (isStreaming) stopStream();
    setActiveConvoId(null);
    setMessages([]);
  };

  // Send prompt and read streamed responses
  const sendMessage = async (content) => {
    if (!content.trim() || isStreaming) return;

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Build temporary user message
    const tempUserMsg = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: content,
      timestamp: new Date().toISOString()
    };

    // Build temporary assistant placeholder
    const tempAiMsg = {
      id: `temp-ai-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      model: selectedModel
    };

    setMessages((prev) => [...prev, tempUserMsg, tempAiMsg]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          content,
          conversation_id: activeConvoId,
          model: selectedModel,
          temperature: parseFloat(temperature)
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine.startsWith("data: ")) continue;

          const jsonStr = cleanLine.slice(6);
          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "metadata") {
              // If it's a new conversation, backend returned conversation ID and title
              if (event.conversation_id && event.conversation_id !== activeConvoId) {
                setActiveConvoId(event.conversation_id);
                // Trigger sidebar list reload
                fetchHistory();
              }
            } else if (event.type === "content") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + event.delta
                  };
                }
                return updated;
              });
            } else if (event.type === "done") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    id: event.message_id // Replace temp id with real db id
                  };
                }
                return updated;
              });
              setIsStreaming(false);
              fetchHistory(); // Refresh metadata list (title, timestamps)
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (err) {
            console.error("Error parsing streaming frame:", err);
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Chat generation stopped by user.");
      } else {
        console.error("Streaming request failed:", err);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + `\n\n*(Error during generation: ${err.message})*`
            };
          }
          return updated;
        });
      }
      setIsStreaming(false);
      fetchHistory();
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Halt generation stream
  const stopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // Regenerate last assistant response
  const regenerateLastMessage = async () => {
    if (messages.length < 2 || isStreaming) return;
    
    // Find last user message
    let lastUserPrompt = "";
    let removeCount = 0;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserPrompt = messages[i].content;
        removeCount = messages.length - i;
        break;
      }
    }
    
    if (lastUserPrompt) {
      // Remove assistant message and user message from stack to send again
      setMessages((prev) => prev.slice(0, prev.length - removeCount));
      await sendMessage(lastUserPrompt);
    }
  };

  // Rename convo in sidebar
  const renameConversation = async (convoId, newTitle) => {
    try {
      const res = await api.put(`/chat/${convoId}/rename`, { title: newTitle });
      setConversations((prev) =>
        prev.map((c) => (c.id === convoId ? { ...c, title: res.data.title } : c))
      );
      return { success: true };
    } catch (err) {
      console.error("Rename conversation failed:", err);
      return { success: false, error: err.response?.data?.detail || "Rename failed." };
    }
  };

  // Pin / unpin conversation
  const pinConversation = async (convoId, pinnedState) => {
    try {
      const res = await api.put(`/chat/${convoId}/pin?pinned=${pinnedState}`);
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === convoId ? { ...c, pinned: res.data.pinned } : c
        );
        // Re-sort so pinned items remain on top
        return updated.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      });
    } catch (err) {
      console.error("Pin operation failed:", err);
    }
  };

  // Delete convo
  const deleteConversation = async (convoId) => {
    try {
      await api.delete(`/chat/${convoId}`);
      setConversations((prev) => prev.filter((c) => c.id !== convoId));
      if (activeConvoId === convoId) {
        setActiveConvoId(null);
        setMessages([]);
      }
      return { success: true };
    } catch (err) {
      console.error("Delete conversation failed:", err);
      return { success: false, error: "Delete failed." };
    }
  };

  // Export chat as JSON download
  const exportConversation = async (convoId) => {
    try {
      const res = await api.get(`/chat/${convoId}/export`);
      const fileData = JSON.stringify(res.data, null, 2);
      const blob = new Blob([fileData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${res.data.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export conversation failed:", err);
    }
  };

  // Filter conversations based on sidebar query
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ChatContext.Provider
      value={{
        conversations: filteredConversations,
        activeConvoId,
        setActiveConvoId,
        messages,
        models,
        selectedModel,
        setSelectedModel,
        temperature,
        setTemperature,
        isStreaming,
        loadingHistory,
        loadingMessages,
        searchQuery,
        setSearchQuery,
        sendMessage,
        createNewChat,
        stopStream,
        regenerateLastMessage,
        renameConversation,
        pinConversation,
        deleteConversation,
        exportConversation,
        refreshHistory: fetchHistory
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
