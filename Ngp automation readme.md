# ⚡ NGP Automation

> **Visual Automation Engine** — محرك الأتمتة البصري

A node-based visual workflow automation tool built with React. Design, connect, and execute automation pipelines directly in your browser — no backend required.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Node Reference](#node-reference)
- [Execution Engine](#execution-engine)
- [Project System](#project-system)
- [UI & Controls](#ui--controls)
- [Themes](#themes)
- [Internationalization](#internationalization)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Tech Stack](#tech-stack)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Roadmap](#roadmap)

---

## Overview

**NGP Automation** is a fully client-side, browser-based visual automation builder. Users drag nodes onto an infinite canvas, connect them with wires, configure their properties in an inspector panel, and execute the resulting workflow — all with live visual feedback showing which node is currently running.

```
Start → Input → Transform → Log → Condition ──true──→ API → End
                                             └─false──→ Alert → End
```

---

## Features

| Feature | Description |
|---|---|
| 🧩 **16 Node Types** | Control, Basic, Intermediate, and Advanced nodes |
| 🔗 **Visual Wiring** | Drag from output port to input port to connect nodes |
| ▶ **Live Execution** | Step-by-step workflow execution with animated node highlighting |
| 💾 **Project System** | Save, load, rename, and delete multiple named projects via `localStorage` |
| 🌐 **Bilingual UI** | Full Arabic (RTL) and English (LTR) support, switchable at runtime |
| 🎨 **5 Themes** | Dark, Light, Midnight, Forest, Rose — persisted across sessions |
| ⌨️ **Keyboard Delete** | Press `Delete` or `Backspace` to remove the selected node |
| 🔍 **Inspector Panel** | Click any node to edit its properties live |
| 📋 **Console Log** | Execution output with color-coded, timestamped entries |
| 🔁 **Real Loops** | Loop node with separate `body` and `out` ports |
| 🌐 **Real API Calls** | API node performs live `fetch()` requests |
| ♾️ **Infinite Canvas** | Pan (Alt+drag), zoom (scroll wheel), reset view |

---

## Getting Started

### Option 1 — Vite (Recommended)

```bash
npm create vite@latest ngp-automation -- --template react
cd ngp-automation
npm install
```

Replace `src/App.jsx` with `NGP-Automation.jsx`, then:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Option 2 — StackBlitz / CodeSandbox

1. Go to [stackblitz.com/fork/react](https://stackblitz.com/fork/react)
2. Replace the default `App.jsx` with the contents of `NGP-Automation.jsx`
3. The app runs instantly — no install needed

### Option 3 — Create React App

```bash
npx create-react-app ngp-automation
cd ngp-automation
```

Replace `src/App.js` with `NGP-Automation.jsx` (rename to `.js`), then:

```bash
npm start
```

---

## Node Reference

### 🟢 Control Nodes

| Node | Icon | Inputs | Outputs | Description |
|---|---|---|---|---|
| **Start** | 🟢 | — | `out` | Entry point. Every workflow must begin here. |
| **End** | 🔴 | `in` | — | Terminates the workflow execution. |
| **Clear Console** | ⬜ | `in` | `out` | Clears all console log entries. |

### 🔵 Basic Nodes

| Node | Icon | Inputs | Outputs | Description |
|---|---|---|---|---|
| **Log** | 🔵 | `in`, `text` | `out` | Prints a plain text message to the console. |
| **Color Log** | 🟣 | `in`, `text`, `color` | `out` | Prints a message in a chosen hex color. |

### 🟠 Intermediate Nodes

| Node | Icon | Inputs | Outputs | Description |
|---|---|---|---|---|
| **Input** | 🩵 | `in` | `out`, `value` | Defines a named input with a default value. Continues the flow via `out`. |
| **Delay** | 🟠 | `in`, `ms` | `out` | Pauses execution for the given number of milliseconds (max 8000ms). |
| **Transform** | 🟢 | `in`, `text` | `out`, `result` | Transforms text: uppercase, lowercase, reverse, trim, snake_case, camelCase. |
| **Merge** | ⬜ | `in`, `a`, `b`, `c` | `out` | Concatenates up to 3 text values separated by spaces. |

### 🔴 Advanced Nodes

| Node | Icon | Inputs | Outputs | Description |
|---|---|---|---|---|
| **Condition** | 🟠 | `in`, `value`, `compare` | `true`, `false` | Branches flow based on a comparison (`==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`). |
| **Loop** | 🩷 | `in` | `body`, `out` | Repeats the `body` branch N times, then continues to `out`. Max 50 iterations. |
| **API** | 🟢 | `in`, `url`, `method` | `out`, `response` | Performs a real `fetch()` HTTP request. Supports GET, POST, PUT, PATCH, DELETE. |
| **Variable** | 🟣 | `in`, `key`, `value` | `out`, `stored` | Stores a value in a shared runtime variable store accessible during execution. |

---

## Execution Engine

The execution engine traverses the workflow graph recursively starting from the **Start** node.

### How It Works

```
1. Find the Start node
2. Call execNode(startNode, depth=0)
3. Each node:
   a. Highlights itself (flash animation + glow)
   b. Waits 220ms (visual feedback)
   c. Performs its logic
   d. Calls execNode(nextNode) for the connected output
4. Execution ends when:
   - An End node is reached
   - A dead end (no connection) is hit
   - The Stop button is pressed
   - depth > 300 (infinite loop guard)
```

### Variable Sharing

All nodes share a `vars` object during a single execution run. The **Variable** node writes to it, and future nodes in the same run can reference stored values.

### Real API Calls

The **API** node performs a real `fetch()` to the configured URL. The first 100 characters of the JSON response are printed to the console. The full parsed response is stored in `vars.__api_<nodeId>`.

### Loop Body

The **Loop** node has two output ports:
- `body` — connects to the sub-graph that runs on each iteration
- `out` — continues after all iterations are complete

```
Loop (count=3)
  ├─ body → Log("iteration") → [dead end, loop repeats]
  └─ out  → End
```

---

## Project System

Projects are saved to `localStorage` under the key `ngp_projects`.

### Operations

| Action | How |
|---|---|
| **Save** | Click `💾 Save` in the toolbar |
| **Create New** | Open Projects modal → type a name → press Enter or `+ New` |
| **Open** | Open Projects modal → click `Open` next to a project |
| **Rename** | Click the project name in the toolbar → type → press Enter |
| **Delete** | Open Projects modal → click 🗑 next to a project |

### Data Model

Each saved project contains:

```json
{
  "id": "p1718000000000",
  "name": "My Workflow",
  "nodes": [ { "id": "n1", "type": "start", "x": 80, "y": 180, "data": {} } ],
  "conns": [ { "id": "c1", "src": "n1", "sp": "out", "dst": "n2", "dp": "in" } ],
  "savedAt": 1718000000000
}
```

---

## UI & Controls

### Canvas

| Action | Input |
|---|---|
| **Pan** | Hold `Alt` + drag, or middle-mouse drag |
| **Zoom** | Scroll wheel (zoom centers on cursor) |
| **Reset View** | Click `⌂` in the toolbar |
| **Add Node** | Drag a node type from the sidebar onto the canvas |
| **Select Node** | Click on a node |
| **Move Node** | Click and drag a node |
| **Delete Node** | Select a node → press `Delete` or `Backspace`, or click 🗑 in toolbar |
| **Connect Nodes** | Drag from an output port (filled dot) to an input port (hollow dot) |
| **Delete Connection** | Click on a wire/edge |
| **Deselect** | Click on empty canvas |

### Inspector Panel

Click any node to open its properties in the right panel. Fields update the node immediately — no confirmation needed.

### Console Panel

Located below the inspector on the right side. Shows timestamped, color-coded log entries from the most recent execution. Scrolls automatically to the latest entry.

---

## Themes

5 built-in themes, selectable from the toolbar. The choice persists across sessions via `localStorage`.

| Theme | Key | Accent Color | Style |
|---|---|---|---|
| 🌙 **Dark** | `dark` | `#58a6ff` | GitHub-style dark |
| ☀️ **Light** | `light` | `#0969da` | GitHub-style light |
| 🔮 **Midnight** | `midnight` | `#a78bfa` | Deep purple |
| 🌿 **Forest** | `forest` | `#3fb950` | Dark green |
| 🌸 **Rose** | `rose` | `#f472b6` | Pink/magenta |

---

## Internationalization

The UI supports two languages, switchable at any time via the `AR / EN` toggle in the toolbar. **Switching language does not reset the canvas.**

| Language | Code | Direction |
|---|---|---|
| Arabic | `ar` | RTL |
| English | `en` | LTR |

The selected language is persisted to `localStorage` under `ngp_lang`. All node labels, port names, console messages, and UI strings switch simultaneously.

---

## Architecture

```
NGP-Automation.jsx
│
├── Constants
│   ├── T{}          — Translation strings (ar / en)
│   ├── THEMES{}     — Theme color tokens (5 themes)
│   ├── NODES{}      — Node type definitions (label, color, ports, category)
│   ├── DEFAULTS{}   — Default field values per node type
│   ├── FIELD_LABELS{}  — Human-readable field names per language
│   └── FIELDS{}     — Which fields each node exposes in inspector
│
├── Components
│   ├── App()           — Main component, all state lives here
│   ├── ProjectsModal() — Project management overlay
│   ├── TBtn()          — Toolbar button with hover state
│   ├── Bdg()           — Badge (project count indicator)
│   └── PortDot()       — Individual input/output port dot on a node
│
├── State
│   ├── Canvas: nodes, conns, pan, zoom, dragging, connecting, mouse
│   ├── Selection: selected node id
│   ├── Execution: running, activeNode, visitedNodes, logs, stopRef, vars
│   └── Projects: projects[], curProjId, projName, saveFlash
│
└── Execution Engine (async, recursive)
    ├── runWorkflow()     — Entry point, builds node map, calls exec(startNode)
    ├── exec(node, depth) — Recursive node executor
    └── stopRef.current   — Shared mutable ref for stop signal
```

### Connection Model

```js
// A connection object
{
  id:  "c1234",   // unique id
  src: "nAAA",    // source node id
  sp:  "out",     // source port name
  dst: "nBBB",    // destination node id
  dp:  "in",      // destination port name
}
```

Port names are always English internally (e.g. `"out"`, `"in"`, `"true"`, `"false"`, `"value"`, `"result"`), regardless of the display language.

---

## File Structure

```
ngp-automation/
├── src/
│   └── App.jsx          ← NGP-Automation.jsx goes here
├── index.html
├── package.json
└── vite.config.js
```

For Vite, `index.html` should include:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

And `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18+ | UI framework, all state via hooks |
| **Vite** | 5+ | Build tool and dev server |
| No UI library | — | All styling is inline `style={{}}` props |
| No state manager | — | `useState` + `useRef` + `useCallback` |
| No router | — | Single-page application |
| `localStorage` | Browser API | Persist projects, language, theme |
| `fetch()` | Browser API | API node HTTP requests |

Zero external dependencies beyond React itself.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Delete` / `Backspace` | Delete the selected node (and its connections) |
| `Alt` + Drag | Pan the canvas |
| Scroll Wheel | Zoom in / out (centered on cursor) |
| `Enter` | Confirm project name edit / submit new project name |
| `Escape` | Cancel project name edit |

---

## Roadmap

### Planned Features

- [ ] **Undo / Redo** — `Ctrl+Z` / `Ctrl+Y` history stack
- [ ] **Multi-select** — Shift+click or drag-select multiple nodes
- [ ] **Copy / Paste nodes** — `Ctrl+C` / `Ctrl+V`
- [ ] **Sub-flows** — Group nodes into reusable components
- [ ] **Export workflow** — Download as JSON file
- [ ] **Import workflow** — Upload a JSON workflow file
- [ ] **Execution history** — Timeline of past runs with replay
- [ ] **Scheduler node** — Trigger workflows on a cron/interval
- [ ] **Email node** — Send email via SMTP/API
- [ ] **Webhook node** — Listen for incoming HTTP requests
- [ ] **Database node** — Query/write to an external database
- [ ] **Code node** — Run arbitrary JavaScript inline
- [ ] **Comment node** — Sticky notes on the canvas
- [ ] **Auto-layout** — Automatically arrange nodes in a DAG layout
- [ ] **Minimap** — Overview thumbnail for large workflows
- [ ] **Collaboration** — Multi-user real-time editing via WebSocket

---

## License

MIT — free to use, modify, and distribute.

---

<div align="center">

**NGP Automation** · Built with React · Zero dependencies

*Visual automation for everyone*

</div>