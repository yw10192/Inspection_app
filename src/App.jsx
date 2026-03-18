import { useState, useMemo, useEffect } from "react";

// ─── 印刷用スタイル注入 ──────────────────────────────────────────
const printStyle = `
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    body, .app-root { background: #fff !important; color: #000 !important; }
    body { margin: 0; }
    .no-print { display: none !important; }
    .print-hidden { display: none !important; }
    .print-only { display: block !important; }
    .screen-only { display: none !important; }
    @page { size: A4 portrait; margin: 8mm; }
  }
`;

// ─── localStorage永続化フック ─────────────────────────────────────
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : (typeof initialValue === "function" ? initialValue() : initialValue);
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

// ─── ユーティリティ ───────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,"0")}/${String(dt.getDate()).padStart(2,"0")}`;
};
const toKey = (d) => {
  const dt = d instanceof Date ? d : new Date(d + "T00:00:00");
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
};
const addDays = (base, n) => {
  const d = new Date((typeof base === "string" ? base + "T00:00:00" : base));
  d.setDate(d.getDate() + n);
  return d;
};
const daysBetween = (a, b) =>
  Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);

function calcRange(orders) {
  if (!orders.length) {
    const t = toKey(new Date());
    return { start: t, days: 30 };
  }
  const dates = orders.map((o) => o.deadline).sort();
  const start = toKey(addDays(dates[0], -7));
  const end   = toKey(addDays(dates[dates.length - 1], 5));
  return { start, days: daysBetween(start, end) + 1 };
}

// ─── 初期データ ───────────────────────────────────────────────────
const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f59e0b"];

const initProducts = () => [
  { id:"P1",  name:"製品A", color:COLORS[0] },
  { id:"P2",  name:"製品B", color:COLORS[1] },
  { id:"P3",  name:"製品C", color:COLORS[2] },
  { id:"P4",  name:"製品D", color:COLORS[3] },
  { id:"P5",  name:"製品E", color:COLORS[4] },
  { id:"P6",  name:"製品F", color:COLORS[5] },
  { id:"P7",  name:"製品G", color:COLORS[6] },
  { id:"P8",  name:"製品H", color:COLORS[7] },
  { id:"P9",  name:"製品I", color:COLORS[8] },
  { id:"P10", name:"製品J", color:COLORS[9] },
];

const initInspectors = () => [
  { id:"I1",  name:"田中 一郎",  workHours:8,
    speedPerProduct:{ P1:15,P2:14,P3:16,P4:13,P5:15 },
    canInspect:["P1","P2","P3","P4","P5"],
    holidays:[{date:"2025-01-11",half:false},{date:"2025-01-12",half:false},{date:"2025-01-18",half:false},{date:"2025-01-19",half:false},{date:"2025-01-25",half:false},{date:"2025-01-26",half:false}] },
  { id:"I2",  name:"佐藤 花子",  workHours:7,
    speedPerProduct:{ P1:12,P6:11,P7:13,P8:12 },
    canInspect:["P1","P6","P7","P8"],
    holidays:[{date:"2025-01-05",half:false},{date:"2025-01-06",half:false},{date:"2025-01-13",half:true},{date:"2025-01-20",half:false},{date:"2025-01-27",half:false}] },
  { id:"I3",  name:"鈴木 次郎",  workHours:8,
    speedPerProduct:{ P2:18,P3:17,P9:16,P10:19 },
    canInspect:["P2","P3","P9","P10"],
    holidays:[{date:"2025-01-04",half:false},{date:"2025-01-05",half:false},{date:"2025-01-11",half:false},{date:"2025-01-18",half:false},{date:"2025-01-25",half:false}] },
  { id:"I4",  name:"高橋 美咲",  workHours:6,
    speedPerProduct:{ P4:10,P5:9,P6:11,P7:10 },
    canInspect:["P4","P5","P6","P7"],
    holidays:[{date:"2025-01-06",half:true},{date:"2025-01-13",half:false},{date:"2025-01-20",half:false},{date:"2025-01-27",half:false}] },
  { id:"I5",  name:"渡辺 健太",  workHours:8,
    speedPerProduct:{ P1:13,P3:14,P5:13,P8:12,P10:14 },
    canInspect:["P1","P3","P5","P8","P10"],
    holidays:[{date:"2025-01-07",half:false},{date:"2025-01-14",half:false},{date:"2025-01-21",half:false},{date:"2025-01-28",half:false}] },
  { id:"I6",  name:"伊藤 さくら", workHours:7,
    speedPerProduct:{ P2:11,P4:12,P6:10,P9:11 },
    canInspect:["P2","P4","P6","P9"],
    holidays:[{date:"2025-01-05",half:true},{date:"2025-01-12",half:false},{date:"2025-01-19",half:false},{date:"2025-01-26",half:false}] },
  { id:"I7",  name:"山田 浩二",  workHours:8,
    speedPerProduct:{ P3:16,P5:15,P7:17,P8:16,P10:18 },
    canInspect:["P3","P5","P7","P8","P10"],
    holidays:[{date:"2025-01-04",half:false},{date:"2025-01-11",half:false},{date:"2025-01-18",half:true},{date:"2025-01-25",half:false}] },
  { id:"I8",  name:"中村 理恵",  workHours:7,
    speedPerProduct:{ P1:11,P2:12,P4:10,P6:11 },
    canInspect:["P1","P2","P4","P6"],
    holidays:[{date:"2025-01-06",half:false},{date:"2025-01-13",half:false},{date:"2025-01-20",half:true},{date:"2025-01-27",half:false}] },
  { id:"I9",  name:"小林 大輔",  workHours:8,
    speedPerProduct:{ P5:17,P7:18,P9:16,P10:17 },
    canInspect:["P5","P7","P9","P10"],
    holidays:[{date:"2025-01-05",half:false},{date:"2025-01-12",half:false},{date:"2025-01-19",half:false},{date:"2025-01-26",half:false}] },
  { id:"I10", name:"加藤 由美",  workHours:7,
    speedPerProduct:{ P1:13,P3:12,P6:13,P8:12,P9:14 },
    canInspect:["P1","P3","P6","P8","P9"],
    holidays:[{date:"2025-01-07",half:true},{date:"2025-01-14",half:false},{date:"2025-01-21",half:false},{date:"2025-01-28",half:false}] },
];

const initOrders = () => [
  { id:"O1",  productId:"P1",  deadline:"2025-01-10", quantity:400 },
  { id:"O2",  productId:"P1",  deadline:"2025-01-20", quantity:600 },
  { id:"O3",  productId:"P2",  deadline:"2025-01-15", quantity:800 },
  { id:"O4",  productId:"P2",  deadline:"2025-01-25", quantity:1200 },
  { id:"O5",  productId:"P3",  deadline:"2025-01-28", quantity:500 },
  { id:"O6",  productId:"P4",  deadline:"2025-01-12", quantity:300 },
  { id:"O7",  productId:"P4",  deadline:"2025-01-22", quantity:500 },
  { id:"O8",  productId:"P5",  deadline:"2025-01-18", quantity:700 },
  { id:"O9",  productId:"P6",  deadline:"2025-01-14", quantity:400 },
  { id:"O10", productId:"P7",  deadline:"2025-01-20", quantity:600 },
  { id:"O11", productId:"P8",  deadline:"2025-01-25", quantity:450 },
  { id:"O12", productId:"P9",  deadline:"2025-01-16", quantity:350 },
  { id:"O13", productId:"P10", deadline:"2025-01-23", quantity:550 },
  { id:"O14", productId:"P3",  deadline:"2025-01-18", quantity:300 },
  { id:"O15", productId:"P5",  deadline:"2025-01-28", quantity:800 },
];

// actuals: { "inspectorId_dateKey": { products: {orderId: qty}, note: string } }
// products が存在しない場合は旧形式 qty (後方互換)

// ─── スケジューラ ─────────────────────────────────────────────────
// actuals の合計数量を取得（旧形式 qty / 新形式 products 両対応）
function getActualTotal(actual) {
  if (!actual) return 0;
  if (actual.products) return Object.values(actual.products).reduce((s,v)=>s+(parseInt(v)||0),0);
  return parseInt(actual.qty) || 0;
}

// actuals を考慮した2段階スケジュール:
//   1. today より前の日は actuals を正とする（実績で consumed を計算）
//   2. today 以降は残量を再スケジュール
function generateSchedule(inspectors, orders, range, actuals, today, manualAssignments = []) {
  const { start, days } = range;
  const dateKeys = Array.from({ length: days }, (_, i) => toKey(addDays(start, i)));

  // 注文ごとの残量
  const remaining = {};
  orders.forEach((o) => { remaining[o.id] = o.quantity; });

  // schedule[iid][dk] = [{orderId, productId, qty, isManual, isActual}]
  const schedule = {};
  inspectors.forEach((ins) => {
    schedule[ins.id] = {};
    dateKeys.forEach((dk) => { schedule[ins.id][dk] = []; });
  });

  // 手動割り当てを先に処理（スケジューラの自動計算より優先）
  const orderMap_s = Object.fromEntries(orders.map(o => [o.id, o]));
  for (const ma of manualAssignments) {
    if (!remaining.hasOwnProperty(ma.orderId)) continue;
    const qty = Math.min(ma.qty, remaining[ma.orderId]);
    if (qty <= 0) continue;
    if (!schedule[ma.inspectorId]?.[ma.date]) continue;
    const order = orderMap_s[ma.orderId];
    if (!order) continue;
    schedule[ma.inspectorId][ma.date].push({
      orderId: ma.orderId, productId: order.productId,
      qty, isManual: true, isActual: false, isPlanned: false,
    });
    remaining[ma.orderId] -= qty;
  }

  const holidayMap = {};
  inspectors.forEach((ins) => {
    holidayMap[ins.id] = {};
    // 土曜(6)・日曜(0)を自動で全休に設定
    dateKeys.forEach((dk) => {
      const dow = new Date(dk + "T00:00:00").getDay();
      if (dow === 0 || dow === 6) holidayMap[ins.id][dk] = 0;
    });
    // 個別休日設定で上書き（土日に半休設定も可能）
    ins.holidays.forEach((h) => { holidayMap[ins.id][h.date] = h.half ? 0.5 : 0; });
  });

  // 納期昇順のベースソート
  const sortedOrders = [...orders].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  // 2段階eligible: 3日前までに終わらせたい注文を優先し、
  // 残量があれば納期を超えてでも割り当てる
  function buildEligible(ins, dk) {
    const deadline3 = sortedOrders.filter(
      (o) => remaining[o.id] > 0.5 && ins.canInspect.includes(o.productId) && toKey(addDays(o.deadline, -3)) >= dk
    );
    if (deadline3.length > 0) return deadline3;
    // 3日前では間に合わない → 納期を超えてでも割り当て
    return sortedOrders.filter(
      (o) => remaining[o.id] > 0.5 && ins.canInspect.includes(o.productId)
    );
  }

  // ── 製品ごとの担当検査員を事前に割り当てる ──────────────────────
  // 各製品（productId）について、担当できる検査員のうち
  // その製品の検査速度が最も高い検査員を担当者として固定する。
  // 同速度の場合は他の担当製品が少ない検査員を優先（負荷分散）。
  const productAssignment = {}; // { productId: inspectorId }
  const inspectorLoad = {};     // { inspectorId: 担当製品数 }
  inspectors.forEach(ins => { inspectorLoad[ins.id] = 0; });

  // 製品を「その製品を担当できる検査員数」が少ない順に処理（希少スキルを先に割り当て）
  const uniqueProductIds = [...new Set(orders.map(o => o.productId))];
  const sortedProductIds = uniqueProductIds.sort((a, b) => {
    const capA = inspectors.filter(i => i.canInspect.includes(a)).length;
    const capB = inspectors.filter(i => i.canInspect.includes(b)).length;
    return capA - capB;
  });

  for (const pid of sortedProductIds) {
    const candidates = inspectors.filter(i => i.canInspect.includes(pid));
    if (candidates.length === 0) continue;
    // 速度降順 → 負荷昇順 で最適な担当者を選ぶ
    const best = candidates.sort((a, b) => {
      const spdDiff = (b.speedPerProduct[pid] || 0) - (a.speedPerProduct[pid] || 0);
      if (spdDiff !== 0) return spdDiff;
      return inspectorLoad[a.id] - inspectorLoad[b.id];
    })[0];
    productAssignment[pid] = best.id;
    inspectorLoad[best.id]++;
  }

  // 担当製品以外は他の検査員が手伝える優先度を下げる並び替え
  // eligible を「担当者が自分」→「担当者が他人（ヘルプ）」→ 納期順 で並べる
  function sortByAssignment(eligible, insId) {
    return [...eligible].sort((a, b) => {
      const aPrimary = productAssignment[a.productId] === insId ? 0 : 1;
      const bPrimary = productAssignment[b.productId] === insId ? 0 : 1;
      if (aPrimary !== bPrimary) return aPrimary - bPrimary;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }

  for (const dk of dateKeys) {
    const isPast = dk < today;

    for (const ins of inspectors) {
      const hf = holidayMap[ins.id][dk];
      if (hf === 0) continue;
      const factor = hf === 0.5 ? 0.5 : 1.0;
      const availHours = ins.workHours * factor;

      if (isPast) {
        // 過去日: 実績がある場合は実績を使って残量を消化
        const aKey = `${ins.id}_${dk}`;
        const actual = actuals[aKey];
        if (!actual || getActualTotal(actual) <= 0) {
          // 実績なし → 予定通り処理したとして計画値で消化
          let hoursLeft = availHours;
          const eligible = sortByAssignment(buildEligible(ins, dk), ins.id);
          for (const order of eligible) {
            if (hoursLeft <= 0.001) break;
            const spd = ins.speedPerProduct[order.productId] || 0;
            if (!spd) continue;
            const doQty = Math.min(spd * hoursLeft, remaining[order.id]);
            if (doQty <= 0) continue;
            schedule[ins.id][dk].push({ orderId:order.id, productId:order.productId, qty:doQty, isActual:false, isPlanned:true });
            remaining[order.id] -= doQty;
            hoursLeft -= doQty / spd;
          }
        } else {
          // 実績あり → 実績数量で締め切りが近い順に消化
          let qtyLeft = getActualTotal(actual);
          const eligible = sortByAssignment(buildEligible(ins, dk), ins.id);
          for (const order of eligible) {
            if (qtyLeft <= 0) break;
            const doQty = Math.min(qtyLeft, remaining[order.id]);
            if (doQty <= 0) continue;
            schedule[ins.id][dk].push({ orderId:order.id, productId:order.productId, qty:doQty, isActual:true, isPlanned:false });
            remaining[order.id] -= doQty;
            qtyLeft -= doQty;
          }
        }
      } else {
        // 未来日: 同じ製品を連続させながらスケジュール
        // 手動割り当て済みの時間を先に差し引く
        const manualTasks = schedule[ins.id][dk].filter(t => t.isManual);
        const manualHours = manualTasks.reduce((s, t) => {
          const spd = ins.speedPerProduct[t.productId] || 1;
          return s + t.qty / spd;
        }, 0);
        let hoursLeft = Math.max(0, availHours - manualHours);
        const eligible = sortByAssignment(buildEligible(ins, dk), ins.id);
        for (const order of eligible) {
          if (hoursLeft <= 0.001) break;
          const spd = ins.speedPerProduct[order.productId] || 0;
          if (!spd) continue;
          const doQty = Math.min(spd * hoursLeft, remaining[order.id]);
          if (doQty <= 0) continue;
          schedule[ins.id][dk].push({ orderId:order.id, productId:order.productId, qty:doQty, isActual:false, isPlanned:false });
          remaining[order.id] -= doQty;
          hoursLeft -= doQty / spd;
        }
      }
    }
  }

  // 納期を超えて割り当てられた量を集計
  const overdueQty = {}; // { orderId: 超過割り当て量 }
  orders.forEach(o => { overdueQty[o.id] = 0; });
  for (const dk of dateKeys) {
    for (const ins of inspectors) {
      for (const task of (schedule[ins.id][dk] || [])) {
        const order = orders.find(o => o.id === task.orderId);
        if (order && dk > order.deadline) {
          overdueQty[task.orderId] = (overdueQty[task.orderId] || 0) + task.qty;
        }
      }
    }
  }

  return { schedule, remaining, dateKeys, overdueQty };
}

// ─── スタイル ─────────────────────────────────────────────────────
const S = {
  input:        { background:"#1e2535", border:"1px solid #4a5568", borderRadius:6, color:"#e2e8f0", padding:"6px 10px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" },
  inputDate:    { background:"#1e2535", border:"1px solid #4a5568", borderRadius:6, color:"#e2e8f0", padding:"6px 10px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box", colorScheme:"dark" },
  btnPrimary:   { background:"linear-gradient(135deg,#667eea,#764ba2)", border:"none", borderRadius:7, color:"#fff", padding:"7px 16px", cursor:"pointer", fontSize:13, fontWeight:600 },
  btnSecondary: { background:"transparent", border:"1px solid #4a5568", borderRadius:7, color:"#a0aec0", padding:"7px 14px", cursor:"pointer", fontSize:13 },
  btnDanger:    { background:"transparent", border:"1px solid #fc818144", borderRadius:7, color:"#fc8181", padding:"7px 14px", cursor:"pointer", fontSize:13 },
  card:         { background:"#1a1f2e", borderRadius:10, padding:"14px 16px", border:"1px solid #2d3748", marginBottom:10 },
};

// ─── App ──────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = printStyle;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  const [products,   setProducts]   = useLocalStorage("ip_products", initProducts);
  const [inspectors, setInspectors] = useLocalStorage("ip_inspectors", initInspectors);
  const [orders,     setOrders]     = useLocalStorage("ip_orders", initOrders);
  // actuals: {"I1_2025-01-08": {qty:100, note:"機械トラブル"}}
  const [actuals,           setActuals]           = useLocalStorage("ip_actuals", {});
  // manualAssignments: [{id, date, inspectorId, orderId, qty}]
  const [manualAssignments, setManualAssignments] = useLocalStorage("ip_manual", []);

  const [today, setToday] = useLocalStorage("ip_today", toKey(new Date())); // 運用上の「今日」

  // 起動時に当日の日付をセット
  useEffect(() => { setToday(toKey(new Date())); }, []);
  const [activeTab,  setActiveTab]  = useState("gantt");
  const [tooltip,    setTooltip]    = useState(null);

  const productMap = useMemo(() => { const m={}; products.forEach(p=>m[p.id]=p); return m; }, [products]);

  const { schedule, remaining, dateKeys, overdueQty } = useMemo(() => {
    const range = calcRange(orders);
    return generateSchedule(inspectors, orders, range, actuals, today, manualAssignments);
  }, [inspectors, orders, actuals, today, manualAssignments]);

  // 納期アラート:
  // ・残量あり: スケジュール後も割り当てられなかった量がある
  // ・納期超え割り当て: 納期を超えた日に割り当てが発生している
  const alerts = useMemo(() => orders
    .filter(o => remaining[o.id] > 0.5 || (overdueQty[o.id] > 0.5))
    .map(o => {
      const overDeadline = o.deadline < today;
      const hasOverdue = (overdueQty[o.id] || 0) > 0.5;
      const hasRemaining = remaining[o.id] > 0.5;
      return { order:o, rem:Math.round(remaining[o.id]), overdueAmt:Math.round(overdueQty[o.id]||0), overDeadline, hasOverdue, hasRemaining };
    })
    .sort((a,b) => a.order.deadline.localeCompare(b.order.deadline)),
  [orders, remaining, overdueQty, today]);

  const tabs = [
    { key:"gantt",      label:"📊 ガントチャート" },
    { key:"actuals",    label:"✏️ 実績入力" },
    { key:"manual",     label:"📋 手動割り当て" },
    { key:"orders",     label:"📦 注文・納期" },
    { key:"inspectors", label:"👷 検査員設定" },
    { key:"products",   label:"🏷️ 製品管理" },
  ];

  return (
    <div className="app-root" style={{ fontFamily:"'Noto Sans JP','Segoe UI',sans-serif", background:"#0f1117", minHeight:"100vh", color:"#e2e8f0" }}>
      {/* Header */}
      <div className="no-print" style={{ background:"linear-gradient(135deg,#1a1f2e,#1e2640)", borderBottom:"1px solid #2d3748", padding:"14px 24px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
        <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔍</div>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>検査計画システム</div>
          <div style={{ fontSize:12, color:"#718096" }}>Inspection Planning Dashboard</div>
        </div>
        {/* 今日の日付設定 */}
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0f1117", borderRadius:8, padding:"6px 12px", border:"1px solid #4a5568" }}>
          <span style={{ fontSize:12, color:"#718096" }}>📅 基準日（今日）</span>
          <input type="date" value={today} onChange={e=>setToday(e.target.value)}
            style={{ ...S.inputDate, padding:"3px 8px", fontSize:12, border:"none", background:"transparent", width:"auto" }} />
        </div>
        <div style={{ flex:1 }} />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding:"8px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
              background: activeTab===t.key ? "linear-gradient(135deg,#667eea,#764ba2)" : "#2d3748",
              color: activeTab===t.key ? "#fff" : "#a0aec0",
              position:"relative",
            }}>
              {t.label}
              {t.key==="actuals" && alerts.length>0 && (
                <span style={{ position:"absolute", top:-4, right:-4, background:"#fc8181", borderRadius:"50%", width:16, height:16, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{alerts.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 納期アラートバナー */}
      {alerts.length > 0 && (
        <div className="no-print" style={{ background:"#2d1515", borderBottom:"1px solid #fc818155", padding:"10px 24px", display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ color:"#fc8181", fontWeight:700, fontSize:14 }}>⚠️ 納期注意 {alerts.length}件</span>
          {alerts.map(({order,rem,overdueAmt,overDeadline,hasOverdue,hasRemaining}) => {
            const p = productMap[order.productId];
            const icon = overDeadline ? "🚨" : "⚠️";
            const color = overDeadline ? "#fc8181" : "#f6ad55";
            const bg    = overDeadline ? "#fc818122" : "#f6ad5522";
            const bd    = overDeadline ? "#fc818144" : "#f6ad5544";
            const detail = [
              hasOverdue   ? `納期超え割当 ${overdueAmt.toLocaleString()}個` : null,
              hasRemaining ? `未割当 ${rem.toLocaleString()}個` : null,
            ].filter(Boolean).join("・");
            return (
              <span key={order.id} style={{ background:bg, border:`1px solid ${bd}`, borderRadius:6, padding:"3px 10px", fontSize:12, color }}>
                {icon} {p?.name}（〆{fmt(order.deadline)}）{detail}
              </span>
            );
          })}
        </div>
      )}

      <div style={{ padding:"20px 24px" }}>
        {activeTab==="gantt" && (
          <GanttView inspectors={inspectors} dateKeys={dateKeys} schedule={schedule}
            orders={orders} productMap={productMap} remaining={remaining}
            actuals={actuals} today={today}
            manualAssignments={manualAssignments} setManualAssignments={setManualAssignments}
            tooltip={tooltip} setTooltip={setTooltip} />
        )}
        {activeTab==="actuals" && (
          <ActualsInput inspectors={inspectors} dateKeys={dateKeys} schedule={schedule}
            orders={orders} productMap={productMap} actuals={actuals} setActuals={setActuals} today={today} />
        )}
        {activeTab==="manual" && (
          <ManualAssignment
            inspectors={inspectors} orders={orders} productMap={productMap}
            manualAssignments={manualAssignments} setManualAssignments={setManualAssignments}
            dateKeys={dateKeys} today={today} />
        )}
        {activeTab==="orders" && (
          <OrderSettings orders={orders} setOrders={setOrders} productMap={productMap} remaining={remaining} today={today} />
        )}
        {activeTab==="inspectors" && (
          <InspectorSettings inspectors={inspectors} setInspectors={setInspectors} products={products} />
        )}
        {activeTab==="products" && (
          <ProductSettings products={products} setProducts={setProducts} />
        )}
      </div>

      {tooltip && (
        <div style={{ position:"fixed", left:tooltip.x+14, top:tooltip.y-10, background:"#1a202c", border:"1px solid #4a5568", borderRadius:8, padding:"10px 14px", fontSize:13, pointerEvents:"none", zIndex:9999, boxShadow:"0 8px 24px rgba(0,0,0,0.6)", minWidth:200 }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

// ─── ガントチャート ───────────────────────────────────────────────
const DAY_W = 56;

function GanttView({ inspectors, dateKeys, schedule, orders, productMap, remaining, actuals, today, manualAssignments, setManualAssignments, tooltip, setTooltip }) {
  // セルクリックで開くモーダル
  const [cellModal, setCellModal] = useState(null);
  // cellModal = { ins, dk, x, y }

  const [printFrom, setPrintFrom] = useState(dateKeys[0] || "");
  const [printTo,   setPrintTo]   = useState(dateKeys[dateKeys.length-1] || "");
  const [showPrintRange, setShowPrintRange] = useState(false);
  const [printInspectors, setPrintInspectors] = useState(() => inspectors.map(i=>i.id));

  // 印刷範囲でフィルタしたdateKeys
  const printDateKeys = useMemo(() => {
    if (!printFrom || !printTo) return dateKeys;
    return dateKeys.filter(dk => dk >= printFrom && dk <= printTo);
  }, [dateKeys, printFrom, printTo]);

  const handlePrint = () => { window.print(); };
  const orderMap = useMemo(() => { const m={}; orders.forEach(o=>m[o.id]=o); return m; }, [orders]);
  const deadlineByDate = useMemo(() => {
    const m={};
    orders.forEach(o=>{ if(!m[o.deadline]) m[o.deadline]=[]; m[o.deadline].push(o); });
    return m;
  }, [orders]);

  // 予定セル（上段）
  const PlanCell = ({ ins, dk, holidaySet }) => {
    const hf = holidaySet[dk];
    const isFullHoliday = hf === 0;
    const isHalfHoliday = hf === 0.5;
    const isToday = dk === today;
    const tasks = schedule[ins.id]?.[dk] || [];
    const totalQty = Math.round(tasks.reduce((s,t)=>s+t.qty,0));

    const outOfPrintRange = dk < printFrom || dk > printTo;



    return (
      <div className={outOfPrintRange ? "print-hidden" : ""} style={{
        width:DAY_W, minWidth:DAY_W, height:36, borderLeft:"1px solid #2d374822",
        position:"relative", overflow:"hidden", display:"flex", flexDirection:"column",
        background: isFullHoliday?"#200f0f": isHalfHoliday?"#1a1a0f": isToday?"#0e2330":"transparent",
        cursor: isFullHoliday ? "default" : "pointer",
      }}
        onMouseEnter={(e) => {
          if (isFullHoliday) { setTooltip({ x:e.clientX, y:e.clientY, content:<div>🏖️ 全休（予定）</div> }); return; }
          if (tasks.length===0) { setTooltip(null); return; }
          setTooltip({ x:e.clientX, y:e.clientY, content:(
            <div>
              <div style={{ fontWeight:700, marginBottom:6, color:"#a78bfa" }}>{ins.name} — {fmt(dk)}</div>
              <div style={{ fontSize:11, color:"#718096", marginBottom:6 }}>📋 予定</div>
              {isHalfHoliday && <div style={{ color:"#f6ad55", fontSize:11, marginBottom:4 }}>🌅 半休</div>}
              {tasks.map((t,i) => {
                const o = orderMap[t.orderId];
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:productMap[t.productId]?.color, flexShrink:0 }} />
                    <span>{productMap[t.productId]?.name}: {Math.round(t.qty)}個 <span style={{ color:"#718096", fontSize:11 }}>〆{fmt(o?.deadline)}</span></span>
                  </div>
                );
              })}
              <div style={{ borderTop:"1px solid #4a5568", paddingTop:4, marginTop:4, color:"#a0aec0" }}>合計: {totalQty}個</div>
            </div>
          )});
        }}
        onMouseLeave={() => setTooltip(null)}
        onClick={(e) => {
          if (isFullHoliday) return;
          e.stopPropagation();
          setTooltip(null);
          setCellModal({ ins, dk, x: e.clientX, y: e.clientY });
        }}
      >
        {isFullHoliday
          ? <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, opacity:0.4 }}>🏖</div>
          : <>
              {tasks.map((t,i) => {
                const capH = isHalfHoliday ? ins.workHours*0.5 : ins.workHours;
                const spd = ins.speedPerProduct[t.productId]||1;
                const pct = Math.min((t.qty/spd/capH)*100, 100);
                const pName = (t.isManual ? "📌" : "") + (productMap[t.productId]?.name || "");
                const o = orderMap[t.orderId];
                const dlStr = o ? `〆${String(new Date(o.deadline+"T00:00:00").getMonth()+1).padStart(2,"0")}/${String(new Date(o.deadline+"T00:00:00").getDate()).padStart(2,"0")}` : "";
                return (
                  <div key={i} style={{ width:"100%", height:`${pct}%`, minHeight:3, background:productMap[t.productId]?.color||"#aaa", opacity:0.85, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 2px" }}>
                    <div style={{ fontSize:7, color:"rgba(255,255,255,0.95)", fontWeight:700, lineHeight:1.2, textShadow:"0 0 3px rgba(0,0,0,0.9)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{pName}</div>
                    <div style={{ fontSize:7, color:"rgba(255,255,255,0.85)", lineHeight:1.2, textShadow:"0 0 3px rgba(0,0,0,0.9)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{dlStr}</div>
                  </div>
                );
              })}
              {isToday && <div style={{ position:"absolute", top:0, left:0, bottom:0, width:2, background:"#67e8f9", opacity:0.8 }} />}
            </>
        }
        {deadlineByDate[dk] && <div style={{ position:"absolute", right:0, top:0, bottom:0, width:2, background:"#f6ad55", opacity:0.7 }} />}
      </div>
    );
  };

  // 実績セル（下段）
  const ActualCell = ({ ins, dk, holidaySet }) => {
    const hf = holidaySet[dk];
    const isFullHoliday = hf === 0;
    const isHalfHoliday = hf === 0.5;
    const isPast = dk < today;
    const isToday = dk === today;
    const tasks = schedule[ins.id]?.[dk] || [];
    const plannedQty = Math.round(tasks.reduce((s,t)=>s+t.qty,0));
    const aKey = `${ins.id}_${dk}`;
    const actual = actuals[aKey];
    const hasActual = (isPast || isToday) && actual && getActualTotal(actual) > 0;
    const actTotalQty = getActualTotal(actual);
    const isShortfall = hasActual && actTotalQty < plannedQty * 0.99;
    const isOver      = hasActual && actTotalQty > plannedQty * 1.001;
    const rate = hasActual && plannedQty > 0 ? Math.round((actTotalQty/plannedQty)*100) : null;

    const outOfPrintRange = dk < printFrom || dk > printTo;
    return (
      <div className={outOfPrintRange ? "print-hidden" : ""} style={{
        width:DAY_W, minWidth:DAY_W, height:36, borderLeft:"1px solid #2d374822",
        position:"relative", overflow:"hidden", display:"flex", flexDirection:"column",
        background: isFullHoliday?"#200f0f": !isPast && !isToday?"#181818":
          isShortfall?"#1a0e0e": isOver?"#0e1a0e":"#0e111a",
      }}
        onMouseEnter={(e) => {
          if (isFullHoliday) { setTooltip({ x:e.clientX, y:e.clientY, content:<div>🏖️ 全休</div> }); return; }
          if (!isPast && !isToday) { setTooltip({ x:e.clientX, y:e.clientY, content:<div style={{ color:"#718096", fontSize:12 }}>未来日（実績なし）</div> }); return; }
          setTooltip({ x:e.clientX, y:e.clientY, content:(
            <div>
              <div style={{ fontWeight:700, marginBottom:6, color:"#a78bfa" }}>{ins.name} — {fmt(dk)}</div>
              <div style={{ fontSize:11, color:"#68d391", marginBottom:6 }}>✏️ 実績</div>
              {isHalfHoliday && <div style={{ color:"#f6ad55", fontSize:11, marginBottom:4 }}>🌅 半休</div>}
              <div style={{ color:"#a0aec0" }}>予定: {plannedQty}個</div>
              {hasActual ? (
                <>
                  <div style={{ color:isShortfall?"#fc8181":isOver?"#68d391":"#e2e8f0", fontWeight:600 }}>
                    実績: {actTotalQty}個 {rate!==null?`(${rate}%)`:""} {isShortfall?"⚠️ 未達":isOver?"✅ 超過":"✅"}
                  </div>
                  {isShortfall && <div style={{ color:"#fc8181", fontSize:11 }}>不足: {plannedQty-actTotalQty}個 → 翌日へ繰越</div>}
                  {actual.note && <div style={{ color:"#f6ad55", fontSize:11, marginTop:3 }}>📝 {actual.note}</div>}
                </>
              ) : (
                <div style={{ color:"#4a5568", fontSize:12 }}>実績未入力</div>
              )}
            </div>
          )});
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        {isFullHoliday ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, opacity:0.4 }}>🏖</div>
        ) : !isPast && !isToday ? (
          <div style={{ flex:1, background:"repeating-linear-gradient(45deg,#1a1f2e 0,#1a1f2e 4px,#111827 4px,#111827 8px)", opacity:0.4 }} />
        ) : hasActual ? (
          <>
            {/* 実績バー：製品色で塗る（按分） */}
            {tasks.map((t,i) => {
              const share = plannedQty > 0 ? t.qty / plannedQty : 0;
              const actQty = actTotalQty * share;
              const capH = isHalfHoliday ? ins.workHours*0.5 : ins.workHours;
              const spd = ins.speedPerProduct[t.productId]||1;
              const pct = Math.min((actQty/spd/capH)*100, 100);
              return <div key={i} style={{ width:"100%", height:`${pct}%`, minHeight:2, background:productMap[t.productId]?.color||"#aaa", opacity:0.95 }} />;
            })}
            {/* 達成率バッジ */}
            <div style={{
              position:"absolute", top:1, left:2, fontSize:8, fontWeight:700, lineHeight:1,
              color: isShortfall?"#fc8181":isOver?"#68d391":"rgba(255,255,255,0.7)",
            }}>{rate}%</div>
            {/* 未達ライン：予定ラインを赤点線で示す */}
            {isShortfall && (
              <div style={{ position:"absolute", top:`${100-Math.min((plannedQty/(ins.speedPerProduct[tasks[0]?.productId]||1)/ins.workHours)*100,100)}%`, left:0, right:0, borderTop:"1px dashed #fc8181", opacity:0.6 }} />
            )}
          </>
        ) : (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#2d3748" }}>—</div>
        )}
        {isToday && <div style={{ position:"absolute", top:0, left:0, bottom:0, width:2, background:"#67e8f9", opacity:0.8 }} />}
        {deadlineByDate[dk] && <div style={{ position:"absolute", right:0, top:0, bottom:0, width:2, background:"#f6ad55", opacity:0.7 }} />}
      </div>
    );
  };

  // モーダル用：注文選択state
  const [modalForm, setModalForm] = useState({ orderId:"", qty:0 });

  const openModal = (ins, dk, x, y) => {
    // 担当できる注文をすべて表示（残量0でも手動設定可能）
    const eligible = orders
      .filter(o => ins.canInspect.includes(o.productId))
      .sort((a,b) => new Date(a.deadline)-new Date(b.deadline));
    if (eligible.length === 0) return;
    const first = eligible[0];
    const rem = Math.max(remaining[first.id]||0, 0);
    const spd = ins.speedPerProduct[first.productId] || 1;
    setModalForm({ orderId: first.id, qty: Math.round(Math.min(rem > 0 ? rem : first.quantity, spd * ins.workHours)) });
    setCellModal({ ins, dk, x, y });
  };

  const addManual = () => {
    if (!cellModal || !modalForm.orderId || !modalForm.qty) return;
    const { ins, dk } = cellModal;
    setManualAssignments(prev => [
      ...prev,
      { id:`M${Date.now()}`, date:dk, inspectorId:ins.id, orderId:modalForm.orderId, qty:parseInt(modalForm.qty)||0 }
    ]);
    setCellModal(null);
  };

  const removeManualForCell = (insId, dk) => {
    setManualAssignments(prev => prev.filter(m => !(m.inspectorId===insId && m.date===dk)));
  };

  return (
    <div onClick={() => setCellModal(null)}>
      {/* 手動割り当てモーダル */}
      {cellModal && (() => {
        const { ins, dk, x, y } = cellModal;
        const eligible = orders
          .filter(o => ins.canInspect.includes(o.productId))
          .sort((a,b) => new Date(a.deadline)-new Date(b.deadline));
        const existingManuals = manualAssignments.filter(m => m.inspectorId===ins.id && m.date===dk);
        // モーダル位置（画面端に収まるよう調整）
        const mx = Math.min(x, window.innerWidth - 320);
        const my = Math.min(y, window.innerHeight - 360);
        return (
          <div onClick={e=>e.stopPropagation()} style={{
            position:"fixed", left:mx, top:my, zIndex:10000,
            background:"#1a1f2e", border:"1px solid #667eea88", borderRadius:12,
            padding:"16px", width:300, boxShadow:"0 12px 40px rgba(0,0,0,0.7)",
          }}>
            <div style={{ fontWeight:700, color:"#a78bfa", marginBottom:4 }}>📌 手動割り当て</div>
            <div style={{ fontSize:12, color:"#718096", marginBottom:12 }}>{ins.name} — {fmt(dk)}</div>

            {/* 既存の手動割り当て */}
            {existingManuals.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:"#718096", marginBottom:6 }}>設定済み</div>
                {existingManuals.map(m => {
                  const o = orders.find(x=>x.id===m.orderId);
                  const p = productMap[o?.productId];
                  return (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 8px", background:"#0f1117", borderRadius:6, marginBottom:4 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:p?.color }} />
                      <span style={{ fontSize:12, flex:1, color:p?.color }}>{p?.name} {m.qty.toLocaleString()}個</span>
                      <button onClick={()=>setManualAssignments(prev=>prev.filter(x=>x.id!==m.id))}
                        style={{ background:"none", border:"none", color:"#fc8181", cursor:"pointer", fontSize:14, padding:"0 4px" }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 新規追加フォーム */}
            <div style={{ fontSize:12, color:"#718096", marginBottom:6 }}>新規追加</div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:11, color:"#718096", marginBottom:4 }}>注文（製品・納期）</div>
              <select value={modalForm.orderId}
                onChange={e=>{
                  const o = orders.find(x=>x.id===e.target.value);
                  const spd = ins.speedPerProduct[o?.productId] || 1;
                  const rem = Math.max(remaining[e.target.value]||0, 0);
                  const defaultQty = Math.round(Math.min(rem > 0 ? rem : o?.quantity||0, spd * ins.workHours));
                  setModalForm({ orderId:e.target.value, qty: defaultQty });
                }}
                style={{ ...S.input, width:"100%", fontSize:12 }}>
                {eligible.map(o => {
                  const p = productMap[o.productId];
                  const rem = Math.round(remaining[o.id]||0);
                  const label = rem > 0
                    ? `${p?.name} 〆${o.deadline} 残${rem.toLocaleString()}個`
                    : `${p?.name} 〆${o.deadline} ✅スケジュール済`;
                  return <option key={o.id} value={o.id}>{label}</option>;
                })}
              </select>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#718096", marginBottom:4 }}>数量（個）</div>
              <input type="number" min="1" value={modalForm.qty}
                onChange={e=>setModalForm(f=>({...f, qty:e.target.value}))}
                style={{ ...S.input, width:"100%", fontSize:12 }} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addManual} style={{ ...S.btnPrimary, flex:1 }}>追加</button>
              <button onClick={()=>setCellModal(null)} style={{ ...S.btnSecondary }}>閉じる</button>
            </div>
          </div>
        );
      })()}
      {/* 印刷コントロール */}
      <div className="no-print" style={{ marginBottom:12 }}>
        <button
          onClick={() => setShowPrintRange(v => !v)}
          style={{ background:"#1e2535", border:"1px solid #4a5568", borderRadius:7, color:"#a0aec0", padding:"7px 14px", cursor:"pointer", fontSize:13 }}
        >🖨️ 印刷設定 {showPrintRange ? "▲" : "▼"}</button>
        {showPrintRange && (
          <div style={{ background:"#1a1f2e", border:"1px solid #2d3748", borderRadius:8, padding:"14px 16px", marginTop:8 }}>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end", marginBottom:12 }}>
              <label style={{ fontSize:13 }}>
                <div style={{ color:"#718096", marginBottom:4 }}>開始日</div>
                <input type="date" value={printFrom} onChange={e => setPrintFrom(e.target.value)}
                  style={{ ...S.inputDate, width:150 }} />
              </label>
              <label style={{ fontSize:13 }}>
                <div style={{ color:"#718096", marginBottom:4 }}>終了日</div>
                <input type="date" value={printTo} onChange={e => setPrintTo(e.target.value)}
                  style={{ ...S.inputDate, width:150 }} />
              </label>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:13, color:"#718096", marginBottom:6 }}>印刷する検査員</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button onClick={()=>setPrintInspectors(inspectors.map(i=>i.id))}
                  style={{ fontSize:12, padding:"3px 10px", borderRadius:5, border:"1px solid #4a5568", background:"#2d3748", color:"#a0aec0", cursor:"pointer" }}>全員</button>
                <button onClick={()=>setPrintInspectors([])}
                  style={{ fontSize:12, padding:"3px 10px", borderRadius:5, border:"1px solid #4a5568", background:"#2d3748", color:"#a0aec0", cursor:"pointer" }}>クリア</button>
                {inspectors.map(ins=>(
                  <button key={ins.id}
                    onClick={()=>setPrintInspectors(prev=>prev.includes(ins.id)?prev.filter(x=>x!==ins.id):[...prev,ins.id])}
                    style={{ fontSize:12, padding:"3px 10px", borderRadius:5, cursor:"pointer",
                      border: printInspectors.includes(ins.id)?"1px solid #667eea":"1px solid #4a5568",
                      background: printInspectors.includes(ins.id)?"#667eea33":"transparent",
                      color: printInspectors.includes(ins.id)?"#a78bfa":"#a0aec0",
                    }}>{ins.name}</button>
                ))}
              </div>
            </div>
            <button onClick={handlePrint}
              style={{ background:"linear-gradient(135deg,#48bb78,#276749)", border:"none", borderRadius:7, color:"#fff", padding:"8px 24px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              🖨️ 印刷
            </button>
          </div>
        )}
      </div>
      {/* 凡例（画面のみ） */}
      <div className="screen-only" style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {Object.values(productMap).map((p) => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:6, background:"#1e2640", borderRadius:6, padding:"4px 10px", border:`1px solid ${p.color}44` }}>
            <div style={{ width:10, height:10, borderRadius:2, background:p.color }} />
            <span style={{ fontSize:12, color:"#cbd5e0" }}>{p.name}</span>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"#1e2640", borderRadius:6, padding:"4px 10px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
            <div style={{ width:14, height:7, background:"#8b5cf644", border:"1px solid #8b5cf6" }} />
            <div style={{ width:14, height:7, background:"#8b5cf6aa" }} />
          </div>
          <span style={{ fontSize:12, color:"#cbd5e0" }}>上:予定 / 下:実績</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"#1e2640", borderRadius:6, padding:"4px 10px" }}>
          <div style={{ width:14, height:14, background:"repeating-linear-gradient(45deg,#fc818166 0,#fc818166 3px,transparent 3px,transparent 6px)", border:"1px solid #fc8181" }} />
          <span style={{ fontSize:12, color:"#cbd5e0" }}>未達</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"#1e2640", borderRadius:6, padding:"4px 10px" }}>
          <div style={{ width:2, height:14, background:"#f6ad55" }} />
          <span style={{ fontSize:12, color:"#cbd5e0" }}>納期</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"#1e2640", borderRadius:6, padding:"4px 10px" }}>
          <div style={{ width:2, height:14, background:"#67e8f9" }} />
          <span style={{ fontSize:12, color:"#cbd5e0" }}>今日</span>
        </div>

      </div>

      <div className="screen-only" style={{ overflowX:"auto", borderRadius:12, border:"1px solid #2d3748" }}>
        <div style={{ minWidth: dateKeys.length * DAY_W + 190 }}>
          {/* 日付ヘッダー */}
          <div style={{ display:"flex", background:"#1a1f2e", borderBottom:"1px solid #2d3748" }}>
            <div style={{ width:190, minWidth:190, padding:"10px 12px", fontSize:12, color:"#718096", fontWeight:700 }}>検査員</div>
            <div style={{ display:"flex" }}>
              {dateKeys.map((dk) => {
                const dt = new Date(dk+"T00:00:00");
                const isWE = [0,6].includes(dt.getDay());
                const isToday = dk === today;
                const hasDL = !!deadlineByDate[dk];
                const outOfPrintRange = dk < printFrom || dk > printTo;
                return (
                  <div key={dk} className={outOfPrintRange ? "print-hidden" : ""} style={{ width:DAY_W, minWidth:DAY_W, textAlign:"center", fontSize:10, padding:"5px 0 3px", borderLeft:"1px solid #2d374833", position:"relative",
                    color: isToday ? "#67e8f9" : isWE ? "#fc8181" : "#a0aec0",
                    background: isToday ? "#0e2330" : "transparent",
                  }}>
                    <div style={{ fontSize:9, color: isToday?"#67e8f944":"#4a5568" }}>{dt.getFullYear()}</div>
                    <div style={{ fontWeight: isToday?700:400 }}>{String(dt.getMonth()+1).padStart(2,"0")}/{String(dt.getDate()).padStart(2,"0")}</div>
                    {hasDL && <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:2, height:4, background:"#f6ad55" }} />}
                    {isToday && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"#67e8f9" }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 検査員行（予定行＋実績行の2段） */}
          {inspectors.map((ins, idx) => {
            const holidaySet={};
            ins.holidays.forEach(h=>{ holidaySet[h.date]=h.half?0.5:0; });
            const bg = idx%2===0 ? "#111827" : "#0f1117";

            return (
              <div key={ins.id} style={{ borderBottom:"2px solid #2d3748" }}>
                {/* 予定行 */}
                <div style={{ display:"flex", background:bg }}>
                  <div style={{ width:190, minWidth:190, padding:"6px 12px", borderRight:"1px solid #2d3748", display:"flex", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{ins.name}</div>
                      <div style={{ fontSize:10, color:"#718096" }}>{ins.workHours}h/日</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontSize:10, color:"#667eea", fontWeight:700, background:"#667eea22", borderRadius:4, padding:"2px 6px" }}>予定</div>
                  </div>
                  <div style={{ display:"flex" }}>
                    {dateKeys.map(dk => <PlanCell key={dk} ins={ins} dk={dk} holidaySet={holidaySet} />)}
                  </div>
                </div>
                {/* 実績行 */}
                <div className="no-print" style={{ display:"flex", background: idx%2===0?"#0d1117":"#0a0d12", borderTop:"1px solid #2d374855" }}>
                  <div style={{ width:190, minWidth:190, padding:"6px 12px", borderRight:"1px solid #2d3748", display:"flex", alignItems:"center" }}>
                    <div style={{ fontSize:10, color:"#68d391", fontWeight:700, background:"#68d39122", borderRadius:4, padding:"2px 6px", marginLeft:"auto" }}>実績</div>
                  </div>
                  <div style={{ display:"flex" }}>
                    {dateKeys.map(dk => <ActualCell key={dk} ins={ins} dk={dk} holidaySet={holidaySet} />)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 納期行 */}
          <div style={{ display:"flex", background:"#1a1f2e", borderTop:"1px solid #2d3748" }}>
            <div style={{ width:190, minWidth:190, padding:"8px 12px", borderRight:"1px solid #2d3748", fontSize:12, fontWeight:700, color:"#f6ad55" }}>📦 納期</div>
            <div style={{ display:"flex" }}>
              {dateKeys.map((dk) => {
                const dls = deadlineByDate[dk]||[];
                const outOfPrintRange2 = dk < printFrom || dk > printTo;
                return (
                  <div key={dk} className={outOfPrintRange2 ? "print-hidden" : ""} style={{ width:DAY_W, minWidth:DAY_W, minHeight:36, borderLeft:"1px solid #2d374822", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"2px 0",
                    background: dk===today?"#0e2330":"transparent" }}>
                    {dls.map((o,i) => {
                      const rem = remaining[o.id]??0;
                      const missed = rem > 0.5 && o.deadline < today;
                      const atRisk = rem > 0.5 && o.deadline >= today;
                      return <div key={i} style={{ width:8, height:8, borderRadius:"50%",
                        background: missed?"#fc8181": atRisk?"#f6ad55":"#68d391",
                        border:`1.5px solid ${productMap[o.productId]?.color||"#fff"}` }}
                        title={`${productMap[o.productId]?.name} 残${Math.round(rem)}個`} />;
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* サマリーカード（画面のみ） */}
      <div className="no-print" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginTop:20 }}>
        {[...orders].sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).map((o) => {
          const p = productMap[o.productId];
          const rem = Math.max(0, Math.round(remaining[o.id]??0));
          const done = o.quantity - rem;
          const pct = Math.round((done/o.quantity)*100);
          const missed = rem > 0.5 && o.deadline < today;
          const atRisk = rem > 0.5 && o.deadline >= today;
          return (
            <div key={o.id} style={{ background:"#1a1f2e", borderRadius:10, padding:"12px 14px",
              border:`1px solid ${missed?"#fc818144": atRisk?"#f6ad5544":"#2d374844"}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:p?.color }} />
                <span style={{ fontSize:13, fontWeight:700 }}>{p?.name}</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:"#718096" }}>〆{fmt(o.deadline)}</span>
              </div>
              <div style={{ fontSize:12, color:"#a0aec0", marginBottom:6 }}>{Math.round(done).toLocaleString()} / {o.quantity.toLocaleString()} 個</div>
              <div style={{ background:"#2d3748", borderRadius:4, height:6, overflow:"hidden" }}>
                <div style={{ width:`${Math.min(pct,100)}%`, height:"100%", background:missed?"#fc8181":atRisk?"#f6ad55":p?.color }} />
              </div>
              <div style={{ fontSize:11, marginTop:4, fontWeight:600,
                color: missed?"#fc8181": atRisk?"#f6ad55":"#68d391" }}>
                {missed?`🚨 納期超過 ${rem.toLocaleString()}個残`: atRisk?`⚠️ 要注意 ${rem.toLocaleString()}個残`:`✅ 達成 ${pct}%`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ 印刷専用カレンダービュー（白背景・A4横） ═══ */}
      <PrintCalendar
        inspectors={inspectors.filter(i=>printInspectors.includes(i.id))}
        dateKeys={dateKeys}
        schedule={schedule}
        orders={orders}
        productMap={productMap}
        remaining={remaining}
        today={today}
        printFrom={printFrom}
        printTo={printTo}
      />
    </div>
  );
}

// ─── 印刷専用カレンダービュー（1ページ=1人・5週分・日曜始まり） ────
function PrintCalendar({ inspectors, dateKeys, schedule, orders, productMap, remaining, today, printFrom, printTo }) {
  // 日曜始まり
  const DOW_SUN = ["日","月","火","水","木","金","土"];
  const orderMap = Object.fromEntries(orders.map(o=>[o.id,o]));

  function getSundayOf(dk) {
    const d = new Date(dk+"T00:00:00");
    const dow = d.getDay(); // 0=日
    d.setDate(d.getDate() - dow); // 直前の日曜へ
    return toKey(d);
  }
  function addDay(dk, n) {
    const d = new Date(dk+"T00:00:00");
    d.setDate(d.getDate()+n);
    return toKey(d);
  }

  const MAX_WEEKS = 5;
  const startSunday = getSundayOf(printFrom);
  const allWeeks = [];
  let cur = startSunday;
  while (allWeeks.length < MAX_WEEKS) {
    // 終了日を超えた週でも必ず5週分作る（均等表示のため）
    const wk = Array.from({length:7},(_,i)=>addDay(cur,i));
    allWeeks.push(wk);
    cur = addDay(cur,7);
    if (cur > printTo && allWeeks.length >= MAX_WEEKS) break;
  }
  // ちょうど5週になるよう調整
  while (allWeeks.length < MAX_WEEKS) {
    const wk = Array.from({length:7},(_,i)=>addDay(cur,i));
    allWeeks.push(wk);
    cur = addDay(cur,7);
  }

  // 1行の高さ: A4縦(297mm) - margin(16mm) - header(~14mm) - dowRow(~8mm) - legend(~8mm) = ~251mm / 5
  const ROW_H = "calc((100vh - 80px) / 5)";

  return (
    <div className="print-only" style={{ display:"none" }}>
      {inspectors.map((ins) => {
        const holMap = Object.fromEntries((ins.holidays||[]).map(h=>[h.date,h]));

        return (
          <div key={ins.id} style={{
            pageBreakAfter:"always",
            width:"100%",
            fontFamily:"'Noto Sans JP','Meiryo',sans-serif",
            padding:"6mm 6mm 4mm 6mm",
            color:"#000", background:"#fff",
          }}>
            {/* ヘッダー */}
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:4, borderBottom:"2px solid #000", paddingBottom:3 }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                <span style={{ fontSize:20, fontWeight:900 }}>{ins.name}</span>
                <span style={{ fontSize:12, color:"#444" }}>検査計画表</span>
                <span style={{ fontSize:11, color:"#666" }}>{fmt(printFrom)} 〜 {fmt(printTo)}</span>
              </div>
              <span style={{ fontSize:10, color:"#888" }}>印刷日: {toKey(new Date())}</span>
            </div>

            {/* カレンダーテーブル（曜日ヘッダー＋5週） */}
            <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
              <colgroup>
                {DOW_SUN.map((_,i)=><col key={i} style={{ width:`${100/7}%` }} />)}
              </colgroup>

              {/* 曜日ヘッダー */}
              <thead>
                <tr>
                  {DOW_SUN.map((d,i)=>{
                    const isSun=i===0, isSat=i===6;
                    return (
                      <th key={i} style={{
                        border:"1px solid #888", padding:"3px 0", textAlign:"center",
                        background: isSun?"#ffe0e0": isSat?"#e0e8ff":"#f0f0f0",
                        fontSize:13, fontWeight:700,
                        color: isSun?"#c00": isSat?"#006":"#000",
                      }}>{d}</th>
                    );
                  })}
                </tr>
              </thead>

              {/* 5週分の行（均等高さ） */}
              <tbody>
                {allWeeks.map((wk, wkIdx) => (
                  <tr key={wkIdx} style={{ height:"18mm" }}>
                    {wk.map((dk, dIdx) => {
                      const dt = new Date(dk+"T00:00:00");
                      const dow = dt.getDay();
                      const isSun=dow===0, isSat=dow===6;
                      const isToday = dk===today;
                      const inRange = dk>=printFrom && dk<=printTo;
                      const tasks = inRange ? (schedule[ins.id]?.[dk]||[]) : [];
                      const totalQty = Math.round(tasks.reduce((s,t)=>s+t.qty,0));
                      const hol = holMap[dk];
                      const isFullHol = isSun || isSat || (hol && !hol.half);
                      const isHalfHol = !isFullHol && hol && hol.half;

                      return (
                        <td key={dk} style={{
                          border:"1px solid #bbb",
                          verticalAlign:"top",
                          padding:"2px",
                          background: !inRange?"#f4f4f4": isToday?"#fffff0": isFullHol?"#efefef": isHalfHol?"#fffbf0":"#fff",
                          overflow:"hidden",
                        }}>
                          {/* 日付 */}
                          <div style={{
                            fontSize:12, fontWeight:700, lineHeight:1,
                            color: !inRange?"#ccc": isSun?"#c00": isSat?"#006":"#000",
                            marginBottom:2,
                            background: isToday?"#ffd700":"transparent",
                            borderRadius:2, padding:"1px 2px", display:"inline-block",
                          }}>
                            {dt.getMonth()+1}/{dt.getDate()}
                          </div>

                          {/* タスク */}
                          {inRange && !isFullHol && (
                            <div>
                              {isHalfHol && <div style={{ fontSize:9, color:"#b8860b" }}>半休</div>}
                              {tasks.map((t,i)=>(
                                <div key={i} style={{
                                  borderLeft:`3px solid ${productMap[t.productId]?.color||"#888"}`,
                                  background:`${productMap[t.productId]?.color||"#888"}18`,
                                  borderRadius:2,
                                  padding:"1px 3px",
                                  marginBottom:2,
                                }}>
                                  <div style={{ fontSize:13, fontWeight:900, color:"#000", lineHeight:1.2, wordBreak:"break-all", whiteSpace:"normal" }}>
                                    {t.isManual?"📌":""}{productMap[t.productId]?.name}
                                  </div>
                                  <div style={{ fontSize:10, color:"#333", fontWeight:600, lineHeight:1.2 }}>
                                    {Math.round(t.qty).toLocaleString()}個　{orderMap[t.orderId] ? `〆${String(new Date(orderMap[t.orderId].deadline+"T00:00:00").getMonth()+1).padStart(2,"0")}/${String(new Date(orderMap[t.orderId].deadline+"T00:00:00").getDate()).padStart(2,"0")}` : ""}
                                  </div>
                                </div>
                              ))}
                              {tasks.length>1 && (
                                <div style={{ fontSize:9, color:"#555", textAlign:"right" }}>計{totalQty.toLocaleString()}個</div>
                              )}
                            </div>
                          )}
                          {inRange && isFullHol && !inRange && (
                            <div style={{ color:"#bbb", fontSize:9 }}>休</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 製品凡例 */}
            <div style={{ display:"flex", gap:8, marginTop:3, flexWrap:"wrap", borderTop:"1px solid #ddd", paddingTop:2 }}>
              {Object.values(productMap).map(p=>(
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:2, fontSize:9 }}>
                  <div style={{ width:8, height:8, borderRadius:1, background:p.color }} />
                  <span>{p.name}</span>
                </div>
              ))}
              <span style={{ fontSize:9, color:"#888", marginLeft:"auto" }}>📌=手動設定</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 手動割り当て ─────────────────────────────────────────────────
function ManualAssignment({ inspectors, orders, productMap, manualAssignments, setManualAssignments, dateKeys, today }) {
  const orderMap = Object.fromEntries(orders.map(o => [o.id, o]));
  const [form, setForm] = useState({
    date: today, inspectorId: inspectors[0]?.id || "", orderId: orders[0]?.id || "", qty: 100
  });

  const eligibleInspectors = form.orderId
    ? inspectors.filter(ins => {
        const order = orderMap[form.orderId];
        return order && ins.canInspect.includes(order.productId);
      })
    : inspectors;

  const add = () => {
    if (!form.date || !form.inspectorId || !form.orderId || !form.qty) return;
    const order = orderMap[form.orderId];
    if (!order) return;
    const ins = inspectors.find(i => i.id === form.inspectorId);
    if (!ins || !ins.canInspect.includes(order.productId)) return;
    const id = `M${Date.now()}`;
    setManualAssignments(prev => [...prev, { ...form, id, qty: parseInt(form.qty)||0 }]);
  };

  const remove = (id) => setManualAssignments(prev => prev.filter(m => m.id !== id));

  // 注文選択が変わったら担当できる最初の検査員に自動セット
  const handleOrderChange = (orderId) => {
    const order = orderMap[orderId];
    const firstEligible = order
      ? inspectors.find(ins => ins.canInspect.includes(order.productId))
      : inspectors[0];
    setForm(f => ({ ...f, orderId, inspectorId: firstEligible?.id || f.inspectorId }));
  };

  // グループ表示用：注文ごとに手動割り当てをまとめる
  const grouped = orders.map(o => ({
    order: o,
    p: productMap[o.productId],
    items: manualAssignments.filter(m => m.orderId === o.id)
  })).filter(g => g.items.length > 0);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:18, color:"#f6ad55" }}>📋 手動割り当て</h2>
        <span style={{ fontSize:12, color:"#718096" }}>手動設定した分は自動スケジュールから除外され、残りが自動で再割り当てされます</span>
      </div>

      {/* 追加フォーム */}
      <div style={{ ...S.card, border:"1px solid #f6ad5544", marginBottom:20 }}>
        <div style={{ fontWeight:700, color:"#f6ad55", marginBottom:12 }}>＋ 割り当て追加</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
          <label style={{ fontSize:13 }}>
            <div style={{ color:"#718096", marginBottom:4 }}>日付</div>
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({...f, date: e.target.value}))}
              style={{ ...S.inputDate, width:160 }} />
          </label>
          <label style={{ fontSize:13 }}>
            <div style={{ color:"#718096", marginBottom:4 }}>注文（製品・納期）</div>
            <select value={form.orderId}
              onChange={e => handleOrderChange(e.target.value)}
              style={{ ...S.input, width:220 }}>
              {orders.sort((a,b) => new Date(a.deadline)-new Date(b.deadline)).map(o => {
                const p = productMap[o.productId];
                return <option key={o.id} value={o.id}>{p?.name} 〆{o.deadline} {o.quantity.toLocaleString()}個</option>;
              })}
            </select>
          </label>
          <label style={{ fontSize:13 }}>
            <div style={{ color:"#718096", marginBottom:4 }}>検査員</div>
            <select value={form.inspectorId}
              onChange={e => setForm(f => ({...f, inspectorId: e.target.value}))}
              style={{ ...S.input, width:160 }}>
              {eligibleInspectors.map(ins => (
                <option key={ins.id} value={ins.id}>{ins.name}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize:13 }}>
            <div style={{ color:"#718096", marginBottom:4 }}>数量（個）</div>
            <input type="number" min="1" value={form.qty}
              onChange={e => setForm(f => ({...f, qty: e.target.value}))}
              style={{ ...S.input, width:110 }} />
          </label>
          <button onClick={add} style={{ ...S.btnPrimary, marginBottom:1 }}>追加</button>
        </div>
      </div>

      {/* 登録済み一覧 */}
      {grouped.length === 0 ? (
        <div style={{ color:"#718096", textAlign:"center", padding:24 }}>手動割り当てはありません</div>
      ) : (
        grouped.map(({ order, p, items }) => (
          <div key={order.id} style={{ ...S.card, border:`1px solid ${p?.color}33`, marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:p?.color }} />
              <span style={{ fontWeight:700, color:p?.color }}>{p?.name}</span>
              <span style={{ fontSize:12, color:"#718096" }}>〆{order.deadline}　合計 {order.quantity.toLocaleString()}個</span>
            </div>
            {items.sort((a,b) => a.date.localeCompare(b.date)).map(m => {
              const ins = inspectors.find(i => i.id === m.inspectorId);
              return (
                <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px", background:"#0f111788", borderRadius:6, marginBottom:4 }}>
                  <span style={{ fontSize:13, color:"#cbd5e0", minWidth:100 }}>📅 {fmt(m.date)}</span>
                  <span style={{ fontSize:13, color:"#e2e8f0", minWidth:120 }}>👷 {ins?.name||m.inspectorId}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:"#f6ad55" }}>{m.qty.toLocaleString()}個</span>
                  <button onClick={() => remove(m.id)}
                    style={{ ...S.btnDanger, padding:"3px 10px", fontSize:12, marginLeft:"auto" }}>削除</button>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

// ─── 実績入力 ─────────────────────────────────────────────────────
function ActualsInput({ inspectors, dateKeys, schedule, orders, productMap, actuals, setActuals, today }) {
  const [selectedDate, setSelectedDate] = useState(today);

  const daySchedule = useMemo(() => {
    return inspectors.map((ins) => {
      const tasks = schedule[ins.id]?.[selectedDate] || [];
      const plannedQty = Math.round(tasks.reduce((s,t)=>s+t.qty,0));
      const aKey = `${ins.id}_${selectedDate}`;
      const actual = actuals[aKey] || { products:{}, note:"" };
      return { ins, tasks, plannedQty, aKey, actual };
    }).filter(({ plannedQty, actual }) => plannedQty > 0 || getActualTotal(actual) > 0);
  }, [inspectors, schedule, selectedDate, actuals]);

  // 製品別の実績を更新
  const updateProductQty = (aKey, orderId, value) => {
    setActuals(prev => {
      const cur = prev[aKey] || { products:{}, note:"" };
      const products = { ...(cur.products||{}), [orderId]: value===""?"":parseInt(value)||0 };
      return { ...prev, [aKey]: { ...cur, products } };
    });
  };
  const updateNote = (aKey, value) => {
    setActuals(prev => ({
      ...prev,
      [aKey]: { ...(prev[aKey]||{products:{},note:""}), note: value }
    }));
  };

  const pastDates = dateKeys.filter(dk => dk <= today).reverse();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        <h2 style={{ margin:0, fontSize:18, color:"#68d391" }}>✏️ 実績入力</h2>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, color:"#718096" }}>日付選択:</span>
          <select value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{ ...S.inputDate, width:160 }}>
            {pastDates.map(dk=><option key={dk} value={dk}>{fmt(dk)}{dk===today?" (今日)":""}</option>)}
          </select>
        </div>
        <div style={{ fontSize:12, color:"#718096" }}>
          ※ 実績を入力すると残量が自動で翌日以降に再スケジュールされます
        </div>
      </div>

      {daySchedule.length === 0 ? (
        <div style={{ color:"#718096", padding:"20px", textAlign:"center" }}>この日の予定はありません</div>
      ) : (
        <div>
          {daySchedule.map(({ ins, tasks, plannedQty, aKey, actual }) => {
            const products = actual.products || {};
            const totalActual = getActualTotal(actual);
            const hasAnyInput = Object.values(products).some(v => v !== "" && v > 0);
            const isShort = hasAnyInput && totalActual < plannedQty * 0.99;
            const isOver  = hasAnyInput && totalActual > plannedQty * 1.001;
            const rate    = hasAnyInput && plannedQty > 0 ? Math.round((totalActual/plannedQty)*100) : null;
            const multiProduct = tasks.length > 1;

            return (
              <div key={ins.id} style={{ ...S.card, border:`1px solid ${isShort?"#fc818144":isOver?"#68d39144":"#2d374844"}` }}>
                {/* 検査員名・合計 */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, flexWrap:"wrap" }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{ins.name}</div>
                  <div style={{ fontSize:12, color:"#718096" }}>予定合計: {plannedQty.toLocaleString()}個</div>
                  {rate !== null && (
                    <div style={{ fontSize:18, fontWeight:700, color: isShort?"#fc8181":isOver?"#68d391":"#a78bfa", marginLeft:"auto" }}>
                      {rate}%
                      {isShort && <span style={{ fontSize:12, marginLeft:6 }}>⚠️ 未達</span>}
                      {isOver  && <span style={{ fontSize:12, marginLeft:6 }}>✅ 超過</span>}
                    </div>
                  )}
                </div>

                {/* 製品別入力（複数製品 or 1製品） */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
                  {tasks.map((t) => {
                    const p = productMap[t.productId];
                    const planned = Math.round(t.qty);
                    const val = products[t.orderId];
                    const numVal = parseInt(val)||0;
                    const pShort = val !== undefined && val !== "" && numVal < planned * 0.99;
                    const pOver  = val !== undefined && val !== "" && numVal > planned * 1.001;
                    return (
                      <div key={t.orderId} style={{
                        background:"#0f1117", border:`1px solid ${pShort?"#fc8181":pOver?"#68d391":p?.color+"44"}`,
                        borderRadius:8, padding:"10px 12px", minWidth:160,
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                          <div style={{ width:10, height:10, borderRadius:3, background:p?.color, flexShrink:0 }} />
                          <span style={{ fontSize:13, fontWeight:700, color:p?.color }}>{p?.name}</span>
                          <span style={{ fontSize:11, color:"#718096", marginLeft:"auto" }}>予定 {planned.toLocaleString()}個</span>
                        </div>
                        <input type="number" min="0" placeholder={planned}
                          value={val ?? ""}
                          onChange={e => updateProductQty(aKey, t.orderId, e.target.value)}
                          style={{ ...S.input, width:"100%",
                            borderColor: pShort?"#fc8181":pOver?"#68d391":p?.color+"66" }} />
                        {val !== undefined && val !== "" && (
                          <div style={{ fontSize:11, marginTop:4, color: pShort?"#fc8181":pOver?"#68d391":"#a78bfa" }}>
                            {Math.round(numVal/planned*100)}%
                            {pShort && ` (-${(planned-numVal).toLocaleString()}個)`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 合計達成度バー */}
                {rate !== null && (
                  <div style={{ background:"#2d3748", borderRadius:4, height:6, overflow:"hidden", marginBottom:10, maxWidth:400 }}>
                    <div style={{ width:`${Math.min(rate,100)}%`, height:"100%", background: isShort?"#fc8181":isOver?"#68d391":"#a78bfa", transition:"width 0.3s" }} />
                  </div>
                )}

                {/* メモ */}
                <label style={{ fontSize:13, display:"block" }}>
                  <div style={{ color:"#718096", marginBottom:4 }}>遅延原因・メモ{isShort?" *":"（任意）"}</div>
                  <input type="text" placeholder="例: 機械トラブル、材料不足..."
                    value={actual.note||""}
                    onChange={e=>updateNote(aKey, e.target.value)}
                    style={{ ...S.input, width:"100%", maxWidth:400 }} />
                </label>

                {isShort && (
                  <div style={{ marginTop:8, padding:"6px 10px", background:"#2d1515", borderRadius:6, fontSize:12, color:"#fc8181", border:"1px solid #fc818133" }}>
                    📋 残 {(plannedQty-totalActual).toLocaleString()}個 → 翌日以降に自動再スケジュール
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 実績サマリー */}
      {Object.keys(actuals).length > 0 && (
        <div style={{ marginTop:24 }}>
          <h3 style={{ fontSize:15, color:"#a78bfa", marginBottom:12 }}>📊 実績サマリー（全日）</h3>
          <div style={{ overflowX:"auto" }}>
            <table style={{ borderCollapse:"collapse", width:"100%", fontSize:12 }}>
              <thead>
                <tr style={{ background:"#1a1f2e" }}>
                  {["日付","検査員","製品別実績","合計","達成率","メモ"].map(h=>(
                    <th key={h} style={{ padding:"8px 12px", color:"#718096", textAlign:"left", borderBottom:"1px solid #2d3748" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(actuals)
                  .filter(([,v]) => getActualTotal(v) > 0)
                  .sort(([a],[b]) => a.localeCompare(b))
                  .map(([key,val]) => {
                    const [iid, dk] = key.split("_");
                    const ins = inspectors.find(x=>x.id===iid);
                    const plannedTasks = schedule[iid]?.[dk]||[];
                    const planned = Math.round(plannedTasks.reduce((s,t)=>s+t.qty,0));
                    const total = getActualTotal(val);
                    const rate = planned>0 ? Math.round((total/planned)*100) : null;
                    const isShort = rate!==null && rate < 99;
                    const prods = val.products || {};
                    return (
                      <tr key={key} style={{ borderBottom:"1px solid #2d374833" }}>
                        <td style={{ padding:"6px 12px", color:"#a0aec0" }}>{fmt(dk)}</td>
                        <td style={{ padding:"6px 12px" }}>{ins?.name||iid}</td>
                        <td style={{ padding:"6px 12px" }}>
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            {plannedTasks.map(t => {
                              const p = productMap[t.productId];
                              const actQty = parseInt(prods[t.orderId])||0;
                              return (
                                <span key={t.orderId} style={{ fontSize:11, padding:"1px 6px", borderRadius:4, background:`${p?.color}22`, color:p?.color, border:`1px solid ${p?.color}44` }}>
                                  {p?.name} {actQty.toLocaleString()}個
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding:"6px 12px", fontWeight:600 }}>{total.toLocaleString()}個 / {planned.toLocaleString()}個</td>
                        <td style={{ padding:"6px 12px", color: isShort?"#fc8181":"#68d391", fontWeight:600 }}>
                          {rate!==null ? `${rate}%` : "—"}
                        </td>
                        <td style={{ padding:"6px 12px", color:"#f6ad55" }}>{val.note||"—"}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 注文・納期設定 ────────────────────────────────────────────────
function OrderSettings({ orders, setOrders, productMap, remaining, today }) {
  // addForm: 一括追加モード { productId, rows:[{id,deadline,quantity}] }
  const [addForm,  setAddForm]  = useState(null);
  // editForm: 1件編集モード
  const [editForm, setEditForm] = useState(null);

  const firstProductId = Object.keys(productMap)[0] || "";

  // ── 追加フォーム ──
  const openAdd = () => setAddForm({
    productId: firstProductId,
    rows: [{ id:`O${Date.now()}`, deadline:today, quantity:100 }],
  });
  const addRow = () => setAddForm(f => ({
    ...f,
    rows: [...f.rows, { id:`O${Date.now()+Math.random()}`, deadline:today, quantity:100 }],
  }));
  const removeRow = (idx) => setAddForm(f => ({ ...f, rows: f.rows.filter((_,i)=>i!==idx) }));
  const updateRow = (idx, key, val) => setAddForm(f => {
    const rows = [...f.rows];
    rows[idx] = { ...rows[idx], [key]: val };
    return { ...f, rows };
  });
  const saveAdd = () => {
    if (!addForm.productId) return;
    const valid = addForm.rows.filter(r => r.deadline && parseInt(r.quantity) > 0);
    if (!valid.length) return;
    const entries = valid.map(r => ({ id:r.id, productId:addForm.productId, deadline:r.deadline, quantity:parseInt(r.quantity) }));
    setOrders(prev => [...prev, ...entries]);
    setAddForm(null);
  };

  // ── 編集フォーム ──
  const startEdit = (o) => setEditForm({...o});
  const saveEdit = () => {
    if (!editForm.productId||!editForm.deadline||!editForm.quantity) return;
    const entry = { id:editForm.id, productId:editForm.productId, deadline:editForm.deadline, quantity:parseInt(editForm.quantity)||0 };
    setOrders(prev => prev.map(o => o.id===entry.id ? entry : o));
    setEditForm(null);
  };
  const remove = (id) => setOrders(prev => prev.filter(o=>o.id!==id));

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <h2 style={{ margin:0, fontSize:18, color:"#f6ad55" }}>📦 注文・納期設定</h2>
        <button onClick={openAdd} style={S.btnPrimary}>+ 注文追加</button>
      </div>

      {/* ── 一括追加フォーム ── */}
      {addForm && (
        <div style={{ ...S.card, border:"1px solid #667eea88", marginBottom:16 }}>
          <div style={{ fontWeight:700, marginBottom:12, color:"#a78bfa" }}>新規注文</div>

          {/* 製品選択 */}
          <label style={{ fontSize:13, display:"block", marginBottom:14, maxWidth:320 }}>
            <span style={{ color:"#718096", marginRight:8 }}>製品</span>
            <select value={addForm.productId} onChange={e=>setAddForm(f=>({...f,productId:e.target.value}))} style={{ ...S.input, width:"auto", minWidth:160 }}>
              {Object.values(productMap).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          {/* 納期・数量の行 */}
          <div style={{ marginBottom:10, maxWidth:480 }}>
            <div style={{ display:"grid", gridTemplateColumns:"180px 130px 36px", gap:8, marginBottom:6, fontSize:12, color:"#718096", padding:"0 4px" }}>
              <span>納期</span><span>数量（個）</span><span></span>
            </div>
            {addForm.rows.map((row, idx) => (
              <div key={row.id} style={{ display:"grid", gridTemplateColumns:"180px 130px 36px", gap:8, marginBottom:6, alignItems:"center" }}>
                <input type="date" value={row.deadline} onChange={e=>updateRow(idx,"deadline",e.target.value)} style={S.inputDate} />
                <input type="number" min="1" value={row.quantity} onChange={e=>updateRow(idx,"quantity",e.target.value)} style={S.input} />
                <button onClick={()=>removeRow(idx)} style={{ ...S.btnDanger, padding:"6px 8px", fontSize:13, visibility:addForm.rows.length>1?"visible":"hidden" }}>✕</button>
              </div>
            ))}
          </div>

          {/* 行追加ボタン */}
          <button onClick={addRow} style={{ ...S.btnSecondary, fontSize:13, marginBottom:14 }}>+ 納期を追加</button>

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={saveAdd} style={S.btnPrimary}>すべて保存</button>
            <button onClick={()=>setAddForm(null)} style={S.btnSecondary}>キャンセル</button>
          </div>
        </div>
      )}

      {/* ── 1件編集フォーム ── */}
      {editForm && (
        <div style={{ ...S.card, border:"1px solid #f6ad5588", marginBottom:16 }}>
          <div style={{ fontWeight:700, marginBottom:12, color:"#f6ad55" }}>注文編集</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
            <label style={{ fontSize:13 }}>
              <div style={{ color:"#718096", marginBottom:4 }}>製品</div>
              <select value={editForm.productId} onChange={e=>setEditForm({...editForm,productId:e.target.value})} style={S.input}>
                {Object.values(productMap).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label style={{ fontSize:13 }}>
              <div style={{ color:"#718096", marginBottom:4 }}>納期</div>
              <input type="date" value={editForm.deadline} onChange={e=>setEditForm({...editForm,deadline:e.target.value})} style={S.inputDate} />
            </label>
            <label style={{ fontSize:13 }}>
              <div style={{ color:"#718096", marginBottom:4 }}>数量（個）</div>
              <input type="number" min="1" value={editForm.quantity} onChange={e=>setEditForm({...editForm,quantity:e.target.value})} style={{ ...S.input, width:100 }} />
            </label>
            <button onClick={saveEdit} style={S.btnPrimary}>保存</button>
            <button onClick={()=>setEditForm(null)} style={S.btnSecondary}>キャンセル</button>
          </div>
        </div>
      )}

      {/* ── 注文一覧（製品ごとにグループ表示） ── */}
      {Object.values(productMap).map(p => {
        const pOrders = [...orders].filter(o=>o.productId===p.id).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
        if (!pOrders.length) return null;
        return (
          <div key={p.id} style={{ ...S.card, border:`1px solid ${p.color}33`, marginBottom:12 }}>
            {/* 製品ヘッダー */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:14, height:14, borderRadius:3, background:p.color, flexShrink:0 }} />
              <span style={{ fontWeight:700, color:p.color }}>{p.name}</span>
              <span style={{ fontSize:12, color:"#718096" }}>{pOrders.length}件</span>
            </div>
            {/* 納期行 */}
            {pOrders.map(o => {
              const rem = Math.max(0,Math.round(remaining[o.id]??0));
              const missed = rem>0.5 && o.deadline<today;
              const atRisk = rem>0.5 && o.deadline>=today;
              return (
                <div key={o.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px", borderRadius:6, marginBottom:4, background:"#0f111788" }}>
                  <span style={{ fontSize:13, color:"#cbd5e0", minWidth:100 }}>📅 {fmt(o.deadline)}</span>
                  <span style={{ fontSize:13, color:"#e2e8f0", minWidth:90 }}>{o.quantity.toLocaleString()}個</span>
                  <span style={{ fontSize:12, fontWeight:600, flex:1, color:missed?"#fc8181":atRisk?"#f6ad55":"#68d391" }}>
                    {missed?`🚨 超過 ${rem.toLocaleString()}個残`:atRisk?`⚠️ ${rem.toLocaleString()}個残`:"✅ 達成可能"}
                  </span>
                  <button onClick={()=>startEdit(o)} style={S.btnSecondary}>編集</button>
                  <button onClick={()=>remove(o.id)} style={S.btnDanger}>削除</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── 検査員設定 ───────────────────────────────────────────────────
function InspectorSettings({ inspectors, setInspectors, products }) {
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(null);
  const [nameEditId, setNameEditId] = useState(null); // インライン名前編集中のID
  const [nameInput,  setNameInput]  = useState("");

  const startEdit = (ins) => {
    setNameEditId(null);
    setEditId(ins.id);
    setForm({ ...ins, speedPerProduct:{...ins.speedPerProduct}, holidays:ins.holidays.map(h=>({...h})), canInspectSet:new Set(ins.canInspect) });
  };
  const save = () => {
    setInspectors(prev => prev.map(ins => ins.id!==form.id ? ins : {
      ...ins,
      name: form.name || ins.name,
      workHours: parseFloat(form.workHours) || ins.workHours,
      speedPerProduct: {...form.speedPerProduct},
      holidays: form.holidays,
      canInspect: [...form.canInspectSet],
    }));
    setEditId(null); setForm(null);
  };

  // ── インライン名前編集 ──
  const startNameEdit = (ins, e) => {
    e.stopPropagation();
    setNameEditId(ins.id);
    setNameInput(ins.name);
  };
  const commitNameEdit = (insId) => {
    const trimmed = nameInput.trim();
    if (trimmed) setInspectors(prev => prev.map(ins => ins.id===insId ? {...ins, name:trimmed} : ins));
    setNameEditId(null);
  };

  const addInspector = () => {
    const id = `I${Date.now()}`;
    const ni = { id, name:"新規検査員", workHours:8, speedPerProduct:{}, canInspect:[], holidays:[] };
    setInspectors(prev => [...prev, ni]);
    // すぐ名前編集モードに
    setNameEditId(id);
    setNameInput("新規検査員");
  };
  const removeInspector = (id) => {
    if (window.confirm("この検査員を削除しますか？")) {
      setInspectors(prev => prev.filter(ins => ins.id !== id));
      if (editId === id) { setEditId(null); setForm(null); }
    }
  };
  const addHoliday    = () => setForm(f=>({...f, holidays:[...f.holidays,{date:"2025-01-01",half:false}]}));
  const removeHoliday = (i) => setForm(f=>({...f, holidays:f.holidays.filter((_,idx)=>idx!==i)}));
  const updateHoliday = (i,k,v) => setForm(f=>{ const hs=[...f.holidays]; hs[i]={...hs[i],[k]:v}; return {...f,holidays:hs}; });

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <h2 style={{ margin:0, fontSize:18, color:"#a78bfa" }}>👷 検査員設定</h2>
        <button onClick={addInspector} style={S.btnPrimary}>+ 検査員追加</button>
      </div>
      {inspectors.map((ins) => (
        <div key={ins.id} style={S.card}>
          {editId===ins.id && form ? (
            // ── 詳細編集フォーム ──
            <div>
              <label style={{ fontSize:13, display:"block", marginBottom:14 }}>
                <span style={{ color:"#718096" }}>検査員名　</span>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ ...S.input, width:200 }} placeholder="検査員名" />
              </label>
              <label style={{ fontSize:13, display:"block", marginBottom:12 }}>
                <span style={{ color:"#718096" }}>1日の労働時間（時間）　</span>
                <input type="number" min="0.5" max="24" step="0.5" value={form.workHours} onChange={e=>setForm({...form,workHours:e.target.value})} style={{ ...S.input, width:80 }} />
              </label>
              <div style={{ marginBottom:14 }}>
                <div style={{ color:"#718096", fontSize:13, marginBottom:8 }}>担当製品と検査速度（個/時間）</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {products.map((p) => {
                    const checked=form.canInspectSet.has(p.id);
                    return (
                      <div key={p.id} style={{ background:checked?`${p.color}22`:"#0f1117", border:`1px solid ${p.color}${checked?"88":"22"}`, borderRadius:8, padding:"8px 12px", minWidth:120 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:checked?6:0 }}>
                          <input type="checkbox" checked={checked} onChange={()=>{ const s=new Set(form.canInspectSet); checked?s.delete(p.id):s.add(p.id); setForm({...form,canInspectSet:s}); }} />
                          <span style={{ fontSize:13, color:checked?p.color:"#718096", fontWeight:checked?700:400 }}>{p.name}</span>
                        </div>
                        {checked && <input type="number" min="1" placeholder="個/時間" value={form.speedPerProduct[p.id]||""} onChange={e=>setForm({...form,speedPerProduct:{...form.speedPerProduct,[p.id]:parseInt(e.target.value)||0}})} style={{ ...S.input, width:"100%", fontSize:12, padding:"4px 8px" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ color:"#718096", fontSize:13 }}>休日設定</span>
                  <button onClick={addHoliday} style={{ ...S.btnSecondary, padding:"4px 10px", fontSize:12 }}>+ 追加</button>
                </div>
                {form.holidays.map((h,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <input type="date" value={h.date} onChange={e=>updateHoliday(i,"date",e.target.value)} style={{ ...S.inputDate, width:160 }} />
                    <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, cursor:"pointer" }}>
                      <input type="checkbox" checked={h.half} onChange={e=>updateHoliday(i,"half",e.target.checked)} />
                      <span style={{ color:h.half?"#f6ad55":"#718096" }}>半日休み</span>
                    </label>
                    <span style={{ fontSize:12, color:"#718096" }}>{h.half?"🌅 半休":"🏖️ 全休"}</span>
                    <button onClick={()=>removeHoliday(i)} style={{ ...S.btnDanger, padding:"3px 8px", fontSize:12 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={save} style={S.btnPrimary}>保存</button>
                <button onClick={()=>{setEditId(null);setForm(null);}} style={S.btnSecondary}>キャンセル</button>
              </div>
            </div>
          ) : (
            // ── カード表示（名前インライン編集つき） ──
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <div style={{ flex:1 }}>
                {/* 名前：クリックでインライン編集 */}
                {nameEditId===ins.id ? (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={e=>setNameInput(e.target.value)}
                      onBlur={()=>commitNameEdit(ins.id)}
                      onKeyDown={e=>{ if(e.key==="Enter") commitNameEdit(ins.id); if(e.key==="Escape"){ setNameEditId(null); } }}
                      style={{ ...S.input, fontSize:15, fontWeight:700, width:200, padding:"4px 8px" }}
                    />
                    <button onClick={()=>commitNameEdit(ins.id)} style={{ ...S.btnPrimary, padding:"4px 10px", fontSize:12 }}>✓</button>
                    <button onClick={()=>setNameEditId(null)} style={{ ...S.btnSecondary, padding:"4px 10px", fontSize:12 }}>✕</button>
                  </div>
                ) : (
                  <div
                    onClick={e=>startNameEdit(ins, e)}
                    title="クリックして名前を編集"
                    style={{ fontWeight:700, marginBottom:4, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 }}
                  >
                    {ins.name}
                    <span style={{ fontSize:11, color:"#4a5568", opacity:0.7 }}>✏️</span>
                  </div>
                )}
                <div style={{ fontSize:12, color:"#718096", marginBottom:6 }}>労働時間: {ins.workHours}h/日</div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
                  {ins.canInspect.map(pid=>{ const p=products.find(x=>x.id===pid); const spd=ins.speedPerProduct[pid]; return <span key={pid} style={{ fontSize:11, padding:"2px 7px", borderRadius:4, background:`${p?.color}22`, color:p?.color, border:`1px solid ${p?.color}44` }}>{p?.name}{spd?` ${spd}/h`:""}</span>; })}
                </div>
                <div style={{ fontSize:12, color:"#718096" }}>休日: {ins.holidays.length===0?"なし":ins.holidays.map(h=>`${fmt(h.date)}${h.half?"(半)":""}`).join("、")}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>startEdit(ins)} style={S.btnSecondary}>詳細編集</button>
                <button onClick={()=>removeInspector(ins.id)} style={S.btnDanger}>削除</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── 製品管理 ─────────────────────────────────────────────────────
function ProductSettings({ products, setProducts }) {
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState(null);
  const startEdit=(p)=>{ setEditId(p.id); setForm({...p}); };
  const save=()=>{ setProducts(prev=>prev.map(p=>p.id===form.id?form:p)); setEditId(null); setForm(null); };
  const add=()=>{ const id=`P${Date.now()}`; const np={id,name:"新製品",color:COLORS[products.length%COLORS.length]}; setProducts(prev=>[...prev,np]); setEditId(id); setForm({...np}); };
  const remove=(id)=>setProducts(prev=>prev.filter(p=>p.id!==id));

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <h2 style={{ margin:0, fontSize:18, color:"#68d391" }}>🏷️ 製品管理</h2>
        <button onClick={add} style={S.btnPrimary}>+ 製品追加</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
        {products.map((p) => (
          <div key={p.id} style={{ ...S.card, border:`1px solid ${p.color}44` }}>
            {editId===p.id && form ? (
              <div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end", marginBottom:12 }}>
                  <label style={{ fontSize:13 }}><div style={{ color:"#718096", marginBottom:4 }}>製品名</div><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ ...S.inputDate, width:160 }} /></label>
                  <label style={{ fontSize:13 }}><div style={{ color:"#718096", marginBottom:4 }}>カラー</div><input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} style={{ width:48, height:34, borderRadius:6, border:"1px solid #4a5568", background:"none", cursor:"pointer" }} /></label>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={save} style={S.btnPrimary}>保存</button>
                  <button onClick={()=>{setEditId(null);setForm(null);}} style={S.btnSecondary}>キャンセル</button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:24, height:24, borderRadius:6, background:p.color, flexShrink:0 }} />
                <span style={{ fontWeight:700, flex:1 }}>{p.name}</span>
                <button onClick={()=>startEdit(p)} style={S.btnSecondary}>編集</button>
                <button onClick={()=>remove(p.id)} style={S.btnDanger}>削除</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
