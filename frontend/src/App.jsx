import { useState, useRef, useCallback, useEffect } from 'react'

// ══════════════════════════════════════════════════════════════
// CONFIG — change this to your backend URL
// ══════════════════════════════════════════════════════════════
const API_BASE = 'http://localhost:3001/api'

// ══════════════════════════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════════════════════════
const T = {
  ar: {
    appName: 'فايب كود',
    appSub: 'استوديو الأتمتة',
    run: '▶ تشغيل',
    running: '⏳ يعمل...',
    stop: '■ إيقاف',
    save: '💾 حفظ',
    saved: '✓ محفوظ!',
    clearAll: 'مسح الكل',
    clearLog: 'مسح السجل',
    projects: '📁 مشاريع',
    myProjects: '📁 مشاريعي',
    projectsSaved: n => `${n} مشروع`,
    newPlaceholder: 'اسم المشروع الجديد...',
    newBtn: '+ جديد',
    openBtn: 'فتح',
    noProjects: 'لا توجد مشاريع بعد',
    inspector: 'الخصائص',
    console: 'الكونسول',
    clickNode: 'اضغط على عقدة لعرض خصائصها',
    dragHint: 'اسحب عقدة من الشريط الجانبي',
    panHint: 'Alt+سحب للتحريك | عجلة للتكبير',
    deleteBtn: '🗑 حذف',
    resetView: '⌂',
    catControl: 'تحكم',
    catBasic: 'أساسية',
    catInter: 'متوسطة',
    catAdvanced: 'متقدمة',
    theme: 'الثيم',
    lang: 'EN',
    lines: n => `${n} سطر`,
    opUp: 'كبيرة',
    opLow: 'صغيرة',
    opRev: 'عكس',
    opTrim: 'قص',
    lReady: 'نظام فايب كود جاهز. ابنِ سير العمل واضغط تشغيل.',
    lStart: '▶ تشغيل سير العمل...',
    lNoStart: '❌ لا توجد عقدة بداية!',
    lDone: '✅ اكتمل التنفيذ',
    lOpen: n => `تم فتح: ${n}`,
    lNew: n => `مشروع جديد: ${n}`,
    lSaved: '✅ تم الحفظ',
    lSaveErr: '❌ خطأ في الحفظ',
    agent: '🤖 VibeBot',
    agentPlaceholder:
      "اسألني أو أعطني أمراً... مثلاً: 'ابنيلي workflow يطبع Hello ثم ينتظر ثانيتين'",
    agentSend: 'إرسال',
    agentThinking: 'VibeBot يفكر...',
    agentApiKey: '🔑 أدخل Anthropic API Key لتفعيل VibeBot',
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeySave: 'حفظ'
  },
  en: {
    appName: 'Vibe Code',
    appSub: 'Automation Studio',
    run: '▶ Run',
    running: '⏳ Running...',
    stop: '■ Stop',
    save: '💾 Save',
    saved: '✓ Saved!',
    clearAll: 'Clear All',
    clearLog: 'Clear Log',
    projects: '📁 Projects',
    myProjects: '📁 My Projects',
    projectsSaved: n => `${n} project${n !== 1 ? 's' : ''}`,
    newPlaceholder: 'New project name...',
    newBtn: '+ New',
    openBtn: 'Open',
    noProjects: 'No saved projects yet',
    inspector: 'Inspector',
    console: 'Console',
    clickNode: 'Click a node to inspect it',
    dragHint: 'Drag a node from the sidebar',
    panHint: 'Alt+drag to pan | Scroll to zoom',
    deleteBtn: '🗑 Delete',
    resetView: '⌂',
    catControl: 'Control',
    catBasic: 'Basic',
    catInter: 'Intermediate',
    catAdvanced: 'Advanced',
    theme: 'Theme',
    lang: 'AR',
    lines: n => `${n} line${n !== 1 ? 's' : ''}`,
    opUp: 'UPPERCASE',
    opLow: 'lowercase',
    opRev: 'Reverse',
    opTrim: 'Trim',
    lReady: 'Vibe Code ready. Build your workflow and click Run.',
    lStart: '▶ Running workflow...',
    lNoStart: '❌ No Start node found!',
    lDone: '✅ Workflow complete',
    lOpen: n => `Opened: ${n}`,
    lNew: n => `New project: ${n}`,
    lSaved: '✅ Saved to server',
    lSaveErr: '❌ Save failed',
    agent: '🤖 VibeBot',
    agentPlaceholder:
      "Ask me anything or give a command... e.g. 'Build a workflow that logs Hello then waits 2 seconds'",
    agentSend: 'Send',
    agentThinking: 'VibeBot is thinking...',
    agentApiKey: '🔑 Enter Anthropic API Key to enable VibeBot',
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeySave: 'Save'
  }
}

// ══════════════════════════════════════════════════════════════
// THEMES
// ══════════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    name: { ar: 'داكن', en: 'Dark' },
    icon: '🌙',
    bg: '#0f172a',
    panel: '#1e293b',
    border: '#334155',
    text: '#e2e8f0',
    muted: '#64748b',
    dim: '#475569',
    canvas: '#0a1120',
    consoleBg: '#070e1a',
    accent: '#38bdf8',
    accentDim: '#0369a1',
    grid: '#1e293b',
    nodeHover: '#263345',
    nodeBg: '#1e293b',
    nodeActive: 'rgba(34,197,94,0.15)',
    glow: 'rgba(56,189,248,0.3)'
  },
  light: {
    name: { ar: 'فاتح', en: 'Light' },
    icon: '☀️',
    bg: '#f8fafc',
    panel: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    dim: '#94a3b8',
    canvas: '#f1f5f9',
    consoleBg: '#f8fafc',
    accent: '#0284c7',
    accentDim: '#0ea5e9',
    grid: '#e2e8f0',
    nodeHover: '#f0f9ff',
    nodeBg: '#ffffff',
    nodeActive: 'rgba(34,197,94,0.1)',
    glow: 'rgba(2,132,199,0.2)'
  },
  midnight: {
    name: { ar: 'منتصف الليل', en: 'Midnight' },
    icon: '🔮',
    bg: '#080818',
    panel: '#0f0f28',
    border: '#1e1e4a',
    text: '#ddd6fe',
    muted: '#7c6fad',
    dim: '#4c4880',
    canvas: '#060614',
    consoleBg: '#040410',
    accent: '#a78bfa',
    accentDim: '#7c3aed',
    grid: '#0f0f28',
    nodeHover: '#151530',
    nodeBg: '#0f0f28',
    nodeActive: 'rgba(167,139,250,0.15)',
    glow: 'rgba(167,139,250,0.35)'
  },
  forest: {
    name: { ar: 'غابة', en: 'Forest' },
    icon: '🌿',
    bg: '#0a1a0c',
    panel: '#112018',
    border: '#1a3522',
    text: '#bbf7d0',
    muted: '#4a7a58',
    dim: '#2d5438',
    canvas: '#080f09',
    consoleBg: '#050b06',
    accent: '#34d399',
    accentDim: '#059669',
    grid: '#112018',
    nodeHover: '#162a1c',
    nodeBg: '#112018',
    nodeActive: 'rgba(52,211,153,0.15)',
    glow: 'rgba(52,211,153,0.3)'
  },
  sunset: {
    name: { ar: 'غروب', en: 'Sunset' },
    icon: '🌅',
    bg: '#1a0a0a',
    panel: '#2a1018',
    border: '#4a1a28',
    text: '#fde8d8',
    muted: '#8a4a58',
    dim: '#5a2a38',
    canvas: '#120808',
    consoleBg: '#0e0606',
    accent: '#f97316',
    accentDim: '#dc2626',
    grid: '#2a1018',
    nodeHover: '#3a1820',
    nodeBg: '#2a1018',
    nodeActive: 'rgba(249,115,22,0.15)',
    glow: 'rgba(249,115,22,0.3)'
  }
}

// ══════════════════════════════════════════════════════════════
// NODE DEFINITIONS
// ══════════════════════════════════════════════════════════════
const NODES = {
  start: {
    label: { ar: 'بداية', en: 'Start' },
    color: '#22c55e',
    cat: 'control',
    ins: [],
    outs: ['out']
  },
  end: {
    label: { ar: 'نهاية', en: 'End' },
    color: '#ef4444',
    cat: 'control',
    ins: ['in'],
    outs: []
  },
  log: {
    label: { ar: 'طباعة', en: 'Log' },
    color: '#3b82f6',
    cat: 'basic',
    ins: ['in', 'text'],
    outs: ['out']
  },
  color: {
    label: { ar: 'ملوّن', en: 'Color Log' },
    color: '#8b5cf6',
    cat: 'basic',
    ins: ['in', 'text', 'color'],
    outs: ['out']
  },
  delay: {
    label: { ar: 'تأخير', en: 'Delay' },
    color: '#f59e0b',
    cat: 'inter',
    ins: ['in', 'ms'],
    outs: ['out']
  },
  input: {
    label: { ar: 'إدخال', en: 'Input' },
    color: '#06b6d4',
    cat: 'inter',
    ins: [],
    outs: ['value']
  },
  transform: {
    label: { ar: 'تحويل', en: 'Transform' },
    color: '#10b981',
    cat: 'inter',
    ins: ['in', 'text'],
    outs: ['result']
  },
  merge: {
    label: { ar: 'دمج', en: 'Merge' },
    color: '#6366f1',
    cat: 'inter',
    ins: ['in', 'a', 'b', 'c'],
    outs: ['out']
  },
  condition: {
    label: { ar: 'شرط', en: 'Condition' },
    color: '#f97316',
    cat: 'advanced',
    ins: ['in', 'value', 'compare'],
    outs: ['true', 'false']
  },
  loop: {
    label: { ar: 'تكرار', en: 'Loop' },
    color: '#ec4899',
    cat: 'advanced',
    ins: ['in', 'body'],
    outs: ['out']
  },
  api: {
    label: { ar: 'API', en: 'API' },
    color: '#14b8a6',
    cat: 'advanced',
    ins: ['in', 'url', 'method'],
    outs: ['out', 'response']
  },
  variable: {
    label: { ar: 'متغير', en: 'Variable' },
    color: '#a855f7',
    cat: 'advanced',
    ins: ['key', 'value'],
    outs: ['stored']
  },
  clear: {
    label: { ar: 'مسح', en: 'Clear' },
    color: '#64748b',
    cat: 'control',
    ins: ['in'],
    outs: ['out']
  }
}

const DEFAULTS = {
  log: { text: 'Hello, World!' },
  color: { text: 'Colored text', color: '#ff6b6b' },
  delay: { ms: '1000' },
  input: { label: 'Name', default: 'Alice' },
  transform: { text: 'hello world', op: 'uppercase' },
  merge: { a: 'foo', b: 'bar', c: '' },
  condition: { value: '10', op: '>', compare: '5' },
  loop: { count: '3', body: '' },
  api: { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
  variable: { key: 'myVar', value: '42' }
}

const FIELD_LABELS = {
  ar: {
    text: 'النص',
    color: 'اللون',
    ms: 'مدة (ms)',
    label: 'التسمية',
    default: 'الافتراضي',
    op: 'العملية',
    a: 'أ',
    b: 'ب',
    c: 'ج',
    value: 'القيمة',
    compare: 'المقارنة',
    count: 'العدد',
    body: 'محتوى الجسم',
    url: 'الرابط',
    method: 'الطريقة',
    key: 'المفتاح'
  },
  en: {
    text: 'Text',
    color: 'Color',
    ms: 'Duration (ms)',
    label: 'Label',
    default: 'Default',
    op: 'Operation',
    a: 'A',
    b: 'B',
    c: 'C',
    value: 'Value',
    compare: 'Compare',
    count: 'Count',
    body: 'Body',
    url: 'URL',
    method: 'Method',
    key: 'Key'
  }
}

const PORT_LABELS = {
  ar: {
    out: 'خ',
    in: 'د',
    value: 'قيمة',
    result: 'نتيجة',
    stored: 'محفوظ',
    true: 'صح',
    false: 'خطأ',
    response: 'رد',
    a: 'أ',
    b: 'ب',
    c: 'ج',
    text: 'نص',
    color: 'لون',
    ms: 'ms',
    url: 'رابط',
    method: 'طريقة',
    key: 'مفتاح',
    compare: 'قارن',
    body: 'جسم'
  },
  en: {
    out: '▶',
    in: '▶',
    value: 'val',
    result: 'res',
    stored: 'stored',
    true: 'T',
    false: 'F',
    response: 'resp',
    a: 'a',
    b: 'b',
    c: 'c',
    text: 'txt',
    color: 'col',
    ms: 'ms',
    url: 'url',
    method: 'met',
    key: 'key',
    compare: 'cmp',
    body: 'body'
  }
}

let _nid = Date.now()
const uid = () => `n${++_nid}`
const sleep = ms => new Promise(r => setTimeout(r, ms))
function createNode (type, x, y) {
  return { id: uid(), type, x, y, data: { ...(DEFAULTS[type] || {}) } }
}
function makeDefaultWorkflow () {
  const s = createNode('start', 80, 180),
    l = createNode('log', 310, 180),
    e = createNode('end', 540, 180)
  return {
    nodes: [s, l, e],
    conns: [
      { id: 'c1', src: s.id, srcPort: 'out', dst: l.id, dstPort: 'in' },
      { id: 'c2', src: l.id, srcPort: 'out', dst: e.id, dstPort: 'in' }
    ]
  }
}

const W = 160,
  H = 56,
  PS = 22

// ══════════════════════════════════════════════════════════════
// API CLIENT
// ══════════════════════════════════════════════════════════════
const api = {
  getProjects: () =>
    fetch(`${API_BASE}/projects`)
      .then(r => r.json())
      .catch(() => []),
  saveProject: p =>
    fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    }).then(r => r.json()),
  deleteProject: id =>
    fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' }).then(r =>
      r.json()
    ),
  runWorkflow: (nodes, conns) =>
    fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, conns })
    }).then(r => r.json()),
  pollLogs: (runId, since) =>
    fetch(`${API_BASE}/run/${runId}/logs?since=${since}`).then(r => r.json()),
  agent: (message, currentWorkflow, history, apiKey) =>
    fetch(`${API_BASE}/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ message, currentWorkflow, history })
    }).then(r => r.json())
}

// ══════════════════════════════════════════════════════════════
// PROJECTS MODAL
// ══════════════════════════════════════════════════════════════
function ProjectsModal ({
  projects,
  currentId,
  onClose,
  onLoad,
  onDelete,
  onNew,
  t,
  th,
  lang
}) {
  const [name, setName] = useState('')
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const submit = () => {
    if (name.trim()) {
      onNew(name.trim())
      setName('')
    }
  }
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: th.panel,
          border: `1px solid ${th.border}`,
          borderRadius: 14,
          width: 500,
          maxHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
          direction: dir,
          boxShadow: `0 24px 64px rgba(0,0,0,0.6)`
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: `1px solid ${th.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: th.accent }}>
              {t.myProjects}
            </div>
            <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>
              {t.projectsSaved(projects.length)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: th.muted,
              fontSize: 22,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${th.border}`,
            display: 'flex',
            gap: 8
          }}
        >
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder={t.newPlaceholder}
            style={{
              flex: 1,
              background: th.bg,
              border: `1px solid ${th.border}`,
              color: th.text,
              borderRadius: 8,
              padding: '9px 13px',
              fontSize: 13,
              fontFamily: 'inherit',
              direction: dir,
              outline: 'none'
            }}
          />
          <button
            onClick={submit}
            style={{
              background: th.accent,
              border: 'none',
              color: '#fff',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700
            }}
          >
            {t.newBtn}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {projects.length === 0 && (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: th.muted,
                fontSize: 13
              }}
            >
              {t.noProjects}
            </div>
          )}
          {[...projects].reverse().map(p => {
            const active = p.id === currentId
            return (
              <div
                key={p.id}
                onClick={() => onLoad(p.id)}
                style={{
                  padding: '13px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderBottom: `1px solid ${th.border}`,
                  background: active ? th.nodeHover : 'transparent',
                  cursor: 'pointer',
                  [lang === 'ar' ? 'borderRight' : 'borderLeft']: active
                    ? `3px solid ${th.accent}`
                    : '3px solid transparent'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: active ? th.accent : th.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {active && '● '}
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: th.muted, marginTop: 3 }}>
                    {(p.nodes || []).length} nodes ·{' '}
                    {new Date(p.savedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onLoad(p.id)
                  }}
                  style={{
                    background: th.accentDim,
                    border: 'none',
                    color: '#fff',
                    borderRadius: 7,
                    padding: '6px 14px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 600
                  }}
                >
                  {t.openBtn}
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(p.id)
                  }}
                  style={{
                    background: '#7f1d1d',
                    border: 'none',
                    color: '#fca5a5',
                    borderRadius: 7,
                    padding: '6px 10px',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  🗑
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// AI AGENT CHAT PANEL
// ══════════════════════════════════════════════════════════════
function AgentPanel ({
  th,
  t,
  lang,
  nodes,
  conns,
  onBuildWorkflow,
  onRunWorkflow,
  onLog
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        lang === 'ar'
          ? "مرحباً! أنا VibeBot 🤖 يمكنني بناء workflows وتشغيلها بالأوامر النصية. جرّب: 'ابنيلي workflow يطبع مرحبا ثم ينتظر ثانيتين'"
          : "Hi! I'm VibeBot 🤖 I can build and run workflows from your commands. Try: 'Build a workflow that logs Hello then waits 2 seconds'"
    }
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('vbc_apikey') || ''
  )
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [tempKey, setTempKey] = useState('')
  const chatRef = useRef(null)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveKey = () => {
    localStorage.setItem('vbc_apikey', tempKey)
    setApiKey(tempKey)
    setShowKeyInput(false)
    setTempKey('')
  }

  const send = async () => {
    if (!input.trim() || thinking) return
    if (!apiKey) {
      setShowKeyInput(true)
      return
    }

    const userMsg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setThinking(true)

    try {
      const result = await api.agent(input, { nodes, conns }, messages, apiKey)

      if (result.error) {
        setMessages(m => [
          ...m,
          { role: 'assistant', content: `❌ ${result.error}` }
        ])
        setThinking(false)
        return
      }

      setMessages(m => [
        ...m,
        { role: 'assistant', content: result.message || 'Done!' }
      ])

      if (result.action === 'build' && result.workflow) {
        onBuildWorkflow(result.workflow)
        onLog({
          text: `🤖 VibeBot built: ${
            (result.workflow.nodes || []).length
          } nodes`,
          color: '#a78bfa',
          bold: true
        })
      } else if (result.action === 'run') {
        onRunWorkflow()
      }
    } catch (e) {
      setMessages(m => [
        ...m,
        { role: 'assistant', content: `❌ Error: ${e.message}` }
      ])
    }
    setThinking(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        direction: dir
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `1px solid ${th.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: th.accent }}>
          {t.agent}
        </span>
        <button
          onClick={() => setShowKeyInput(s => !s)}
          title='API Key'
          style={{
            background: 'transparent',
            border: `1px solid ${th.border}`,
            color: th.muted,
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          🔑
        </button>
      </div>

      {/* API Key input */}
      {showKeyInput && (
        <div
          style={{
            padding: '10px 14px',
            borderBottom: `1px solid ${th.border}`,
            background: th.bg,
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: 11, color: th.muted, marginBottom: 6 }}>
            {t.agentApiKey}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type='password'
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder={t.apiKeyPlaceholder}
              style={{
                flex: 1,
                background: th.panel,
                border: `1px solid ${th.border}`,
                color: th.text,
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 12,
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            <button
              onClick={saveKey}
              style={{
                background: th.accent,
                border: 'none',
                color: '#fff',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              {t.apiKeySave}
            </button>
          </div>
          {apiKey && (
            <div style={{ fontSize: 10, color: '#22c55e', marginTop: 4 }}>
              ✓ Key saved
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 12,
                lineHeight: 1.6,
                background: m.role === 'user' ? th.accent : th.nodeBg,
                color: m.role === 'user' ? '#fff' : th.text,
                border:
                  m.role === 'assistant' ? `1px solid ${th.border}` : 'none',
                borderBottomRightRadius: m.role === 'user' ? 2 : 10,
                borderBottomLeftRadius: m.role === 'assistant' ? 2 : 10
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: th.nodeBg,
                border: `1px solid ${th.border}`,
                fontSize: 12,
                color: th.muted
              }}
            >
              <span style={{ animation: 'pulse 1s infinite' }}>●</span>{' '}
              {t.agentThinking}
            </div>
          </div>
        )}
        <div ref={chatRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '10px 12px',
          borderTop: `1px solid ${th.border}`,
          display: 'flex',
          gap: 6,
          flexShrink: 0
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={t.agentPlaceholder}
          disabled={thinking}
          style={{
            flex: 1,
            background: th.bg,
            border: `1px solid ${th.border}`,
            color: th.text,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: 'inherit',
            direction: dir,
            outline: 'none',
            resize: 'none'
          }}
        />
        <button
          onClick={send}
          disabled={thinking || !input.trim()}
          style={{
            background: thinking || !input.trim() ? th.dim : th.accent,
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12,
            cursor: thinking ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {t.agentSend}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App () {
  const [lang, setLang] = useState(
    () => localStorage.getItem('vbc_lang') || 'ar'
  )
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem('vbc_theme') || 'dark'
  )
  useEffect(() => localStorage.setItem('vbc_lang', lang), [lang])
  useEffect(() => localStorage.setItem('vbc_theme', themeName), [themeName])
  const th = THEMES[themeName],
    t = T[lang],
    dir = lang === 'ar' ? 'rtl' : 'ltr'

  const [projects, setProjects] = useState([])
  const [curProjId, setCurProjId] = useState(null)
  const [projName, setProjName] = useState(() =>
    lang === 'ar' ? 'مشروع جديد' : 'New Project'
  )
  const [showProjects, setShowProjects] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)
  const [editName, setEditName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [showThemes, setShowThemes] = useState(false)
  const [showAgent, setShowAgent] = useState(false)

  // Load projects from backend on mount
  useEffect(() => {
    api.getProjects().then(setProjects)
  }, [])

  const def = makeDefaultWorkflow()
  const [nodes, setNodes] = useState(def.nodes)
  const [conns, setConns] = useState(def.conns)
  const [pan, setPan] = useState({ x: 60, y: 20 })
  const [zoom, setZoom] = useState(1)
  const [panStart, setPanStart] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState(null)

  const [running, setRunning] = useState(false)
  const [activeNode, setActiveNode] = useState(null)
  const [visitedNodes, setVisitedNodes] = useState([])
  const [logs, setLogs] = useState([
    { text: T[lang].lReady, color: '#64748b', t: Date.now() }
  ])
  const stopRef = useRef(false)
  const runIdRef = useRef(null)
  const pollRef = useRef(null)
  const canvasRef = useRef(null)
  const logRef = useRef(null)
  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const addLog = useCallback(entry => {
    if (entry.clear) {
      setLogs([])
      return
    }
    setLogs(l => [
      ...l,
      {
        text: entry.text,
        color: entry.color || '#e2e8f0',
        bold: entry.bold || false,
        t: Date.now()
      }
    ])
  }, [])

  // ── Coord helpers ──────────────────────────────────────────
  const toCanvas = useCallback(
    (cx, cy) => {
      const r = canvasRef.current.getBoundingClientRect()
      return { x: (cx - r.left - pan.x) / zoom, y: (cy - r.top - pan.y) / zoom }
    },
    [pan, zoom]
  )

  // ── Mouse handlers ─────────────────────────────────────────
  const onBgDown = useCallback(
    e => {
      if (e.button === 1 || e.altKey) {
        setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y })
        e.preventDefault()
        return
      }
      if (
        e.target === canvasRef.current ||
        e.target.tagName === 'svg' ||
        e.target.tagName === 'SVG'
      )
        setSelected(null)
    },
    [pan]
  )
  const onMove = useCallback(
    e => {
      if (panStart) {
        setPan({
          x: panStart.px + e.clientX - panStart.mx,
          y: panStart.py + e.clientY - panStart.my
        })
        return
      }
      if (dragging) {
        const c = toCanvas(e.clientX, e.clientY)
        setNodes(ns =>
          ns.map(n =>
            n.id === dragging.id
              ? { ...n, x: c.x - dragging.ox, y: c.y - dragging.oy }
              : n
          )
        )
      }
      const r = canvasRef.current?.getBoundingClientRect()
      if (r)
        setMouse({
          x: (e.clientX - r.left - pan.x) / zoom,
          y: (e.clientY - r.top - pan.y) / zoom
        })
    },
    [panStart, dragging, toCanvas, pan, zoom]
  )
  const onUp = useCallback(() => {
    if (panStart) {
      setPanStart(null)
      return
    }
    if (dragging) {
      setDragging(null)
      return
    }
    if (connecting) {
      setConnecting(null)
    }
  }, [panStart, dragging, connecting])
  const onWheel = useCallback(e => {
    e.preventDefault()
    setZoom(z => Math.min(3, Math.max(0.2, z * (e.deltaY < 0 ? 1.12 : 0.9))))
  }, [])
  const startDrag = useCallback(
    (e, node) => {
      if (e.button !== 0) return
      e.stopPropagation()
      const c = toCanvas(e.clientX, e.clientY)
      setDragging({ id: node.id, ox: c.x - node.x, oy: c.y - node.y })
      setSelected(node.id)
    },
    [toCanvas]
  )
  const onDrop = useCallback(
    e => {
      e.preventDefault()
      const type = e.dataTransfer.getData('ntype')
      if (!type) return
      const c = toCanvas(e.clientX, e.clientY)
      setNodes(ns => [...ns, createNode(type, c.x - 75, c.y - 28)])
    },
    [toCanvas]
  )
  const startConn = useCallback((e, nodeId, port, isInput) => {
    e.stopPropagation()
    e.preventDefault()
    setConnecting({ nodeId, port, isInput })
  }, [])
  const endConn = useCallback(
    (e, nodeId, port, isInput) => {
      e.stopPropagation()
      if (!connecting || connecting.isInput === isInput) return
      const src = connecting.isInput ? nodeId : connecting.nodeId
      const srcPort = connecting.isInput ? port : connecting.port
      const dst = connecting.isInput ? connecting.nodeId : nodeId
      const dstPort = connecting.isInput ? connecting.port : port
      if (src === dst) return
      setConns(cs => [
        ...cs.filter(c => !(c.dst === dst && c.dstPort === dstPort)),
        { id: `c${Date.now()}`, src, srcPort, dst, dstPort }
      ])
      setConnecting(null)
    },
    [connecting]
  )
  const delNode = useCallback(id => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setConns(cs => cs.filter(c => c.src !== id && c.dst !== id))
    setSelected(null)
  }, [])
  const updData = useCallback((id, key, val) => {
    setNodes(ns =>
      ns.map(n => (n.id === id ? { ...n, data: { ...n.data, [key]: val } } : n))
    )
  }, [])

  // ── RUN via Backend ─────────────────────────────────────────
  const runWorkflow = useCallback(async () => {
    if (running) return
    stopRef.current = false
    setRunning(true)
    setActiveNode(null)
    setVisitedNodes([])
    setLogs([{ text: t.lStart, color: '#22c55e', bold: true, t: Date.now() }])

    try {
      const { runId, error } = await api.runWorkflow(nodes, conns)
      if (error) {
        addLog({ text: `❌ ${error}`, color: '#ef4444' })
        setRunning(false)
        return
      }
      runIdRef.current = runId
      let since = 0
      const poll = async () => {
        if (stopRef.current) {
          setRunning(false)
          return
        }
        const { logs: newLogs, total } = await api
          .pollLogs(runId, since)
          .catch(() => ({ logs: [], total: since }))
        since = total
        newLogs.forEach(entry => {
          if (entry.done) {
            setRunning(false)
            setActiveNode(null)
            return
          }
          addLog(entry)
        })
        const isDone = newLogs.some(e => e.done)
        if (!isDone) pollRef.current = setTimeout(poll, 200)
        else setRunning(false)
      }
      pollRef.current = setTimeout(poll, 200)
    } catch (e) {
      addLog({ text: `❌ ${e.message}`, color: '#ef4444' })
      setRunning(false)
    }
  }, [running, nodes, conns, t, addLog])

  const stopWorkflow = useCallback(() => {
    stopRef.current = true
    clearTimeout(pollRef.current)
    setRunning(false)
    setActiveNode(null)
  }, [])

  // ── Projects (Backend) ──────────────────────────────────────
  const saveProject = useCallback(async () => {
    const p = { id: curProjId || uid(), name: projName, nodes, conns }
    try {
      const saved = await api.saveProject(p)
      setCurProjId(saved.id)
      setProjects(await api.getProjects())
      setSaveFlash(true)
      setTimeout(() => setSaveFlash(false), 1200)
      addLog({ text: t.lSaved, color: '#22c55e' })
    } catch {
      addLog({ text: t.lSaveErr, color: '#ef4444' })
    }
  }, [curProjId, projName, nodes, conns, t, addLog])

  const loadProject = useCallback(
    id => {
      const p = projects.find(x => x.id === id)
      if (!p) return
      setNodes(p.nodes || [])
      setConns(p.conns || [])
      setCurProjId(p.id)
      setProjName(p.name)
      setSelected(null)
      setShowProjects(false)
      addLog({ text: t.lOpen(p.name), color: th.accent })
    },
    [projects, t, th, addLog]
  )

  const deleteProject = useCallback(
    async id => {
      await api.deleteProject(id)
      setProjects(await api.getProjects())
      if (curProjId === id) setCurProjId(null)
    },
    [curProjId]
  )

  const newProject = useCallback(
    name => {
      const def = makeDefaultWorkflow()
      setNodes(def.nodes)
      setConns(def.conns)
      setProjName(name)
      setCurProjId(null)
      setSelected(null)
      setShowProjects(false)
      addLog({ text: t.lNew(name), color: th.accent })
    },
    [t, th, addLog]
  )

  // ── Agent handlers ──────────────────────────────────────────
  const handleBuildWorkflow = useCallback(wf => {
    if (wf.nodes) setNodes(wf.nodes)
    if (wf.conns) setConns(wf.conns)
    setSelected(null)
  }, [])

  // ── Inspector fields ────────────────────────────────────────
  const selNode = nodes.find(n => n.id === selected)
  const FIELDS = {
    log: ['text'],
    color: ['text', 'color'],
    delay: ['ms'],
    input: ['label', 'default'],
    transform: ['text', 'op'],
    merge: ['a', 'b', 'c'],
    condition: ['value', 'op', 'compare'],
    loop: ['count', 'body'],
    api: ['url', 'method'],
    variable: ['key', 'value']
  }
  const renderField = (node, key) => {
    const label = FIELD_LABELS[lang][key] || key
    const val = node.data[key] ?? ''
    const iStyle = {
      width: '100%',
      background: th.bg,
      border: `1px solid ${th.border}`,
      color: th.text,
      borderRadius: 6,
      padding: '6px 9px',
      fontSize: 12,
      fontFamily: 'inherit',
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      outline: 'none',
      boxSizing: 'border-box'
    }
    if (key === 'op' && node.type === 'transform')
      return (
        <div key={key} style={{ marginBottom: 9 }}>
          <div style={{ fontSize: 10, color: th.muted, marginBottom: 3 }}>
            {label}
          </div>
          <select
            value={val}
            onChange={e => updData(node.id, key, e.target.value)}
            style={{ ...iStyle, cursor: 'pointer' }}
          >
            {[
              ['uppercase', t.opUp],
              ['lowercase', t.opLow],
              ['reverse', t.opRev],
              ['trim', t.opTrim]
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      )
    if (key === 'op' && node.type === 'condition')
      return (
        <div key={key} style={{ marginBottom: 9 }}>
          <div style={{ fontSize: 10, color: th.muted, marginBottom: 3 }}>
            {label}
          </div>
          <select
            value={val}
            onChange={e => updData(node.id, key, e.target.value)}
            style={{ ...iStyle, cursor: 'pointer' }}
          >
            {['==', '!=', '>', '<', '>=', '<='].map(op => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      )
    if (key === 'method')
      return (
        <div key={key} style={{ marginBottom: 9 }}>
          <div style={{ fontSize: 10, color: th.muted, marginBottom: 3 }}>
            {label}
          </div>
          <select
            value={val}
            onChange={e => updData(node.id, key, e.target.value)}
            style={{ ...iStyle, cursor: 'pointer' }}
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )
    if (key === 'color')
      return (
        <div key={key} style={{ marginBottom: 9 }}>
          <div style={{ fontSize: 10, color: th.muted, marginBottom: 3 }}>
            {label}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type='color'
              value={val || '#ff6b6b'}
              onChange={e => updData(node.id, key, e.target.value)}
              style={{
                width: 34,
                height: 28,
                border: `1px solid ${th.border}`,
                borderRadius: 5,
                cursor: 'pointer',
                background: 'none',
                padding: 2
              }}
            />
            <input
              value={val}
              onChange={e => updData(node.id, key, e.target.value)}
              style={{ ...iStyle, flex: 1 }}
            />
          </div>
        </div>
      )
    return (
      <div key={key} style={{ marginBottom: 9 }}>
        <div style={{ fontSize: 10, color: th.muted, marginBottom: 3 }}>
          {label}
        </div>
        <input
          value={val}
          onChange={e => updData(node.id, key, e.target.value)}
          style={iStyle}
        />
      </div>
    )
  }

  // ── Categories ──────────────────────────────────────────────
  const cats = [
    { key: 'control', label: t.catControl },
    { key: 'basic', label: t.catBasic },
    { key: 'inter', label: t.catInter },
    { key: 'advanced', label: t.catAdvanced }
  ]

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: th.bg,
        color: th.text,
        fontFamily:
          lang === 'ar' ? "'Tajawal',sans-serif" : "'Inter',sans-serif",
        direction: dir,
        overflow: 'hidden'
      }}
      onMouseMove={onMove}
      onMouseUp={onUp}
    >
      {/* TOP BAR */}
      <div
        style={{
          height: 50,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          borderBottom: `1px solid ${th.border}`,
          background: th.panel,
          flexShrink: 0,
          gap: 10,
          zIndex: 10
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: th.accent,
            whiteSpace: 'nowrap'
          }}
        >
          {t.appName}
        </div>
        <div style={{ fontSize: 10, color: th.muted }}>{t.appSub}</div>
        <div style={{ flex: 1 }} />

        {editName ? (
          <input
            autoFocus
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            onBlur={() => {
              if (tempName.trim()) setProjName(tempName.trim())
              setEditName(false)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && tempName.trim()) {
                setProjName(tempName.trim())
                setEditName(false)
              }
              if (e.key === 'Escape') setEditName(false)
            }}
            style={{
              background: th.bg,
              border: `1px solid ${th.accent}`,
              color: th.text,
              borderRadius: 6,
              padding: '4px 9px',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              maxWidth: 180
            }}
          />
        ) : (
          <div
            onClick={() => {
              setTempName(projName)
              setEditName(true)
            }}
            style={{
              fontSize: 13,
              color: th.text,
              cursor: 'text',
              padding: '3px 8px',
              borderRadius: 6,
              border: `1px solid transparent`,
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title='Click to rename'
          >
            {projName}
          </div>
        )}

        <Btn onClick={() => setShowProjects(true)} th={th}>
          {t.projects}
        </Btn>
        <Btn
          onClick={saveProject}
          th={th}
          style={saveFlash ? { color: '#22c55e', borderColor: '#22c55e' } : {}}
        >
          {saveFlash ? t.saved : t.save}
        </Btn>
        <Btn
          onClick={() => {
            setNodes([])
            setConns([])
            setSelected(null)
          }}
          th={th}
        >
          {t.clearAll}
        </Btn>
        <Btn
          onClick={() => {
            setPan({ x: 60, y: 20 })
            setZoom(1)
          }}
          th={th}
        >
          {t.resetView}
        </Btn>

        {/* Agent toggle */}
        <button
          onClick={() => setShowAgent(s => !s)}
          style={{
            background: showAgent ? th.accent : 'transparent',
            border: `1px solid ${showAgent ? th.accent : th.border}`,
            color: showAgent ? '#fff' : th.muted,
            borderRadius: 7,
            padding: '5px 12px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
        >
          🤖 VibeBot
        </button>

        {/* Theme */}
        <div style={{ position: 'relative' }}>
          <Btn onClick={() => setShowThemes(s => !s)} th={th}>
            {THEMES[themeName].icon} {t.theme}
          </Btn>
          {showThemes && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                [lang === 'ar' ? 'left' : 'right']: 0,
                background: th.panel,
                border: `1px solid ${th.border}`,
                borderRadius: 10,
                padding: 8,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: 130,
                boxShadow: `0 8px 32px rgba(0,0,0,0.5)`
              }}
            >
              {Object.entries(THEMES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => {
                    setThemeName(k)
                    setShowThemes(false)
                  }}
                  style={{
                    background:
                      k === themeName ? th.accent + '22' : 'transparent',
                    border:
                      k === themeName
                        ? `1px solid ${th.accent}`
                        : '1px solid transparent',
                    color: k === themeName ? th.accent : th.text,
                    borderRadius: 7,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'start',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7
                  }}
                >
                  {v.icon} {v.name[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        <Btn onClick={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))} th={th}>
          {t.lang}
        </Btn>

        {running && (
          <button
            onClick={stopWorkflow}
            style={{
              background: '#ef4444',
              border: 'none',
              color: '#fff',
              borderRadius: 7,
              padding: '6px 14px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700
            }}
          >
            {t.stop}
          </button>
        )}
        <button
          onClick={runWorkflow}
          disabled={running}
          style={{
            background: running ? th.dim : th.accent,
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            padding: '7px 18px',
            fontSize: 13,
            cursor: running ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontWeight: 800,
            opacity: running ? 0.7 : 1
          }}
        >
          {running ? t.running : t.run}
        </button>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* LEFT SIDEBAR */}
        <div
          style={{
            width: 176,
            background: th.panel,
            borderRight: lang === 'en' ? `1px solid ${th.border}` : 'none',
            borderLeft: lang === 'ar' ? `1px solid ${th.border}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
            order: lang === 'ar' ? 3 : 0
          }}
        >
          {cats.map(cat => {
            const catNodes = Object.entries(NODES).filter(
              ([, n]) => n.cat === cat.key
            )
            return (
              <div key={cat.key}>
                <div
                  style={{
                    padding: '8px 12px 4px',
                    fontSize: 9,
                    fontWeight: 700,
                    color: th.muted,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  {cat.label}
                </div>
                {catNodes.map(([type, nd]) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('ntype', type)}
                    style={{
                      margin: '3px 8px',
                      padding: '7px 10px',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'grab',
                      border: `1px solid ${th.border}`,
                      background: th.bg,
                      transition: 'background .15s'
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background = th.nodeHover)
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background = th.bg)
                    }
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: nd.color,
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{ fontSize: 12, color: th.text, fontWeight: 500 }}
                    >
                      {nd.label[lang]}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
          {/* COPYRIGHT */}
          <div
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderTop: `1px solid ${th.border}`,
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: 10, color: th.muted }}>
              © 2026 NGP Studio
            </span>
            <div
              style={{
                fontSize: 9,
                color: th.muted,
                opacity: 0.6,
                marginTop: 2
              }}
            >
              Made with Vibe
            </div>
          </div>
        </div>

        {/* CANVAS */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            background: th.canvas,
            cursor: panStart ? 'grabbing' : 'default',
            order: 1
          }}
          onMouseDown={onBgDown}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onWheel={onWheel}
        >
          {/* Grid */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <defs>
              <pattern
                id='grid'
                width={40 * zoom}
                height={40 * zoom}
                patternUnits='userSpaceOnUse'
                x={pan.x % (40 * zoom)}
                y={pan.y % (40 * zoom)}
              >
                <path
                  d={`M ${40 * zoom} 0 L 0 0 0 ${40 * zoom}`}
                  fill='none'
                  stroke={th.grid}
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grid)' />
          </svg>

          <div
            style={{
              position: 'absolute',
              transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform'
            }}
          >
            {/* Connections SVG */}
            <svg
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 5000,
                height: 4000,
                overflow: 'visible',
                pointerEvents: 'none'
              }}
            >
              <defs>
                <marker
                  id='arr'
                  markerWidth='7'
                  markerHeight='7'
                  refX='5'
                  refY='3.5'
                  orient='auto'
                >
                  <path d='M0,0 L7,3.5 L0,7 Z' fill={th.border} />
                </marker>
                <filter id='glow'>
                  <feGaussianBlur
                    in='SourceGraphic'
                    stdDeviation='2'
                    result='blur'
                  />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
              </defs>
              {conns.map(conn => {
                const src = nodes.find(n => n.id === conn.src),
                  dst = nodes.find(n => n.id === conn.dst)
                if (!src || !dst) return null
                const nd_s = NODES[src.type],
                  nd_d = NODES[dst.type]
                const si = nd_s.outs.indexOf(conn.srcPort),
                  di = nd_d.ins.indexOf(conn.dstPort)
                const x1 = src.x + W,
                  y1 = src.y + H / 2 + (si - (nd_s.outs.length - 1) / 2) * PS
                const x2 = dst.x,
                  y2 = dst.y + H / 2 + (di - (nd_d.ins.length - 1) / 2) * PS
                const isActive =
                  visitedNodes.includes(conn.src) &&
                  visitedNodes.includes(conn.dst)
                const cx = (x1 + x2) / 2
                const path = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`
                return (
                  <g key={conn.id}>
                    <path
                      d={path}
                      fill='none'
                      stroke={isActive ? th.accent : th.border}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      markerEnd='url(#arr)'
                      opacity={isActive ? 1 : 0.5}
                      filter={isActive ? 'url(#glow)' : 'none'}
                      style={{ transition: 'stroke .3s' }}
                    />
                  </g>
                )
              })}
              {connecting &&
                (() => {
                  const srcNode = nodes.find(n => n.id === connecting.nodeId)
                  if (!srcNode) return null
                  const nd = NODES[srcNode.type]
                  const portList = connecting.isInput ? nd.ins : nd.outs
                  const portIdx = portList.indexOf(connecting.port)
                  const px = connecting.isInput ? srcNode.x : srcNode.x + W
                  const py =
                    srcNode.y +
                    H / 2 +
                    (portIdx - (portList.length - 1) / 2) * PS
                  return (
                    <line
                      x1={px}
                      y1={py}
                      x2={mouse.x}
                      y2={mouse.y}
                      stroke={th.accent}
                      strokeWidth={2}
                      strokeDasharray='6,4'
                      opacity={0.8}
                    />
                  )
                })()}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const nd = NODES[node.type]
              const isSel = selected === node.id
              const isActive = activeNode === node.id
              const wasVisited = visitedNodes.includes(node.id) && !isActive
              return (
                <div
                  key={node.id}
                  onMouseDown={e => startDrag(e, node)}
                  onClick={e => {
                    e.stopPropagation()
                    setSelected(node.id)
                  }}
                  style={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                    width: W,
                    height: H,
                    background: isActive ? th.nodeActive : th.nodeBg,
                    border: `2px solid ${
                      isActive ? '#22c55e' : isSel ? th.accent : nd.color + '44'
                    }`,
                    borderRadius: 10,
                    cursor: 'grab',
                    userSelect: 'none',
                    boxShadow: isActive
                      ? `0 0 24px ${nd.color}88`
                      : isSel
                      ? `0 0 16px ${th.glow}`
                      : wasVisited
                      ? `0 0 8px ${nd.color}33`
                      : '0 2px 10px rgba(0,0,0,0.35)',
                    transition:
                      'box-shadow .25s,border-color .25s,background .25s',
                    direction: dir
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: 14,
                        border: '2px solid #22c55e',
                        animation: 'ring 1s ease-out infinite',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                  <div
                    style={{
                      height: H,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      position: 'relative',
                      gap: 8
                    }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 2.5,
                        background: nd.color,
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: th.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}
                    >
                      {nd.label[lang]}
                    </span>
                    {isActive && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#22c55e',
                          flexShrink: 0,
                          animation: 'pulse 0.6s ease-in-out infinite'
                        }}
                      />
                    )}
                    {nd.ins.map((port, i) => (
                      <div
                        key={port}
                        onMouseDown={e => startConn(e, node.id, port, true)}
                        onMouseUp={e => endConn(e, node.id, port, true)}
                        title={PORT_LABELS[lang][port] || port}
                        style={{
                          position: 'absolute',
                          [lang === 'ar' ? 'right' : 'left']: -8,
                          top: H / 2 + (i - (nd.ins.length - 1) / 2) * PS - 8,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: th.canvas,
                          border: `2.5px solid ${nd.color}`,
                          cursor: 'crosshair',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontSize: 6,
                            color: nd.color,
                            fontWeight: 700,
                            userSelect: 'none'
                          }}
                        >
                          {PORT_LABELS[lang][port]?.slice(0, 2) || ''}
                        </span>
                      </div>
                    ))}
                    {nd.outs.map((port, i) => (
                      <div
                        key={port}
                        onMouseDown={e => startConn(e, node.id, port, false)}
                        onMouseUp={e => endConn(e, node.id, port, false)}
                        title={PORT_LABELS[lang][port] || port}
                        style={{
                          position: 'absolute',
                          [lang === 'ar' ? 'left' : 'right']: -8,
                          top: H / 2 + (i - (nd.outs.length - 1) / 2) * PS - 8,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: nd.color,
                          border: `2.5px solid ${nd.color}`,
                          cursor: 'crosshair',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isActive
                            ? `0 0 8px ${nd.color}88`
                            : 'none',
                          transition: 'box-shadow .25s'
                        }}
                      >
                        <span
                          style={{
                            fontSize: 6,
                            color: '#fff',
                            fontWeight: 700,
                            userSelect: 'none'
                          }}
                        >
                          {PORT_LABELS[lang][port]?.slice(0, 2) || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {nodes.length === 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <div style={{ fontSize: 52, opacity: 0.15, marginBottom: 14 }}>
                ⚡
              </div>
              <div style={{ fontSize: 14, color: th.dim }}>{t.dragHint}</div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Inspector + Console */}
        <div
          style={{
            width: 258,
            background: th.panel,
            borderLeft: lang === 'en' ? `1px solid ${th.border}` : 'none',
            borderRight: lang === 'ar' ? `1px solid ${th.border}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            order: lang === 'ar' ? -1 : 3
          }}
        >
          {/* Inspector */}
          <div
            style={{ flexShrink: 0, borderBottom: `1px solid ${th.border}` }}
          >
            <div
              style={{
                padding: '10px 14px',
                fontSize: 10,
                fontWeight: 700,
                color: th.muted,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderBottom: `1px solid ${th.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{t.inspector}</span>
              {selNode && (
                <button
                  onClick={() => delNode(selNode.id)}
                  style={{
                    background: '#7f1d1d',
                    border: 'none',
                    color: '#fca5a5',
                    borderRadius: 5,
                    padding: '2px 8px',
                    fontSize: 10,
                    cursor: 'pointer'
                  }}
                >
                  {t.deleteBtn}
                </button>
              )}
            </div>
            {selNode ? (
              <div
                style={{
                  padding: '12px 14px',
                  maxHeight: 240,
                  overflowY: 'auto'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 13
                  }}
                >
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 3,
                      background: NODES[selNode.type].color,
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: th.text }}
                  >
                    {NODES[selNode.type].label[lang]}
                  </span>
                </div>
                {(FIELDS[selNode.type] || []).map(key =>
                  renderField(selNode, key)
                )}
                <div style={{ fontSize: 9, color: th.dim, marginTop: 6 }}>
                  id: {selNode.id}
                </div>
              </div>
            ) : (
              <div
                style={{ padding: '16px 14px', fontSize: 12, color: th.muted }}
              >
                {t.clickNode}
              </div>
            )}
          </div>

          {/* Console */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                fontSize: 10,
                fontWeight: 700,
                color: th.muted,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderBottom: `1px solid ${th.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{t.console}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: th.dim, fontSize: 9, fontWeight: 400 }}>
                  {t.lines(logs.length)}
                </span>
                <button
                  onClick={() => setLogs([])}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${th.border}`,
                    color: th.muted,
                    borderRadius: 4,
                    padding: '1px 7px',
                    fontSize: 10,
                    cursor: 'pointer'
                  }}
                >
                  {t.clearLog}
                </button>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 12px',
                background: th.consoleBg,
                direction: 'ltr'
              }}
            >
              {logs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    lineHeight: 1.7,
                    color: log.color || th.text,
                    fontWeight: log.bold ? 700 : 400,
                    wordBreak: 'break-word',
                    fontFamily: "'JetBrains Mono','Fira Code',monospace"
                  }}
                >
                  {log.text}
                </div>
              ))}
              <div ref={logRef} />
            </div>
          </div>
        </div>

        {/* AI AGENT PANEL */}
        {showAgent && (
          <div
            style={{
              width: 300,
              background: th.panel,
              borderLeft: lang === 'en' ? `1px solid ${th.border}` : 'none',
              borderRight: lang === 'ar' ? `1px solid ${th.border}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              order: lang === 'ar' ? -2 : 4
            }}
          >
            <AgentPanel
              th={th}
              t={t}
              lang={lang}
              nodes={nodes}
              conns={conns}
              onBuildWorkflow={handleBuildWorkflow}
              onRunWorkflow={runWorkflow}
              onLog={addLog}
            />
          </div>
        )}
      </div>

      {showProjects && (
        <ProjectsModal
          projects={projects}
          currentId={curProjId}
          onClose={() => setShowProjects(false)}
          onLoad={loadProject}
          onDelete={deleteProject}
          onNew={newProject}
          t={t}
          th={th}
          lang={lang}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Inter:wght@400;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.15)}}
        @keyframes ring{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.35);opacity:0}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${th.border};border-radius:2px}
        select option{background:${th.panel};color:${th.text}}
        input:focus,select:focus,textarea:focus{border-color:${th.accent}!important}
        *{box-sizing:border-box}
      `}</style>
    </div>
  )
}

function Btn ({ children, onClick, th, style = {} }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? th.nodeHover : 'transparent',
        border: `1px solid ${th.border}`,
        color: th.muted,
        borderRadius: 7,
        padding: '6px 12px',
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        flexShrink: 0,
        transition: 'background .15s',
        ...style
      }}
    >
      {children}
    </button>
  )
}
