import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

let projects = []
let runLogs = {}

const sleep = ms => new Promise(r => setTimeout(r, Math.min(ms, 5000)))

async function executeWorkflow (nodes, conns, onLog) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
  const vars = {}
  let steps = 0

  function nextFrom (nodeId, port) {
    const c = conns.find(c => c.src === nodeId && c.srcPort === port)
    return c ? nodeMap[c.dst] : null
  }

  function getInputValue (nodeId, port, depth = 0) {
    if (depth > 10) return ''
    const c = conns.find(c => c.dst === nodeId && c.dstPort === port)
    if (!c) {
      const n = nodeMap[nodeId]
      return n?.data?.[port] ?? ''
    }
    const srcNode = nodeMap[c.src]
    if (!srcNode) return ''
    return evalOutput(srcNode, c.srcPort, depth + 1)
  }

  function evalOutput (node, port, depth = 0) {
    if (depth > 10) return ''
    if (node.type === 'variable') {
      const k = getInputValue(node.id, 'key', depth + 1) || node.data.key || ''
      return vars[k] ?? (node.data.value || '')
    }
    if (node.type === 'input') return node.data.default || ''
    if (node.type === 'transform') {
      let tx = getInputValue(node.id, 'text', depth + 1) || node.data.text || ''
      const op = node.data.op || 'uppercase'
      if (op === 'uppercase') tx = tx.toUpperCase()
      else if (op === 'lowercase') tx = tx.toLowerCase()
      else if (op === 'reverse') tx = [...tx].reverse().join('')
      else if (op === 'trim') tx = tx.trim()
      return tx
    }
    if (node.type === 'merge') {
      const a = getInputValue(node.id, 'a', depth + 1) || node.data.a || ''
      const b = getInputValue(node.id, 'b', depth + 1) || node.data.b || ''
      const c = getInputValue(node.id, 'c', depth + 1) || node.data.c || ''
      return [a, b, c].filter(Boolean).join(' + ')
    }
    if (node.type === 'log' || node.type === 'color') {
      return getInputValue(node.id, 'text', depth + 1) || node.data.text || ''
    }
    return node.data[port] ?? ''
  }

  async function execNode (node, depth = 0) {
    if (!node || depth > 200 || ++steps > 100) {
      if (steps > 100)
        onLog({ text: '⚠ Execution limit reached (100 steps)', color: '#f59e0b' })
      return
    }

    const d = node.data

    switch (node.type) {
      case 'start':
        onLog({ text: '◉ Start', color: '#22c55e', bold: true })
        await sleep(100)
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break

      case 'end':
        onLog({ text: '◉ End', color: '#ef4444', bold: true })
        break

      case 'log': {
        const text = getInputValue(node.id, 'text') || d.text || ''
        onLog({ text: `📝 ${text}`, color: '#e2e8f0' })
        await sleep(80)
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break
      }

      case 'color': {
        const text = getInputValue(node.id, 'text') || d.text || ''
        const color = getInputValue(node.id, 'color') || d.color || '#fff'
        onLog({ text: `🎨 ${text}`, color })
        await sleep(80)
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break
      }

      case 'delay': {
        const ms = Math.min(5000, parseInt(d.ms) || 1000)
        onLog({ text: `⏳ Waiting ${ms}ms...`, color: '#f59e0b' })
        await sleep(ms)
        onLog({ text: '✓ Done waiting', color: '#64748b' })
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break
      }

      case 'input': {
        const lbl = d.label || 'Input'
        const val = d.default || ''
        onLog({ text: `📥 ${lbl}: "${val}"`, color: '#06b6d4' })
        vars[`__input_${node.id}`] = val
        break
      }

      case 'transform': {
        let tx = getInputValue(node.id, 'text') || d.text || ''
        const op = d.op || 'uppercase'
        if (op === 'uppercase') tx = tx.toUpperCase()
        else if (op === 'lowercase') tx = tx.toLowerCase()
        else if (op === 'reverse') tx = [...tx].reverse().join('')
        else if (op === 'trim') tx = tx.trim()
        onLog({ text: `🔄 ${op} → "${tx}"`, color: '#10b981' })
        vars[`__transform_${node.id}`] = tx
        await sleep(80)
        await execNode(nextFrom(node.id, 'result'), depth + 1)
        break
      }

      case 'merge': {
        const a = d.a || '', b = d.b || '', c = d.c || ''
        const merged = [a, b, c].filter(Boolean).join(' + ')
        onLog({ text: `🔀 Merge → "${merged}"`, color: '#6366f1' })
        vars[`__merge_${node.id}`] = merged
        await sleep(80)
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break
      }

      case 'condition': {
        const val = parseFloat(d.value) || d.value || ''
        const cmp = parseFloat(d.compare) || d.compare || ''
        const op = d.op || '=='
        let result = false
        if (op === '==') result = String(val) === String(cmp)
        else if (op === '!=') result = String(val) !== String(cmp)
        else if (op === '>') result = parseFloat(val) > parseFloat(cmp)
        else if (op === '<') result = parseFloat(val) < parseFloat(cmp)
        else if (op === '>=') result = parseFloat(val) >= parseFloat(cmp)
        else if (op === '<=') result = parseFloat(val) <= parseFloat(cmp)
        onLog({
          text: `🔀 Condition: ${d.value} ${op} ${d.compare} → ${result ? 'TRUE ✓' : 'FALSE ✗'}`,
          color: result ? '#22c55e' : '#ef4444'
        })
        await sleep(120)
        await execNode(nextFrom(node.id, result ? 'true' : 'false'), depth + 1)
        break
      }

      case 'loop': {
        const count = Math.min(50, parseInt(d.count) || 3)
        onLog({ text: `🔁 Loop × ${count}`, color: '#ec4899', bold: true })
        for (let i = 1; i <= count; i++) {
          onLog({ text: `  · Iteration ${i}/${count}`, color: '#ec4899' })
          await sleep(100)
        }
        onLog({ text: '✓ Loop done', color: '#64748b' })
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break
      }

      case 'api': {
        const url = d.url || ''
        const method = d.method || 'GET'
        onLog({ text: `🌐 ${method} ${url}...`, color: '#14b8a6' })
        try {
          const resp = await fetch(url, { method })
          const data = await resp.json().catch(() => ({}))
          onLog({ text: `✓ Response: ${JSON.stringify(data).slice(0, 100)}`, color: '#22c55e' })
          vars[`__api_${node.id}`] = JSON.stringify(data)
        } catch (e) {
          onLog({ text: `❌ Error: ${e.message}`, color: '#ef4444' })
        }
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break
      }

      case 'variable': {
        const key = d.key || 'myVar'
        const val = d.value || ''
        vars[key] = val
        onLog({ text: `📦 ${key} = "${val}"`, color: '#a855f7' })
        await execNode(nextFrom(node.id, 'stored'), depth + 1)
        break
      }

      case 'clear':
        onLog({ text: '🧹 Console cleared', color: '#64748b', clear: true })
        await execNode(nextFrom(node.id, 'out'), depth + 1)
        break

      default:
        break
    }
  }

  const startNode = nodes.find(n => n.type === 'start')
  if (!startNode) {
    onLog({ text: '❌ No Start node found!', color: '#ef4444' })
    return
  }
  await execNode(startNode)
  onLog({ text: '✅ Workflow complete', color: '#22c55e', bold: true })
}

// ══════════════════════════════════════════
// ROUTES — Projects
// ══════════════════════════════════════════

app.get('/api/projects', (req, res) => {
  res.json(projects)
})

app.get('/api/projects/:id', (req, res) => {
  const p = projects.find(p => p.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
})

app.post('/api/projects', (req, res) => {
  const { id, name, nodes, conns } = req.body
  const existing = projects.findIndex(p => p.id === id)
  const project = { id: id || uuidv4(), name, nodes, conns, savedAt: Date.now() }
  if (existing >= 0) {
    projects[existing] = project
  } else {
    projects.push(project)
  }
  res.json(project)
})

app.delete('/api/projects/:id', (req, res) => {
  projects = projects.filter(p => p.id !== req.params.id)
  res.json({ ok: true })
})

// ══════════════════════════════════════════
// ROUTES — Workflow Execution
// ══════════════════════════════════════════

app.post('/api/run', async (req, res) => {
  const { nodes, conns } = req.body
  if (!nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: 'nodes required' })
  }

  const runId = uuidv4()
  runLogs[runId] = []

  const onLog = entry => {
    runLogs[runId].push({ ...entry, t: Date.now() })
  }

  executeWorkflow(nodes, conns || [], onLog)
    .then(() => {
      if (runLogs[runId]) runLogs[runId].push({ done: true })
    })
    .catch(e => {
      if (runLogs[runId])
        runLogs[runId].push({
          text: `💥 Runtime error: ${e.message}`,
          color: '#ef4444',
          done: true
        })
    })

  setTimeout(() => { delete runLogs[runId] }, 5 * 60 * 1000)

  res.json({ runId })
})

app.get('/api/run/:runId/logs', (req, res) => {
  const { runId } = req.params
  const since = parseInt(req.query.since) || 0
  const logs = runLogs[runId]
  if (!logs) return res.status(404).json({ error: 'Run not found' })
  res.json({ logs: logs.slice(since), total: logs.length })
})

// ══════════════════════════════════════════
// ROUTES — AI Agent
// ══════════════════════════════════════════

const SYSTEM_PROMPT = `You are VibeBot, an AI assistant for Vibe Automation Studio.
You help users build and run automation workflows. 

You can:
1. CHAT — Answer questions, explain workflow concepts, give advice
2. BUILD — Generate a complete workflow JSON when the user asks you to build/create an automation
3. RUN — Trigger running the current workflow when the user says "run", "execute", "شغل", "تشغيل"

When building a workflow, respond with ONLY valid JSON in this exact format:
{
  "action": "build",
  "workflow": {
    "nodes": [...],
    "conns": [...]
  },
  "message": "Brief explanation in the user's language"
}

Node types available: start, end, log, color, delay, input, transform, merge, condition, loop, api, variable, clear

Node structure: { "id": "n1", "type": "log", "x": 100, "y": 150, "data": { "text": "Hello!" } }
Connection structure: { "id": "c1", "src": "n1", "srcPort": "out", "dst": "n2", "dstPort": "in" }

When the user wants to run the current workflow, respond with:
{ "action": "run", "message": "Running your workflow..." }

When just chatting, respond with:
{ "action": "chat", "message": "Your response here" }

Always detect the user's language (Arabic/English) and respond in the same language.
Be concise, helpful, and enthusiastic about automation!`

app.post('/api/agent', async (req, res) => {
  const { message, currentWorkflow, history = [] } = req.body
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required. Add X-API-Key header.' })
  }

  if (!message) {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      {
        role: 'user',
        content: `Current workflow: ${JSON.stringify(currentWorkflow)}\n\nUser message: ${message}`
      }
    ]

    // ✅ الطلب لـ OpenRouter بشكل صحيح
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'vibe-automation'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages
      })
    })

    // ✅ نتحقق من status قبل parse
    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      return res.status(500).json({ error: `OpenRouter error ${response.status}: ${errText}` })
    }

    const data = await response.json()

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Unknown API error' })
    }

    // ✅ صيغة OpenRouter الصحيحة
    const text = data.choices?.[0]?.message?.content || ''

    if (!text) {
      return res.json({ action: 'chat', message: 'No response from AI.' })
    }

    // ✅ نحاول نحوّله JSON، وإلا نرسله كـ chat
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      return res.json(parsed)
    } catch {
      return res.json({ action: 'chat', message: text })
    }

  } catch (e) {
    // ✅ error message واضح بدل "fetch failed"
    console.error('Agent error:', e)
    res.status(500).json({ error: `Request failed: ${e.message}` })
  }
})

// ══════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`\n🚀 Vibe Automation Backend running on http://localhost:${PORT}`)
  console.log(`   GET  /api/projects`)
  console.log(`   POST /api/projects`)
  console.log(`   POST /api/run`)
  console.log(`   GET  /api/run/:runId/logs`)
  console.log(`   POST /api/agent\n`)
})