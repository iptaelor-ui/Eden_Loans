import { createClient } from "@supabase/supabase-js";

// ── Supabase ── (replace with your Eden Supabase credentials)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qdzxbjnqnpnaxuqduptw.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkenhiam5xbnBuYXh1cWR1cHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzkzMTQsImV4cCI6MjA5MTQxNTMxNH0.ION6QtscAxLGer8YMa3KiaZR00-pDynL_LOryO_74s8"
);

// ── Helpers ──────────────────────────────────────────────────────────────────
export const fmt = (n) => "K " + Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (d) => { if (!d) return "—"; return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }); };
export const calcLoan = (amount, rate, repayment) => {
  const principal = Number(amount || 0);
  const interest = principal * Number(rate || 0) / 100;
  const total = principal + interest;
  const installment = repayment === "weekly" ? total / 4 : repayment === "monthly" ? total / 3 : total;
  return { principal, interest, total, installment };
};
export const isOverdue = (loan) => loan.status === "active" && loan.due_date && new Date(loan.due_date + "T00:00:00") < new Date();
export const genId = () => {
  const y = new Date().getFullYear();
  const r = String(Math.floor(Math.random() * 900) + 100);
  return `EDN-${y}-${r}`;
};

// ── Shared Agreement Styles (Blue/Black/Gray theme) ──────────────────────────
export const AGR_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --blue: #1a56db;
  --blue-dark: #1e3a6e;
  --blue-light: #ebf0fb;
  --gray: #6b7280;
  --gray-light: #f3f4f6;
  --ink: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --white: #ffffff;
  --bg: #f9fafb;
  --red: #dc2626;
  --red-light: #fef2f2;
  --accent: #f3f4f6;
  --green: #059669;
}
body { font-family: 'Inter', sans-serif; color: var(--ink); background: var(--bg); }
.loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; background: var(--bg); }
.loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
.loading-text { font-size: 0.875rem; color: var(--muted); font-weight: 600; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; background: var(--bg); padding: 2rem; }
.error-icon { font-size: 3rem; }
.error-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; }
.error-sub { color: var(--muted); font-size: 0.875rem; text-align: center; }
.fade-up { animation: fadeUp 0.4s ease both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* Agreement Document */
.agr-page { min-height: 100vh; background: var(--gray-light); display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; }
.agr-doc { background: var(--white); border-radius: 16px; width: 100%; max-width: 740px; box-shadow: 0 4px 32px rgba(26,86,219,0.10); overflow: hidden; border: 1px solid var(--border); }
.agr-header { background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 100%); padding: 2rem; display: flex; align-items: flex-start; gap: 1.25rem; position: relative; }
.agr-logo { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; flex-shrink: 0; overflow: hidden; border: 2px solid rgba(255,255,255,0.3); }
.agr-logo img { width: 100%; height: 100%; object-fit: cover; }
.agr-biz-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #fff; }
.agr-biz-tag { font-size: 0.82rem; color: rgba(255,255,255,0.65); margin-top: 2px; }
.agr-biz-contact { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-top: 6px; }
.agr-status-pill { position: absolute; top: 1.5rem; right: 1.5rem; padding: 5px 14px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.06em; }
.agr-status-active { background: #d1fae5; color: #065f46; }
.agr-status-overdue { background: #fee2e2; color: #991b1b; }
.agr-status-settled { background: #e5e7eb; color: #374151; }
.agr-id-bar { background: var(--gray-light); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
.agr-id-label { font-size: 0.65rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
.agr-id-num { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--blue-dark); }
.agr-body { padding: 1.75rem 2rem; }
.agr-section-title { font-size: 0.78rem; font-weight: 800; color: var(--blue); text-transform: uppercase; letter-spacing: 0.08em; margin: 1.5rem 0 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--blue-light); display: flex; align-items: center; gap: 6px; }
.agr-section-title:first-child { margin-top: 0; }
.agr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.5rem; }
.agr-cell { background: var(--gray-light); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; }
.agr-cell.full { grid-column: 1 / -1; }
.agr-cell-label { font-size: 0.65rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.agr-cell-value { font-size: 0.9rem; font-weight: 700; color: var(--ink); }
.agr-money-bar { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }
.agr-money-item { background: var(--gray-light); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; }
.agr-money-item.highlight { background: linear-gradient(135deg, var(--blue-dark), var(--blue)); border-color: var(--blue); }
.agr-money-item .lbl { font-size: 0.65rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.agr-money-item.highlight .lbl { color: rgba(255,255,255,0.7); }
.agr-money-item .val { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: var(--ink); }
.agr-money-item.highlight .val { color: #fff; }
.agr-terms { background: var(--gray-light); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; font-size: 0.82rem; color: var(--gray); line-height: 1.7; }
.sig-row { display: flex; gap: 2rem; margin-top: 0.5rem; }
.sig-box { flex: 1; }
.sig-line { height: 50px; border-bottom: 2px solid var(--blue); margin-bottom: 6px; }
.sig-name { font-size: 0.78rem; color: var(--muted); font-weight: 700; }
.agr-footer { background: var(--blue-dark); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.agr-footer-left { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
.agr-footer-right { font-size: 0.75rem; color: rgba(255,255,255,0.5); font-weight: 700; }
`;

export default function Shared() { return null; }
