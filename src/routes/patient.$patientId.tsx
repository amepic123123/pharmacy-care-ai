import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { usePatients } from "@/contexts/PatientContext";
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
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/patient/$patientId")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "alerts",
  }),
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
  const { patientId } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { patients, resolveAlert, unresolveAlert } = usePatients();

  const setTab = (newTab: "alerts" | "metrics" | "history" | "log") => 
    navigate({ search: (prev) => ({ ...prev, tab: newTab }), replace: true });
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlights, setHighlights] = useState<Set<string>>(new Set());

  const toggleHighlight = (id: string) => {
    if (!highlightMode) return;
    setHighlights((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isHighlighted = (id: string) => highlights.has(id);
  
  const patient = useMemo(() => {
    return patients.find(p => p.id === patientId) || patients[0];
  }, [patients, patientId]);

  return (
    <div className="p-5 space-y-4 max-w-[1700px] mx-auto">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <button onClick={() => window.history.back()} className="hover:text-primary flex items-center gap-1 transition">
          <ArrowLeft className="size-3" /> Patients
        </button>
        <ChevronRight className="size-3" />
        <span className="text-foreground/70 font-medium">{patient.name}</span>
      </div>

      {/* Patient summary header */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-12 gap-5">
          {/* Avatar + name */}
          <div className="col-span-12 lg:col-span-4 flex gap-4 items-start">
            <div className="size-20 rounded-xl bg-gradient-to-br from-accent to-surface-elevated flex items-center justify-center text-xl font-semibold text-primary shrink-0 shadow-inner">
              {patient.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{patient.name}</h1>
                <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-primary">
                  {patient.gender === "Female" ? "♀" : "♂"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{patient.age} · {patient.gender}</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">MRN</dt>
                  <dd className="font-medium text-foreground">{patient.mrn}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium text-foreground">{patient.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Blood Type</dt>
                  <dd className="font-medium text-foreground">{patient.bloodType}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Weight / Height</dt>
                  <dd className="font-medium text-foreground">{patient.weight} / {patient.height}</dd>
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
              <div className="text-sm font-medium">{patient.diagnosis}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-critical mb-1.5">
                <AlertTriangle className="size-3.5" /> Allergies
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {patient.allergies.map(a => (
                  <span key={a} className="px-2 py-1 rounded-md bg-critical-soft text-critical text-xs font-medium border border-critical-soft">
                    {a}
                  </span>
                ))}
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
                {patient.conditions.map((c) => (
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
                <Pill className="size-3.5 text-primary" /> Current Medications ({patient.medications.length})
              </div>
              <div className="text-sm text-foreground/90 leading-relaxed">
                {patient.medications.join(", ")}
              </div>
            </div>
          </div>

          {/* Risk */}
          <div className="col-span-12 lg:col-span-2 text-xs">
            <div className="text-muted-foreground mb-1.5">Risk Status</div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold ${
              patient.risk === "HIGH" ? "bg-critical text-critical-foreground" : 
              patient.risk === "MED" ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"
            }`}>
              {patient.risk} RISK
            </span>
            <div className="mt-4 text-muted-foreground">Last Visit</div>
            <div className="text-sm font-medium mt-1">{patient.lastVisit}</div>
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
            <button 
              onClick={() => setHighlightMode(!highlightMode)}
              className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                highlightMode ? "bg-primary text-primary-foreground shadow-glow" : "bg-surface border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <Sparkles className="size-3" /> {highlightMode ? "Highlighter ON" : "Highlighter"}
            </button>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <button className="p-1"><Minus className="size-3.5" /></button>
              <span>100%</span>
              <button className="p-1"><Plus className="size-3.5" /></button>
            </div>
            <button className="ml-2 p-1 hover:text-primary"><Download className="size-3.5" /></button>
          </div>

          {/* Document mock */}
          <div className={`m-4 rounded-lg bg-[oklch(0.96_0.005_250)] text-[oklch(0.18_0.015_250)] p-6 font-serif text-sm leading-relaxed shadow-elevated transition-all ${highlightMode ? "cursor-crosshair ring-2 ring-primary/20" : ""}`}>
            <div className="flex justify-between items-start border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold tracking-wide">ADMISSION NOTE</h3>
              <div className="text-xs text-right space-y-0.5">
                <div>Date: 10/05/2026</div>
                <div>Time: 09:14 AM</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-xs mb-4">
              <div onClick={() => toggleHighlight("name")} className={isHighlighted("name") ? "bg-yellow-200/80 rounded px-1" : ""}>
                <span className="font-semibold">Patient Name:</span> {patient.name}
              </div>
              <div onClick={() => toggleHighlight("dob")} className={isHighlighted("dob") ? "bg-yellow-200/80 rounded px-1" : ""}>
                <span className="font-semibold">DOB:</span> {patient.dob}
              </div>
              <div onClick={() => toggleHighlight("dept")} className={isHighlighted("dept") ? "bg-yellow-200/80 rounded px-1" : ""}>
                <span className="font-semibold">Department:</span> {patient.dept}
              </div>
              <div onClick={() => toggleHighlight("mrn")} className={isHighlighted("mrn") ? "bg-yellow-200/80 rounded px-1" : ""}>
                <span className="font-semibold">MRN:</span> {patient.mrn}
              </div>
            </div>

            <div className="mb-3">
              <div className="font-semibold text-sm">Chief Complaint:</div>
              <div 
                onClick={() => toggleHighlight("complaint")}
                className={`italic mt-1 px-1 rounded transition-colors ${isHighlighted("complaint") ? "bg-yellow-200/80" : ""}`}
              >
                Pt. c/o increased fatigue and decreased urine output.
              </div>
            </div>

            <div className="mb-3">
              <div className="font-semibold text-sm">Vital Signs:</div>
              <div 
                onClick={() => toggleHighlight("vitals")}
                className={`text-xs mt-1 px-1 rounded transition-colors ${isHighlighted("vitals") ? "bg-yellow-200/80" : ""}`}
              >
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
                  <tr 
                    key={n} 
                    onClick={() => toggleHighlight(`lab-${n}`)}
                    className={`border-t border-[oklch(0.85_0.01_250)] transition-colors ${isHighlighted(`lab-${n}`) ? "bg-yellow-200/60" : ""}`}
                  >
                    <td className="px-2 py-1 font-medium">{n}</td>
                    <td className={`px-2 py-1 ${c}`}>{v}</td>
                    <td className={`px-2 py-1 font-bold ${c}`}>{f}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div 
              onClick={() => toggleHighlight("note")}
              className={`mt-4 rounded-md border-2 border-dashed border-amber-400 bg-amber-100/60 p-3 italic text-[13px] leading-snug transition-colors ${isHighlighted("note") ? "ring-4 ring-yellow-300" : ""}`}
            >
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

          {/* Tab Content */}
          <div className="space-y-3 min-h-[400px]">
            {tab === "alerts" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                {drugAlerts.map((a, i) => (
                  <DrugAlertCard 
                    key={i} 
                    alert={a} 
                    patientId={patient.id} 
                    onResolve={() => resolveAlert(patient.id)}
                    onUnresolve={() => unresolveAlert(patient.id)}
                  />
                ))}
              </div>
            )}

            {tab === "metrics" && (
              <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Kidney Function Trend</h3>
                    <TrendingUp className="size-4 text-critical" />
                  </div>
                  <div className="h-48 bg-muted/20 rounded flex items-end justify-between p-4 gap-2">
                    {[35, 32, 28, 26, 28].map((v, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t relative group" style={{ height: `${v * 2}px` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>May 06</span>
                    <span>May 07</span>
                    <span>May 08</span>
                    <span>May 09</span>
                    <span>Today</span>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold mb-4">Vitals Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface rounded-lg border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Blood Pressure</div>
                      <div className="text-lg font-bold">138/82</div>
                    </div>
                    <div className="p-3 bg-surface rounded-lg border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Heart Rate</div>
                      <div className="text-lg font-bold">88 <span className="text-xs font-normal">bpm</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "history" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                {patient.medications.map((med, idx) => (
                  <div key={med} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Pill className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{med}</div>
                      <div className="text-[10px] text-muted-foreground">Active Medication · Patient Registry {patient.id}</div>
                    </div>
                    <button className="text-[10px] font-bold text-primary hover:underline">Details</button>
                  </div>
                ))}
              </div>
            )}

            {tab === "log" && (
              <div className="space-y-4 p-2 animate-in fade-in slide-in-from-right-4">
                {[
                  { date: patient.lastVisit, event: "Last Clinical Encounter", detail: `Follow-up visit regarding ${patient.diagnosis}.` },
                  { date: "12 Apr 2026", event: "Routine Review", detail: "General health screening and medication reconciliation." },
                  { date: "05 Jan 2026", event: "Historical Entry", detail: "Initial baseline assessment performed." },
                ].map((item, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-border">
                    <div className="absolute left-[-5px] top-1.5 size-2 rounded-full bg-primary" />
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">{item.date}</div>
                    <div className="text-sm font-semibold mt-0.5">{item.event}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DrugAlertCard({ 
  alert: a, 
  onResolve, 
  onUnresolve 
}: { 
  alert: typeof drugAlerts[number], 
  patientId: string,
  onResolve: () => void,
  onUnresolve: () => void
}) {
  const [open, setOpen] = useState(a.open);
  const [isResolved, setIsResolved] = useState(false);
  const isCritical = a.severity === "critical";

  const handleResolve = () => {
    setIsResolved(true);
    onResolve();
  };

  const handleUnresolve = () => {
    setIsResolved(false);
    onUnresolve();
  };

  if (isResolved) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center justify-between animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="size-6 rounded-full bg-success/20 flex items-center justify-center text-success">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">{a.title}</div>
        </div>
        <button 
          onClick={handleUnresolve}
          className="text-[10px] font-bold text-primary hover:underline"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border-2 transition-all duration-300 ${
        isCritical ? "border-critical/60 bg-critical-soft" : "border-warning/50 bg-warning-soft"
      } overflow-hidden shadow-sm`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left group"
      >
        <div
          className={`size-7 shrink-0 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 ${
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
          <div className="text-sm font-semibold mt-1.5 group-hover:text-primary transition-colors">{a.title}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {a.drugs.map((d) => (
              <span
                key={d}
                className="text-[11px] px-2 py-0.5 rounded-md bg-surface-elevated/80 border border-border text-foreground/90 inline-flex items-center gap-1 shadow-sm"
              >
                <Pill className="size-3" /> {d}
              </span>
            ))}
          </div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Why this matters</div>
            <p className="text-sm text-foreground/90 leading-relaxed">{a.why}</p>
          </div>

          <div className="rounded-lg border border-info/30 bg-info-soft p-3 shadow-inner">
            <div className="text-[10px] uppercase tracking-wider text-info font-bold mb-1 flex items-center gap-1.5">
              <Sparkles className="size-3" /> AI Recommendation
            </div>
            <p className="text-sm text-foreground/90 leading-snug">{a.rec}</p>
          </div>

          {isCritical && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button 
                onClick={handleResolve}
                className="rounded-lg border border-border bg-surface-elevated text-sm font-medium py-2.5 hover:bg-accent transition active:scale-95"
              >
                Defer
              </button>
              <button 
                onClick={handleResolve}
                className="rounded-lg bg-critical text-critical-foreground text-sm font-semibold py-2.5 inline-flex items-center justify-center gap-2 hover:opacity-90 transition shadow-glow active:scale-95"
              >
                <Lock className="size-3.5" /> Sign & Override Warning
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
