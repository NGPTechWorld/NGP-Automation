<div align="center">

# ⬡ Vibe Automation Studio

**A full-stack visual workflow automation platform with AI-powered natural language control**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-6366F1?style=flat-square)](https://openrouter.ai)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

<br/>

> Build automation workflows visually — or just tell VibeBot what you want.

<br/>

![Vibe Automation Studio Preview](https://via.placeholder.com/900x400/1E1B4B/6366F1?text=Vibe+Automation+Studio)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Node Types](#-node-types)
- [API Reference](#-api-reference)
- [VibeBot AI Agent](#-vibebot-ai-agent)
- [Architecture](#-architecture)
- [Roadmap](#-roadmap)
- [Changelog](#-changelog)

---

## 🚀 Overview

Vibe Automation Studio is a browser-based visual workflow builder. Users drag and drop nodes onto a canvas, connect them, and execute them — all in real time. An integrated AI assistant called **VibeBot** lets you generate and run workflows using plain English or Arabic.

---

## ✨ Features

- 🎨 **Visual canvas** — drag, drop, connect, and edit nodes
- 🤖 **VibeBot** — AI agent that builds and runs workflows from natural language
- 🌐 **Bilingual** — full English and Arabic (RTL) support
- 🌙 **Dark / Light** theme toggle
- 📁 **Project manager** — save, load, and delete workflows
- 📟 **Live console** — color-coded real-time execution logs
- ⚡ **13 node types** — covering control flow, data, transforms, and API calls
- 🔄 **Polling-based log streaming** — no websockets needed

---

## 🛠 Tech Stack

| Layer     | Technology              | Purpose                                      |
|-----------|-------------------------|----------------------------------------------|
| Frontend  | React 18 + Vite         | UI, canvas, node editor, AI chat panel       |
| Backend   | Node.js + Express       | REST API, workflow execution engine          |
| AI        | OpenRouter API          | Natural language workflow generation         |
| Styling   | Inline CSS (JS objects) | Theming, RTL layout, dark/light mode         |
| State     | React useState/useRef   | Canvas state, project management             |
| IDs       | uuid v4                 | Project and run identifier generation        |

---

## 📂 Project Structure

```
vibe-automation/
├── backend/
│   ├── server.js              ← Express API + workflow execution engine
│   ├── package.json
│   └── .env.example                   ← PORT config
│
└── frontend/
    ├── src/
    │   ├── App.jsx            ← Layout shell + VibeBot chat panel
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start

### 1. Backend

```bash
cd backend
npm install
node server.js
# ✅ Running on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# ✅ Running on http://localhost:5173
```

### 3. VibeBot Setup

1. Open the app in your browser
2. Click the **🤖 VibeBot** button in the toolbar
3. Enter your [OpenRouter API key](https://openrouter.ai)
4. Start chatting

> **Note:** The API key is stored in `localStorage` and sent per-request via the `X-API-Key` header. It is never persisted on the server.

---

## 🧩 Node Types

| Node        | Color     | Data Fields         | Description                                                              |
|-------------|-----------|---------------------|--------------------------------------------------------------------------|
| `start`     | 🟢 Green  | —                   | Entry point. Every workflow must begin here.                             |
| `end`       | 🔴 Red    | —                   | Terminates the workflow.                                                 |
| `log`       | ⚪ White  | `text`              | Prints a message to the console.                                         |
| `color`     | 🩷 Pink   | `text`, `color`     | Prints a colored message. Supports hex colors.                           |
| `delay`     | 🟡 Amber  | `ms`                | Pauses execution (max 5000ms).                                           |
| `input`     | 🔵 Cyan   | `label`, `default`  | Defines an input variable with a default value.                          |
| `transform` | 🟢 Teal   | `text`, `op`        | String transform: `uppercase`, `lowercase`, `reverse`, or `trim`.        |
| `merge`     | 🟣 Indigo | `a`, `b`, `c`       | Joins up to 3 text values with ` + ` separator.                          |
| `condition` | 🟠 Orange | `value`, `op`, `compare` | Branches flow via `==`, `!=`, `>`, `<`, `>=`, `<=`.               |
| `loop`      | 🩷 Pink   | `count`             | Iterates N times (max 50) then continues.                                |
| `api`       | 🩵 Teal   | `url`, `method`     | Makes an HTTP request and logs the JSON response.                        |
| `variable`  | 🟣 Purple | `key`, `value`      | Stores a named variable for downstream use.                              |
| `clear`     | ⬛ Gray   | —                   | Clears the execution console.                                            |

---

## 📡 API Reference

Base URL: `http://localhost:3001`

### Projects

| Method   | Endpoint              | Body                          | Description                        |
|----------|-----------------------|-------------------------------|------------------------------------|
| `GET`    | `/api/projects`       | —                             | Returns all saved projects         |
| `GET`    | `/api/projects/:id`   | —                             | Returns a single project           |
| `POST`   | `/api/projects`       | `{ id?, name, nodes, conns }` | Creates or updates a project       |
| `DELETE` | `/api/projects/:id`   | —                             | Deletes a project                  |

### Workflow Execution

| Method | Endpoint                    | Body / Query       | Description                              |
|--------|-----------------------------|--------------------|------------------------------------------|
| `POST` | `/api/run`                  | `{ nodes, conns }` | Starts async execution → returns `runId` |
| `GET`  | `/api/run/:runId/logs`      | `?since=N`         | Returns log entries from index N onward  |

### AI Agent

| Method | Endpoint      | Headers          | Body                                        |
|--------|---------------|------------------|---------------------------------------------|
| `POST` | `/api/agent`  | `X-API-Key: ...` | `{ message, currentWorkflow, history[] }`   |

#### Agent Response Format

```json
// Chat
{ "action": "chat", "message": "..." }

// Build workflow
{ "action": "build", "workflow": { "nodes": [...], "conns": [...] }, "message": "..." }

// Run current workflow
{ "action": "run", "message": "..." }
```

---

## 🤖 VibeBot AI Agent

VibeBot is powered by OpenRouter (`openai/gpt-4o-mini` by default). It auto-detects your language and responds in kind.

### Actions

| Action  | Trigger Examples                               | Result                                    |
|---------|------------------------------------------------|-------------------------------------------|
| `chat`  | "hello", "what can you do?", any question      | Conversational reply                      |
| `build` | "build a workflow that...", "create an automation" | Generates nodes + connections on canvas |
| `run`   | "run", "execute", "شغل", "تشغيل"              | Runs the current workflow                 |

### Example Prompts

```
Build a workflow that logs "Hello" then waits 2 seconds
Create a loop that runs 5 times then logs "Done"
Make a condition: if 10 > 5 log TRUE, else log FALSE
Build a workflow with a variable name = "Meme" then log it
ابنيلي workflow يطبع مرحبا ثم ينتظر ثانيتين
شغل
```

---

## 🏗 Architecture

### Execution Flow

```
User clicks Run
     │
     ▼
POST /api/run { nodes, conns }
     │
     ▼
Backend: assign runId → start executeWorkflow() async
     │
     ▼
Respond immediately: { runId }
     │
     ▼
Frontend polls GET /api/run/:runId/logs?since=N  (every 300ms)
     │
     ▼
Append new log entries to console
     │
     ▼
Stop polling when { done: true } received
     │
     ▼
Backend cleans up after 5 minutes
```

### AI Agent Flow

```
User types message
     │
     ▼
POST /api/agent { message, currentWorkflow, history }
     │
     ▼
Build messages: [system prompt] + [last 10 history] + [user message]
     │
     ▼
Forward to OpenRouter API
     │
     ▼
Parse response as JSON action
     │
     ├── action: "build" → load workflow onto canvas
     ├── action: "run"   → trigger execution
     └── action: "chat"  → show message in panel
```

### Known Limitations

| Limitation          | Notes                                                          |
|---------------------|----------------------------------------------------------------|
| In-memory storage   | Projects reset on server restart — replace with a database     |
| No authentication   | All endpoints are public                                       |
| Single-user model   | No multi-user isolation                                        |
| Max 100 steps/run   | Hard limit to prevent infinite loops                           |
| Max 5s delay        | Delay nodes capped at 5000ms                                   |

---

## 🗺 Roadmap

### Backend
- [ ] Replace in-memory store with SQLite / MongoDB / PostgreSQL
- [ ] JWT authentication and per-user project isolation
- [ ] Server-Sent Events (SSE) instead of polling
- [ ] Webhook node type for external triggers
- [ ] Rate limiting and execution queue

### Frontend
- [ ] Undo/redo history
- [ ] Node copy/paste and multi-select
- [ ] Minimap for large workflows
- [ ] Export workflow as JSON or shareable URL
- [ ] Keyboard shortcuts panel

### VibeBot
- [ ] Support more models (Claude, Gemini, Llama)
- [ ] Workflow explanation mode
- [ ] Error diagnosis — analyze failed runs and suggest fixes
- [ ] Voice input support

---

## 📋 Changelog

| Version  | Date  | Changes                                                                               |
|----------|-------|---------------------------------------------------------------------------------------|
| `v1.0.0` | 2025  | Initial release — canvas, 13 node types, bilingual UI, VibeBot, project management   |
| `v0.9.0` | 2025  | Fixed OpenRouter integration: message format, response parsing, fetch error handling  |
| `v0.8.0` | 2025  | Added VibeBot AI agent with build, run, and chat actions                              |
| `v0.7.0` | 2025  | Backend workflow execution engine with polling-based log streaming                    |
| `v0.6.0` | 2025  | Project management: save, load, delete with in-memory store                           |

---

<div align="center">

**© 2025 NGP Studio** &nbsp;•&nbsp; Made with Vibe

</div>