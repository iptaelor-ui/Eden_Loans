import { useState, useEffect } from "react";
import { supabase, fmt, fmtDate, isOverdue, genId, AGR_STYLES } from "./shared";

const ADMIN_STYLES = `
${AGR_STYLES}
body{background:var(--bg);}

/* ── Dark Mode ── */
body.dark{
  --bg:#0f1a13;--white:#1a2e1f;--border:#2a3d2e;--ink:#e8f5ee;
  --muted:#7aab87;--accent:#1a2e1f;--green-light:#1a2e1f;
}
body.dark .topbar{background:#1a2e1f;border-bottom-color:#2a3d2e;}
body.dark .card{background:#1a2e1f;border-color:#2a3d2e;}
body.dark .modal{background:#1a2e1f;}
body.dark .modal-head,.dark .modal-foot{background:#1a2e1f;}
body.dark input,body.dark select,body.dark textarea{background:#0f1a13;color:#e8f5ee;border-color:#2a3d2e;}
body.dark th{background:#0f1a13;}
body.dark td{border-bottom-color:#2a3d2e;}
body.dark tr:hover td{background:#1f3326;}
body.dark .stat-card{background:#1a2030;border-color:#2a3d2e;}
body.dark .pin-key{background:#1a2e1f;border-color:#2a3d2e;color:#e8f5ee;}
body.dark .sidebar{background:#0a1020;}
body.dark .login-box{background:#1a2e1f;}

/* ── Layout ── */
.shell{display:flex;min-height:100vh;}
.sidebar{width:240px;flex-shrink:0;background:var(--blue-dark);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;}
.sidebar-brand{padding:28px 20px 20px;border-bottom:1px solid rgba(255,255,255,0.08);}
.brand-logo{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;margin-bottom:10px;overflow:hidden;}
.brand-logo img{width:100%;height:100%;object-fit:cover;}
.brand-name{font-family:'Playfair Display',serif;color:#fff;font-size:1rem;font-weight:700;line-height:1.3;}
.brand-tag{font-size:0.72rem;color:rgba(255,255,255,0.5);margin-top:2px;}
.sidebar-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:4px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.875rem;font-weight:700;color:rgba(255,255,255,0.6);background:transparent;transition:all 0.18s;text-align:left;width:100%;}
.nav-item:hover{color:#fff;background:rgba(255,255,255,0.08);}
.nav-item.active{color:var(--blue-dark);background:#fff;}
.sidebar-footer{padding:16px 12px;border-top:1px solid rgba(255,255,255,0.08);}
.logout-btn{width:100%;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);font-family:'Inter',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:8px;}
.logout-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}
.main{flex:1;overflow-y:auto;}
.topbar{background:var(--white);border-bottom:1px solid var(--border);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.topbar-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;}
.topbar-right{display:flex;align-items:center;gap:0.75rem;}
.topbar-date{font-size:0.8rem;color:var(--muted);}
.dark-toggle{padding:6px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;font-size:0.8rem;font-weight:700;color:var(--muted);}
.dark-toggle:hover{border-color:var(--blue);color:var(--blue);}
.page{padding:2rem;max-width:1100px;}

/* ── Notification Banner ── */
.notif-banner{background:#fffbeb;border:1px solid #f59e0b;border-radius:10px;padding:0.875rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:flex-start;gap:0.75rem;}
.notif-banner.danger{background:#fef2f2;border-color:#ef4444;}
.notif-icon{font-size:1.1rem;flex-shrink:0;}
.notif-title{font-weight:800;font-size:0.875rem;color:#92400e;}
.notif-banner.danger .notif-title{color:#991b1b;}
.notif-items{font-size:0.8rem;color:#92400e;margin-top:4px;display:flex;flex-direction:column;gap:2px;}
.notif-banner.danger .notif-items{color:#991b1b;}
body.dark .notif-banner{background:#2a1f00;border-color:#d97706;}
body.dark .notif-banner.danger{background:#2a0000;border-color:#ef4444;}

/* ── Stats ── */
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1rem;}
.stat-card{background:var(--white);border-radius:12px;border:1px solid var(--border);padding:1.25rem 1.5rem;border-top:3px solid var(--blue);transition:transform 0.2s;box-shadow:0 1px 6px rgba(26,86,219,0.07);}
.stat-card:hover{transform:translateY(-2px);}
.stat-card.amber{border-top-color:#d97706;}
.stat-card.gray{border-top-color:#888;}
.stat-card.purple{border-top-color:#7c3aed;}
.stat-card.blue{border-top-color:#2563eb;}
.stat-card.teal{border-top-color:#0891b2;}
.stat-label{font-size:0.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;}
.stat-value{font-family:'Playfair Display',serif;font-size:1.65rem;font-weight:700;color:var(--ink);line-height:1;}
.stat-value.sm{font-size:1.2rem;}
.stat-sub{font-size:0.72rem;color:var(--muted);margin-top:4px;}

/* ── Card ── */
.card{background:var(--white);border-radius:12px;border:1px solid var(--border);margin-bottom:1.5rem;box-shadow:0 1px 6px rgba(26,86,219,0.07);}
.card-head{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.card-title{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;}
.card-body{padding:1.5rem;}
.tbl-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:0.875rem;}
th{padding:10px 14px;text-align:left;background:var(--accent);color:var(--muted);font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid var(--border);}
td{padding:12px 14px;border-bottom:1px solid var(--border);vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tr:hover td{background:var(--blue-light);}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.68rem;font-weight:800;text-transform:uppercase;}
.badge-active{background:#dcf5e7;color:#145f39;}
.badge-overdue{background:#fdf0ee;color:#c0392b;}
.badge-settled{background:#e8eaed;color:#555;}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:9px;border:none;font-family:'Inter',sans-serif;font-weight:800;font-size:0.875rem;cursor:pointer;transition:all 0.18s;}
.btn:disabled{opacity:0.55;cursor:not-allowed;transform:none!important;}
.btn-green{background:var(--blue);color:#fff;}
.btn-green:hover:not(:disabled){background:#2da05f;transform:translateY(-1px);}
.btn-outline{background:transparent;color:var(--blue);border:2px solid var(--green);}
.btn-outline:hover{background:var(--blue-light);}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border);}
.btn-ghost:hover:not(:disabled){background:var(--bg);color:var(--ink);}
.btn-red{background:#c0392b;color:#fff;}
.btn-red:hover{background:#a93226;}
.btn-wa{background:#25d366;color:#fff;}
.btn-wa:hover:not(:disabled){background:#1ebe5d;transform:translateY(-1px);}
.btn-link{background:var(--blue-light);color:var(--blue-dark);border:1px solid var(--border);}
.btn-link:hover{background:#d4edda;}
.btn-blue{background:#2563eb;color:#fff;}
.btn-blue:hover:not(:disabled){background:#1d4ed8;}
.btn-sm{padding:6px 13px;font-size:0.78rem;}
.btn-xs{padding:4px 10px;font-size:0.72rem;}

/* ── Forms ── */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.form-group{display:flex;flex-direction:column;gap:5px;}
.form-group.full{grid-column:1/-1;}
label{font-size:0.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;}
input,select,textarea{padding:10px 14px;border:1.5px solid var(--border);border-radius:9px;font-family:'Inter',sans-serif;font-size:0.9rem;color:var(--ink);background:var(--white);outline:none;transition:border-color 0.18s;width:100%;}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,86,219,0.1);}
textarea{resize:vertical;min-height:80px;}

/* ── Modal ── */
.modal-backdrop{position:fixed;inset:0;z-index:200;background:rgba(13,31,20,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;}
.modal{background:var(--white);border-radius:16px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;box-shadow:0 12px 48px rgba(26,86,219,0.16);}
.modal-head{padding:1.5rem 1.75rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--white);z-index:1;}
.modal-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;}
.modal-body{padding:1.75rem;}
.modal-foot{padding:1.25rem 1.75rem;border-top:1px solid var(--border);display:flex;gap:0.75rem;justify-content:flex-end;position:sticky;bottom:0;background:var(--white);}
.close-btn{width:32px;height:32px;border-radius:50%;border:none;background:var(--bg);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;color:var(--muted);}

/* ── Login ── */
.login-shell{min-height:100vh;background:var(--blue-dark);display:flex;align-items:center;justify-content:center;padding:1rem;}
.login-box{background:var(--white);border-radius:20px;padding:2.5rem;width:100%;max-width:400px;text-align:center;box-shadow:0 12px 48px rgba(26,122,74,0.2);}
.login-logo{width:72px;height:72px;border-radius:50%;background:var(--blue);margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#fff;overflow:hidden;}
.login-logo img{width:100%;height:100%;object-fit:cover;}
.login-title{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;margin-bottom:4px;}
.login-sub{color:var(--muted);font-size:0.875rem;margin-bottom:2rem;}
.pin-dots{display:flex;gap:12px;justify-content:center;margin-bottom:1.5rem;}
.pin-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--border);transition:all 0.18s;}
.pin-dot.filled{background:var(--blue);border-color:var(--blue);}
.pin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:1rem;}
.pin-key{padding:14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:800;color:var(--ink);cursor:pointer;transition:all 0.15s;}
.pin-key:hover{background:var(--blue-light);border-color:var(--blue);color:var(--blue-dark);}
.pin-key:active{transform:scale(0.95);}
.pin-key.zero{grid-column:2;}
.pin-key.del{background:var(--red-light);border-color:#f5c6c0;color:var(--red);}
.pin-error{color:var(--red);font-size:0.85rem;font-weight:700;margin-bottom:0.75rem;}

/* ── Upload ── */
.upload-area{border:2px dashed var(--border);border-radius:10px;padding:1.25rem;text-align:center;cursor:pointer;transition:all 0.2s;background:var(--bg);}
.upload-area:hover{border-color:var(--blue);background:var(--blue-light);}
.upload-preview{max-width:220px;max-height:90px;object-fit:contain;margin:0 auto 0.5rem;display:block;}
.upload-preview-round{width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 0.5rem;display:block;}
.collateral-photo-preview{max-width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:0.5rem;border:1px solid var(--border);}
.section-sub{font-size:0.78rem;font-weight:800;color:var(--blue);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid var(--blue-light);}

/* ── Toast ── */
.toast{position:fixed;bottom:2rem;right:2rem;background:var(--ink);color:#fff;padding:12px 22px;border-radius:10px;font-size:0.875rem;font-weight:700;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,0.2);border-left:4px solid var(--blue);animation:fadeUp 0.25s ease;}
.toast.error{border-left-color:#c0392b;}

/* ── Mobile Bottom Nav ── */
.mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--white);border-top:1px solid var(--border);z-index:100;padding:8px 0 max(8px, env(safe-area-inset-bottom));}
.mobile-nav-inner{display:flex;justify-content:space-around;align-items:center;}
.mobile-nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 16px;border:none;background:transparent;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.65rem;font-weight:800;color:var(--muted);transition:all 0.18s;border-radius:8px;}
.mobile-nav-btn.active{color:var(--blue);}
.mobile-nav-btn .mnav-icon{font-size:1.2rem;}
body.dark .mobile-nav{background:#1a2e1f;border-top-color:#2a3d2e;}

/* ── Monthly Summary ── */
.month-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;}
.month-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:1.25rem;box-shadow:0 1px 4px rgba(26,86,219,0.06);}
.month-title{font-family:'Playfair Display',serif;font-weight:700;font-size:0.95rem;margin-bottom:0.75rem;color:var(--blue-dark);}
.month-row{display:flex;justify-content:space-between;font-size:0.82rem;padding:4px 0;border-bottom:1px solid var(--border);}
.month-row:last-child{border-bottom:none;font-weight:800;}

@media(max-width:768px){
  .sidebar{display:none;}
  .mobile-nav{display:block;}
  .main{padding-bottom:70px;}
  .stats-row{grid-template-columns:1fr 1fr;}
  .form-grid{grid-template-columns:1fr;}
  .page{padding:1rem;}
}
`;

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [business, setBusiness] = useState(null);
  const [loans, setLoans] = useState([]);
  const [settled, setSettled] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "ok" });

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "ok" }), 3500); };

  useEffect(() => {
    const saved = localStorage.getItem("eden_dark");
    if (saved === "1") { setDarkMode(true); document.body.classList.add("dark"); }
    loadBusiness();
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark", next);
    localStorage.setItem("eden_dark", next ? "1" : "0");
  };

  const loadBusiness = async () => {
    const { data } = await supabase.from("business").select("*").eq("id", 1).single();
    setBusiness(data || { name:"Sonkhela Soft Loans", tagline:"Eden University Campus", phone:"", email:"", address:"", admin_pin:"1234", logo:null, signature:null });
    setScreen("login");
  };

  const loadLoans = async () => {
    const [loansRes, settledRes] = await Promise.all([
      supabase.from("loans").select("*").order("created_at", { ascending: false }),
      supabase.from("settled_loans").select("*").order("settled_at", { ascending: false }),
    ]);
    if (loansRes.data) setLoans(loansRes.data);
    if (settledRes.data) setSettled(settledRes.data);
  };

  const handlePinKey = (k) => {
    if (k === "del") { setPinInput(p => p.slice(0,-1)); setPinError(""); return; }
    if (pinInput.length >= 6) return;
    const next = pinInput + k;
    setPinInput(next);
    const pin = business?.admin_pin || "1234";
    if (next.length >= pin.length) {
      if (next === pin) { setTimeout(async () => { await loadLoans(); setScreen("app"); setPinInput(""); }, 200); }
      else { setTimeout(() => { setPinError("Wrong PIN. Try again."); setPinInput(""); }, 300); }
    }
  };

  if (screen === "loading") return (<><style>{ADMIN_STYLES}</style><div className="loading-screen"><div className="loading-spinner"/><div className="loading-text">Loading Eden Loans...</div></div></>);

  if (screen === "login") return (
    <><style>{ADMIN_STYLES}</style>
    <div className="login-shell">
      <div className="login-box fade-up">
        <div className="login-logo">{business?.logo ? <img src={business.logo} alt="logo"/> : (business?.name||"S")[0]}</div>
        <div className="login-title">{business?.name}</div>
        <div className="login-sub">Admin Login — Enter your PIN</div>
        <div className="pin-dots">
          {Array.from({length:(business?.admin_pin||"1234").length}).map((_,i) => (
            <div key={i} className={`pin-dot ${i<pinInput.length?"filled":""}`}/>
          ))}
        </div>
        {pinError && <div className="pin-error">{pinError}</div>}
        <div className="pin-grid">
          {["1","2","3","4","5","6","7","8","9","del","0"].map(k => (
            <button key={k} className={`pin-key ${k==="0"?"zero":""} ${k==="del"?"del":""}`} onClick={() => handlePinKey(k)}>
              {k==="del"?"⌫":k}
            </button>
          ))}
        </div>
      </div>
    </div></>
  );

  const NAV = [
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"clients",icon:"👥",label:"Clients"},
    {id:"records",icon:"📁",label:"Records"},
    {id:"summary",icon:"📈",label:"Summary"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ];

  return (
    <><style>{ADMIN_STYLES}</style>
    {toast.msg && <div className={`toast ${toast.type==="error"?"error":""}`}>{toast.msg}</div>}
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">{business?.logo?<img src={business.logo} alt=""/>:(business?.name||"S")[0]}</div>
          <div className="brand-name">{business?.name}</div>
          <div className="brand-tag">{business?.tagline}</div>
          <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)",marginTop:4}}>👤 {business?.coo_name||"Mr Blessed Mwanza"}</div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button key={item.id} className={`nav-item ${activePage===item.id?"active":""}`} onClick={() => setActivePage(item.id)}>
              <span style={{width:20,textAlign:"center"}}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {setScreen("login");setPinInput("");}}>🔒 Lock / Logout</button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{NAV.find(n=>n.id===activePage)?.label||"Dashboard"}</div>
          <div className="topbar-right">
            <button className="dark-toggle" onClick={toggleDark}>{darkMode?"☀️ Light":"🌙 Dark"}</button>
            <div className="topbar-date">{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
        </div>

        <div className="page fade-up" key={activePage}>
          {activePage==="dashboard" && <Dashboard loans={loans} settled={settled} setActivePage={setActivePage} showToast={showToast}/>}
          {activePage==="clients" && <ClientsPage loans={loans} setLoans={setLoans} settled={settled} setSettled={setSettled} showToast={showToast} business={business}/>}
          {activePage==="records" && <RecordsPage settled={settled} setSettled={setSettled} showToast={showToast}/>}
          {activePage==="summary" && <SummaryPage loans={loans} settled={settled}/>}
          {activePage==="settings" && <SettingsPage business={business} setBusiness={setBusiness} showToast={showToast}/>}
        </div>
      </div>
    </div>

    {/* Mobile Bottom Nav */}
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {NAV.map(item => (
          <button key={item.id} className={`mobile-nav-btn ${activePage===item.id?"active":""}`} onClick={() => setActivePage(item.id)}>
            <span className="mnav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
    </>
  );
}

function CopyLinkBtn({ loanId, showToast }) {
  return (
    <button className="btn btn-link btn-xs" onClick={() => {
      navigator.clipboard.writeText(`${window.location.origin}/agreement/${loanId}`)
        .then(() => showToast("✓ Client link copied!"));
    }}>🔗 Copy</button>
  );
}

function WhatsAppBtn({ loanId, clientName }) {
  const send = () => {
    const url = `${window.location.origin}/agreement/${loanId}`;
    const msg = encodeURIComponent(`Hello ${clientName}, here is your Eden Loans agreement: ${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };
  return <button className="btn btn-wa btn-xs" onClick={send}>💬 WhatsApp</button>;
}

function Notifications({ loans }) {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);
  const dueSoon = loans.filter(l => l.status === "active" && !isOverdue(l) && new Date(l.due_date+"T00:00:00") <= in7);
  const overdue = loans.filter(isOverdue);
  if (dueSoon.length === 0 && overdue.length === 0) return null;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.5rem"}}>
      {overdue.length > 0 && (
        <div className="notif-banner danger">
          <span className="notif-icon">🚨</span>
          <div>
            <div className="notif-title">{overdue.length} Overdue Loan{overdue.length>1?"s":""}</div>
            <div className="notif-items">{overdue.map(l=><span key={l.id}>{l.client_name} — {fmt(l.amount)} (due {fmtDate(l.due_date)})</span>)}</div>
          </div>
        </div>
      )}
      {dueSoon.length > 0 && (
        <div className="notif-banner">
          <span className="notif-icon">⏰</span>
          <div>
            <div className="notif-title">{dueSoon.length} Loan{dueSoon.length>1?"s":""} Due Within 7 Days</div>
            <div className="notif-items">{dueSoon.map(l=><span key={l.id}>{l.client_name} — {fmt(l.amount)} (due {fmtDate(l.due_date)})</span>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ loans, settled, setActivePage, showToast }) {
  const activeLoans = loans.filter(l => l.status !== "settled");
  const totalIssued = activeLoans.reduce((s,l) => s+Number(l.amount),0);
  const totalInterest = activeLoans.reduce((s,l) => s+(Number(l.amount)*Number(l.interest_rate)/100),0);
  const salary = totalInterest*0.30;
  const active = loans.filter(l=>l.status==="active"&&!isOverdue(l)).length;
  const overdue = loans.filter(isOverdue).length;

  return (
    <>
      <div style={{marginBottom:"1.25rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:4}}>Welcome back 👋</h1>
        <p style={{color:"var(--muted)",fontSize:"0.875rem"}}>Here's what's happening with your loan portfolio today.</p>
      </div>
      <Notifications loans={loans}/>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Total Issued</div><div className="stat-value sm">{fmt(totalIssued)}</div><div className="stat-sub">active & overdue only</div></div>
        <div className="stat-card purple"><div className="stat-label">Total Interest Expected</div><div className="stat-value sm">{fmt(totalInterest)}</div><div className="stat-sub">active & overdue only</div></div>
        <div className="stat-card teal"><div className="stat-label">💼 Salary (30%)</div><div className="stat-value sm">{fmt(salary)}</div><div className="stat-sub">your estimated earnings</div></div>
      </div>
      <div className="stats-row" style={{marginBottom:"2rem"}}>
        <div className="stat-card blue"><div className="stat-label">Active Loans</div><div className="stat-value">{active}</div><div className="stat-sub">in good standing</div></div>
        <div className="stat-card amber"><div className="stat-label">Overdue</div><div className="stat-value" style={{color:overdue>0?"#d97706":"inherit"}}>{overdue}</div><div className="stat-sub">need attention</div></div>
        <div className="stat-card gray"><div className="stat-label">Settled</div><div className="stat-value">{settled.length}</div><div className="stat-sub">fully repaid</div></div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Recent Agreements</div><button className="btn btn-outline btn-sm" onClick={() => setActivePage("clients")}>View All →</button></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Loan ID</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Share</th></tr></thead>
            <tbody>
              {loans.length===0 && <tr><td colSpan={6} style={{textAlign:"center",color:"var(--muted)",padding:"2rem"}}>No loans yet.</td></tr>}
              {loans.slice(0,6).map(loan => {
                const over = isOverdue(loan);
                return (
                  <tr key={loan.id}>
                    <td style={{fontWeight:800,fontFamily:"'Playfair Display',serif",fontSize:"0.82rem"}}>{loan.id}</td>
                    <td style={{fontWeight:700}}>{loan.client_name}</td>
                    <td style={{fontWeight:700}}>{fmt(loan.amount)}</td>
                    <td style={{color:over?"var(--red)":"inherit",fontWeight:over?800:400}}>{fmtDate(loan.due_date)}</td>
                    <td><span className={`badge badge-${over?"overdue":loan.status}`}>{over?"overdue":loan.status}</span></td>
                    <td><div style={{display:"flex",gap:4}}><CopyLinkBtn loanId={loan.id} showToast={showToast}/><WhatsAppBtn loanId={loan.id} clientName={loan.client_name}/></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ClientsPage({ loans, setLoans, settled, setSettled, showToast, business }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(null);

  const filtered = loans.filter(l => {
    const s = ((l.client_name||"")+l.id).toLowerCase().includes(search.toLowerCase());
    if (filter==="all") return s;
    if (filter==="overdue") return s&&isOverdue(l);
    return s&&l.status===filter&&!isOverdue(l);
  });

  const deleteLoan = async (id) => {
    if (!confirm("Delete this loan agreement permanently?")) return;
    await supabase.from("loans").delete().eq("id",id);
    setLoans(p=>p.filter(l=>l.id!==id));
    showToast("Agreement deleted.");
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("loans").update({status}).eq("id",id);
    if (error) { showToast("Failed to update.","error"); return; }
    setLoans(p=>p.map(l=>l.id===id?{...l,status}:l));
    if (status==="settled") {
      const loan = loans.find(l=>l.id===id);
      if (loan) {
        const interest = Number(loan.amount)*Number(loan.interest_rate)/100;
        const total = Number(loan.amount)+interest;
        const record = { id:loan.id, client_name:loan.client_name, client_phone:loan.client_phone, client_nrc:loan.client_nrc, client_email:loan.client_email, amount:loan.amount, interest_rate:loan.interest_rate, interest, total, processing_date:loan.processing_date, due_date:loan.due_date, repayment:loan.repayment, collateral:loan.collateral, collateral_value:loan.collateral_value, terms:loan.terms };
        const { error:sErr } = await supabase.from("settled_loans").insert(record);
        if (!sErr) { setSettled(p=>[{...record,settled_at:new Date().toISOString()},...p]); showToast("✓ Loan settled & saved to Records!"); }
        else showToast("Settled but record failed.","error");
      }
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    if (editTarget) {
      const { error } = await supabase.from("loans").update(data).eq("id",editTarget.id);
      if (error) { showToast("Failed.","error"); setSaving(false); return; }
      setLoans(p=>p.map(l=>l.id===editTarget.id?{...l,...data}:l));
      showToast("Updated! ✓");
    } else {
      const newLoan = {...data, id:genId()};
      const { error } = await supabase.from("loans").insert(newLoan);
      if (error) { showToast("Failed.","error"); setSaving(false); return; }
      setLoans(p=>[newLoan,...p]);
      showToast("Agreement created! ✓");
    }
    setSaving(false); setShowModal(false);
  };

  const sendReminder = async (loan) => {
    if (!loan.client_email) { showToast("No email address.","error"); return; }
    setSendingEmail(loan.id);
    try {
      const res = await fetch("/api/send-reminder",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({loanId:loan.id})});
      const d = await res.json();
      if (d.success) showToast(`✉️ Reminder sent to ${loan.client_email}`);
      else showToast(d.error||"Email failed.","error");
    } catch { showToast("Email unavailable.","error"); }
    setSendingEmail(null);
  };

  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"1.75rem",flexWrap:"wrap",gap:"1rem"}}>
        <div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:4}}>Clients</h1><p style={{color:"var(--muted)",fontSize:"0.875rem"}}>{loans.length} agreement{loans.length!==1?"s":""} on record</p></div>
        <button className="btn btn-green" onClick={() => {setEditTarget(null);setShowModal(true);}}>+ New Agreement</button>
      </div>
      <div style={{display:"flex",gap:"0.75rem",marginBottom:"1rem",flexWrap:"wrap"}}>
        <input style={{flex:1,minWidth:200}} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{minWidth:150}}>
          <option value="all">All Statuses</option><option value="active">Active</option><option value="overdue">Overdue</option><option value="settled">Settled</option>
        </select>
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Loan ID</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Collateral</th><th>Status</th><th>Share</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"var(--muted)",padding:"2.5rem"}}>No agreements found.</td></tr>}
              {filtered.map(loan=>{
                const over=isOverdue(loan);
                const dueSoon=!over&&loan.status==="active"&&new Date(loan.due_date+"T00:00:00")<=new Date(Date.now()+3*86400000);
                return (
                  <tr key={loan.id}>
                    <td style={{fontWeight:800,fontFamily:"'Playfair Display',serif",fontSize:"0.82rem"}}>{loan.id}</td>
                    <td>
                      <div style={{fontWeight:700}}>{loan.client_name}</div>
                      {loan.client_phone&&<div style={{fontSize:"0.72rem",color:"var(--muted)"}}>{loan.client_phone}</div>}
                      {loan.client_email&&<div style={{fontSize:"0.7rem",color:"#2563eb"}}>✉️ {loan.client_email}</div>}
                    </td>
                    <td style={{fontWeight:700}}>{fmt(loan.amount)}</td>
                    <td>
                      <div style={{color:over?"var(--red)":"inherit",fontWeight:over?800:400}}>{fmtDate(loan.due_date)}</div>
                      {dueSoon&&<div style={{fontSize:"0.68rem",color:"#d97706",fontWeight:800}}>⚠️ Due soon</div>}
                    </td>
                    <td>
                      <div style={{fontSize:"0.78rem",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loan.collateral}</div>
                      {loan.collateral_photo&&<img src={loan.collateral_photo} style={{width:36,height:36,objectFit:"cover",borderRadius:4,marginTop:3,border:"1px solid var(--border)"}} alt="collateral"/>}
                    </td>
                    <td>
                      <select value={over?"overdue":loan.status} onChange={e=>updateStatus(loan.id,e.target.value)} style={{padding:"5px 8px",fontSize:"0.78rem",minWidth:100}}>
                        <option value="active">Active</option><option value="settled">Settled</option><option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:4,flexDirection:"column"}}>
                        <CopyLinkBtn loanId={loan.id} showToast={showToast}/>
                        <WhatsAppBtn loanId={loan.id} clientName={loan.client_name}/>
                      </div>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        <button className="btn btn-ghost btn-xs" onClick={()=>{setEditTarget(loan);setShowModal(true);}}>Edit</button>
                        {loan.client_email&&<button className="btn btn-blue btn-xs" disabled={sendingEmail===loan.id} onClick={()=>sendReminder(loan)}>{sendingEmail===loan.id?"...":"📧"}</button>}
                        <button className="btn btn-red btn-xs" onClick={()=>deleteLoan(loan.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal&&<LoanModal loan={editTarget} saving={saving} onClose={()=>setShowModal(false)} onSave={handleSave}/>}
    </>
  );
}

function LoanModal({ loan, onClose, onSave, saving }) {
  const blank = {
    client_name:"",client_phone:"",client_nrc:"",client_email:"",
    amount:"",interest_rate:"",
    processing_date:new Date().toISOString().slice(0,10),
    due_date:"",repayment:"monthly",collateral:"",collateral_value:"",collateral_photo:"",
    status:"active",
    terms:"Collateral Ownership: If the borrower fails to pay any installment on the due date an extra two days shall be given to the borrower to clear up the balance. Failure to that, the borrower loses ownership of the collateral unless they renew the contract",
  };
  const [f,setF]=useState(loan||blank);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));

  const uploadCollateralPhoto=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader(); r.onload=ev=>set("collateral_photo",ev.target.result); r.readAsDataURL(file);
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal fade-up">
        <div className="modal-head"><div className="modal-title">{loan?"Edit Agreement":"New Loan Agreement"}</div><button className="close-btn" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <p className="section-sub">👤 Client Info</p>
          <div className="form-grid" style={{marginBottom:"1.25rem"}}>
            <div className="form-group"><label>Full Name *</label><input value={f.client_name} onChange={e=>set("client_name",e.target.value)} placeholder="e.g. Chanda Mutale"/></div>
            <div className="form-group"><label>Phone Number</label><input value={f.client_phone} onChange={e=>set("client_phone",e.target.value)} placeholder="+260 97..."/></div>
            <div className="form-group"><label>NRC / National ID</label><input value={f.client_nrc} onChange={e=>set("client_nrc",e.target.value)} placeholder="234567/10/1"/></div>
            <div className="form-group"><label>Email <span style={{fontWeight:400,textTransform:"none",fontSize:"0.68rem"}}>(optional)</span></label><input type="email" value={f.client_email||""} onChange={e=>set("client_email",e.target.value)} placeholder="client@example.com"/></div>
          </div>
          <p className="section-sub">💰 Loan Details</p>
          <div className="form-grid" style={{marginBottom:"1.25rem"}}>
            <div className="form-group"><label>Loan Amount (K) *</label><input type="number" value={f.amount} onChange={e=>set("amount",e.target.value)}/></div>
            <div className="form-group"><label>Interest Rate (%)</label><input type="number" value={f.interest_rate} onChange={e=>set("interest_rate",e.target.value)}/></div>
            <div className="form-group"><label>Processing Date</label><input type="date" value={f.processing_date} onChange={e=>set("processing_date",e.target.value)}/></div>
            <div className="form-group"><label>Due Date *</label><input type="date" value={f.due_date} onChange={e=>set("due_date",e.target.value)}/></div>
            <div className="form-group full"><label>Repayment Schedule</label>
              <select value={f.repayment} onChange={e=>set("repayment",e.target.value)}>
                <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="lump-sum">Lump Sum</option>
              </select>
            </div>
          </div>
          <p className="section-sub">🔒 Collateral</p>
          <div className="form-grid" style={{marginBottom:"1.25rem"}}>
            <div className="form-group full"><label>Item / Description *</label><input value={f.collateral} onChange={e=>set("collateral",e.target.value)} placeholder="e.g. Samsung TV – Serial No. XYZ123"/></div>
            <div className="form-group"><label>Collateral Value (K)</label><input type="number" value={f.collateral_value} onChange={e=>set("collateral_value",e.target.value)}/></div>
            <div className="form-group full">
              <label>Collateral Photo <span style={{fontWeight:400,textTransform:"none",fontSize:"0.68rem"}}>(optional)</span></label>
              <div className="upload-area" onClick={()=>document.getElementById("collateralPhoto").click()}>
                {f.collateral_photo
                  ?<img className="collateral-photo-preview" src={f.collateral_photo} alt="collateral"/>
                  :<div style={{fontSize:"1.5rem",marginBottom:4}}>📷</div>}
                <div style={{fontSize:"0.78rem",color:"var(--muted)",fontWeight:700}}>{f.collateral_photo?"Click to change photo":"Click to upload collateral photo"}</div>
              </div>
              <input id="collateralPhoto" type="file" accept="image/*" style={{display:"none"}} onChange={uploadCollateralPhoto}/>
              {f.collateral_photo&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.5rem"}} onClick={()=>set("collateral_photo","")}>Remove Photo</button>}
            </div>
          </div>
          <p className="section-sub">📋 Terms & Conditions</p>
          <div className="form-group"><textarea value={f.terms} onChange={e=>set("terms",e.target.value)} rows={4}/></div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-green" disabled={saving} onClick={()=>{
            if(!f.client_name||!f.amount||!f.due_date){alert("Fill in: Name, Amount, Due Date");return;}
            onSave(f);
          }}>{saving?"Saving...":loan?"Save Changes":"✓ Create Agreement"}</button>
        </div>
      </div>
    </div>
  );
}

function RecordsPage({ settled, setSettled, showToast }) {
  const [search,setSearch]=useState("");
  const filtered=settled.filter(l=>((l.client_name||"")+l.id).toLowerCase().includes(search.toLowerCase()));
  const totalInterest=settled.reduce((s,l)=>s+Number(l.interest||0),0);
  const totalRepaid=settled.reduce((s,l)=>s+Number(l.total||0),0);

  const exportCSV=()=>{
    const headers=["Loan ID","Client Name","Phone","Amount","Interest Rate %","Interest","Total Repaid","Processing Date","Due Date","Repayment","Collateral","Settled Date"];
    const rows=filtered.map(l=>[l.id,l.client_name,l.client_phone||"",l.amount,l.interest_rate,l.interest,l.total,l.processing_date,l.due_date,l.repayment,l.collateral,l.settled_at?new Date(l.settled_at).toLocaleDateString("en-GB"):""]);
    const csv=[headers,...rows].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="Eden_Settled_Records.csv";a.click();
    showToast("✓ CSV downloaded!");
  };

  return (
    <>
      <div style={{marginBottom:"1.75rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:4}}>📁 Settled Records</h1>
        <p style={{color:"var(--muted)",fontSize:"0.875rem"}}>All fully repaid loan agreements — saved permanently.</p>
      </div>
      <div className="stats-row" style={{marginBottom:"2rem"}}>
        <div className="stat-card gray"><div className="stat-label">Total Settled</div><div className="stat-value">{settled.length}</div><div className="stat-sub">agreements</div></div>
        <div className="stat-card"><div className="stat-label">Total Interest Collected</div><div className="stat-value sm">{fmt(totalInterest)}</div><div className="stat-sub">from settled loans</div></div>
        <div className="stat-card teal"><div className="stat-label">Total Amount Recovered</div><div className="stat-value sm">{fmt(totalRepaid)}</div><div className="stat-sub">principal + interest</div></div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Settled Loan History</div><button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇️ Export CSV</button></div>
        <div style={{padding:"1rem 1.5rem",borderBottom:"1px solid var(--border)"}}>
          <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",maxWidth:400}}/>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Loan ID</th><th>Client</th><th>Principal</th><th>Interest</th><th>Total Repaid</th><th>Collateral</th><th>Settled Date</th><th>Agreement</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",color:"var(--muted)",padding:"2.5rem"}}>No settled loans yet.</td></tr>}
              {filtered.map(loan=>(
                <tr key={loan.id}>
                  <td style={{fontWeight:800,fontFamily:"'Playfair Display',serif",fontSize:"0.82rem"}}>{loan.id}</td>
                  <td><div style={{fontWeight:700}}>{loan.client_name}</div><div style={{fontSize:"0.72rem",color:"var(--muted)"}}>{loan.client_phone}</div></td>
                  <td style={{fontWeight:700}}>{fmt(loan.amount)}</td>
                  <td style={{color:"#0891b2",fontWeight:700}}>{fmt(loan.interest)}</td>
                  <td style={{fontWeight:800,color:"var(--blue)"}}>{fmt(loan.total)}</td>
                  <td style={{fontSize:"0.78rem",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loan.collateral}</td>
                  <td style={{fontSize:"0.78rem",color:"var(--muted)"}}>{loan.settled_at?new Date(loan.settled_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                  <td>
                    <div style={{display:"flex",gap:4,flexDirection:"column"}}>
                      <button className="btn btn-link btn-xs" onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/agreement/${loan.id}`);showToast("✓ Link copied!");}}>🔗 Copy</button>
                      <WhatsAppBtn loanId={loan.id} clientName={loan.client_name}/>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-red btn-xs" onClick={async()=>{
                      if(!confirm("Delete this record permanently?"))return;
                      const{error}=await supabase.from("settled_loans").delete().eq("id",loan.id);
                      if(error){showToast("Failed to delete.","error");return;}
                      setSettled(p=>p.filter(r=>r.id!==loan.id));
                      showToast("Record deleted.");
                    }}>✕ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SummaryPage({ loans, settled }) {
  const allLoans = [...loans, ...settled];
  const months = {};
  allLoans.forEach(l => {
    const date = new Date((l.settled_at || l.processing_date || l.created_at || "")+"T00:00:00");
    if (isNaN(date)) return;
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
    const label = date.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
    if (!months[key]) months[key] = { label, issued:0, interest:0, salary:0, count:0, settledCount:0, settledTotal:0 };
    const isSettled = !!l.settled_at;
    const interest = Number(l.amount)*Number(l.interest_rate||0)/100;
    if (!isSettled) {
      months[key].issued += Number(l.amount||0);
      months[key].interest += interest;
      months[key].salary += interest*0.30;
      months[key].count++;
    } else {
      months[key].settledCount++;
      months[key].settledTotal += Number(l.total||0);
    }
  });
  const sorted = Object.entries(months).sort((a,b)=>b[0].localeCompare(a[0]));

  return (
    <>
      <div style={{marginBottom:"1.75rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:4}}>📈 Monthly Summary</h1>
        <p style={{color:"var(--muted)",fontSize:"0.875rem"}}>A breakdown of your loan business month by month.</p>
      </div>
      {sorted.length===0&&<div className="card"><div className="card-body" style={{textAlign:"center",color:"var(--muted)"}}>No data yet.</div></div>}
      <div className="month-grid">
        {sorted.map(([key,m])=>(
          <div key={key} className="month-card">
            <div className="month-title">{m.label}</div>
            <div className="month-row"><span>Loans Issued</span><span style={{fontWeight:700}}>{m.count}</span></div>
            <div className="month-row"><span>Amount Issued</span><span style={{fontWeight:700}}>{fmt(m.issued)}</span></div>
            <div className="month-row"><span>Interest Expected</span><span style={{fontWeight:700,color:"#7c3aed"}}>{fmt(m.interest)}</span></div>
            <div className="month-row"><span>Loans Settled</span><span style={{fontWeight:700}}>{m.settledCount}</span></div>
            <div className="month-row"><span>Amount Collected</span><span style={{fontWeight:700,color:"#0891b2"}}>{fmt(m.settledTotal)}</span></div>
            <div className="month-row"><span>💼 Salary (30%)</span><span style={{fontWeight:800,color:"var(--blue)"}}>{fmt(m.salary)}</span></div>
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsPage({ business, setBusiness, showToast }) {
  const [f,setF]=useState({...business});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));

  const uploadImage=(key,e)=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader(); r.onload=ev=>set(key,ev.target.result); r.readAsDataURL(file);
  };

  const handleSave=async()=>{
    setSaving(true);
    const{error}=await supabase.from("business").update({
      name:f.name,tagline:f.tagline,phone:f.phone,email:f.email,
      address:f.address,admin_pin:f.admin_pin,logo:f.logo,signature:f.signature,
    }).eq("id",1);
    setSaving(false);
    if(error){showToast("Failed to save.","error");return;}
    setBusiness(f);showToast("Settings saved! ✓");
  };

  return (
    <>
      <div style={{marginBottom:"1.75rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:4}}>Settings</h1>
        <p style={{color:"var(--muted)",fontSize:"0.875rem"}}>Manage your profile, signature and security</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
        <div className="card">
          <div className="card-head"><div className="card-title">🏢 Business Profile</div></div>
          <div className="card-body" style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
            <div className="form-group">
              <label>Business Logo</label>
              <div className="upload-area" onClick={()=>document.getElementById("logoUpload").click()}>
                {f.logo?<img className="upload-preview-round" src={f.logo} alt="logo"/>:<div style={{fontSize:"2rem",marginBottom:6}}>🏢</div>}
                <div style={{fontSize:"0.78rem",color:"var(--muted)",fontWeight:700}}>Click to upload logo</div>
              </div>
              <input id="logoUpload" type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadImage("logo",e)}/>
            </div>
            <div className="form-group"><label>Business Name</label><input value={f.name||""} onChange={e=>set("name",e.target.value)}/></div>
            <div className="form-group"><label>Tagline</label><input value={f.tagline||""} onChange={e=>set("tagline",e.target.value)}/></div>
            <div className="form-group"><label>Phone</label><input value={f.phone||""} onChange={e=>set("phone",e.target.value)}/></div>
            <div className="form-group"><label>Email</label><input value={f.email||""} onChange={e=>set("email",e.target.value)}/></div>
            <div className="form-group"><label>Address</label><input value={f.address||""} onChange={e=>set("address",e.target.value)}/></div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
          <div className="card">
            <div className="card-head"><div className="card-title">✍️ Your Signature</div></div>
            <div className="card-body">
              <div className="upload-area" onClick={()=>document.getElementById("sigUpload").click()}>
                {f.signature?<img className="upload-preview" src={f.signature} alt="sig"/>:<div style={{fontSize:"2rem",marginBottom:6}}>✍️</div>}
                <div style={{fontSize:"0.78rem",color:"var(--muted)",fontWeight:700}}>{f.signature?"Click to change":"Click to upload signature"}</div>
              </div>
              <input id="sigUpload" type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadImage("signature",e)}/>
              {f.signature&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.75rem",width:"100%"}} onClick={()=>set("signature",null)}>Remove Signature</button>}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">🔐 Security</div></div>
            <div className="card-body">
              <div className="form-group">
                <label>Admin PIN</label>
                <input type="password" maxLength={6} value={f.admin_pin||""} onChange={e=>set("admin_pin",e.target.value)} placeholder="4–6 digits"/>
              </div>
            </div>
          </div>
          <button className="btn btn-green" style={{width:"100%",padding:"14px"}} onClick={handleSave} disabled={saving}>
            {saving?"Saving...":"💾 Save All Settings"}
          </button>
        </div>
      </div>
    </>
  );
}
