import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  FileText,
  Lock,
  Maximize2,
  Minus,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Pill,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/patient")({
  component: PatientPage,
});

const labs = [
  { name: "eGFR", value: "28", unit: "mL/min/1.73m²", tone: "critical" },
  { name: "ALT", value: "142", unit: "U/L", tone: "warning" },
  { name: "AST", value: "118", unit: "U/L", tone: "warning" },
  { name: "Total Bilirubin", value: "1.1", unit: "mg/dL", tone: "success" },
  { name: "Creatinine", value: "3.4", unit: "mg/dL", tone: "critical" },
  { name: "Potassium", value: "5.8", unit: "mEq/L", tone: "critical" },
  { name: "INR", value: "1.9", unit: "0.9 – 1.1 normal", tone: "warning" },
  { name: "Hemoglobin", value: "9.2", unit: "g/dL", tone: "warning" },
];

const toneText: Record<string, string> = {
  critical: "text-critical",
  warning: "text-warning",
  success: "text-success",
};
const toneDot: Record<string, string> = {
  critical: "bg-critical",
  warning: "bg-warning",
  success: "bg-success",
};

const drugAlerts = [
  {
    severity: "critical",
    title: "Contraindicated Drug Combination",
    drugs: ["Metformin 1000mg", "Contrast Dye (Iohexol)"],
    why: "This patient's severely reduced kidney function (eGFR 28) means their body cannot eliminate metformin fast enough. Combining it with contrast dye — used in the scheduled CT scan — dramatically increases the risk of lactic acidosis, a rare but life-threatening buildup of lactic acid in the blood.",
    rec: "Hold metformin 48 hours before the procedure and restart only after kidney function is re-checked and confirmed stable.",
    open: true,
  },
  {
    severity: "critical",
    title: "Dangerous Bleeding Risk",
    drugs: ["Warfarin 5mg", "Ibuprofen 400mg"],
    why: "Concurrent use significantly increases gastrointestinal bleeding risk in elderly patients on chronic anticoagulation.",
    rec: "Discontinue ibuprofen. Use acetaminophen for pain control and reassess INR within 48 hours.",
    open: false,
  },
  {
    severity: "warning",
    title: "Elevated Potassium Level",
    drugs: ["Lisinopril 20mg", "Spironolactone 25mg"],
    why: "Potassium is high (5.8 mEq/L). Monitor closely and review medications.",
    rec: "Reduce ACE inhibitor dose, recheck potassium in 24h.",
    open: false,
  },
];

function PatientPage() {
  const [tab, setTab] = useState<"alerts" | "metrics" | "history" | "log">("alerts");

  return (
    <div className="p-5 space-y-4 max-w-[1700px] mx-auto">
      {/* Patient summary header */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-12 gap-5">
          {/* Avatar + name */}
          <div className="col-span-12 lg:col-span-4 flex gap-4 items-start">
            <div className="size-20 rounded-xl bg-gradient-to-br from-accent to-surface-elevated flex items-center justify-center text-xl font-semibold text-primary shrink-0">
              MC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Margaret R. Collins</h1>
                <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-primary">♀</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">78Y · Female</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">MRN</dt>
                  <dd className="font-medium text-foreground">847201</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium text-foreground">+1 (555) 231-9876</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Blood Type</dt>
                  <dd className="font-medium text-foreground">O+</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Weight / Height</dt>
                  <dd className="font-medium text-foreground">62 kg / 158 cm</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Diagnosis & allergies */}
          <div className="col-span-12 lg:col-span-3 space-y-4 text-xs">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <CheckCircle2 className="size-3.5 text-success" /> Primary Diagnosis
              </div>
              <div className="text-sm font-medium">Chronic Kidney Disease (CKD Stage 4)</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-critical mb-1.5">
                <AlertTriangle className="size-3.5" /> Allergies
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="px-2 py-1 rounded-md bg-critical-soft text-critical text-xs font-medium border border-critical-soft">
                  Penicillin (Rash)
                </span>
                <span className="px-2 py-1 rounded-md bg-surface-elevated text-muted-foreground text-xs">
                  +1
                </span>
              </div>
            </div>
          </div>

          {/* Conditions & meds */}
          <div className="col-span-12 lg:col-span-3 space-y-4 text-xs">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <CheckCircle2 className="size-3.5 text-success" /> Chronic Conditions
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {["Diabetes Mellitus", "Hypertension", "Anemia"].map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 rounded-md bg-accent/60 text-foreground text-xs font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <Pill className="size-3.5 text-primary" /> Current Medications (5)
              </div>
              <div className="text-sm text-foreground/90 leading-relaxed">
                Warfarin, Metformin, Lisinopril, Furosemide, Atorvastatin
              </div>
            </div>
          </div>

          {/* Risk */}
          <div className="col-span-12 lg:col-span-2 text-xs">
            <div className="text-muted-foreground mb-1.5">Risk Status</div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-critical text-critical-foreground text-xs font-bold">
              HIGH RISK
            </span>
            <div className="mt-4 text-muted-foreground">Last Visit</div>
            <div className="text-sm font-medium mt-1">08 May 2026</div>
          </div>
        </div>
      </section>

      {/* Split workspace */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Document viewer */}
        <section className="col-span-12 lg:col-span-7 rounded-xl border border-border bg-card flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold">Patient Record</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Admission Note</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button className="hover:text-foreground"><ChevronLeft className="size-4" /></button>
              <span>Page 1 of 3</span>
              <button className="hover:text-foreground"><ChevronRight className="size-4" /></button>
            </div>
          </div>

          {/* AI extraction banner */}
          <div className="mx-4 mt-4 rounded-lg border border-success/30 bg-success-soft px-4 py-2.5 flex items-center gap-2.5">
            <Sparkles className="size-4 text-success shrink-0" />
            <span className="text-sm text-foreground/90 flex-1">
              AI extracted 8 clinical metrics from this document — including handwritten annotations.
            </span>
            <CheckCircle2 className="size-4 text-success" />
          </div>

          {/* Toolbar */}
          <div className="mx-4 mt-3 flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-surface-elevated">
            <button className="p-1 hover:text-primary"><Maximize2 className="size-3.5" /></button>
            <button className="p-1 hover:text-primary"><Search className="size-3.5" /></button>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <button className="p-1"><Minus className="size-3.5" /></button>
              <span>100%</span>
              <button className="p-1"><Plus className="size-3.5" /></button>
            </div>
            <button className="ml-2 p-1 hover:text-primary"><Download className="size-3.5" /></button>
          </div>

          {/* Document mock */}
          <div className="m-4 rounded-lg bg-[oklch(0.96_0.005_250)] text-[oklch(0.18_0.015_250)] p-6 font-serif text-sm leading-relaxed shadow-elevated">
            <div className="flex justify-between items-start border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold tracking-wide">ADMISSION NOTE</h3>
              <div className="text-xs text-right space-y-0.5">
                <div>Date: 10/05/2026</div>
                <div>Time: 09:14 AM</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-xs mb-4">
              <div><span className="font-semibold">Patient Name:</span> Margaret R. Collins</div>
              <div><span className="font-semibold">DOB:</span> 03/12/1948</div>
              <div><span className="font-semibold">Department:</span> Nephrology</div>
              <div><span className="font-semibold">MRN:</span> 847201</div>
            </div>

            <div className="mb-3">
              <div className="font-semibold text-sm">Chief Complaint:</div>
              <div className="italic mt-1">Pt. c/o increased fatigue and decreased urine output.</div>
            </div>

            <div className="mb-3">
              <div className="font-semibold text-sm">Vital Signs:</div>
              <div className="text-xs mt-1">
                BP: 138/82 mmHg · HR: 88 bpm · RR: 18/min · Temp: 98.4 °F · SpO₂: 97% (RA)
              </div>
            </div>

            <div className="mb-2 font-semibold text-sm">Laboratory Results:</div>
            <table className="w-full text-xs border border-[oklch(0.85_0.01_250)]">
              <tbody>
                {[
                  ["eGFR", "28 mL/min/1.73m²", "L", "text-red-600"],
                  ["Creatinine", "3.4 mg/dL", "H", "text-red-600"],
                  ["Potassium", "5.8 mEq/L", "H", "text-red-600"],
                  ["ALT", "142 U/L", "H", "text-amber-600"],
                  ["AST", "118 U/L", "H", "text-amber-600"],
                  ["Total Bilirubin", "1.1 mg/dL", "N", "text-emerald-600"],
                ].map(([n, v, f, c]) => (
                  <tr key={n} className="border-t border-[oklch(0.85_0.01_250)]">
                    <td className="px-2 py-1 font-medium">{n}</td>
                    <td className={`px-2 py-1 ${c}`}>{v}</td>
                    <td className={`px-2 py-1 font-bold ${c}`}>{f}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 rounded-md border-2 border-dashed border-amber-400 bg-amber-100/60 p-3 italic text-[13px] leading-snug">
              Dr. Chen — Pt. c/o increased fatigue + SOB. Hold nephrotoxic agents. Renal consult ordered.
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`size-12 rounded border ${
                    n === 1 ? "border-primary ring-2 ring-primary/40" : "border-border"
                  } bg-surface-elevated flex items-center justify-center text-[10px] text-muted-foreground`}
                >
                  {n}
                </div>
              ))}
            </div>
            <div className="text-xs flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Show AI Highlights</span>
                <div className="w-9 h-5 rounded-full bg-primary relative">
                  <div className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-success" /> Extracted</span>
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-critical" /> Abnormal</span>
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-warning" /> Note</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right: tabs + alerts */}
        <section className="col-span-12 lg:col-span-5 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-border">
            {[
              { id: "alerts", label: "Drug Alerts", badge: 3 },
              { id: "metrics", label: "Patient Metrics" },
              { id: "history", label: "Medication History" },
              { id: "log", label: "History" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`relative pb-3 text-sm flex items-center gap-2 transition ${
                  tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {t.badge && (
                  <span className="text-[10px] font-bold bg-critical text-critical-foreground rounded-full px-1.5 py-0.5">
                    {t.badge}
                  </span>
                )}
                {tab === t.id && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>

          {/* Lab values */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Extracted Lab Values
              </div>
              <button className="text-xs text-primary inline-flex items-center gap-1">
                <TrendingUp className="size-3.5" /> View Trend
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {labs.map((l) => (
                <div key={l.name} className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground truncate">{l.name}</span>
                    <span className={`size-2 rounded-full ${toneDot[l.tone]}`} />
                  </div>
                  <div className={`mt-1.5 text-2xl font-semibold ${toneText[l.tone]}`}>{l.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{l.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Drug alerts */}
          <div className="space-y-3">
            {drugAlerts.map((a, i) => (
              <DrugAlertCard key={i} alert={a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function DrugAlertCard({ alert: a }: { alert: typeof drugAlerts[number] }) {
  const [open, setOpen] = useState(a.open);
  const isCritical = a.severity === "critical";

  return (
    <div
      className={`rounded-xl border-2 ${
        isCritical ? "border-critical/60 bg-critical-soft" : "border-warning/50 bg-warning-soft"
      } overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div
          className={`size-7 shrink-0 rounded-md flex items-center justify-center ${
            isCritical ? "bg-critical text-critical-foreground" : "bg-warning text-warning-foreground"
          }`}
        >
          {isCritical ? <ShieldAlert className="size-4" /> : <AlertTriangle className="size-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isCritical
                  ? "bg-critical text-critical-foreground"
                  : "bg-warning text-warning-foreground"
              }`}
            >
              {a.severity.toUpperCase()}
            </span>
            {isCritical && (
              <span className="text-[10px] inline-flex items-center gap-1 text-muted-foreground">
                <Lock className="size-3" /> Signature Required
              </span>
            )}
          </div>
          <div className="text-sm font-semibold mt-1.5">{a.title}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {a.drugs.map((d) => (
              <span
                key={d}
                className="text-[11px] px-2 py-0.5 rounded-md bg-surface-elevated/80 border border-border text-foreground/90 inline-flex items-center gap-1"
              >
                <Pill className="size-3" /> {d}
              </span>
            ))}
          </div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Why this matters</div>
            <p className="text-sm text-foreground/90 leading-relaxed">{a.why}</p>
          </div>

          <div className="rounded-lg border border-info/30 bg-info-soft p-3">
            <div className="text-[10px] uppercase tracking-wider text-info font-bold mb-1">
              AI Recommendation
            </div>
            <p className="text-sm text-foreground/90 leading-snug">{a.rec}</p>
          </div>

          {isCritical && (
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-border bg-surface-elevated text-sm font-medium py-2.5 hover:bg-accent transition">
                Defer
              </button>
              <button className="rounded-lg bg-critical text-critical-foreground text-sm font-semibold py-2.5 inline-flex items-center justify-center gap-2 hover:opacity-90 transition">
                <Lock className="size-3.5" /> Sign & Override Warning
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
