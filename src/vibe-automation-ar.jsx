import { useState, useRef, useCallback, useEffect } from "react";

const NODE_TYPES = {
  start:    { label: "بداية",        color: "#22c55e", category: "control", inputs: [], outputs: ["تدفق"] },
  end:      { label: "نهاية",        color: "#ef4444", category: "control", inputs: ["تدفق"], outputs: [] },
  log:      { label: "طباعة",        color: "#3b82f6", category: "basic",   inputs: ["تدفق","نص"], outputs: ["تدفق"] },
  color:    { label: "طباعة ملونة",  color: "#8b5cf6", category: "basic",   inputs: ["تدفق","نص","لون"], outputs: ["تدفق"] },
  delay:    { label: "تأخير",        color: "#f59e0b", category: "inter",   inputs: ["تدفق","ms"], outputs: ["تدفق"] },
  input:    { label: "إدخال",        color: "#06b6d4", category: "inter",   inputs: [], outputs: ["قيمة"] },
  transform:{ label: "تحويل",        color: "#10b981", category: "inter",   inputs: ["نص","عملية"], outputs: ["نتيجة"] },
  merge:    { label: "دمج",          color: "#6366f1", category: "inter",   inputs: ["أ","ب","ج"], outputs: ["مدموج"] },
  condition:{ label: "شرط",          color: "#f97316", category: "advanced",inputs: ["تدفق","قيمة","مقارنة","رقم"], outputs: ["صح","خطأ"] },
  loop:     { label: "تكرار",        color: "#ec4899", category: "advanced",inputs: ["تدفق","عدد"], outputs: ["تدفق"] },
  api:      { label: "API طلب",      color: "#14b8a6", category: "advanced",inputs: ["تدفق","رابط","طريقة"], outputs: ["تدفق","رد"] },
  variable: { label: "متغير",        color: "#a855f7", category: "advanced",inputs: ["مفتاح","قيمة"], outputs: ["محفوظ"] },
  clear:    { label: "مسح الكونسول", color: "#64748b", category: "control", inputs: ["تدفق"], outputs: ["تدفق"] },
};

const NODE_DEFAULTS = {
  log:      { نص: "مرحباً بالعالم!" },
  color:    { نص: "نص ملوّن", لون: "#ff6b6b" },
  delay:    { ms: "1000" },
  input:    { افتراضي: "مدخل المستخدم" },
  transform:{ نص: "مرحبا", عملية: "uppercase" },
  merge:    { أ: "", ب: "", ج: "" },
  condition:{ قيمة: "5", مقارنة: "==", رقم: "5" },
  loop:     { عدد: "3" },
  api:      { رابط: "https://api.example.com/data", طريقة: "GET" },
  variable: { مفتاح: "متغيري", قيمة: "42" },
};

const CAT_LABELS = { basic: "أساسية", inter: "متوسطة", advanced: "متقدمة", control: "تحكم" };

let nid = Date.now();
function makeNode(type, x, y) {
  return { id: `n${++nid}`, type, x, y, data: { ...(NODE_DEFAULTS[type] || {}) } };
}

function makeDefaultWorkflow() {
  const s = makeNode("start", 80, 180);
  const l = makeNode("log", 300, 180);
  const e = makeNode("end", 520, 180);
  return {
    nodes: [s, l, e],
    conns: [
      { id: "c1", source: s.id, sourcePort: "تدفق", target: l.id, targetPort: "تدفق" },
      { id: "c2", source: l.id, sourcePort: "تدفق", target: e.id, targetPort: "تدفق" },
    ]
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Project Manager Modal ───────────────────────────────────────────────────
function ProjectsModal({ projects, currentId, onClose, onLoad, onDelete, onNew }) {
  const [newName, setNewName] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, width: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", direction: "rtl" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#38bdf8" }}>📁 مشاريعي</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{projects.length} مشروع محفوظ</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>

        {/* New project */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #334155", display: "flex", gap: 8 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newName.trim()) { onNew(newName.trim()); setNewName(""); } }}
            placeholder="اسم المشروع الجديد..."
            style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 6, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", direction: "rtl" }}
          />
          <button onClick={() => { if (newName.trim()) { onNew(newName.trim()); setNewName(""); } }}
            style={{ background: "#16a34a", border: "none", color: "#fff", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            + جديد
          </button>
        </div>

        {/* Project list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {projects.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#475569", fontSize: 13 }}>لا توجد مشاريع محفوظة بعد</div>
          )}
          {projects.map(p => (
            <div key={p.id} style={{
              padding: "12px 20px", display: "flex", alignItems: "center", gap: 12,
              background: p.id === currentId ? "#172032" : "transparent",
              borderRight: p.id === currentId ? "3px solid #38bdf8" : "3px solid transparent",
              transition: "background 0.15s"
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: p.id === currentId ? "#38bdf8" : "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.id === currentId && "● "}{p.name}
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                  {p.nodes?.length || 0} عقدة · {new Date(p.savedAt).toLocaleDateString("ar-SA")} {new Date(p.savedAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <button onClick={() => onLoad(p.id)}
                style={{ background: "#1d4ed8", border: "none", color: "#fff", borderRadius: 5, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                فتح
              </button>
              <button onClick={() => onDelete(p.id)}
                style={{ background: "#7f1d1d", border: "none", color: "#fca5a5", borderRadius: 5, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const def = makeDefaultWorkflow();

  // Project system state
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vibe_projects") || "[]"); } catch { return []; }
  });
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProjectName, setCurrentProjectName] = useState("مشروع جديد");
  const [showProjects, setShowProjects] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Canvas state
  const [nodes, setNodes] = useState(def.nodes);
  const [conns, setConns] = useState(def.conns);
  const [logs, setLogs] = useState([{ text: "نظام فايب كود جاهز. ابنِ سير العمل واضغط تشغيل.", color: "#94a3b8", t: Date.now() }]);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeNode, setActiveNode] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState(null);
  const [zoom, setZoom] = useState(1);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  // Persist projects
  useEffect(() => {
    localStorage.setItem("vibe_projects", JSON.stringify(projects));
  }, [projects]);

  // ── Project operations ──
  function saveProject() {
    const snapshot = { nodes, conns };
    if (currentProjectId) {
      setProjects(ps => ps.map(p => p.id === currentProjectId
        ? { ...p, name: currentProjectName, nodes, conns, savedAt: Date.now() }
        : p));
    } else {
      const id = `p${Date.now()}`;
      const newP = { id, name: currentProjectName, nodes, conns, savedAt: Date.now() };
      setProjects(ps => [...ps, newP]);
      setCurrentProjectId(id);
    }
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  }

  function loadProject(id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    setNodes(p.nodes || []);
    setConns(p.conns || []);
    setCurrentProjectId(p.id);
    setCurrentProjectName(p.name);
    setSelected(null);
    setLogs([{ text: `تم فتح المشروع: ${p.name}`, color: "#38bdf8", t: Date.now() }]);
    setShowProjects(false);
  }

  function deleteProject(id) {
    setProjects(ps => ps.filter(p => p.id !== id));
    if (currentProjectId === id) { setCurrentProjectId(null); setCurrentProjectName("مشروع جديد"); }
  }

  function newProject(name) {
    const d = makeDefaultWorkflow();
    const id = `p${Date.now()}`;
    const p = { id, name, nodes: d.nodes, conns: d.conns, savedAt: Date.now() };
    setProjects(ps => [...ps, p]);
    setNodes(d.nodes);
    setConns(d.conns);
    setCurrentProjectId(id);
    setCurrentProjectName(name);
    setSelected(null);
    setLogs([{ text: `تم إنشاء مشروع جديد: ${name}`, color: "#22c55e", t: Date.now() }]);
    setShowProjects(false);
  }

  // ── Canvas helpers ──
  const addLog = useCallback((text, color = "#e2e8f0", bold = false) => {
    setLogs(l => [...l, { text, color, bold, t: Date.now() }]);
  }, []);

  const canvasCoords = useCallback((clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom };
  }, [pan, zoom]);

  const onCanvasMouseDown = useCallback((e) => {
    if (e.button === 1 || e.altKey) {
      setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
      e.preventDefault(); return;
    }
    if (e.target === canvasRef.current || e.target === svgRef.current) setSelected(null);
  }, [pan]);

  const onMouseMove = useCallback((e) => {
    if (panStart) { setPan({ x: panStart.px + e.clientX - panStart.mx, y: panStart.py + e.clientY - panStart.my }); return; }
    if (dragging) {
      const c = canvasCoords(e.clientX, e.clientY);
      setNodes(ns => ns.map(n => n.id === dragging.id ? { ...n, x: c.x - dragging.ox, y: c.y - dragging.oy } : n));
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom });
  }, [dragging, panStart, canvasCoords, pan, zoom]);

  const onMouseUp = useCallback(() => {
    if (panStart) { setPanStart(null); return; }
    if (dragging) { setDragging(null); return; }
    if (connecting) setConnecting(null);
  }, [dragging, panStart, connecting]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.3, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  }, []);

  const startDrag = useCallback((e, node) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const c = canvasCoords(e.clientX, e.clientY);
    setDragging({ id: node.id, ox: c.x - node.x, oy: c.y - node.y });
    setSelected(node.id);
  }, [canvasCoords]);

  const startConnect = useCallback((e, nodeId, port, isInput) => {
    e.stopPropagation(); e.preventDefault();
    setConnecting({ nodeId, port, isInput });
  }, []);

  const endConnect = useCallback((e, nodeId, port, isInput) => {
    e.stopPropagation();
    if (!connecting || connecting.isInput === isInput) return;
    const src = connecting.isInput ? nodeId : connecting.nodeId;
    const srcPort = connecting.isInput ? port : connecting.port;
    const tgt = connecting.isInput ? connecting.nodeId : nodeId;
    const tgtPort = connecting.isInput ? connecting.port : port;
    if (src === tgt) return;
    setConns(cs => [...cs.filter(c => !(c.target === tgt && c.targetPort === tgtPort)),
      { id: `c${Date.now()}`, source: src, sourcePort: srcPort, target: tgt, targetPort: tgtPort }]);
    setConnecting(null);
  }, [connecting]);

  const deleteNode = useCallback((id) => {
    setNodes(ns => ns.filter(n => n.id !== id));
    setConns(cs => cs.filter(c => c.source !== id && c.target !== id));
    setSelected(null);
  }, []);

  const updateNodeData = useCallback((id, key, val) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, [key]: val } } : n));
  }, []);

  const dropOnCanvas = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    if (!type) return;
    const c = canvasCoords(e.clientX, e.clientY);
    setNodes(ns => [...ns, makeNode(type, c.x - 75, c.y - 26)]);
  }, [canvasCoords]);

  // ── Edge path ──
  function getEdgePath(conn) {
    const srcNode = nodes.find(n => n.id === conn.source);
    const tgtNode = nodes.find(n => n.id === conn.target);
    if (!srcNode || !tgtNode) return null;
    const si = NODE_TYPES[srcNode.type], ti = NODE_TYPES[tgtNode.type];
    const siIdx = si.outputs.indexOf(conn.sourcePort);
    const tiIdx = ti.inputs.indexOf(conn.targetPort);
    const W = 150, H = 52, PS = 16;
    const sx = srcNode.x + W;
    const sy = srcNode.y + H / 2 + (siIdx - (si.outputs.length - 1) / 2) * PS;
    const tx = tgtNode.x;
    const ty = tgtNode.y + H / 2 + (tiIdx - (ti.inputs.length - 1) / 2) * PS;
    const cx = (sx + tx) / 2;
    return `M ${sx} ${sy} C ${cx} ${sy}, ${cx} ${ty}, ${tx} ${ty}`;
  }

  // ── Run ──
  async function runWorkflow() {
    if (running) return;
    setRunning(true);
    setLogs([{ text: "▶ جارٍ تشغيل سير العمل...", color: "#22c55e", bold: true, t: Date.now() }]);
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
    const getNext = (fromId, port) => {
      const c = conns.find(c => c.source === fromId && c.sourcePort === port);
      return c ? { node: nodeMap[c.target], port: c.targetPort } : null;
    };
    const startNode = nodes.find(n => n.type === "start");
    if (!startNode) { addLog("❌ لا توجد عقدة بداية!", "#ef4444", true); setRunning(false); return; }
    const vars = {};
    let current = { node: startNode, port: "تدفق" };
    let steps = 0;
    while (current?.node && steps++ < 100) {
      const { node } = current;
      setActiveNode(node.id);
      await sleep(200);
      switch (node.type) {
        case "start": addLog("◉ بداية", "#22c55e", true); current = getNext(node.id, "تدفق"); break;
        case "end":   addLog("◉ نهاية", "#ef4444", true); current = null; break;
        case "log":   addLog(`📝 ${node.data["نص"] || ""}`, "#e2e8f0"); current = getNext(node.id, "تدفق"); break;
        case "color": addLog(`🎨 ${node.data["نص"] || ""}`, node.data["لون"] || "#fff"); current = getNext(node.id, "تدفق"); break;
        case "delay": {
          const ms = parseInt(node.data["ms"]) || 1000;
          addLog(`⏳ انتظار ${ms}ms...`, "#f59e0b");
          await sleep(ms);
          addLog("✓ انتهى الانتظار", "#64748b");
          current = getNext(node.id, "تدفق"); break;
        }
        case "input": addLog(`📥 إدخال: "${node.data["افتراضي"] || ""}"`, "#06b6d4"); current = null; break;
        case "transform": {
          let t = node.data["نص"] || "", op = node.data["عملية"] || "uppercase";
          if (op === "uppercase") t = t.toUpperCase();
          else if (op === "lowercase") t = t.toLowerCase();
          else if (op === "reverse") t = [...t].reverse().join("");
          else if (op === "trim") t = t.trim();
          addLog(`🔄 تحويل → "${t}"`, "#10b981"); current = null; break;
        }
        case "merge": {
          const m = [node.data["أ"], node.data["ب"], node.data["ج"]].filter(Boolean).join(" | ");
          addLog(`🔀 دمج → "${m}"`, "#6366f1"); current = null; break;
        }
        case "condition": {
          const v = node.data["قيمة"], cmp = node.data["رقم"], op = node.data["مقارنة"] || "==";
          let res = op === "==" ? v == cmp : op === "!=" ? v != cmp : op === ">" ? parseFloat(v) > parseFloat(cmp) : parseFloat(v) < parseFloat(cmp);
          addLog(`🔀 شرط: ${v} ${op} ${cmp} → ${res ? "صحيح" : "خاطئ"}`, res ? "#22c55e" : "#ef4444");
          current = getNext(node.id, res ? "صح" : "خطأ"); break;
        }
        case "loop": {
          const cnt = parseInt(node.data["عدد"]) || 3;
          addLog(`🔁 تكرار × ${cnt}`, "#ec4899", true);
          for (let i = 0; i < cnt; i++) { addLog(`  تكرار ${i + 1}/${cnt}`, "#94a3b8"); await sleep(300); }
          current = getNext(node.id, "تدفق"); break;
        }
        case "api":
          addLog(`🌐 جارٍ جلب ${node.data["طريقة"] || "GET"} ${node.data["رابط"]}...`, "#14b8a6");
          await sleep(800);
          addLog('✓ الرد: { "status": 200, "data": "بيانات وهمية" }', "#94a3b8");
          current = getNext(node.id, "تدفق"); break;
        case "variable":
          vars[node.data["مفتاح"]] = node.data["قيمة"];
          addLog(`📦 ${node.data["مفتاح"]} = "${node.data["قيمة"]}"`, "#a855f7"); current = null; break;
        case "clear": setLogs([]); addLog("🧹 تم مسح الكونسول", "#64748b"); current = getNext(node.id, "تدفق"); break;
        default: current = null;
      }
    }
    if (steps >= 100) addLog("⚠ تجاوز الحد الأقصى للتنفيذ", "#f59e0b", true);
    setActiveNode(null); setRunning(false);
    addLog("✓ اكتمل سير العمل", "#22c55e", true);
  }

  const nodesByCategory = {};
  Object.entries(NODE_TYPES).forEach(([type, info]) => {
    if (!nodesByCategory[info.category]) nodesByCategory[info.category] = [];
    nodesByCategory[info.category].push(type);
  });

  const selectedNode = nodes.find(n => n.id === selected);
  const W = 150, H = 52, PS = 16;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", fontFamily: "'Tajawal', 'Cairo', 'Segoe UI', sans-serif", color: "#e2e8f0", overflow: "hidden", direction: "rtl" }}>

      {/* Projects modal */}
      {showProjects && (
        <ProjectsModal
          projects={projects}
          currentId={currentProjectId}
          onClose={() => setShowProjects(false)}
          onLoad={loadProject}
          onDelete={deleteProject}
          onNew={newProject}
        />
      )}

      {/* Right sidebar (node panel) */}
      <div style={{ width: 188, background: "#1e293b", borderLeft: "1px solid #334155", display: "flex", flexDirection: "column", flexShrink: 0, order: 3 }}>
        <div style={{ padding: "16px 12px 8px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#38bdf8" }}>⚡ فايب كود</div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>استوديو الأتمتة</div>
        </div>
        <div style={{ padding: "8px 10px 4px", fontSize: 10, color: "#475569" }}>اسحب العقد إلى اللوحة</div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 8px" }}>
          {["control", "basic", "inter", "advanced"].map(cat => (
            <div key={cat}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 12px 3px" }}>{CAT_LABELS[cat]}</div>
              {nodesByCategory[cat]?.map(type => {
                const info = NODE_TYPES[type];
                return (
                  <div key={type} draggable onDragStart={e => e.dataTransfer.setData("nodeType", type)}
                    style={{ padding: "7px 12px", cursor: "grab", display: "flex", alignItems: "center", gap: 8, fontSize: 12, transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#263345"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, background: info.color, flexShrink: 0 }} />
                    {info.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #334155", fontSize: 9, color: "#334155", lineHeight: 1.6, textAlign: "center" }}>
          Alt + سحب للتحريك<br />عجلة الفأرة للتكبير
        </div>
      </div>

      {/* Main canvas area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, order: 2 }}>
        {/* Toolbar */}
        <div style={{ height: 50, background: "#1e293b", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: 8, padding: "0 14px", flexShrink: 0 }}>
          {/* Project name */}
          {editingName ? (
            <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)}
              onBlur={() => { setCurrentProjectName(tempName); setEditingName(false); }}
              onKeyDown={e => { if (e.key === "Enter") { setCurrentProjectName(tempName); setEditingName(false); } }}
              style={{ background: "#0f172a", border: "1px solid #38bdf8", color: "#38bdf8", borderRadius: 5, padding: "4px 10px", fontSize: 13, fontFamily: "inherit", width: 160 }} />
          ) : (
            <div onClick={() => { setTempName(currentProjectName); setEditingName(true); }}
              style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", cursor: "text", padding: "4px 8px", borderRadius: 5, border: "1px solid transparent", transition: "all 0.15s", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.currentTarget.style.border = "1px solid #334155"}
              onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
              title="اضغط لتعديل الاسم">
              {currentProjectName}
            </div>
          )}

          <button onClick={() => setShowProjects(true)}
            style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
            📁 <span>{projects.length}</span>
          </button>

          <button onClick={saveProject}
            style={{ background: saveFlash ? "#166534" : "transparent", border: `1px solid ${saveFlash ? "#22c55e" : "#334155"}`, color: saveFlash ? "#4ade80" : "#94a3b8", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s" }}>
            {saveFlash ? "✓ محفوظ!" : "💾 حفظ"}
          </button>

          <div style={{ width: 1, height: 24, background: "#334155", margin: "0 4px" }} />

          <button onClick={runWorkflow} disabled={running}
            style={{ background: running ? "#14532d" : "#16a34a", border: "none", color: "#fff", borderRadius: 6, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: running ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            {running ? "⏳ يعمل..." : "▶ تشغيل"}
          </button>

          <button onClick={() => { const d = makeDefaultWorkflow(); setNodes(d.nodes); setConns(d.conns); setSelected(null); }}
            style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            مسح الكل
          </button>

          <button onClick={() => setLogs([])}
            style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            مسح السجل
          </button>

          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: "#475569" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            style={{ background: "transparent", border: "1px solid #334155", color: "#64748b", borderRadius: 5, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⌂</button>
          {selected && (
            <button onClick={() => deleteNode(selected)}
              style={{ background: "#7f1d1d", border: "none", color: "#fca5a5", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              🗑 حذف
            </button>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* Canvas */}
          <div ref={canvasRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0f172a", cursor: panStart ? "grabbing" : "default" }}
            onMouseDown={onCanvasMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={onWheel} onDragOver={e => e.preventDefault()} onDrop={dropOnCanvas}>
            {/* Grid */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <defs>
                <pattern id="g" x={pan.x % (20 * zoom)} y={pan.y % (20 * zoom)} width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse">
                  <path d={`M ${20 * zoom} 0 L 0 0 0 ${20 * zoom}`} fill="none" stroke="#1a2744" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g)" />
            </svg>

            {/* Transform layer */}
            <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})` }}>
              {/* Edges SVG */}
              <svg ref={svgRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
                <defs>
                  <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#38bdf8" />
                  </marker>
                </defs>
                {conns.map(conn => {
                  const path = getEdgePath(conn);
                  if (!path) return null;
                  return (
                    <g key={conn.id} style={{ pointerEvents: "stroke" }}>
                      <path d={path} fill="none" stroke="transparent" strokeWidth={10} style={{ cursor: "pointer", pointerEvents: "stroke" }} onClick={() => setConns(cs => cs.filter(c => c.id !== conn.id))} />
                      <path d={path} fill="none" stroke="#38bdf8" strokeWidth={1.5} markerEnd="url(#arr)" opacity={0.6} />
                    </g>
                  );
                })}
                {connecting && (
                  <line x1={mousePos.x} y1={mousePos.y} x2={mousePos.x} y2={mousePos.y} stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="5,4" />
                )}
              </svg>

              {/* Nodes */}
              {nodes.map(node => {
                const info = NODE_TYPES[node.type];
                const isActive = activeNode === node.id;
                const isSel = selected === node.id;
                return (
                  <div key={node.id}
                    onMouseDown={e => startDrag(e, node)}
                    onClick={e => { e.stopPropagation(); setSelected(node.id); }}
                    style={{
                      position: "absolute", left: node.x, top: node.y, width: W, height: H,
                      background: "#1e293b",
                      border: `2px solid ${isSel ? "#38bdf8" : isActive ? "#22c55e" : info.color + "55"}`,
                      borderRadius: 8, cursor: "grab", userSelect: "none",
                      boxShadow: isActive ? `0 0 18px ${info.color}44` : isSel ? "0 0 12px #38bdf844" : "0 2px 8px #00000055",
                      transition: "box-shadow 0.2s, border-color 0.2s",
                      direction: "rtl",
                    }}>
                    <div style={{ height: H, display: "flex", alignItems: "center", padding: "0 10px", position: "relative" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: info.color, marginLeft: 8, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{info.label}</span>
                      {isActive && <div style={{ position: "absolute", left: 8, width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />}
                      {/* Input ports (right side in RTL = logical right) */}
                      {info.inputs.map((port, i) => (
                        <div key={port} data-port={port} data-input="true"
                          onMouseDown={e => startConnect(e, node.id, port, true)}
                          onMouseUp={e => endConnect(e, node.id, port, true)}
                          title={port}
                          style={{ position: "absolute", right: -6, top: H / 2 + (i - (info.inputs.length - 1) / 2) * PS - 5, width: 10, height: 10, borderRadius: "50%", background: "#0f172a", border: `2px solid ${info.color}`, cursor: "crosshair", zIndex: 10 }} />
                      ))}
                      {/* Output ports (left side) */}
                      {info.outputs.map((port, i) => (
                        <div key={port} data-port={port} data-input="false"
                          onMouseDown={e => startConnect(e, node.id, port, false)}
                          onMouseUp={e => endConnect(e, node.id, port, false)}
                          title={port}
                          style={{ position: "absolute", left: -6, top: H / 2 + (i - (info.outputs.length - 1) / 2) * PS - 5, width: 10, height: 10, borderRadius: "50%", background: info.color, border: `2px solid ${info.color}`, cursor: "crosshair", zIndex: 10 }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {nodes.length === 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⚡</div>
                <div style={{ fontSize: 14, color: "#334155", textAlign: "center" }}>اسحب عقدة من الشريط الجانبي للبدء</div>
              </div>
            )}
          </div>

          {/* Left panel: inspector + console */}
          <div style={{ width: 252, background: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column", flexShrink: 0, order: -1 }}>
            {/* Inspector */}
            <div style={{ borderBottom: "1px solid #334155", flexShrink: 0 }}>
              <div style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", borderBottom: "1px solid #0f172a" }}>🔍 الخصائص</div>
              {selectedNode ? (
                <div style={{ padding: "10px 14px", maxHeight: 260, overflowY: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: NODE_TYPES[selectedNode.type].color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{NODE_TYPES[selectedNode.type].label}</span>
                  </div>
                  {Object.keys(NODE_DEFAULTS[selectedNode.type] || {}).map(key => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>{key}</div>
                      {key === "عملية" ? (
                        <select value={selectedNode.data[key] || "uppercase"} onChange={e => updateNodeData(selectedNode.id, key, e.target.value)}
                          style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", direction: "ltr" }}>
                          <option value="uppercase">UPPERCASE</option>
                          <option value="lowercase">lowercase</option>
                          <option value="reverse">عكس</option>
                          <option value="trim">إزالة مسافات</option>
                        </select>
                      ) : key === "مقارنة" ? (
                        <select value={selectedNode.data[key] || "=="} onChange={e => updateNodeData(selectedNode.id, key, e.target.value)}
                          style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", direction: "ltr" }}>
                          <option value="==">==</option><option value="!=">!=</option><option value=">">{">"}</option><option value="<">{"<"}</option>
                        </select>
                      ) : key === "طريقة" ? (
                        <select value={selectedNode.data[key] || "GET"} onChange={e => updateNodeData(selectedNode.id, key, e.target.value)}
                          style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", direction: "ltr" }}>
                          <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                        </select>
                      ) : key === "لون" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <input type="color" value={selectedNode.data[key] || "#ff6b6b"} onChange={e => updateNodeData(selectedNode.id, key, e.target.value)}
                            style={{ width: 36, height: 30, padding: 2, background: "#0f172a", border: "1px solid #334155", borderRadius: 4, cursor: "pointer" }} />
                          <input type="text" value={selectedNode.data[key] || ""} onChange={e => updateNodeData(selectedNode.id, key, e.target.value)}
                            style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", direction: "ltr" }} />
                        </div>
                      ) : (
                        <input type="text" value={selectedNode.data[key] || ""} onChange={e => updateNodeData(selectedNode.id, key, e.target.value)}
                          style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
                      )}
                    </div>
                  ))}
                  <div style={{ fontSize: 9, color: "#2d3f55", marginTop: 4 }}>ID: {selectedNode.id}</div>
                </div>
              ) : (
                <div style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>اضغط على عقدة لعرض خصائصها</div>
              )}
            </div>

            {/* Console */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>💻 الكونسول</span>
                <span style={{ color: "#334155" }}>{logs.length} سطر</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px", background: "#0a1020", direction: "ltr" }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ fontSize: 11, lineHeight: 1.65, color: log.color || "#e2e8f0", fontWeight: log.bold ? 700 : 400, wordBreak: "break-word", fontFamily: "monospace" }}>
                    {log.text}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        select option { background: #1e293b; color: #e2e8f0; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
