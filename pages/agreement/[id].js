import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase, fmt, fmtDate, calcLoan, isOverdue, AGR_STYLES } from "../shared";

const PAGE_STYLES = `
${AGR_STYLES}
body{background:var(--gray-light);}
.dl-bar{width:100%;max-width:740px;display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap;}
.btn-dl{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:9px;border:none;font-family:'Inter',sans-serif;font-weight:800;font-size:0.9rem;cursor:pointer;background:var(--blue);color:#fff;transition:all 0.18s;}
.btn-dl:hover{background:#1e40af;transform:translateY(-1px);box-shadow:0 4px 14px rgba(26,122,74,0.35);}
.btn-dl:disabled{background:#93c5fd;cursor:not-allowed;transform:none;box-shadow:none;}
.dl-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
.dl-hint{font-size:0.78rem;color:#6b9e7e;}
.sig-section{margin-top:1.5rem;}
.sig-lender-box{display:flex;flex-direction:column;align-items:flex-start;max-width:260px;}
.sig-img{max-width:220px;max-height:80px;object-fit:contain;margin-bottom:4px;}
.sig-line-under{height:1px;background:var(--ink);width:100%;margin-bottom:6px;}
.sig-label{font-size:0.8rem;color:#6b7c72;font-weight:700;}
.sig-pad-wrap{background:#fff;border:2px solid var(--border);border-radius:12px;padding:1.5rem;margin-top:1rem;max-width:740px;width:100%;}
.sig-pad-title{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:4px;color:#0d1f14;}
.sig-pad-sub{font-size:0.8rem;color:#6b7c72;margin-bottom:1rem;}
.sig-canvas-wrap{border:2px dashed #d4e8db;border-radius:10px;background:var(--gray-light);overflow:hidden;touch-action:none;}
canvas{display:block;width:100%;cursor:crosshair;}
.sig-pad-btns{display:flex;gap:0.75rem;margin-top:1rem;flex-wrap:wrap;}
.btn-clear{padding:9px 18px;border-radius:9px;border:1.5px solid #d4e8db;background:#fff;font-family:'Inter',sans-serif;font-weight:800;font-size:0.85rem;cursor:pointer;color:#6b7c72;}
.btn-clear:hover{background:#f4fbf6;border-color:#1a7a4a;color:#1a7a4a;}
.btn-submit-sig{padding:9px 22px;border-radius:9px;border:none;background:var(--blue);color:#fff;font-family:'Inter',sans-serif;font-weight:800;font-size:0.85rem;cursor:pointer;transition:all 0.18s;}
.btn-submit-sig:hover{background:#1e40af;}
.btn-submit-sig:disabled{background:#93c5fd;cursor:not-allowed;}
.sig-signed-box{display:flex;flex-direction:column;align-items:flex-start;max-width:260px;}
.sig-signed-img{max-width:220px;max-height:80px;object-fit:contain;margin-bottom:4px;border:1px solid #d4e8db;border-radius:6px;padding:4px;background:#fff;}
.sig-toast{background:var(--ink);color:#fff;padding:10px 18px;border-radius:8px;font-size:0.85rem;font-weight:700;margin-top:0.75rem;display:inline-block;border-left:3px solid var(--blue);}
@media print{.dl-bar,.sig-pad-wrap{display:none!important;}}
`;

export default function AgreementPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loan, setLoan] = useState(null);
  const [business, setBusiness] = useState(null);
  const [status, setStatus] = useState("loading");
  const [downloading, setDownloading] = useState(false);
  const [submittingSig, setSubmittingSig] = useState(false);
  const [sigSaved, setSigSaved] = useState(false);
  const [sigToast, setSigToast] = useState("");
  const docRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);

  useEffect(() => { if (!id) return; loadData(); }, [id]);

  const loadData = async () => {
    const [loanRes, bizRes] = await Promise.all([
      supabase.from("loans").select("*").eq("id", id).single(),
      supabase.from("business").select("*").eq("id", 1).single(),
    ]);
    if (loanRes.error || !loanRes.data) { setStatus("notfound"); return; }
    setLoan(loanRes.data);
    setBusiness(bizRes.data);
    if (loanRes.data.client_signature) setSigSaved(true);
    setStatus("found");
  };

  // Canvas setup
  useEffect(() => {
    if (status !== "found" || sigSaved) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 180;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [status, sigSaved]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e3a6e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e) => { if (e) e.preventDefault(); isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return !data.some(v => v !== 0);
  };

  const submitSignature = async () => {
    if (isCanvasEmpty()) { setSigToast("Please sign before submitting."); setTimeout(() => setSigToast(""), 3000); return; }
    setSubmittingSig(true);
    const canvas = canvasRef.current;
    const sigData = canvas.toDataURL("image/png");
    const { error } = await supabase.from("loans").update({ client_signature: sigData }).eq("id", id);
    if (error) { setSigToast("Failed to save signature. Please try again."); setSubmittingSig(false); return; }
    setLoan(p => ({ ...p, client_signature: sigData }));
    setSigSaved(true);
    setSigToast("✓ Signature submitted successfully!");
    setTimeout(() => setSigToast(""), 4000);
    setSubmittingSig(false);
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const el = docRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;
      if (ih <= ph) { pdf.addImage(imgData, "PNG", 0, 0, pw, ih); }
      else { let y = 0; while (y < ih) { if (y > 0) pdf.addPage(); pdf.addImage(imgData, "PNG", 0, -y, pw, ih); y += ph; } }
      pdf.save(`Eden_${loan.id}_${(loan.client_name||"Client").replace(/\s+/g,"_")}.pdf`);
    } catch(err) { alert("PDF generation failed. Please try again."); }
    setDownloading(false);
  };

  if (status === "loading") return (<><style>{PAGE_STYLES}</style><div className="loading-screen"><div className="loading-spinner"/><div className="loading-text">Loading agreement...</div></div></>);
  if (status === "notfound") return (<><style>{PAGE_STYLES}</style><div className="error-screen"><div className="error-icon">🔍</div><div className="error-title">Agreement Not Found</div><div className="error-sub">This link may be invalid or the agreement has been removed.</div></div></>);

  const calc = calcLoan(loan.amount, loan.interest_rate, loan.repayment);
  const over = isOverdue(loan);
  const displayStatus = over ? "overdue" : loan.status;
  const schedMap = { weekly:"Weekly", monthly:"Monthly", "lump-sum":"Lump Sum" };
  const instLabel = loan.repayment !== "lump-sum"
    ? `${fmt(calc.installment)} / ${loan.repayment==="weekly"?"week":"month"}`
    : fmt(calc.total) + " (once)";

  return (
    <><style>{PAGE_STYLES}</style>
    <div className="agr-page">

      <div className="dl-bar">
        <button className="btn-dl" onClick={downloadPDF} disabled={downloading}>
          {downloading ? <><span className="dl-spinner"/> Generating PDF...</> : <>⬇️ Download PDF</>}
        </button>
        <span className="dl-hint">📲 Download &amp; share on WhatsApp</span>
      </div>

      {/* Agreement document */}
      <div className="agr-doc fade-up" ref={docRef}>
        <div className="agr-header">
          <div className="agr-logo">{business?.logo ? <img src={business.logo} alt="logo"/> : (business?.name||"S")[0]}</div>
          <div>
            <div className="agr-biz-name">{business?.name}</div>
            <div className="agr-biz-tag">{business?.tagline}</div>
            <div className="agr-biz-contact">{business?.phone} · {business?.email} · {business?.address}</div>
          </div>
          <span className={`agr-status-pill agr-status-${displayStatus}`}>{displayStatus.toUpperCase()}</span>
        </div>

        <div className="agr-id-bar">
          <div><div className="agr-id-label">Agreement Number</div><div className="agr-id-num">{loan.id}</div></div>
          <div style={{textAlign:"right"}}><div className="agr-id-label">Date Issued</div><div style={{fontWeight:800,fontSize:"0.9rem"}}>{fmtDate(loan.processing_date)}</div></div>
        </div>

        <div className="agr-body">
          <div className="agr-section-title">👤 Borrower Details</div>
          <div className="agr-grid">
            <div className="agr-cell"><div className="agr-cell-label">Full Name</div><div className="agr-cell-value">{loan.client_name}</div></div>
            <div className="agr-cell"><div className="agr-cell-label">Phone Number</div><div className="agr-cell-value">{loan.client_phone||"—"}</div></div>
            <div className="agr-cell full"><div className="agr-cell-label">NRC / National ID</div><div className="agr-cell-value">{loan.client_nrc||"—"}</div></div>
          </div>

          <div className="agr-section-title">💰 Loan Financials</div>
          <div className="agr-money-bar">
            <div className="agr-money-item"><div className="lbl">Principal Amount</div><div className="val">{fmt(loan.amount)}</div></div>
            <div className="agr-money-item"><div className="lbl">Interest ({loan.interest_rate}%)</div><div className="val">{fmt(loan.amount*loan.interest_rate/100)}</div></div>
            <div className="agr-money-item highlight"><div className="lbl">Total Repayable</div><div className="val">{fmt(calc.total)}</div></div>
          </div>
          <div className="agr-grid">
            <div className="agr-cell"><div className="agr-cell-label">Processing Date</div><div className="agr-cell-value">{fmtDate(loan.processing_date)}</div></div>
            <div className="agr-cell"><div className="agr-cell-label">Due Date</div><div className="agr-cell-value" style={{color:over?"var(--red)":"inherit"}}>{fmtDate(loan.due_date)}{over?" ⚠️":""}</div></div>
            <div className="agr-cell"><div className="agr-cell-label">Repayment Schedule</div><div className="agr-cell-value">{schedMap[loan.repayment]||loan.repayment}</div></div>
            <div className="agr-cell"><div className="agr-cell-label">Installment</div><div className="agr-cell-value">{instLabel}</div></div>
          </div>

          <div className="agr-section-title">🔒 Collateral Held</div>
          <div className="agr-grid">
            <div className="agr-cell full"><div className="agr-cell-label">Item / Description</div><div className="agr-cell-value">{loan.collateral}</div></div>
            {loan.collateral_value && <div className="agr-cell"><div className="agr-cell-label">Estimated Value</div><div className="agr-cell-value">{fmt(loan.collateral_value)}</div></div>}
            {loan.collateral_photo && (
              <div className="agr-cell full">
                <div className="agr-cell-label">Collateral Photo</div>
                <img src={loan.collateral_photo} alt="collateral" style={{maxWidth:"100%",maxHeight:200,objectFit:"contain",borderRadius:8,marginTop:6,display:"block"}}/>
              </div>
            )}
          </div>

          {loan.terms && (<><div className="agr-section-title">📋 Terms & Conditions</div><div className="agr-terms">{loan.terms}</div></>)}

          {/* Signatures */}
          <div className="agr-section-title">✍️ Signatures</div>
          <div style={{display:"flex",gap:"3rem",alignItems:"flex-end",flexWrap:"wrap",marginTop:"0.5rem"}}>
            {/* Lender */}
            <div className="sig-lender-box">
              {business?.signature
                ? <img className="sig-img" src={business.signature} alt="signature"/>
                : <div style={{height:60}}/>}
              <div className="sig-line-under"/>
              <div className="sig-label">{business?.name} (Lender)</div>
            </div>
            {/* Client */}
            <div className="sig-lender-box">
              {loan.client_signature
                ? <img className="sig-signed-img" src={loan.client_signature} alt="client signature"/>
                : <div style={{height:60,borderBottom:"1.5px solid #d4e8db",width:220}}/>}
              <div className="sig-line-under" style={{marginTop: loan.client_signature ? 4 : 0}}/>
              <div className="sig-label">{loan.client_name} (Borrower)</div>
            </div>
          </div>
        </div>

        <div className="agr-footer">
          <div className="agr-footer-left">{business?.name} · {business?.email}</div>
          <div className="agr-footer-right">Official Loan Agreement</div>
        </div>
      </div>

      {/* Signature Pad */}
      {!sigSaved ? (
        <div className="sig-pad-wrap fade-up">
          <div className="sig-pad-title">✍️ Sign This Agreement</div>
          <div className="sig-pad-sub">Draw your signature below using your finger or mouse, then tap Submit.</div>
          <div className="sig-canvas-wrap">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
            />
          </div>
          <div className="sig-pad-btns">
            <button className="btn-clear" onClick={clearCanvas}>🗑 Clear</button>
            <button className="btn-submit-sig" onClick={submitSignature} disabled={submittingSig}>
              {submittingSig ? "Submitting..." : "✓ Submit Signature"}
            </button>
          </div>
          {sigToast && <div className="sig-toast">{sigToast}</div>}
        </div>
      ) : (
        <div className="sig-pad-wrap fade-up" style={{textAlign:"center"}}>
          <div style={{fontSize:"2rem",marginBottom:8}}>✅</div>
          <div className="sig-pad-title">Signature Submitted</div>
          <div className="sig-pad-sub">Thank you, {loan.client_name}. Your signature has been recorded on this agreement.</div>
          {sigToast && <div className="sig-toast" style={{marginTop:"0.75rem"}}>{sigToast}</div>}
        </div>
      )}

      <div style={{marginTop:"1rem",fontSize:"0.72rem",color:"#6b9e7e",textAlign:"center"}}>
        This document is confidential and issued by {business?.name}
      </div>
    </div></>
  );
}
