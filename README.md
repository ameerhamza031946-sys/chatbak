# AI Nexus Chat

AI Nexus Chat is a modern, production-ready, full-stack AI Chatbot SaaS Web Application built to offer an interface comparable to premium AI applications like ChatGPT, Claude, and Gemini. 

It provides real-time streaming AI completions, robust conversation memory (using MongoDB or an in-memory fallback), secure user JWT sessions, fluid dark/light themes, voice input recognition, and markdown code syntax block renderings.

---

## 🚀 Key Features

*   **Secure Authentication**: Secure User login & register systems backed by salted bcrypt hashes and JWT session tokens.
*   **Multi-Model Engine**: Support for OpenAI models (`gpt-4o-mini`, `gpt-4o`) and Google Gemini models (`gemini-2.5-flash`, `gemini-1.5-pro`) on a unified toggle interface.
*   **Real-time Streaming**: Response generation powered by async Server-Sent Events (SSE) yielding instant tokens.
*   **Resilient Database Layer**: Persists chats, pins, and custom titles. Automatically connects to MongoDB Atlas if configured, or seamlessly falls back to a thread-safe in-memory datastore for instant out-of-the-box local executions.
*   **Rich Markdown & Code blocks**: Dynamic parsing of headings, tables, blockquotes, list structures, and custom code cards with language branding labels and a copy-to-clipboard button.
*   **Micro-Animations & Themes**: High-fidelity dark and light theme palettes built with glassmorphism panels, customized pill scrollbars, and Framer Motion micro-animations.
*   **Voice Recognition Dictation**: Speak directly to the assistant utilizing browser-native Web Speech recognition transcriptions.
*   **Advanced Conversational Settings**: Interactive configurations allowing creativity temperature sliding and model swaps.

---

## 🛠️ Technical Stack

### Frontend
*   **React 19** + **Vite**
*   **Tailwind CSS v4** (Modern CSS-in-JS utility compilation)
*   **Framer Motion** (Visual layout transitions)
*   **Axios** (API requests with automatic token headers interceptors)
*   **React Router v6** (Protected route layout guards)
*   **React Markdown** (High-fidelity parser)

### Backend
*   **FastAPI** (High-performance Python ASGI backend framework)
*   **Uvicorn** (ASGI server runner)
*   **Pydantic v2** (Strict runtime schemas parsing & validation)
*   **Motor** (Asynchronous MongoDB official database client)
*   **PyJWT** (JWT sign/verify utilities)
*   **Passlib (Bcrypt)** (Salted password hashing)

---

## ⚙️ Project Folder Structure

```plaintext
chat bot/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration loaders
│   │   ├── database/       # MongoDB driver initialization
│   │   ├── middleware/     # Auth dependencies
│   │   ├── models/         # Database document models
│   │   ├── routes/         # Auth, chat, & system API routers
│   │   ├── schemas/        # Pydantic validation structures
│   │   ├── services/       # DB mapping & OpenAI/Gemini streams
│   │   ├── utils/          # Encryption & JWT helpers
│   │   └── main.py         # Entrypoint containing CORS configurations
│   ├── .env.example        # Environment parameters template
│   ├── .env                # App active configurations
│   └── requirements.txt    # Python package dependencies
│
└── frontend/
    ├── src/
    │   ├── assets/         # Favicons & graphics assets
    │   ├── components/     # Window, Sidebar, Input, Settings UI
    │   ├── context/        # Theme, Auth, & Chat state providers
    │   ├── pages/          # Landing, Sign In, Sign Up, & Chat views
    │   ├── services/       # Axios wrappers and base urls
    │   ├── App.css         # Reset styles sheet
    │   ├── index.css       # Tailwind v4 directives and CSS variables
    │   ├── App.jsx         # App router tree
    │   └── main.jsx        # Root renderer
    ├── index.html          # Shell wrapper loading Google Fonts
    ├── vite.config.js      # Vite compilation settings
    └── package.json        # Library dependencies
```

---

## 📦 Setup & Installation

### Prerequisite Systems
Ensure you have the following installed on your machine:
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js 18+](https://nodejs.org/en/download)

---

### Step 1: Configure the Backend

1.  Navigate into the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # On Windows:
    venv\Scripts\activate
    # On Mac/Linux:
    source venv/bin/activate
    ```
3.  Install python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment keys in `.env` (a local `.env` has been created by default):
    Open `backend/.env` and update the parameters:
    ```env
    OPENAI_API_KEY=your_key_here
    GEMINI_API_KEY=your_key_here
    MONGODB_URL=mongodb+srv://... (leave blank for automatic in-memory storage)
    ```

---

### Step 2: Configure the Frontend

1.  Navigate into the `frontend/` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```
3.  Configure API endpoint base urls (Optional, defaults to `http://localhost:8000`):
    If your backend runs on a different address, create a `frontend/.env` file and append:
    ```env
    VITE_API_BASE_URL=http://your-backend-address:port
    ```

---

## 🚀 Running the Application Locally

To test the application, run both servers concurrently.

### 1. Launch the Backend Server
From the `backend/` directory:
```bash
python app/main.py
# Or using uvicorn manually:
uvicorn app.main:app --reload --port 8000
```
*   The backend will start running at: `http://localhost:8000`
*   You can access the interactive API docs at: `http://localhost:8000/docs`

### 2. Launch the Frontend Server
From the `frontend/` directory:
```bash
npm run dev
```
*   Vite will host the frontend at: `http://localhost:5173`
*   Open the link in your web browser.

---

## 🔒 Security Architecture

*   **Bcrypt Password Salted Hashing**: Cleartext passwords never reach storage; they are salted and hashed on the backend before write operations.
*   **JWT session verification**: Secured routes (like fetching chat transcripts, deleting logs) require a validation bearer token in the HTTP Authorization headers.
*   **CORS Protection**: Access control configurations on the FastAPI server limit allowed request origins to protect resources.
