import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.mongodb import db_conn
from app.models.domain import User, Conversation, Message

logger = logging.getLogger("app.services.db")

# Thread-safe/Async in-memory mock data
class MemoryStore:
    def __init__(self):
        self.users: Dict[str, dict] = {}           # id -> doc
        self.users_by_email: Dict[str, dict] = {} # email -> doc
        self.conversations: Dict[str, dict] = {}   # id -> doc
        self.messages: List[dict] = []             # list of docs

mem_store = MemoryStore()

def map_doc(doc: Optional[dict]) -> Optional[dict]:
    """Helper to convert MongoDB ObjectId to string keys."""
    if doc is None:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d["_id"])
    # Convert related fields
    for field in ["user_id", "conversation_id"]:
        if field in d and d[field] is not None:
            d[field] = str(d[field])
    return d

class DBService:
    # --- USER OPERATIONS ---
    async def get_user_by_email(self, email: str) -> Optional[User]:
        if db_conn.is_mock:
            doc = mem_store.users_by_email.get(email.lower())
            return User(**doc) if doc else None
        
        doc = await db_conn.db["users"].find_one({"email": email.lower()})
        mapped = map_doc(doc)
        return User(**mapped) if mapped else None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        if db_conn.is_mock:
            doc = mem_store.users.get(user_id)
            return User(**doc) if doc else None
            
        try:
            doc = await db_conn.db["users"].find_one({"_id": ObjectId(user_id)})
            mapped = map_doc(doc)
            return User(**mapped) if mapped else None
        except Exception:
            return None

    async def create_user(self, name: str, email: str, hashed_password: str) -> User:
        now = datetime.now(timezone.utc)
        user_doc = {
            "name": name,
            "email": email.lower(),
            "password": hashed_password,
            "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={email.lower()}",
            "created_at": now
        }
        
        if db_conn.is_mock:
            uid = str(uuid.uuid4())
            user_doc["id"] = uid
            mem_store.users[uid] = user_doc
            mem_store.users_by_email[email.lower()] = user_doc
            return User(**user_doc)
            
        res = await db_conn.db["users"].insert_one(user_doc)
        user_doc["id"] = str(res.inserted_id)
        return User(**user_doc)

    # --- CONVERSATION OPERATIONS ---
    async def get_conversations(self, user_id: str) -> List[Conversation]:
        if db_conn.is_mock:
            # Filter and sort conversations by updated_at descending
            convos = [
                Conversation(**c) for c in mem_store.conversations.values() 
                if c["user_id"] == user_id
            ]
            convos.sort(key=lambda x: x.pinned, reverse=True)
            return convos
            
        cursor = db_conn.db["conversations"].find({"user_id": user_id})
        # Sort by pin status first, then by updated_at desc
        cursor.sort([("pinned", -1), ("updated_at", -1)])
        docs = await cursor.to_list(length=100)
        return [Conversation(**map_doc(doc)) for doc in docs]

    async def get_conversation(self, conversation_id: str, user_id: str) -> Optional[Conversation]:
        if db_conn.is_mock:
            doc = mem_store.conversations.get(conversation_id)
            if doc and doc["user_id"] == user_id:
                return Conversation(**doc)
            return None
            
        try:
            doc = await db_conn.db["conversations"].find_one({
                "_id": ObjectId(conversation_id),
                "user_id": user_id
            })
            mapped = map_doc(doc)
            return Conversation(**mapped) if mapped else None
        except Exception:
            return None

    async def create_conversation(self, user_id: str, title: str, model: Optional[str] = None, temperature: Optional[float] = None) -> Conversation:
        now = datetime.now(timezone.utc)
        convo_doc = {
            "user_id": user_id,
            "title": title,
            "pinned": False,
            "created_at": now,
            "updated_at": now,
            "model": model,
            "temperature": temperature
        }
        
        if db_conn.is_mock:
            cid = str(uuid.uuid4())
            convo_doc["id"] = cid
            mem_store.conversations[cid] = convo_doc
            return Conversation(**convo_doc)
            
        res = await db_conn.db["conversations"].insert_one(convo_doc)
        convo_doc["id"] = str(res.inserted_id)
        return Conversation(**convo_doc)

    async def rename_conversation(self, conversation_id: str, user_id: str, title: str) -> Optional[Conversation]:
        now = datetime.now(timezone.utc)
        if db_conn.is_mock:
            doc = mem_store.conversations.get(conversation_id)
            if doc and doc["user_id"] == user_id:
                doc["title"] = title
                doc["updated_at"] = now
                return Conversation(**doc)
            return None
            
        try:
            res = await db_conn.db["conversations"].find_one_and_update(
                {"_id": ObjectId(conversation_id), "user_id": user_id},
                {"$set": {"title": title, "updated_at": now}},
                return_document=True
            )
            mapped = map_doc(res)
            return Conversation(**mapped) if mapped else None
        except Exception:
            return None

    async def pin_conversation(self, conversation_id: str, user_id: str, pinned: bool) -> Optional[Conversation]:
        now = datetime.now(timezone.utc)
        if db_conn.is_mock:
            doc = mem_store.conversations.get(conversation_id)
            if doc and doc["user_id"] == user_id:
                doc["pinned"] = pinned
                doc["updated_at"] = now
                return Conversation(**doc)
            return None
            
        try:
            res = await db_conn.db["conversations"].find_one_and_update(
                {"_id": ObjectId(conversation_id), "user_id": user_id},
                {"$set": {"pinned": pinned, "updated_at": now}},
                return_document=True
            )
            mapped = map_doc(res)
            return Conversation(**mapped) if mapped else None
        except Exception:
            return None

    async def update_conversation_time(self, conversation_id: str, user_id: str):
        now = datetime.now(timezone.utc)
        if db_conn.is_mock:
            doc = mem_store.conversations.get(conversation_id)
            if doc and doc["user_id"] == user_id:
                doc["updated_at"] = now
            return
            
        try:
            await db_conn.db["conversations"].update_one(
                {"_id": ObjectId(conversation_id), "user_id": user_id},
                {"$set": {"updated_at": now}}
            )
        except Exception:
            pass

    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        if db_conn.is_mock:
            if conversation_id in mem_store.conversations:
                if mem_store.conversations[conversation_id]["user_id"] == user_id:
                    del mem_store.conversations[conversation_id]
                    # Also delete its messages
                    mem_store.messages = [m for m in mem_store.messages if m["conversation_id"] != conversation_id]
                    return True
            return False
            
        try:
            res = await db_conn.db["conversations"].delete_one({
                "_id": ObjectId(conversation_id),
                "user_id": user_id
            })
            if res.deleted_count > 0:
                # Delete messages associated with deleted conversation
                await db_conn.db["messages"].delete_many({"conversation_id": conversation_id})
                return True
            return False
        except Exception:
            return False

    # --- MESSAGE OPERATIONS ---
    async def get_messages(self, conversation_id: str) -> List[Message]:
        if db_conn.is_mock:
            msgs = [
                Message(**m) for m in mem_store.messages 
                if m["conversation_id"] == conversation_id
            ]
            msgs.sort(key=lambda x: x.timestamp)
            return msgs
            
        cursor = db_conn.db["messages"].find({"conversation_id": conversation_id})
        cursor.sort("timestamp", 1)  # Sort oldest first
        docs = await cursor.to_list(length=1000)
        return [Message(**map_doc(doc)) for doc in docs]

    async def create_message(self, conversation_id: str, role: str, content: str, model: Optional[str] = None) -> Message:
        now = datetime.now(timezone.utc)
        msg_doc = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "timestamp": now,
            "model": model
        }
        
        if db_conn.is_mock:
            mid = str(uuid.uuid4())
            msg_doc["id"] = mid
            mem_store.messages.append(msg_doc)
            return Message(**msg_doc)
            
        res = await db_conn.db["messages"].insert_one(msg_doc)
        msg_doc["id"] = str(res.inserted_id)
        return Message(**msg_doc)

db_service = DBService()
