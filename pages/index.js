import { useState, useEffect } from "react";
import { supabase, fmt, fmtDate, isOverdue, genId, AGR_STYLES } from "./shared";

const ADMIN_STYLES = `
${AGR_STYLES}
body{background:var(--bg);transition:background 0.3s,color 0.3s;}
body.dark{--bg:#0d1520;--white:#1a2535;--border:#2a3a50;--muted:#7a90a8;--ink:#e0eaf5;--accent:#1a2535;--blue-light:#1a2535;}
.shell{display:flex;min-height:100vh;}
.sidebar{width:250px;flex-shrink:0;background:var(--blue-dark);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;z-index:100;}
.sidebar-brand{padding:24px 20px 16px;border-bottom:1px solid rgba(255,255,255,0.08);}
.brand-logo{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;overflow:hidden;border:2px solid rgba(255,255,255,0.2);}
.brand-logo img{width:100%;height:100%;object-fit:cover;}
.brand-name{font-family:'Playfair Display',serif;color:#fff;font-size:0.95rem;font-weight:700;line-height:1.3;}
.brand-tag{font-size:0.7rem;color:rgba(255,255,255,0.45);margin-top:2px;}
.coo-badge{display:inline-flex;align-items:center;gap:5px;margin-top:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:3px 10px;font-size:0.68rem;font-weight:700;color:rgba(255,255,255,0.7);}
.sidebar-nav{flex:1;padding:12px;display:flex;flex-direction:column;gap:3px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.875rem;font-weight:700;color:rgba(255,255,255,0.55);background:transparent;transition:all 0.18s;text-align:left;width:100%;}
.nav-item:hover{color:#fff;background:rgba(255,255,255,0.08);}
.nav-item.active{color:var(--blue-dark);background:#fff;}
.sidebar-footer{padding:12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;gap:6px;}
.logout-btn{width:100%;padding:9px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);font-family:'Inter',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:8px;}
.logout-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}
.dark-toggle{width:100%;padding:9px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);font-family:'Inter',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:8px;}
.dark-toggle:hover{background:rgba(255,255,255,0.08);color:#fff;}
.mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--blue-dark);z-index:200;padding:8px 4px 12px;border-top:1px solid rgba(255,255,255,0.1);}
.mobile-nav-items{display:flex;justify-content:space-around;align-items:center;}
.mobile-nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 10px;border:none;background:transparent;cursor:pointer;color:rgba(255,255,255,0.55);font-family:'Inter',sans-serif;font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;border-radius:8px;transition:all 0.18s;}
.mobile-nav-item.active{color:#fff;background:rgba(255,255,255,0.15);}
.mobile-nav-item .icon{font-size:1.2rem;}
.main{flex:1;overflow-y:auto;min-width:0;}
.topbar{background:var(--white);border-bottom:1px solid var(--border);padding:0 1.5rem;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.topbar-title{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;}
.topbar-right{display:flex;align-items:center;gap:1rem;}
.topbar-date{font-size:0.78rem;color:var(--muted);}
.topbar-coo{font-size:0.75rem;font-weight:700;color:var(--blue);background:var(--blue-light);padding:4px 10px;border-radius:20px;}
.page{padding:1.5rem;max-width:1100px;padding-bottom:90px;}
.notif-banner{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:1rem;color:#fff;}
.notif-icon{font-size:1.5rem;flex-shrink:0;}
.notif-text{flex:1;}
.notif-title{font-weight:800;font-size:0.9rem;margin-bottom:2px;}
.notif-items{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;}
.notif-chip{background:rgba(255,255,255,0.2);border-radius:20px;padding:3px 10px;font-size:0.72rem;font-weight:700;}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1rem;}
.stat-card{background:var(--white);border-radius:12px;border:1px solid var(--border);padding:1.1rem 1.25rem;border-top:3px solid var(--blue);transition:transform 0.2s;box-shadow:0 1px 4px rgba(26,86,219,0.06);}
.stat-card:hover{transform:translateY(-2px);}
.stat-card.amber{border-top-color:#d97706;}
.stat-card.gray{border-top-color:#6b7280;}
.stat-card.teal{border-top-color:#0d9488;}
.stat-card.purple{border-top-color:#7c3aed;}
.stat-card.green{border-top-color:#059669;}
.stat-label{font-size:0.68rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
.stat-value{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;line-height:1;}
.stat-value.sm{font-size:1.1rem;}
.stat-sub{font-size:0.7rem;color:var(--muted);margin-top:4px;}
.card{background:var(--white);border-radius:12px;border:1px solid var(--border);margin-bottom:1.5rem;box-shadow:0 1px 6px rgba(26,86,219,0.07);}
.card-head{padding:1rem 1.25rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.card-title{font-family:'Playfair Display',serif;font-size:0.95rem;font-weight:700;}
.card-body{padding:1.25rem;}
.tbl-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:0.85rem;}
th{padding:9px 12px;text-align:left;background:var(--gray-light);color:var(--muted);font-size:0.66rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid var(--border);}
td{padding:11px 12px;border-bottom:1px solid var(--border);vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tr:hover td{background:var(--gray-light);}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.66rem;font-weight:800;text-transform:uppercase;}
.badge-active{background:#d1fae5;color:#065f46;}
.badge-overdue{background:#fee2e2;color:#991b1b;}
.badge-settled{background:#e5e7eb;color:#374151;}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:9px;border:none;font-family:'Inter',sans-serif;font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.18s;}
.btn:disabled{opacity:0.55;cursor:not-allowed;transform:none!important;}
.btn-blue{background:var(--blue);color:#fff;}
.btn-blue:hover{background:#1e40af;transform:translateY(-1px);}
.btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue);}
.btn-outline:hover{background:var(--blue-light);}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border);}
.btn-ghost:hover{background:var(--gray-light);color:var(--ink);}
.btn-red{background:var(--red);color:#fff;}
.btn-red:hover{background:#b91c1c;}
.btn-copy{background:#eff6ff;color:var(--blue);border:1px solid #bfdbfe;}
.btn-copy:hover{background:#dbeafe;}
.btn-email{background:#ede9fe;color:#5b21b6;border:1px solid #ddd6fe;}
.btn-email:hover{background:#ddd6fe;}
.btn-sm{padding:6px 12px;font-size:0.76rem;}
.btn-xs{padding:4px 9px;font-size:0.7rem;}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.form-group{display:flex;flex-direction:column;gap:5px;}
.form-group.full{grid-column:1/-1;}
label{font-size:0.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;}
input,select,textarea{padding:9px 13px;border:1.5px solid var(--border);border-radius:9px;font-family:'Inter',sans-serif;font-size:0.9rem;color:var(--ink);background:var(--white);outline:none;transition:border-color 0.18s;width:100%;}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,86,219,0.1);}
textarea{resize:vertical;min-height:80px;}
.modal-backdrop{position:fixed;inset:0;z-index:200;background:rgba(17,24,39,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;}
.modal{background:var(--white);border-radius:16px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;box-shadow:0 12px 48px rgba(26,86,219,0.18);}
.modal-head{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--white);z-index:1;}
.modal-title{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;}
.modal-body{padding:1.5rem;}
.modal-foot{padding:1rem 1.5rem;border-top:1px solid var(--border);display:flex;gap:0.75rem;justify-content:flex-end;position:sticky;bottom:0;background:var(--white);}
.close-btn{width:30px;height:30px;border-radius:50%;border:none;background:var(--gray-light);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;color:var(--muted);}
.login-shell{min-height:100vh;background:linear-gradient(135deg,var(--blue-dark) 0%,#1a56db 100%);display:flex;align-items:center;justify-content:center;padding:1rem;}
.login-box{background:var(--white);border-radius:20px;padding:2.5rem;width:100%;max-width:420px;text-align:center;box-shadow:0 12px 48px rgba(0,0,0,0.2);}
.login-logo{width:80px;height:80px;border-radius:16px;background:var(--blue);margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#fff;overflow:hidden;}
.login-logo img{width:100%;height:100%;object-fit:cover;}
.login-title{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;margin-bottom:2px;}
.login-sub{color:var(--muted);font-size:0.82rem;margin-bottom:4px;}
.login-coo{font-size:0.78rem;font-weight:700;color:var(--blue);margin-bottom:1.75rem;}
.pin-dots{display:flex;gap:12px;justify-content:center;margin-bottom:1.5rem;}
.pin-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--border);transition:all 0.18s;}
.pin-dot.filled{background:var(--blue);border-color:var(--blue);}
.pin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:1rem;}
.pin-key{padding:14px;border-radius:10px;border:1.5px solid var(--border);background:var(--gray-light);font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:800;color:var(--ink);cursor:pointer;transition:all 0.15s;}
.pin-key:hover{background:var(--blue-light);border-color:var(--blue);color:var(--blue);}
.pin-key:active{transform:scale(0.95);}
.pin-key.zero{grid-column:2;}
.pin-key.del{background:var(--red-light);border-color:#fecaca;color:var(--red);}
.pin-error{color:var(--red);font-size:0.85rem;font-weight:700;margin-bottom:0.75rem;}
.upload-area{border:2px dashed var(--border);border-radius:10px;padding:1.25rem;text-align:center;cursor:pointer;transition:all 0.2s;}
.upload-area:hover{border-color:var(--blue);background:var(--blue-light);}
.upload-preview{max-width:220px;max-height:90px;object-fit:contain;margin:0 auto 0.5rem;display:block;}
.upload-preview-round{width:72px;height:72px;border-radius:12px;object-fit:cover;margin:0 auto 0.5rem;display:block;}
.section-sub{font-size:0.75rem;font-weight:800;color:var(--blue);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px solid var(--blue-light);}
.toast{position:fixed;bottom:5rem;right:1rem;background:var(--ink);color:#fff;padding:11px 18px;border-radius:10px;font-size:0.85rem;font-weight:700;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,0.2);border-left:4px solid var(--blue);animation:fadeUp 0.25s ease;max-width:320px;}
.toast.error{border-left-color:var(--red);}
.month-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;}
.month-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:1.25rem;border-left:4px solid var(--blue);}
.month-name{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--ink);}
.month-row{display:flex;justify-content:space-between;font-size:0.82rem;padding:4px 0;border-bottom:1px solid var(--border);}
.month-row:last-child{border-bottom:none;font-weight:800;color:var(--blue);}
@media(max-width:768px){
  .sidebar{display:none;}
  .mobile-nav{display:block;}
  .stats-row{grid-template-columns:1fr 1fr;}
  .form-grid{grid-template-columns:1fr;}
  .page{padding:1rem;padding-bottom:90px;}
  .topbar{padding:0 1rem;}
}
@media(max-width:480px){.stats-row{grid-template-columns:1fr;}}
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

  useEffect(() => { loadBusiness(); }, []);
  useEffect(() => { if (darkMode) document.body.classList.add("dark"); else document.body.classList.remove("dark"); }, [darkMode]);

  const loadBusiness = async () => {
    const { data } = await supabase.from("business").select("*").eq("id", 1).single();
    setBusiness(data || { name:"Sonkhela Soft Loans", tagline:"Eden University Campus", phone:"", email:"", address:"Eden University, Lusaka, Zambia", admin_pin:"1234", logo:null, signature:null, coo_name:"Mr Blessed Mwanza" });
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

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"clients", icon:"👥", label:"Clients" },
    { id:"records", icon:"📁", label:"Records" },
    { id:"notifications", icon:"🔔", label:"Alerts" },
    { id:"summary", icon:"📈", label:"Summary" },
    { id:"settings", icon:"⚙️", label:"Settings" },
  ];

  if (screen === "loading") return (<><style>{ADMIN_STYLES}</style><div className="loading-screen"><div className="loading-spinner"/><div className="loading-text">Loading Eden Loans...</div></div></>);

  if (screen === "login") return (
    <><style>{ADMIN_STYLES}</style>
    <div className="login-shell">
      <div className="login-box fade-up">
        <div className="login-logo">{business?.logo ? <img src={business.logo} alt="logo"/> : "E"}</div>
        <div className="login-title">{business?.name}</div>
        <div className="login-sub">{business?.tagline}</div>
        <div className="login-coo">👤 COO Portal — {business?.coo_name || "Mr Blessed Mwanza"}</div>
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

  return (
    <><style>{ADMIN_STYLES}</style>
    {toast.msg && <div className={`toast ${toast.type==="error"?"error":""}`}>{toast.msg}</div>}
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">{business?.logo?<img src={business.logo} alt=""/>:"E"}</div>
          <div className="brand-name">{business?.name}</div>
          <div className="brand-tag">{business?.tagline}</div>
          <div className="coo-badge">👤 {business?.coo_name||"Mr Blessed Mwanza"}</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${activePage===item.id?"active":""}`} onClick={() => setActivePage(item.id)}>
              <span style={{width:20,textAlign:"center"}}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="dark-toggle" onClick={() => setDarkMode(d=>!d)}>{darkMode?"☀️ Light Mode":"🌙 Dark Mode"}</button>
          <button className="logout-btn" onClick={() => {setScreen("login");setPinInput("");}}>🔒 Lock / Logout</button>
        </div>
      </aside>

      <nav className="mobile-nav">
        <div className="mobile-nav-items">
          {navItems.map(item => (
            <button key={item.id} className={`mobile-nav-item ${activePage===item.id?"active":""}`} onClick={() => setActivePage(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{navItems.find(n=>n.id===activePage)?.label}</div>
          <div className="topbar-right">
            <div className="topbar-coo">COO: {business?.coo_name||"Mr Blessed Mwanza"}</div>
            <div className="topbar-date">{new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</div>
          </div>
        </div>
        <div className="page fade-up" key={activePage}>
          {activePage==="dashboard" && <Dashboard loans={loans} settled={settled} setActivePage={setActivePage} showToast={showToast}/>}
          {activePage==="clients" && <ClientsPage loans={loans} setLoans={setLoans} settled={settled} setSettled={setSettled} showToast={showToast}/>}
          {activePage==="records" && <RecordsPage settled={settled} setSettled={setSettled} showToast={showToast}/>}
          {activePage==="notifications" && <NotificationsPage loans={loans} showToast={showToast}/>}
          {activePage==="summary" && <SummaryPage loans={loans} settled={settled}/>}
          {activePage==="settings" && <SettingsPage business={business} setBusiness={setBusiness} showToast={showToast}/>}
        </div>
      </div>
    </div></>
  );
}

function CopyLinkBtn({ loanId, showToast }) {
  return <button className="btn btn-copy btn-xs" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/agreement/${loanId}`).then(() => showToast("✓ Link copied!")); }}>🔗 Copy Link</button>;
}

function Dashboard({ loans, settled, setActivePage, showToast }) {
  const activeLoans = loans.filter(l => l.status !== "settled");
  const totalIssued = activeLoans.reduce((s,l) => s+Number(l.amount),0);
  const totalInterest = activeLoans.reduce((s,l) => s+(Number(l.amount)*Number(l.interest_rate)/100),0);
  const salary = totalInterest * 0.30;
  const active = loans.filter(l => l.status==="active" && !isOverdue(l)).length;
  const overdue = loans.filter(isOverdue).length;
  const settledCount = settled.length;
  const in7 = new Date(Date.now()+7*86400000);
  const dueSoon = loans.filter(l => l.status==="active" && !isOverdue(l) && new Date(l.due_date+"T00:00:00") <= in7);
  const overdueList = loans.filter(isOverdue);

  return (
    <>
      <div style={{marginBottom:"1.25rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:700,marginBottom:4}}>Welcome, Mr Blessed Mwanza 👋</h1>
        <p style={{color:"var(--muted)",fontSize:"0.85rem"}}>Here's what's happening with your loan portfolio today.</p>
      </div>

      {(dueSoon.length > 0 || overdueList.length > 0) && (
        <div className="notif-banner">
          <div className="notif-icon">🔔</div>
          <div className="notif-text">
            <div className="notif-title">
              {overdueList.length > 0 ? `${overdueList.length} overdue loan${overdueList.length>1?"s":""}` : ""}
              {overdueList.length > 0 && dueSoon.length > 0 ? " · " : ""}
              {dueSoon.length > 0 ? `${dueSoon.length} due within 7 days` : ""}
            </div>
            <div className="notif-items">
              {[...overdueList,...dueSoon].slice(0,5).map(l => (
                <span key={l.id} className="notif-chip">{l.client_name} — {fmtDate(l.due_date)}</span>
              ))}
              {[...overdueList,...dueSoon].length > 5 && <span className="notif-chip">+{[...overdueList,...dueSoon].length-5} more</span>}
            </div>
          </div>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Total Issued</div><div className="stat-value sm">{fmt(totalIssued)}</div><div className="stat-sub">active & overdue</div></div>
        <div className="stat-card teal"><div className="stat-label">Total Interest Expected</div><div className="stat-value sm" style={{color:"#0d9488"}}>{fmt(totalInterest)}</div><div className="stat-sub">active & overdue</div></div>
        <div className="stat-card purple"><div className="stat-label">💼 COO Salary (30%)</div><div className="stat-value sm" style={{color:"#7c3aed"}}>{fmt(salary)}</div><div className="stat-sub">projected earnings</div></div>
      </div>
      <div className="stats-row" style={{marginBottom:"1.5rem"}}>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value">{active}</div><div className="stat-sub">in good standing</div></div>
        <div className="stat-card amber"><div className="stat-label">Overdue</div><div className="stat-value" style={{color:overdue>0?"#d97706":"inherit"}}>{overdue}</div><div className="stat-sub">need attention</div></div>
        <div className="stat-card gray"><div className="stat-label">Settled</div><div className="stat-value">{settledCount}</div><div className="stat-sub">fully repaid</div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Recent Agreements</div>
          <button className="btn btn-outline btn-sm" onClick={() => setActivePage("clients")}>View All →</button>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Loan ID</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Link</th></tr></thead>
            <tbody>
              {loans.length===0 && <tr><td colSpan={6} style={{textAlign:"center",color:"var(--muted)",padding:"2rem"}}>No loans yet.</td></tr>}
              {loans.slice(0,6).map(loan => {
                const over = isOverdue(loan);
                return (
                  <tr key={loan.id}>
                    <td style={{fontWeight:800,fontFamily:"'Playfair Display',serif",fontSize:"0.8rem"}}>{loan.id}</td>
                    <td style={{fontWeight:700}}>{loan.client_name}</td>
                    <td style={{fontWeight:700}}>{fmt(loan.amount)}</td>
                    <td style={{color:over?"var(--red)":"inherit",fontWeight:over?800:400}}>{fmtDate(loan.due_date)}</td>
                    <td><span className={`badge badge-${over?"overdue":loan.status}`}>{over?"overdue":loan.status}</span></td>
                    <td><CopyLinkBtn loanId={loan.id} showToast={showToast}/></td>
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

function ClientsPage({ loans, setLoans, settled, setSettled, showToast }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(null);

  const filtered = loans.filter(l => {
    const s = ((l.client_name||"")+l.id).toLowerCase().includes(search.toLowerCase());
    if (filter==="all") return s;
    if (filter==="overdue") return s && isOverdue(l);
    return s && l.status===filter && !isOverdue(l);
  });

  const deleteLoan = async (id) => {
    if (!confirm("Delete this loan agreement permanently?")) return;
    await supabase.from("loans").delete().eq("id", id);
    setLoans(p => p.filter(l => l.id!==id));
    showToast("Agreement deleted.");
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("loans").update({ status }).eq("id", id);
    if (error) { showToast("Failed to update status.","error"); return; }
    setLoans(p => p.map(l => l.id===id ? {...l,status} : l));
    if (status === "settled") {
      const loan = loans.find(l => l.id===id);
      if (loan) {
        const interest = Number(loan.amount)*Number(loan.interest_rate)/100;
        const total = Number(loan.amount)+interest;
        const record = { id:loan.id,client_name:loan.client_name,client_phone:loan.client_phone,client_nrc:loan.client_nrc,client_email:loan.client_email,amount:loan.amount,interest_rate:loan.interest_rate,interest,total,processing_date:loan.processing_date,due_date:loan.due_date,repayment:loan.repayment,collateral:loan.collateral,collateral_value:loan.collateral_value,terms:loan.terms };
        const { error: sErr } = await supabase.from("settled_loans").insert(record);
        if (!sErr) { setSettled(p => [{...record,settled_at:new Date().toISOString()},...p]); showToast("✓ Settled & saved to Records!"); }
        else showToast("Settled but failed to save record.","error");
      }
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    if (editTarget) {
      const { error } = await supabase.from("loans").update(data).eq("id", editTarget.id);
      if (error) { showToast("Failed to save.","error"); setSaving(false); return; }
      setLoans(p => p.map(l => l.id===editTarget.id ? {...l,...data} : l));
      showToast("Agreement updated! ✓");
    } else {
      const newLoan = {...data, id:genId()};
      const { error } = await supabase.from("loans").insert(newLoan);
      if (error) { showToast("Failed to create.","error"); setSaving(false); return; }
      setLoans(p => [newLoan,...p]);
      showToast("Agreement created! ✓");
    }
    setSaving(false); setShowModal(false);
  };

  const sendReminder = async (loan) => {
    if (!loan.client_email) { showToast("This client has no email.","error"); return; }
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"1.25rem",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:700,marginBottom:4}}>Clients</h1>
          <p style={{color:"var(--muted)",fontSize:"0.85rem"}}>{loans.length} agreement{loans.length!==1?"s":""} on record</p>
        </div>
        <button className="btn btn-blue" onClick={() => {setEditTarget(null);setShowModal(true);}}>+ New Agreement</button>
      </div>
      <div style={{display:"flex",gap:"0.75rem",marginBottom:"1rem",flexWrap:"wrap"}}>
        <input style={{flex:1,minWidth:180}} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{minWidth:140}}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="settled">Settled</option>
        </select>
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Loan ID</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Collateral</th><th>Status</th><th>Link</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:"center",color:"var(--muted)",padding:"2.5rem"}}>No agreements found.</td></tr>}
              {filtered.map(loan => {
                const over = isOverdue(loan);
                const dueSoon = !over && loan.status==="active" && new Date(loan.due_date+"T00:00:00") <= new Date(Date.now()+3*86400000);
                return (
                  <tr key={loan.id}>
                    <td style={{fontWeight:800,fontFamily:"'Playfair Display',serif",fontSize:"0.8rem"}}>{loan.id}</td>
                    <td>
                      <div style={{fontWeight:700}}>{loan.client_name}</div>
                      {loan.client_phone && <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{loan.client_phone}</div>}
                      {loan.client_email && <div style={{fontSize:"0.68rem",color:"var(--blue)"}}>✉ {loan.client_email}</div>}
                    </td>
                    <td style={{fontWeight:700}}>{fmt(loan.amount)}</td>
                    <td>
                      <div style={{color:over?"var(--red)":"inherit",fontWeight:over?800:400}}>{fmtDate(loan.due_date)}</div>
                      {dueSoon && <div style={{fontSize:"0.66rem",color:"#d97706",fontWeight:800}}>⚠️ Due soon</div>}
                    </td>
                    <td style={{fontSize:"0.76rem",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loan.collateral}</td>
                    <td>
                      <select value={over?"overdue":loan.status} onChange={e=>updateStatus(loan.id,e.target.value)} style={{padding:"4px 8px",fontSize:"0.76rem",minWidth:95}}>
                        <option value="active">Active</option>
                        <option value="settled">Settled</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td><CopyLinkBtn loanId={loan.id} showToast={showToast}/></td>
                    <td>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        <button className="btn btn-ghost btn-xs" onClick={() => {setEditTarget(loan);setShowModal(true);}}>Edit</button>
                        {loan.client_email && <button className="btn btn-email btn-xs" disabled={sendingEmail===loan.id} onClick={() => sendReminder(loan)}>{sendingEmail===loan.id?"...":"📧"}</button>}
                        <button className="btn btn-red btn-xs" onClick={() => deleteLoan(loan.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <LoanModal loan={editTarget} saving={saving} onClose={() => setShowModal(false)} onSave={handleSave}/>}
    </>
  );
}

function LoanModal({ loan, onClose, onSave, saving }) {
  const blank = { client_name:"",client_phone:"",client_nrc:"",client_email:"",amount:"",interest_rate:"",processing_date:new Date().toISOString().slice(0,10),due_date:"",repayment:"monthly",collateral:"",collateral_value:"",status:"active",terms:"The borrower agrees to repay the full loan amount plus interest by the due date. The collateral will be held by Sonkhela Soft Loans until full repayment is made. Failure to repay by the due date may result in forfeiture of the stated collateral. This agreement is governed by the laws of the Republic of Zambia." };
  const [f, setF] = useState(loan || blank);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const uploadCollateral = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("collateral_photo", ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal fade-up">
        <div className="modal-head">
          <div className="modal-title">{loan?"Edit Agreement":"New Loan Agreement"}</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="section-sub">👤 Client Info</p>
          <div className="form-grid" style={{marginBottom:"1.25rem"}}>
            <div className="form-group"><label>Full Name *</label><input value={f.client_name} onChange={e=>set("client_name",e.target.value)} placeholder="e.g. John Banda"/></div>
            <div className="form-group"><label>Phone Number</label><input value={f.client_phone} onChange={e=>set("client_phone",e.target.value)} placeholder="+260 97..."/></div>
            <div className="form-group"><label>NRC / National ID</label><input value={f.client_nrc} onChange={e=>set("client_nrc",e.target.value)} placeholder="234567/10/1"/></div>
            <div className="form-group"><label>Email <span style={{color:"var(--muted)",fontWeight:400,textTransform:"none",fontSize:"0.68rem"}}>(optional)</span></label><input type="email" value={f.client_email||""} onChange={e=>set("client_email",e.target.value)} placeholder="client@email.com"/></div>
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
            <div className="form-group full"><label>Item / Description *</label><input value={f.collateral} onChange={e=>set("collateral",e.target.value)}/></div>
            <div className="form-group"><label>Collateral Value (K)</label><input type="number" value={f.collateral_value} onChange={e=>set("collateral_value",e.target.value)}/></div>
            <div className="form-group full">
              <label>Collateral Photo <span style={{color:"var(--muted)",fontWeight:400,textTransform:"none",fontSize:"0.68rem"}}>(optional)</span></label>
              <div className="upload-area" onClick={() => document.getElementById("collateralUpload").click()}>
                {f.collateral_photo ? <img src={f.collateral_photo} alt="collateral" style={{maxHeight:80,maxWidth:"100%",objectFit:"contain",display:"block",margin:"0 auto 6px"}}/> : <div style={{fontSize:"1.5rem",marginBottom:6}}>📷</div>}
                <div style={{fontSize:"0.76rem",color:"var(--muted)",fontWeight:700}}>Click to upload photo of collateral item</div>
              </div>
              <input id="collateralUpload" type="file" accept="image/*" style={{display:"none"}} onChange={uploadCollateral}/>
              {f.collateral_photo && <button className="btn btn-ghost btn-xs" style={{marginTop:6}} onClick={()=>set("collateral_photo",null)}>Remove Photo</button>}
            </div>
          </div>
          <p className="section-sub">📋 Terms & Conditions</p>
          <div className="form-group"><textarea value={f.terms} onChange={e=>set("terms",e.target.value)} rows={4}/></div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-blue" disabled={saving} onClick={() => { if(!f.client_name||!f.amount||!f.due_date){alert("Fill in: Name, Amount, Due Date");return;} onSave(f); }}>{saving?"Saving...":loan?"Save Changes":"✓ Create Agreement"}</button>
        </div>
      </div>
    </div>
  );
}

function RecordsPage({ settled, setSettled, showToast }) {
  const [search, setSearch] = useState("");
  const filtered = settled.filter(l => ((l.client_name||"")+l.id).toLowerCase().includes(search.toLowerCase()));
  const totalInterest = settled.reduce((s,l) => s+Number(l.interest||0),0);
  const totalRepaid = settled.reduce((s,l) => s+Number(l.total||0),0);

  const exportCSV = () => {
    const headers = ["Loan ID","Client Name","Phone","Amount","Interest Rate %","Interest","Total Repaid","Processing Date","Due Date","Repayment","Collateral","Settled Date"];
    const rows = filtered.map(l => [l.id,l.client_name,l.client_phone||"",l.amount,l.interest_rate,l.interest,l.total,l.processing_date,l.due_date,l.repayment,l.collateral,l.settled_at?new Date(l.settled_at).toLocaleDateString("en-GB"):""]);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="Eden_Settled_Records.csv"; a.click();
    showToast("✓ CSV downloaded!");
  };

  return (
    <>
      <div style={{marginBottom:"1.25rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:700,marginBottom:4}}>📁 Settled Records</h1>
        <p style={{color:"var(--muted)",fontSize:"0.85rem"}}>All fully repaid loan agreements — saved permanently.</p>
      </div>
      <div className="stats-row" style={{marginBottom:"1.5rem"}}>
        <div className="stat-card gray"><div className="stat-label">Total Settled</div><div className="stat-value">{settled.length}</div><div className="stat-sub">agreements</div></div>
        <div className="stat-card teal"><div className="stat-label">Interest Collected</div><div className="stat-value sm">{fmt(totalInterest)}</div><div className="stat-sub">from settled loans</div></div>
        <div className="stat-card"><div className="stat-label">Total Recovered</div><div className="stat-value sm">{fmt(totalRepaid)}</div><div className="stat-sub">principal + interest</div></div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">Settled Loan History</div>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇️ Export CSV</button>
        </div>
        <div style={{padding:"0.75rem 1.25rem",borderBottom:"1px solid var(--border)"}}>
          <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",maxWidth:380}}/>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Loan ID</th><th>Client</th><th>Principal</th><th>Interest</th><th>Total Repaid</th><th>Collateral</th><th>Settled Date</th><th>Agreement</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={9} style={{textAlign:"center",color:"var(--muted)",padding:"2.5rem"}}>No settled loans yet.</td></tr>}
              {filtered.map(loan => (
                <tr key={loan.id}>
                  <td style={{fontWeight:800,fontFamily:"'Playfair Display',serif",fontSize:"0.8rem"}}>{loan.id}</td>
                  <td><div style={{fontWeight:700}}>{loan.client_name}</div><div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{loan.client_phone}</div></td>
                  <td style={{fontWeight:700}}>{fmt(loan.amount)}</td>
                  <td style={{color:"#0d9488",fontWeight:700}}>{fmt(loan.interest)}</td>
                  <td style={{fontWeight:800,color:"var(--blue)"}}>{fmt(loan.total)}</td>
                  <td style={{fontSize:"0.76rem",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loan.collateral}</td>
                  <td style={{fontSize:"0.76rem",color:"var(--muted)"}}>{loan.settled_at?new Date(loan.settled_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                  <td><button className="btn btn-copy btn-xs" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/agreement/${loan.id}`); showToast("✓ Link copied!"); }}>🔗 Copy Link</button></td>
                  <td>
                    <button className="btn btn-red btn-xs" onClick={async () => {
                      if (!confirm("Delete this settled record permanently?")) return;
                      const { error } = await supabase.from("settled_loans").delete().eq("id", loan.id);
                      if (error) { showToast("Failed to delete.","error"); return; }
                      setSettled(p => p.filter(r => r.id !== loan.id));
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


// ── Notifications Page ─────────────────────────────────────────────────────────
function NotifSection({ title, color, borderColor, loans, showToast }) {
  return (
    <div className="card" style={{borderTop:`3px solid ${borderColor}`}}>
      <div className="card-head">
        <div className="card-title" style={{color}}>{title} <span style={{background:color,color:"#fff",borderRadius:"20px",padding:"2px 10px",fontSize:"0.72rem",marginLeft:6}}>{loans.length}</span></div>
      </div>
      {loans.length === 0 ? (
        <div style={{padding:"1.5rem",textAlign:"center",color:"var(--muted)",fontSize:"0.85rem"}}>
          {title.includes("Overdue") ? "✅ No overdue loans — great!" : title.includes("Today") ? "No loans due today." : title.includes("1–3") ? "No loans due in the next 3 days." : "No loans due in the next 7 days."}
        </div>
      ) : (
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Loan ID</th><th>Client</th><th>Phone</th><th>Amount</th><th>Due Date</th><th>Link</th></tr></thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td style={{fontWeight:800,fontFamily:"'Playfair Display',serif",fontSize:"0.8rem"}}>{loan.id}</td>
                  <td style={{fontWeight:700}}>{loan.client_name}</td>
                  <td style={{fontSize:"0.78rem",color:"var(--muted)"}}>{loan.client_phone||"—"}</td>
                  <td style={{fontWeight:700}}>{fmt(loan.amount)}</td>
                  <td style={{fontWeight:800,color}}>{fmtDate(loan.due_date)}</td>
                  <td><CopyLinkBtn loanId={loan.id} showToast={showToast}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NotificationsPage({ loans, showToast }) {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7*86400000);
  const in3 = new Date(now.getTime() + 3*86400000);
  const overdueLoans = loans.filter(l => isOverdue(l));
  const dueTodayLoans = loans.filter(l => l.status==="active" && !isOverdue(l) && new Date(l.due_date+"T00:00:00").toDateString() === now.toDateString());
  const due3Loans = loans.filter(l => l.status==="active" && !isOverdue(l) && new Date(l.due_date+"T00:00:00") <= in3 && new Date(l.due_date+"T00:00:00").toDateString() !== now.toDateString());
  const due7Loans = loans.filter(l => l.status==="active" && !isOverdue(l) && new Date(l.due_date+"T00:00:00") > in3 && new Date(l.due_date+"T00:00:00") <= in7);

  return (
    <>
      <div style={{marginBottom:"1.25rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:700,marginBottom:4}}>🔔 Alerts & Notifications</h1>
        <p style={{color:"var(--muted)",fontSize:"0.85rem"}}>Stay on top of overdue and upcoming loan repayments.</p>
      </div>
      <div className="stats-row" style={{marginBottom:"1.5rem"}}>
        <div className="stat-card" style={{borderTopColor:"var(--red)"}}>
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{color:overdueLoans.length>0?"var(--red)":"inherit"}}>{overdueLoans.length}</div>
          <div className="stat-sub">past due date</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Due Today</div>
          <div className="stat-value" style={{color:dueTodayLoans.length>0?"#d97706":"inherit"}}>{dueTodayLoans.length}</div>
          <div className="stat-sub">due right now</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Due This Week</div>
          <div className="stat-value">{due3Loans.length + due7Loans.length}</div>
          <div className="stat-sub">within 7 days</div>
        </div>
      </div>
      <NotifSection title="🚨 Overdue Loans" color="var(--red)" borderColor="var(--red)" loans={overdueLoans} showToast={showToast}/>
      <NotifSection title="⏰ Due Today" color="#d97706" borderColor="#d97706" loans={dueTodayLoans} showToast={showToast}/>
      <NotifSection title="⚠️ Due in 1–3 Days" color="#d97706" borderColor="#f59e0b" loans={due3Loans} showToast={showToast}/>
      <NotifSection title="📅 Due in 4–7 Days" color="var(--blue)" borderColor="var(--blue)" loans={due7Loans} showToast={showToast}/>
    </>
  );
}

function SummaryPage({ loans, settled }) {
  const allLoans = [...loans, ...settled];
  const monthlyData = {};
  allLoans.forEach(l => {
    const date = new Date((l.processing_date || l.settled_at || "")+"T00:00:00");
    if (isNaN(date)) return;
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
    if (!monthlyData[key]) monthlyData[key] = { issued:0,interest:0,salary:0,count:0,settled:0,settledInterest:0 };
    monthlyData[key].issued += Number(l.amount||0);
    monthlyData[key].interest += Number(l.amount||0)*Number(l.interest_rate||0)/100;
    monthlyData[key].salary += (Number(l.amount||0)*Number(l.interest_rate||0)/100)*0.30;
    monthlyData[key].count += 1;
    if (l.settled_at || l.status==="settled") {
      monthlyData[key].settled += 1;
      monthlyData[key].settledInterest += Number(l.interest||Number(l.amount||0)*Number(l.interest_rate||0)/100);
    }
  });
  const months = Object.keys(monthlyData).sort().reverse();
  const monthName = (key) => { const [y,m] = key.split("-"); return new Date(y,m-1).toLocaleDateString("en-GB",{month:"long",year:"numeric"}); };

  return (
    <>
      <div style={{marginBottom:"1.25rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:700,marginBottom:4}}>📈 Monthly Summary</h1>
        <p style={{color:"var(--muted)",fontSize:"0.85rem"}}>Breakdown of loan activity by month.</p>
      </div>
      {months.length === 0 && <div style={{textAlign:"center",color:"var(--muted)",padding:"3rem"}}>No data yet.</div>}
      <div className="month-grid">
        {months.map(key => {
          const d = monthlyData[key];
          return (
            <div key={key} className="month-card">
              <div className="month-name">{monthName(key)}</div>
              <div className="month-row"><span>Loans Issued</span><span style={{fontWeight:700}}>{d.count}</span></div>
              <div className="month-row"><span>Total Issued</span><span style={{fontWeight:700}}>{fmt(d.issued)}</span></div>
              <div className="month-row"><span>Interest Expected</span><span style={{fontWeight:700,color:"#0d9488"}}>{fmt(d.interest)}</span></div>
              <div className="month-row"><span>Settled</span><span style={{fontWeight:700}}>{d.settled} loan{d.settled!==1?"s":""}</span></div>
              <div className="month-row"><span>Interest Collected</span><span style={{fontWeight:700,color:"var(--blue)"}}>{fmt(d.settledInterest)}</span></div>
              <div className="month-row"><span>💼 COO Salary (30%)</span><span style={{fontWeight:800,color:"#7c3aed"}}>{fmt(d.salary)}</span></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SettingsPage({ business, setBusiness, showToast }) {
  const [f, setF] = useState({...business});
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const uploadImage = (key,e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set(key,ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("business").update({
      name:f.name,tagline:f.tagline,phone:f.phone,email:f.email,
      address:f.address,admin_pin:f.admin_pin,logo:f.logo,signature:f.signature,coo_name:f.coo_name,
    }).eq("id",1);
    setSaving(false);
    if (error) { showToast("Failed to save.","error"); return; }
    setBusiness(f); showToast("Settings saved! ✓");
  };

  return (
    <>
      <div style={{marginBottom:"1.25rem"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:700,marginBottom:4}}>Settings</h1>
        <p style={{color:"var(--muted)",fontSize:"0.85rem"}}>Manage your profile, signature and security</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
        <div className="card">
          <div className="card-head"><div className="card-title">Business Profile</div></div>
          <div className="card-body" style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
            <div className="form-group">
              <label>Business Logo</label>
              <div className="upload-area" onClick={() => document.getElementById("logoUpload").click()}>
                {f.logo?<img className="upload-preview-round" src={f.logo} alt="logo"/>:<div style={{fontSize:"2rem",marginBottom:6}}>🏢</div>}
                <div style={{fontSize:"0.76rem",color:"var(--muted)",fontWeight:700}}>Click to upload logo</div>
              </div>
              <input id="logoUpload" type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadImage("logo",e)}/>
            </div>
            <div className="form-group"><label>Business Name</label><input value={f.name||""} onChange={e=>set("name",e.target.value)}/></div>
            <div className="form-group"><label>Tagline</label><input value={f.tagline||""} onChange={e=>set("tagline",e.target.value)}/></div>
            <div className="form-group"><label>COO Name</label><input value={f.coo_name||""} onChange={e=>set("coo_name",e.target.value)} placeholder="Mr Blessed Mwanza"/></div>
            <div className="form-group"><label>Phone</label><input value={f.phone||""} onChange={e=>set("phone",e.target.value)}/></div>
            <div className="form-group"><label>Email</label><input value={f.email||""} onChange={e=>set("email",e.target.value)}/></div>
            <div className="form-group"><label>Address</label><input value={f.address||""} onChange={e=>set("address",e.target.value)}/></div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
          <div className="card">
            <div className="card-head"><div className="card-title">✍️ COO Signature</div></div>
            <div className="card-body">
              <div className="upload-area" onClick={() => document.getElementById("sigUpload").click()}>
                {f.signature?<img className="upload-preview" src={f.signature} alt="sig"/>:<div style={{fontSize:"2rem",marginBottom:6}}>✍️</div>}
                <div style={{fontSize:"0.76rem",color:"var(--muted)",fontWeight:700}}>{f.signature?"Click to change":"Click to upload signature"}</div>
              </div>
              <input id="sigUpload" type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadImage("signature",e)}/>
              {f.signature&&<button className="btn btn-ghost btn-sm" style={{marginTop:"0.75rem",width:"100%"}} onClick={()=>set("signature",null)}>Remove</button>}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">🔐 Security</div></div>
            <div className="card-body">
              <div className="form-group">
                <label>COO PIN</label>
                <input type="password" maxLength={6} value={f.admin_pin||""} onChange={e=>set("admin_pin",e.target.value)} placeholder="4–6 digits"/>
              </div>
            </div>
          </div>
          <button className="btn btn-blue" style={{width:"100%",padding:"13px"}} onClick={handleSave} disabled={saving}>
            {saving?"Saving...":"💾 Save All Settings"}
          </button>
        </div>
      </div>
    </>
  );
}
