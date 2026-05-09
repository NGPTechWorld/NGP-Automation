import { useState, useRef, useCallback, useEffect } from "react";

// ══════════════════════════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════════════════════════
const T = {
  ar: {
    appName:"فايب كود", appSub:"استوديو الأتمتة",
    run:"▶ تشغيل", running:"⏳ يعمل...", stop:"■ إيقاف",
    save:"💾 حفظ", saved:"✓ محفوظ!",
    clearAll:"مسح الكل", clearLog:"مسح السجل",
    projects:"📁 مشاريع", myProjects:"📁 مشاريعي",
    projectsSaved: n=>`${n} مشروع`,
    newPlaceholder:"اسم المشروع الجديد...",
    newBtn:"+ جديد", openBtn:"فتح",
    noProjects:"لا توجد مشاريع بعد",
    inspector:"الخصائص", console:"الكونسول",
    clickNode:"اضغط على عقدة لعرض خصائصها",
    dragHint:"اسحب عقدة من الشريط الجانبي",
    panHint:"Alt+سحب للتحريك | عجلة للتكبير",
    deleteBtn:"🗑 حذف", resetView:"⌂",
    catControl:"تحكم", catBasic:"أساسية", catInter:"متوسطة", catAdvanced:"متقدمة",
    theme:"الثيم", lang:"EN",
    lines: n=>`${n} سطر`,
    opUp:"كبيرة", opLow:"صغيرة", opRev:"عكس", opTrim:"قص",
    // run logs
    lReady:"نظام فايب كود جاهز. ابنِ سير العمل واضغط تشغيل.",
    lStart:"▶ تشغيل سير العمل...",
    lNoStart:"❌ لا توجد عقدة بداية!",
    lNodeStart:"◉ بداية",
    lNodeEnd:"◉ نهاية",
    lLog: t=>`📝 ${t}`,
    lColor: t=>`🎨 ${t}`,
    lWait: ms=>`⏳ انتظار ${ms}ms...`,
    lWaitDone:"✓ انتهى الانتظار",
    lInput: (lbl,v)=>`📥 ${lbl}: "${v}"`,
    lTransform: (op,v)=>`🔄 ${op} → "${v}"`,
    lMerge: v=>`🔀 دمج → "${v}"`,
    lCond: (a,op,b,r)=>`🔀 شرط: ${a} ${op} ${b} → ${r?"صحيح ✓":"خاطئ ✗"}`,
    lLoop: n=>`🔁 تكرار × ${n}`,
    lIter: (i,n)=>`  · تكرار ${i}/${n}`,
    lLoopDone:"✓ انتهى التكرار",
    lApi: (m,u)=>`🌐 جلب ${m} ${u}...`,
    lApiOk:'✓ رد: {"status":200,"data":"mock"}',
    lApiErr: e=>`❌ خطأ: ${e}`,
    lVar: (k,v)=>`📦 ${k} = "${v}"`,
    lClear:"🧹 مسح الكونسول",
    lLimit:"⚠ تجاوز الحد الأقصى (100 خطوة)",
    lDone:"✅ اكتمل التنفيذ",
    lOpen: n=>`تم فتح: ${n}`,
    lNew: n=>`مشروع جديد: ${n}`,
  },
  en: {
    appName:"NGP Automation", appSub:"Automation Studio",
    run:"▶ Run", running:"⏳ Running...", stop:"■ Stop",
    save:"💾 Save", saved:"✓ Saved!",
    clearAll:"Clear All", clearLog:"Clear Log",
    projects:"📁 Projects", myProjects:"📁 My Projects",
    projectsSaved: n=>`${n} project${n!==1?"s":""}`,
    newPlaceholder:"New project name...",
    newBtn:"+ New", openBtn:"Open",
    noProjects:"No saved projects yet",
    inspector:"Inspector", console:"Console",
    clickNode:"Click a node to inspect it",
    dragHint:"Drag a node from the sidebar",
    panHint:"Alt+drag to pan | Scroll to zoom",
    deleteBtn:"🗑 Delete", resetView:"⌂",
    catControl:"Control", catBasic:"Basic", catInter:"Intermediate", catAdvanced:"Advanced",
    theme:"Theme", lang:"AR",
    lines: n=>`${n} line${n!==1?"s":""}`,
    opUp:"UPPERCASE", opLow:"lowercase", opRev:"Reverse", opTrim:"Trim",
    lReady:"Vibe Code ready. Build your workflow and click Run.",
    lStart:"▶ Running workflow...",
    lNoStart:"❌ No Start node found!",
    lNodeStart:"◉ Start",
    lNodeEnd:"◉ End",
    lLog: t=>`📝 ${t}`,
    lColor: t=>`🎨 ${t}`,
    lWait: ms=>`⏳ Waiting ${ms}ms...`,
    lWaitDone:"✓ Done waiting",
    lInput: (lbl,v)=>`📥 ${lbl}: "${v}"`,
    lTransform: (op,v)=>`🔄 ${op} → "${v}"`,
    lMerge: v=>`🔀 Merge → "${v}"`,
    lCond: (a,op,b,r)=>`🔀 Condition: ${a} ${op} ${b} → ${r?"TRUE ✓":"FALSE ✗"}`,
    lLoop: n=>`🔁 Loop × ${n}`,
    lIter: (i,n)=>`  · Iteration ${i}/${n}`,
    lLoopDone:"✓ Loop done",
    lApi: (m,u)=>`🌐 ${m} ${u}...`,
    lApiOk:'✓ Response: {"status":200,"data":"mock"}',
    lApiErr: e=>`❌ Error: ${e}`,
    lVar: (k,v)=>`📦 ${k} = "${v}"`,
    lClear:"🧹 Console cleared",
    lLimit:"⚠ Execution limit reached (100 steps)",
    lDone:"✅ Workflow complete",
    lOpen: n=>`Opened: ${n}`,
    lNew: n=>`New project: ${n}`,
  }
};

// ══════════════════════════════════════════════════════════════
// THEMES
// ══════════════════════════════════════════════════════════════
const THEMES = {
  dark:{
    name:{ar:"داكن",en:"Dark"}, icon:"🌙",
    bg:"#0f172a", panel:"#1e293b", border:"#334155",
    text:"#e2e8f0", muted:"#64748b", dim:"#475569",
    canvas:"#0a1120", consoleBg:"#070e1a",
    accent:"#38bdf8", accentDim:"#0369a1",
    grid:"#1e293b", nodeHover:"#263345",
    nodeBg:"#1e293b", nodeActive:"rgba(34,197,94,0.15)",
    glow:"rgba(56,189,248,0.3)",
  },
  light:{
    name:{ar:"فاتح",en:"Light"}, icon:"☀️",
    bg:"#f8fafc", panel:"#ffffff", border:"#e2e8f0",
    text:"#0f172a", muted:"#64748b", dim:"#94a3b8",
    canvas:"#f1f5f9", consoleBg:"#f8fafc",
    accent:"#0284c7", accentDim:"#0ea5e9",
    grid:"#e2e8f0", nodeHover:"#f0f9ff",
    nodeBg:"#ffffff", nodeActive:"rgba(34,197,94,0.1)",
    glow:"rgba(2,132,199,0.2)",
  },
  midnight:{
    name:{ar:"منتصف الليل",en:"Midnight"}, icon:"🔮",
    bg:"#080818", panel:"#0f0f28", border:"#1e1e4a",
    text:"#ddd6fe", muted:"#7c6fad", dim:"#4c4880",
    canvas:"#060614", consoleBg:"#040410",
    accent:"#a78bfa", accentDim:"#7c3aed",
    grid:"#0f0f28", nodeHover:"#151530",
    nodeBg:"#0f0f28", nodeActive:"rgba(167,139,250,0.15)",
    glow:"rgba(167,139,250,0.35)",
  },
  forest:{
    name:{ar:"غابة",en:"Forest"}, icon:"🌿",
    bg:"#0a1a0c", panel:"#112018", border:"#1a3522",
    text:"#bbf7d0", muted:"#4a7a58", dim:"#2d5438",
    canvas:"#080f09", consoleBg:"#050b06",
    accent:"#34d399", accentDim:"#059669",
    grid:"#112018", nodeHover:"#162a1c",
    nodeBg:"#112018", nodeActive:"rgba(52,211,153,0.15)",
    glow:"rgba(52,211,153,0.3)",
  },
  sunset:{
    name:{ar:"غروب",en:"Sunset"}, icon:"🌅",
    bg:"#1a0a0a", panel:"#2a1018", border:"#4a1a28",
    text:"#fde8d8", muted:"#8a4a58", dim:"#5a2a38",
    canvas:"#120808", consoleBg:"#0e0606",
    accent:"#f97316", accentDim:"#dc2626",
    grid:"#2a1018", nodeHover:"#3a1820",
    nodeBg:"#2a1018", nodeActive:"rgba(249,115,22,0.15)",
    glow:"rgba(249,115,22,0.3)",
  },
};

// ══════════════════════════════════════════════════════════════
// NODE DEFINITIONS — language-neutral type keys, bilingual labels
// Data fields stored with neutral keys (always English internally)
// ══════════════════════════════════════════════════════════════
const NODES = {
  start:    { label:{ar:"بداية",    en:"Start"},          color:"#22c55e", cat:"control",  ins:[],                           outs:["out"] },
  end:      { label:{ar:"نهاية",    en:"End"},            color:"#ef4444", cat:"control",  ins:["in"],                       outs:[] },
  log:      { label:{ar:"طباعة",    en:"Log"},            color:"#3b82f6", cat:"basic",    ins:["in","text"],                outs:["out"] },
  color:    { label:{ar:"ملوّن",    en:"Color Log"},      color:"#8b5cf6", cat:"basic",    ins:["in","text","color"],        outs:["out"] },
  delay:    { label:{ar:"تأخير",    en:"Delay"},          color:"#f59e0b", cat:"inter",    ins:["in","ms"],                  outs:["out"] },
  input:    { label:{ar:"إدخال",    en:"Input"},          color:"#06b6d4", cat:"inter",    ins:[],                           outs:["value"] },
  transform:{ label:{ar:"تحويل",    en:"Transform"},      color:"#10b981", cat:"inter",    ins:["in","text"],                outs:["result"] },
  merge:    { label:{ar:"دمج",      en:"Merge"},          color:"#6366f1", cat:"inter",    ins:["in","a","b","c"],           outs:["out"] },
  condition:{ label:{ar:"شرط",      en:"Condition"},      color:"#f97316", cat:"advanced", ins:["in","value","compare"],     outs:["true","false"] },
  loop:     { label:{ar:"تكرار",    en:"Loop"},           color:"#ec4899", cat:"advanced", ins:["in","body"],                outs:["out"] },
  api:      { label:{ar:"API",      en:"API"},            color:"#14b8a6", cat:"advanced", ins:["in","url","method"],        outs:["out","response"] },
  variable: { label:{ar:"متغير",    en:"Variable"},       color:"#a855f7", cat:"advanced", ins:["key","value"],              outs:["stored"] },
  clear:    { label:{ar:"مسح",      en:"Clear"},          color:"#64748b", cat:"control",  ins:["in"],                       outs:["out"] },
};

// Default field values (neutral English keys always)
const DEFAULTS = {
  log:      { text:"Hello, World!" },
  color:    { text:"Colored text", color:"#ff6b6b" },
  delay:    { ms:"1000" },
  input:    { label:"Name", default:"Alice" },
  transform:{ text:"hello world", op:"uppercase" },
  merge:    { a:"foo", b:"bar", c:"" },
  condition:{ value:"10", op:">", compare:"5" },
  loop:     { count:"3", body:"" },
  api:      { url:"https://jsonplaceholder.typicode.com/posts/1", method:"GET" },
  variable: { key:"myVar", value:"42" },
};

// Human-readable field labels per language
const FIELD_LABELS = {
  ar:{ text:"النص", color:"اللون", ms:"مدة (ms)", label:"التسمية", default:"الافتراضي",
       op:"العملية", a:"أ", b:"ب", c:"ج", value:"القيمة", compare:"المقارنة",
       count:"العدد", body:"محتوى الجسم", url:"الرابط", method:"الطريقة",
       key:"المفتاح" },
  en:{ text:"Text", color:"Color", ms:"Duration (ms)", label:"Label", default:"Default",
       op:"Operation", a:"A", b:"B", c:"C", value:"Value", compare:"Compare",
       count:"Count", body:"Body", url:"URL", method:"Method", key:"Key" },
};

let _nid = Date.now();
const uid = () => `n${++_nid}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function createNode(type, x, y) {
  return { id: uid(), type, x, y, data: { ...( DEFAULTS[type] || {} ) } };
}
function makeDefaultWorkflow() {
  const s = createNode("start", 80, 180);
  const l = createNode("log", 310, 180);
  const e = createNode("end", 540, 180);
  return {
    nodes: [s, l, e],
    conns: [
      { id:"c1", src:s.id, srcPort:"out", dst:l.id, dstPort:"in" },
      { id:"c2", src:l.id, srcPort:"out", dst:e.id, dstPort:"in" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════
// PORT LABEL: show bilingual port name on the node dot
// ══════════════════════════════════════════════════════════════
const PORT_LABELS = {
  ar:{ out:"خ", in:"د", value:"قيمة", result:"نتيجة", stored:"محفوظ",
       true:"صح", false:"خطأ", response:"رد", a:"أ", b:"ب", c:"ج",
       text:"نص", color:"لون", ms:"ms", url:"رابط", method:"طريقة",
       key:"مفتاح", compare:"قارن", body:"جسم" },
  en:{ out:"▶", in:"▶", value:"val", result:"res", stored:"stored",
       true:"T", false:"F", response:"resp", a:"a", b:"b", c:"c",
       text:"txt", color:"col", ms:"ms", url:"url", method:"met",
       key:"key", compare:"cmp", body:"body" },
};

// ══════════════════════════════════════════════════════════════
// PROJECTS MODAL
// ══════════════════════════════════════════════════════════════
function ProjectsModal({ projects, currentId, onClose, onLoad, onDelete, onNew, t, th, lang }) {
  const [name, setName] = useState("");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const submit = () => { if (name.trim()) { onNew(name.trim()); setName(""); }};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:th.panel,border:`1px solid ${th.border}`,borderRadius:14,width:500,maxHeight:"78vh",display:"flex",flexDirection:"column",direction:dir,boxShadow:`0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${th.border}`}}>
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:th.accent}}>{t.myProjects}</div>
            <div style={{fontSize:11,color:th.muted,marginTop:2}}>{t.projectsSaved(projects.length)}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:th.muted,fontSize:22,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>✕</button>
        </div>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${th.border}`,display:"flex",gap:8}}>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder={t.newPlaceholder}
            style={{flex:1,background:th.bg,border:`1px solid ${th.border}`,color:th.text,borderRadius:8,padding:"9px 13px",fontSize:13,fontFamily:"inherit",direction:dir,outline:"none"}}/>
          <button onClick={submit} style={{background:th.accent,border:"none",color:"#fff",borderRadius:8,padding:"9px 18px",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:700,whiteSpace:"nowrap"}}>{t.newBtn}</button>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {projects.length===0&&<div style={{padding:"40px",textAlign:"center",color:th.muted,fontSize:13}}>{t.noProjects}</div>}
          {[...projects].reverse().map(p=>{
            const active = p.id===currentId;
            return (
              <div key={p.id} onClick={()=>onLoad(p.id)}
                style={{padding:"13px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${th.border}`,background:active?th.nodeHover:"transparent",cursor:"pointer",transition:"background .15s",
                  [lang==="ar"?"borderRight":"borderLeft"]:active?`3px solid ${th.accent}`:"3px solid transparent"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:active?th.accent:th.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{active&&"● "}{p.name}</div>
                  <div style={{fontSize:11,color:th.muted,marginTop:3}}>
                    {(p.nodes||[]).length} nodes · {new Date(p.savedAt).toLocaleString(lang==="ar"?"ar-SA":"en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();onLoad(p.id);}} style={{background:th.accentDim,border:"none",color:"#fff",borderRadius:7,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{t.openBtn}</button>
                <button onClick={e=>{e.stopPropagation();onDelete(p.id);}} style={{background:"#7f1d1d",border:"none",color:"#fca5a5",borderRadius:7,padding:"6px 10px",fontSize:12,cursor:"pointer"}}>🗑</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  // ── Preferences (persist, no canvas reset) ──────────────────
  const [lang, setLang]           = useState(() => localStorage.getItem("vbc_lang") || "ar");
  const [themeName, setThemeName] = useState(() => localStorage.getItem("vbc_theme") || "dark");
  useEffect(() => localStorage.setItem("vbc_lang", lang), [lang]);
  useEffect(() => localStorage.setItem("vbc_theme", themeName), [themeName]);
  const th  = THEMES[themeName];
  const t   = T[lang];
  const dir = lang==="ar" ? "rtl" : "ltr";

  // ── Projects ────────────────────────────────────────────────
  const [projects, setProjects]       = useState(() => { try { return JSON.parse(localStorage.getItem("vbc_projects")||"[]"); } catch { return []; } });
  const [curProjId, setCurProjId]     = useState(null);
  const [projName, setProjName]       = useState(() => lang==="ar"?"مشروع جديد":"New Project");
  const [showProjects, setShowProjects] = useState(false);
  const [saveFlash, setSaveFlash]     = useState(false);
  const [editName, setEditName]       = useState(false);
  const [tempName, setTempName]       = useState("");
  const [showThemes, setShowThemes]   = useState(false);
  useEffect(() => localStorage.setItem("vbc_projects", JSON.stringify(projects)), [projects]);

  // ── Canvas state ────────────────────────────────────────────
  const def = makeDefaultWorkflow();
  const [nodes, setNodes]       = useState(def.nodes);
  const [conns, setConns]       = useState(def.conns);
  const [pan, setPan]           = useState({x:60,y:20});
  const [zoom, setZoom]         = useState(1);
  const [panStart, setPanStart] = useState(null);
  const [dragging, setDragging] = useState(null);   // {id, ox, oy}
  const [connecting, setConnecting] = useState(null); // {nodeId, port, isInput}
  const [mouse, setMouse]       = useState({x:0,y:0});
  const [selected, setSelected] = useState(null);

  // ── Execution state ─────────────────────────────────────────
  const [running, setRunning]       = useState(false);
  const [activeNode, setActiveNode] = useState(null);   // currently executing node id
  const [visitedNodes, setVisitedNodes] = useState([]); // trail of visited
  const [logs, setLogs]             = useState([{text:T[lang].lReady, color:"#64748b", t:Date.now()}]);
  const stopRef = useRef(false);

  const canvasRef = useRef(null);
  const logRef    = useRef(null);
  useEffect(() => { logRef.current?.scrollIntoView({behavior:"smooth"}); }, [logs]);

  const addLog = useCallback((text, color="#e2e8f0", bold=false) => {
    setLogs(l => [...l, {text, color, bold, t:Date.now()}]);
  }, []);

  // ── Coord helpers ────────────────────────────────────────────
  const toCanvas = useCallback((cx, cy) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x:(cx-r.left-pan.x)/zoom, y:(cy-r.top-pan.y)/zoom };
  }, [pan, zoom]);

  // ── Mouse handlers ────────────────────────────────────────────
  const onBgDown = useCallback(e => {
    if (e.button===1 || e.altKey) {
      setPanStart({mx:e.clientX, my:e.clientY, px:pan.x, py:pan.y});
      e.preventDefault(); return;
    }
    if (e.target===canvasRef.current || e.target.tagName==="svg" || e.target.tagName==="SVG")
      setSelected(null);
  }, [pan]);

  const onMove = useCallback(e => {
    if (panStart) { setPan({x:panStart.px+e.clientX-panStart.mx, y:panStart.py+e.clientY-panStart.my}); return; }
    if (dragging) {
      const c = toCanvas(e.clientX, e.clientY);
      setNodes(ns => ns.map(n => n.id===dragging.id ? {...n, x:c.x-dragging.ox, y:c.y-dragging.oy} : n));
    }
    const r = canvasRef.current?.getBoundingClientRect();
    if (r) setMouse({x:(e.clientX-r.left-pan.x)/zoom, y:(e.clientY-r.top-pan.y)/zoom});
  }, [panStart, dragging, toCanvas, pan, zoom]);

  const onUp = useCallback(() => {
    if (panStart) { setPanStart(null); return; }
    if (dragging) { setDragging(null); return; }
    if (connecting) { setConnecting(null); }
  }, [panStart, dragging, connecting]);

  const onWheel = useCallback(e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setZoom(z => Math.min(3, Math.max(0.2, z*factor)));
  }, []);

  const startDrag = useCallback((e, node) => {
    if (e.button!==0) return; e.stopPropagation();
    const c = toCanvas(e.clientX, e.clientY);
    setDragging({id:node.id, ox:c.x-node.x, oy:c.y-node.y});
    setSelected(node.id);
  }, [toCanvas]);

  const onDrop = useCallback(e => {
    e.preventDefault();
    const type = e.dataTransfer.getData("ntype"); if (!type) return;
    const c = toCanvas(e.clientX, e.clientY);
    setNodes(ns => [...ns, createNode(type, c.x-75, c.y-28)]);
  }, [toCanvas]);

  const startConn = useCallback((e, nodeId, port, isInput) => {
    e.stopPropagation(); e.preventDefault();
    setConnecting({nodeId, port, isInput});
  }, []);

  const endConn = useCallback((e, nodeId, port, isInput) => {
    e.stopPropagation();
    if (!connecting || connecting.isInput===isInput) return;
    const src = connecting.isInput ? nodeId : connecting.nodeId;
    const srcPort = connecting.isInput ? port : connecting.port;
    const dst = connecting.isInput ? connecting.nodeId : nodeId;
    const dstPort = connecting.isInput ? connecting.port : port;
    if (src===dst) return;
    setConns(cs => [...cs.filter(c=>!(c.dst===dst&&c.dstPort===dstPort)),
      {id:`c${Date.now()}`, src, srcPort, dst, dstPort}]);
    setConnecting(null);
  }, [connecting]);

  const delNode = useCallback(id => {
    setNodes(ns => ns.filter(n=>n.id!==id));
    setConns(cs => cs.filter(c=>c.src!==id&&c.dst!==id));
    setSelected(null);
  }, []);

  const updData = useCallback((id, key, val) => {
    setNodes(ns => ns.map(n => n.id===id ? {...n, data:{...n.data,[key]:val}} : n));
  }, []);

  // ══════════════════════════════════════════════════════════════
  // EXECUTION ENGINE
  // ══════════════════════════════════════════════════════════════
  const runWorkflow = useCallback(async () => {
    if (running) return;
    stopRef.current = false;
    setRunning(true);
    setActiveNode(null);
    setVisitedNodes([]);
    setLogs([{text:t.lStart, color:"#22c55e", bold:true, t:Date.now()}]);

    // Snapshot nodes/conns (closure-safe)
    const nodeSnap = nodes;
    const connSnap = conns;
    const nodeMap  = Object.fromEntries(nodeSnap.map(n=>[n.id,n]));

    // variables store shared across execution
    const vars = {};

    // Get next node from a specific output port
    function nextFrom(nodeId, port) {
      const c = connSnap.find(c=>c.src===nodeId&&c.srcPort===port);
      return c ? nodeMap[c.dst] : null;
    }
    // Get value connected into an input port (for data nodes)
    // If connected, recursively evaluate source; else use node's own data field
    function getInputValue(nodeId, port, depth=0) {
      if (depth>10) return "";
      const c = connSnap.find(c=>c.dst===nodeId&&c.dstPort===port);
      if (!c) {
        // use own data field
        const n = nodeMap[nodeId];
        return n?.data?.[port] ?? "";
      }
      const srcNode = nodeMap[c.src];
      if (!srcNode) return "";
      // evaluate source node's output value
      return evalOutput(srcNode, c.srcPort, depth+1);
    }
    // Evaluate what a node outputs on a given port (for data/value nodes)
    function evalOutput(node, port, depth=0) {
      if (depth>10) return "";
      if (node.type==="variable") {
        const k = getInputValue(node.id,"key",depth+1)||node.data.key||"";
        return vars[k] ?? (node.data.value||"");
      }
      if (node.type==="input") {
        return node.data.default || "";
      }
      if (node.type==="transform") {
        let tx = getInputValue(node.id,"text",depth+1)||node.data.text||"";
        const op = node.data.op||"uppercase";
        if (op==="uppercase") tx=tx.toUpperCase();
        else if (op==="lowercase") tx=tx.toLowerCase();
        else if (op==="reverse") tx=[...tx].reverse().join("");
        else if (op==="trim") tx=tx.trim();
        return tx;
      }
      if (node.type==="merge") {
        const a=getInputValue(node.id,"a",depth+1)||node.data.a||"";
        const b=getInputValue(node.id,"b",depth+1)||node.data.b||"";
        const c=getInputValue(node.id,"c",depth+1)||node.data.c||"";
        return [a,b,c].filter(Boolean).join(" + ");
      }
      if (node.type==="log"||node.type==="color") {
        return getInputValue(node.id,"text",depth+1)||node.data.text||"";
      }
      return node.data[port] ?? "";
    }

    // Flash a node
    const flash = (id) => {
      setActiveNode(id);
      setVisitedNodes(v => [...v, id]);
    };

    // ── EXECUTE NODE ───────────────────────────────────────────
    async function execNode(node, depth=0) {
      if (!node || stopRef.current || depth>200) return;
      flash(node.id);
      await sleep(180);

      const d = node.data;

      switch (node.type) {

        case "start": {
          addLog(t.lNodeStart, "#22c55e", true);
          await sleep(100);
          const nxt = nextFrom(node.id, "out");
          await execNode(nxt, depth+1);
          break;
        }

        case "end": {
          addLog(t.lNodeEnd, "#ef4444", true);
          break;
        }

        case "log": {
          const text = getInputValue(node.id,"text")||d.text||"";
          addLog(t.lLog(text), "#e2e8f0");
          await sleep(80);
          await execNode(nextFrom(node.id,"out"), depth+1);
          break;
        }

        case "color": {
          const text  = getInputValue(node.id,"text")||d.text||"";
          const color = getInputValue(node.id,"color")||d.color||"#fff";
          addLog(t.lColor(text), color);
          await sleep(80);
          await execNode(nextFrom(node.id,"out"), depth+1);
          break;
        }

        case "delay": {
          const ms = Math.min(5000, parseInt(d.ms)||1000);
          addLog(t.lWait(ms), "#f59e0b");
          let elapsed=0;
          while (elapsed<ms && !stopRef.current) {
            await sleep(Math.min(100,ms-elapsed));
            elapsed+=100;
          }
          if (!stopRef.current) {
            addLog(t.lWaitDone, "#64748b");
            await execNode(nextFrom(node.id,"out"), depth+1);
          }
          break;
        }

        case "input": {
          const lbl = d.label || "Input";
          const val = d.default || "";
          addLog(t.lInput(lbl, val), "#06b6d4");
          vars[`__input_${node.id}`] = val;
          await sleep(80);
          // input feeds its value via "value" output — no flow out
          // but if something is connected on "value" output it can be used
          // Pass to next node that reads from this output (handled by getInputValue)
          break;
        }

        case "transform": {
          let tx = getInputValue(node.id,"text")||d.text||"";
          const op = d.op||"uppercase";
          const orig = tx;
          if (op==="uppercase") tx=tx.toUpperCase();
          else if (op==="lowercase") tx=tx.toLowerCase();
          else if (op==="reverse") tx=[...tx].reverse().join("");
          else if (op==="trim") tx=tx.trim();
          addLog(t.lTransform(op, tx), "#10b981");
          vars[`__transform_${node.id}`]=tx;
          await sleep(80);
          await execNode(nextFrom(node.id,"result"), depth+1);
          break;
        }

        case "merge": {
          const a=d.a||"", b=d.b||"", c=d.c||"";
          const merged=[a,b,c].filter(Boolean).join(" + ");
          addLog(t.lMerge(merged), "#6366f1");
          vars[`__merge_${node.id}`]=merged;
          await sleep(80);
          await execNode(nextFrom(node.id,"out"), depth+1);
          break;
        }

        case "condition": {
          const val  = parseFloat(d.value)  || d.value  || "";
          const cmp  = parseFloat(d.compare) || d.compare || "";
          const op   = d.op || "==";
          let result = false;
          try {
            if (op==="==")  result = String(val)===String(cmp);
            else if (op==="!=") result = String(val)!==String(cmp);
            else if (op===">")  result = parseFloat(val)>parseFloat(cmp);
            else if (op==="<")  result = parseFloat(val)<parseFloat(cmp);
            else if (op===">=") result = parseFloat(val)>=parseFloat(cmp);
            else if (op==="<=") result = parseFloat(val)<=parseFloat(cmp);
          } catch {}
          addLog(t.lCond(d.value, op, d.compare, result), result?"#22c55e":"#ef4444");
          await sleep(120);
          await execNode(nextFrom(node.id, result?"true":"false"), depth+1);
          break;
        }

        case "loop": {
          const count = Math.min(20, parseInt(d.count)||3);
          addLog(t.lLoop(count), "#ec4899", true);
          // find body connection
          const bodyStart = nextFrom(node.id, "body") || nextFrom(node.id, "out");
          // we DON'T traverse "out" for each iteration, we repeat "body"
          for (let i=0; i<count && !stopRef.current; i++) {
            addLog(t.lIter(i+1, count), "#94a3b8");
            if (bodyStart) {
              // execute body (limited depth)
              await execBodyOnce(bodyStart, node.id, depth+1);
            } else {
              await sleep(300);
            }
          }
          if (!stopRef.current) {
            addLog(t.lLoopDone, "#ec4899");
            await execNode(nextFrom(node.id,"out"), depth+1);
          }
          break;
        }

        case "api": {
          const url    = d.url||"https://jsonplaceholder.typicode.com/posts/1";
          const method = d.method||"GET";
          addLog(t.lApi(method, url), "#14b8a6");
          try {
            const res  = await fetch(url, {method, headers:{"Content-Type":"application/json"}});
            const json = await res.json();
            const preview = JSON.stringify(json).slice(0,80)+"…";
            addLog(`✓ ${res.status}: ${preview}`, "#34d399");
            vars[`__api_${node.id}`]=json;
          } catch(err) {
            addLog(t.lApiErr(err.message||"fetch failed"), "#ef4444");
          }
          await sleep(80);
          await execNode(nextFrom(node.id,"out"), depth+1);
          break;
        }

        case "variable": {
          const k = d.key||"var", v = d.value||"";
          vars[k]=v;
          addLog(t.lVar(k,v), "#a855f7");
          await sleep(80);
          // variable has no flow out via "out" normally — but if connected, follow
          const nxt = nextFrom(node.id,"stored");
          if (nxt) await execNode(nxt, depth+1);
          break;
        }

        case "clear": {
          addLog(t.lClear, "#64748b");
          setLogs([]);
          await sleep(80);
          await execNode(nextFrom(node.id,"out"), depth+1);
          break;
        }

        default:
          addLog(`[unknown node: ${node.type}]`, "#ef4444");
      }
    }

    // Execute a body sub-graph once (for loop iterations)
    // We follow until we hit a dead end OR loop back to the loop node
    async function execBodyOnce(start, loopId, depth) {
      let cur = start;
      let steps = 0;
      while (cur && !stopRef.current && steps++<50) {
        if (cur.id===loopId) break; // don't re-enter loop
        if (cur.type==="end") break;
        await execNode(cur, depth);
        // follow "out" unless already handled inside execNode (which sets cur)
        // Since execNode is recursive, we just break here
        break;
      }
    }

    const startNode = nodeSnap.find(n=>n.type==="start");
    if (!startNode) {
      addLog(t.lNoStart, "#ef4444", true);
    } else {
      try {
        await execNode(startNode, 0);
      } catch(e) {
        addLog(`❌ ${e.message}`, "#ef4444");
      }
    }

    if (!stopRef.current) addLog(t.lDone, "#22c55e", true);
    setActiveNode(null);
    setRunning(false);
  }, [running, nodes, conns, t, addLog]);

  const stopWorkflow = useCallback(() => {
    stopRef.current = true;
    setRunning(false);
    setActiveNode(null);
    addLog("■ توقف / Stopped", "#f59e0b", true);
  }, [addLog]);

  // ══════════════════════════════════════════════════════════════
  // PROJECT OPS
  // ══════════════════════════════════════════════════════════════
  function saveProject() {
    if (curProjId) {
      setProjects(ps=>ps.map(p=>p.id===curProjId?{...p,name:projName,nodes,conns,savedAt:Date.now()}:p));
    } else {
      const id=`p${Date.now()}`;
      setProjects(ps=>[...ps,{id,name:projName,nodes,conns,savedAt:Date.now()}]);
      setCurProjId(id);
    }
    setSaveFlash(true); setTimeout(()=>setSaveFlash(false),1500);
  }
  function loadProject(id) {
    const p=projects.find(x=>x.id===id); if(!p) return;
    setNodes(p.nodes||[]); setConns(p.conns||[]);
    setCurProjId(p.id); setProjName(p.name);
    setSelected(null); setActiveNode(null); setVisitedNodes([]);
    setLogs([{text:t.lOpen(p.name),color:th.accent,t:Date.now()}]);
    setShowProjects(false);
  }
  function deleteProject(id) {
    setProjects(ps=>ps.filter(p=>p.id!==id));
    if(curProjId===id){setCurProjId(null); setProjName(lang==="ar"?"مشروع جديد":"New Project");}
  }
  function newProject(name) {
    const d=makeDefaultWorkflow(), id=`p${Date.now()}`;
    setProjects(ps=>[...ps,{id,name,nodes:d.nodes,conns:d.conns,savedAt:Date.now()}]);
    setNodes(d.nodes); setConns(d.conns);
    setCurProjId(id); setProjName(name);
    setSelected(null); setActiveNode(null); setVisitedNodes([]);
    setLogs([{text:t.lNew(name),color:"#22c55e",t:Date.now()}]);
    setShowProjects(false);
  }

  // ══════════════════════════════════════════════════════════════
  // EDGE PATH
  // ══════════════════════════════════════════════════════════════
  const W=160, H=56, PS=18;
  function edgePath(conn) {
    const sn=nodes.find(n=>n.id===conn.src), dn=nodes.find(n=>n.id===conn.dst);
    if(!sn||!dn) return null;
    const si=NODES[sn.type], di=NODES[dn.type];
    const siIdx=si.outs.indexOf(conn.srcPort);
    const diIdx=di.ins.indexOf(conn.dstPort);
    const sx=sn.x+W, sy=sn.y+H/2+(siIdx-(si.outs.length-1)/2)*PS;
    const dx=dn.x,   dy=dn.y+H/2+(diIdx-(di.ins.length-1)/2)*PS;
    const cx=(sx+dx)/2;
    return `M ${sx} ${sy} C ${cx} ${sy} ${cx} ${dy} ${dx} ${dy}`;
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  const catOrder = ["control","basic","inter","advanced"];
  const bycat = {};
  Object.entries(NODES).forEach(([type,def])=>{
    if(!bycat[def.cat]) bycat[def.cat]=[];
    bycat[def.cat].push(type);
  });
  const selNode = nodes.find(n=>n.id===selected);
  const catLabel = c => ({control:t.catControl,basic:t.catBasic,inter:t.catInter,advanced:t.catAdvanced}[c]);

  // field renderer
  function renderField(node, key) {
    const val = node.data[key]??DEFAULTS[node.type]?.[key]??"";
    const lbl = FIELD_LABELS[lang][key]||key;
    const inp = (v,extra={}) => (
      <input type="text" value={String(v)} onChange={e=>updData(node.id,key,e.target.value)}
        style={{width:"100%",background:th.bg,border:`1px solid ${th.border}`,color:th.text,borderRadius:6,padding:"6px 9px",fontSize:12,fontFamily:"inherit",boxSizing:"border-box",outline:"none",direction:"ltr",...extra}}/>
    );
    const sel = (options, defVal) => (
      <select value={val||defVal} onChange={e=>updData(node.id,key,e.target.value)}
        style={{width:"100%",background:th.bg,border:`1px solid ${th.border}`,color:th.text,borderRadius:6,padding:"6px 9px",fontSize:12,fontFamily:"inherit",direction:"ltr",outline:"none"}}>
        {options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
    );

    let control;
    if (key==="op" && node.type==="transform")
      control = sel([["uppercase",t.opUp],["lowercase",t.opLow],["reverse",t.opRev],["trim",t.opTrim]], "uppercase");
    else if (key==="op" && node.type==="condition")
      control = sel([["==","=="],["!=","!="],[">"],[">="],[">="," >="],["<","<"],["<=","<="]], "==");
    else if (key==="method")
      control = sel([["GET","GET"],["POST","POST"],["PUT","PUT"],["DELETE","DELETE"],["PATCH","PATCH"]], "GET");
    else if (key==="color")
      control = <div style={{display:"flex",gap:6}}>
        <input type="color" value={val||"#ff6b6b"} onChange={e=>updData(node.id,key,e.target.value)}
          style={{width:38,height:32,padding:2,background:th.bg,border:`1px solid ${th.border}`,borderRadius:6,cursor:"pointer",flexShrink:0}}/>
        {inp(val,{flex:1,width:"auto"})}
      </div>;
    else
      control = inp(val);

    return (
      <div key={key} style={{marginBottom:10}}>
        <div style={{fontSize:10,color:th.muted,marginBottom:4,fontWeight:600,letterSpacing:"0.05em"}}>{lbl}</div>
        {control}
      </div>
    );
  }

  const FIELDS = {
    log:["text"], color:["text","color"], delay:["ms"], input:["label","default"],
    transform:["text","op"], merge:["a","b","c"], condition:["value","op","compare"],
    loop:["count"], api:["url","method"], variable:["key","value"],
  };

  return (
    <div style={{display:"flex",height:"100vh",background:th.bg,fontFamily:lang==="ar"?"'Tajawal','Cairo',sans-serif":"'Inter','Segoe UI',sans-serif",color:th.text,overflow:"hidden",direction:dir}} onClick={()=>setShowThemes(false)}>

      {showProjects&&<ProjectsModal projects={projects} currentId={curProjId} onClose={()=>setShowProjects(false)} onLoad={loadProject} onDelete={deleteProject} onNew={newProject} t={t} th={th} lang={lang}/>}

      {/* ── SIDEBAR ── */}
      <div style={{width:186,background:th.panel,borderLeft:lang==="ar"?`1px solid ${th.border}`:"none",borderRight:lang==="en"?`1px solid ${th.border}`:"none",display:"flex",flexDirection:"column",flexShrink:0,order:lang==="ar"?3:1}}>
        <div style={{padding:"16px 14px 10px",borderBottom:`1px solid ${th.border}`}}>
          <div style={{fontSize:16,fontWeight:800,color:th.accent}}>{t.appName}</div>
          <div style={{fontSize:10,color:th.muted,marginTop:1}}>{t.appSub}</div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {catOrder.map(cat=>(
            <div key={cat}>
              <div style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.12em",textTransform:"uppercase",padding:"10px 13px 4px"}}>{catLabel(cat)}</div>
              {bycat[cat]?.map(type=>{
                const nd=NODES[type];
                return (
                  <div key={type} draggable onDragStart={e=>e.dataTransfer.setData("ntype",type)}
                    style={{padding:"8px 13px",cursor:"grab",display:"flex",alignItems:"center",gap:9,fontSize:12.5,transition:"background .12s",userSelect:"none"}}
                    onMouseEnter={e=>e.currentTarget.style.background=th.nodeHover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{width:8,height:8,borderRadius:2,background:nd.color,flexShrink:0}}/>
                    {nd.label[lang]}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{padding:"10px 13px",borderTop:`1px solid ${th.border}`,fontSize:9,color:th.dim,lineHeight:1.8,textAlign:"center"}}>{t.panHint}</div>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,order:2}}>

        {/* ── TOOLBAR ── */}
        <div style={{height:50,background:th.panel,borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",gap:7,padding:"0 12px",flexShrink:0,flexWrap:"nowrap",overflowX:"auto"}}>

          {/* Project name */}
          {editName?(
            <input autoFocus value={tempName} onChange={e=>setTempName(e.target.value)}
              onBlur={()=>{setProjName(tempName);setEditName(false);}}
              onKeyDown={e=>{if(e.key==="Enter"){setProjName(tempName);setEditName(false);}if(e.key==="Escape")setEditName(false);}}
              style={{background:th.bg,border:`1.5px solid ${th.accent}`,color:th.accent,borderRadius:7,padding:"5px 10px",fontSize:13,fontFamily:"inherit",width:180,outline:"none",fontWeight:600}}/>
          ):(
            <div onClick={()=>{setTempName(projName);setEditName(true);}} title="Edit name"
              style={{fontSize:13,fontWeight:600,color:th.muted,cursor:"text",padding:"5px 8px",borderRadius:6,border:"1px solid transparent",maxWidth:190,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"border .15s"}}
              onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${th.border}`}
              onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
              {projName}
            </div>
          )}

          <Btn onClick={()=>setShowProjects(true)} th={th}>{t.projects} <Badge>{projects.length}</Badge></Btn>
          <Btn onClick={saveProject} th={th} style={{color:saveFlash?"#4ade80":th.muted,borderColor:saveFlash?"#22c55e":th.border,background:saveFlash?"#166534":"transparent",transition:"all .3s"}}>{saveFlash?t.saved:t.save}</Btn>

          <div style={{width:1,height:22,background:th.border,margin:"0 2px",flexShrink:0}}/>

          {running?(
            <button onClick={stopWorkflow} style={{background:"#dc2626",border:"none",color:"#fff",borderRadius:7,padding:"7px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t.stop}</button>
          ):(
            <button onClick={runWorkflow} style={{background:"#16a34a",border:"none",color:"#fff",borderRadius:7,padding:"7px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t.run}</button>
          )}

          <Btn onClick={()=>{const d=makeDefaultWorkflow();setNodes(d.nodes);setConns(d.conns);setSelected(null);setActiveNode(null);setVisitedNodes([]);}} th={th}>{t.clearAll}</Btn>
          <Btn onClick={()=>setLogs([])} th={th}>{t.clearLog}</Btn>

          <div style={{flex:1}}/>

          {/* Theme picker */}
          <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
            <Btn onClick={()=>setShowThemes(p=>!p)} th={th}>
              <span style={{width:10,height:10,borderRadius:"50%",background:th.accent,display:"inline-block",marginInlineEnd:5}}/>
              {t.theme}
            </Btn>
            {showThemes&&(
              <div style={{position:"absolute",top:40,[lang==="ar"?"left":"right"]:0,background:th.panel,border:`1px solid ${th.border}`,borderRadius:10,padding:6,zIndex:200,minWidth:170,boxShadow:"0 8px 30px rgba(0,0,0,0.5)"}}>
                {Object.entries(THEMES).map(([k,thm])=>(
                  <div key={k} onClick={()=>{setThemeName(k);setShowThemes(false);}}
                    style={{padding:"8px 12px",borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontSize:13,background:k===themeName?th.nodeHover:"transparent",color:k===themeName?th.accent:th.text,fontWeight:k===themeName?700:400,transition:"background .1s"}}>
                    <span style={{fontSize:15}}>{thm.icon}</span>
                    {thm.name[lang]}
                    {k===themeName&&<span style={{marginInlineStart:"auto",fontSize:11}}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language toggle */}
          <div style={{display:"flex",background:th.bg,border:`1px solid ${th.border}`,borderRadius:8,overflow:"hidden",flexShrink:0}}>
            {["ar","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)}
                style={{background:lang===l?th.accent:"transparent",border:"none",color:lang===l?"#fff":th.muted,padding:"6px 13px",fontSize:12,fontWeight:lang===l?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
                {l==="ar"?"🇸🇦 AR":"🇺🇸 EN"}
              </button>
            ))}
          </div>

          <span style={{fontSize:10,color:th.muted,flexShrink:0}}>{Math.round(zoom*100)}%</span>
          <Btn onClick={()=>{setZoom(1);setPan({x:60,y:20});}} th={th} style={{padding:"5px 10px"}}>⌂</Btn>

          {selected&&<button onClick={()=>delNode(selected)} style={{background:"#7f1d1d",border:"none",color:"#fca5a5",borderRadius:7,padding:"6px 13px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600,flexShrink:0}}>{t.deleteBtn}</button>}
        </div>

        <div style={{flex:1,display:"flex",minHeight:0}}>

          {/* ── CANVAS ── */}
          <div ref={canvasRef} style={{flex:1,position:"relative",overflow:"hidden",background:th.canvas,cursor:panStart?"grabbing":"default"}}
            onMouseDown={onBgDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onWheel={onWheel} onDragOver={e=>e.preventDefault()} onDrop={onDrop}>

            {/* Grid */}
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
              <defs>
                <pattern id="grid" x={pan.x%(24*zoom)} y={pan.y%(24*zoom)} width={24*zoom} height={24*zoom} patternUnits="userSpaceOnUse">
                  <path d={`M ${24*zoom} 0 L 0 0 0 ${24*zoom}`} fill="none" stroke={th.grid} strokeWidth={0.6}/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>

            {/* Transform layer */}
            <div style={{position:"absolute",inset:0,transformOrigin:"0 0",transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>

              {/* Edges */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible",pointerEvents:"none"}}>
                <defs>
                  <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L7,3.5 z" fill={th.accent}/>
                  </marker>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                {conns.map(conn=>{
                  const path=edgePath(conn); if(!path)return null;
                  const isActive = conn.src===activeNode || conn.dst===activeNode;
                  return (
                    <g key={conn.id} style={{pointerEvents:"stroke"}}>
                      <path d={path} fill="none" stroke="transparent" strokeWidth={14} style={{cursor:"pointer",pointerEvents:"stroke"}} onClick={()=>setConns(cs=>cs.filter(c=>c.id!==conn.id))}/>
                      <path d={path} fill="none" stroke={isActive?th.accent:th.border} strokeWidth={isActive?2.5:1.5} markerEnd="url(#arr)" opacity={isActive?1:0.5} filter={isActive?"url(#glow)":"none"} style={{transition:"stroke .3s, opacity .3s"}}/>
                    </g>
                  );
                })}
                {/* Live connecting line */}
                {connecting&&(()=>{
                  const srcNode=nodes.find(n=>n.id===connecting.nodeId);
                  if(!srcNode)return null;
                  const nd=NODES[srcNode.type];
                  const portList=connecting.isInput?nd.ins:nd.outs;
                  const portIdx=portList.indexOf(connecting.port);
                  const px=connecting.isInput?srcNode.x:srcNode.x+W;
                  const py=srcNode.y+H/2+(portIdx-(portList.length-1)/2)*PS;
                  return <line x1={px} y1={py} x2={mouse.x} y2={mouse.y} stroke={th.accent} strokeWidth={2} strokeDasharray="6,4" opacity={0.8}/>;
                })()}
              </svg>

              {/* Nodes */}
              {nodes.map(node=>{
                const nd  = NODES[node.type];
                const isSel    = selected===node.id;
                const isActive = activeNode===node.id;
                const wasVisited = visitedNodes.includes(node.id) && !isActive;
                return (
                  <div key={node.id}
                    onMouseDown={e=>startDrag(e,node)}
                    onClick={e=>{e.stopPropagation();setSelected(node.id);}}
                    style={{
                      position:"absolute", left:node.x, top:node.y, width:W, height:H,
                      background:isActive?th.nodeActive:th.nodeBg,
                      border:`2px solid ${isActive?"#22c55e":isSel?th.accent:nd.color+"44"}`,
                      borderRadius:10, cursor:"grab", userSelect:"none",
                      boxShadow:isActive?`0 0 24px ${nd.color}88, 0 0 6px ${nd.color}44`:
                                isSel?`0 0 16px ${th.glow}`:
                                wasVisited?`0 0 8px ${nd.color}33`:"0 2px 10px rgba(0,0,0,0.35)",
                      transition:"box-shadow .25s, border-color .25s, background .25s",
                      direction:dir,
                    }}>
                    {/* Active pulse ring */}
                    {isActive&&<div style={{position:"absolute",inset:-4,borderRadius:14,border:`2px solid ${"#22c55e"}`,animation:"ring 1s ease-out infinite",pointerEvents:"none"}}/>}

                    <div style={{height:H,display:"flex",alignItems:"center",padding:"0 12px",position:"relative",gap:8}}>
                      {/* Color dot */}
                      <div style={{width:9,height:9,borderRadius:2.5,background:nd.color,flexShrink:0}}/>
                      {/* Label */}
                      <span style={{fontSize:12.5,fontWeight:700,color:th.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{nd.label[lang]}</span>
                      {/* Data preview */}
                      {DEFAULTS[node.type]&&Object.keys(node.data||{}).length>0&&(()=>{
                        const firstKey=Object.keys(node.data)[0];
                        const preview=String(node.data[firstKey]||"").slice(0,14);
                        return preview?<span style={{fontSize:9,color:th.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:50,flexShrink:0}}>{preview}</span>:null;
                      })()}
                      {/* Running indicator */}
                      {isActive&&<div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",flexShrink:0,animation:"pulse 0.6s ease-in-out infinite"}}/>}

                      {/* INPUT ports (flow comes INTO node) */}
                      {nd.ins.map((port,i)=>(
                        <div key={port}
                          onMouseDown={e=>startConn(e,node.id,port,true)}
                          onMouseUp={e=>endConn(e,node.id,port,true)}
                          title={PORT_LABELS[lang][port]||port}
                          style={{position:"absolute",[lang==="ar"?"right":"left"]:-8,top:H/2+(i-(nd.ins.length-1)/2)*PS-8,width:16,height:16,borderRadius:"50%",background:th.canvas,border:`2.5px solid ${nd.color}`,cursor:"crosshair",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:6,color:nd.color,fontWeight:700,userSelect:"none"}}>{PORT_LABELS[lang][port]?.slice(0,2)||""}</span>
                        </div>
                      ))}
                      {/* OUTPUT ports */}
                      {nd.outs.map((port,i)=>(
                        <div key={port}
                          onMouseDown={e=>startConn(e,node.id,port,false)}
                          onMouseUp={e=>endConn(e,node.id,port,false)}
                          title={PORT_LABELS[lang][port]||port}
                          style={{position:"absolute",[lang==="ar"?"left":"right"]:-8,top:H/2+(i-(nd.outs.length-1)/2)*PS-8,width:16,height:16,borderRadius:"50%",background:nd.color,border:`2.5px solid ${nd.color}`,cursor:"crosshair",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:isActive?`0 0 8px ${nd.color}88`:"none",transition:"box-shadow .25s"}}>
                          <span style={{fontSize:6,color:"#fff",fontWeight:700,userSelect:"none"}}>{PORT_LABELS[lang][port]?.slice(0,2)||""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {nodes.length===0&&(
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                <div style={{fontSize:52,opacity:.15,marginBottom:14}}>⚡</div>
                <div style={{fontSize:14,color:th.dim}}>{t.dragHint}</div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{width:258,background:th.panel,borderLeft:lang==="en"?`1px solid ${th.border}`:"none",borderRight:lang==="ar"?`1px solid ${th.border}`:"none",display:"flex",flexDirection:"column",flexShrink:0,order:lang==="ar"?-1:3}}>

            {/* Inspector */}
            <div style={{flexShrink:0,borderBottom:`1px solid ${th.border}`}}>
              <div style={{padding:"10px 14px",fontSize:10,fontWeight:700,color:th.muted,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:`1px solid ${th.border}`}}>{t.inspector}</div>
              {selNode?(
                <div style={{padding:"12px 14px",maxHeight:290,overflowY:"auto"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:13}}>
                    <div style={{width:11,height:11,borderRadius:3,background:NODES[selNode.type].color,flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:700,color:th.text}}>{NODES[selNode.type].label[lang]}</span>
                  </div>
                  {(FIELDS[selNode.type]||[]).map(key=>renderField(selNode,key))}
                  <div style={{fontSize:9,color:th.dim,marginTop:6}}>id: {selNode.id}</div>
                </div>
              ):(
                <div style={{padding:"16px 14px",fontSize:12,color:th.muted}}>{t.clickNode}</div>
              )}
            </div>

            {/* Console */}
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
              <div style={{padding:"10px 14px",fontSize:10,fontWeight:700,color:th.muted,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>{t.console}</span>
                <span style={{color:th.dim,fontSize:9,fontWeight:400}}>{t.lines(logs.length)}</span>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"8px 12px",background:th.consoleBg,direction:"ltr"}}>
                {logs.map((log,i)=>(
                  <div key={i} style={{fontSize:11,lineHeight:1.7,color:log.color||th.text,fontWeight:log.bold?700:400,wordBreak:"break-word",fontFamily:"'JetBrains Mono','Fira Code',monospace"}}>
                    {log.text}
                  </div>
                ))}
                <div ref={logRef}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Inter:wght@400;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.15)}}
        @keyframes ring{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.35);opacity:0}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${th.border};border-radius:2px}
        select option{background:${th.panel};color:${th.text}}
        input:focus,select:focus{border-color:${th.accent}!important}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}

// ── Shared button ──────────────────────────────────────────────
function Btn({children,onClick,th,style={}}) {
  const [hov,setHov]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?th.nodeHover:"transparent",border:`1px solid ${th.border}`,color:th.muted,borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,flexShrink:0,transition:"background .15s",...style}}>
      {children}
    </button>
  );
}
function Badge({children}) {
  return <span style={{background:"#334155",borderRadius:10,padding:"1px 6px",fontSize:10,color:"#94a3b8"}}>{children}</span>;
}