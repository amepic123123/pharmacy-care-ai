import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  HeartPulse,
  Pill,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const metrics = [
  { label: "Active Patients", value: "248", change: "+12", icon: Users, tone: "info" },
  { label: "Critical Alerts", value: "7", change: "+3 today", icon: ShieldAlert, tone: "critical" },
  { label: "AI Reviews Today", value: "1,284", change: "98.7% accuracy", icon: Brain, tone: "success" },
  { label: "Avg. Review Time", value: "2.3m", change: "-18% vs last week", icon: TrendingUp, tone: "info" },
];

const toneMap: Record<string, string> = {
  critical: "text-critical bg-critical-soft",
  warning: "text-warning bg-warning-soft",
  success: "text-success bg-success-soft",
  info: "text-info bg-info-soft",
};

const patients = [
  { name: "Margaret R. Collins", mrn: "847201", dept: "Nephrology", risk: "HIGH", alerts: 2, age: "78Y" },
  { name: "James O. Mendez", mrn: "847188", dept: "Cardiology", risk: "MED", alerts: 1, age: "64Y" },
  { name: "Aisha Patel", mrn: "847150", dept: "Oncology", risk: "HIGH", alerts: 3, age: "52Y" },
  { name: "Robert Hayashi", mrn: "847102", dept: "Internal Med", risk: "LOW", alerts: 0, age: "71Y" },
  { name: "Elena Costa", mrn: "847011", dept: "Endocrinology", risk: "MED", alerts: 1, age: "45Y" },
];

const alerts = [
  {
    severity: "critical",
    title: "Contraindicated Drug Combination",
    patient: "Margaret R. Collins",
    detail: "Metformin + Contrast Dye — eGFR 28",
    time: "2m ago",
  },
  {
    severity: "critical",
    title: "Dangerous Bleeding Risk",
    patient: "James O. Mendez",
    detail: "Warfarin + Ibuprofen co-administration",
    time: "14m ago",
  },
  {
    severity: "warning",
    title: "Elevated Potassium Level",
    patient: "Margaret R. Collins",
    detail: "K+ 5.8 mEq/L — review ACE inhibitor dose",
    time: "31m ago",
  },
  {
    severity: "warning",
    title: "Renal Dose Adjustment Needed",
    patient: "Aisha Patel",
    detail: "Vancomycin trough 24 µg/mL",
    time: "1h ago",
  },
];

const insights = [
  "12 patients on metformin require eGFR re-check this week.",
  "3 cardiology patients show INR drift — consider warfarin clinic referral.",
  "New evidence: SGLT2 inhibitors recommended for CKD Stage 3 with diabetes.",
];

const activity = [
  { who: "Dr. A. Chen", what: "Signed override for Margaret R. Collins", when: "14:28" },
  { who: "Pharm. K. Liu", what: "Verified vancomycin dose for Aisha Patel", when: "13:55" },
  { who: "AI Assistant", what: "Flagged 4 new interactions in morning rounds", when: "08:12" },
  { who: "Dr. M. Okafor", what: "Updated care plan for James O. Mendez", when: "Yesterday" },
];

function Dashboard() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Command center</div>
          <h1 className="text-2xl font-semibold mt-1">Good afternoon, Dr. Chen</h1>
          <p className="text-sm text-muted-foreground mt-1">
            7 critical alerts across 248 active patients · AI reviewed 1,284 orders today
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border text-sm hover:bg-accent transition">
            <FileSearch className="size-4" /> Search records
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
            <Plus className="size-4" /> New review
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className={`size-10 rounded-lg flex items-center justify-center ${toneMap[m.tone]}`}>
                <m.icon className="size-5" />
              </div>
              <span className="text-xs text-muted-foreground">{m.change}</span>
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight">{m.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Active Cases */}
        <div className="col-span-12 xl:col-span-7 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-base font-semibold">Active Patient Cases</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sorted by risk · last 24 hours</p>
            </div>
            <Link to="/patient" className="text-xs text-primary inline-flex items-center gap-1">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {patients.map((p, index) => (
              <Link
                key={p.mrn}
                to="/patient/$patientId"
                params={{ patientId: (index + 1).toString() }} // Using index+1 as mock ID for now
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/40 transition"
              >
                <div className="size-9 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    MRN {p.mrn} · {p.dept} · {p.age}
                  </div>
                </div>
                {p.alerts > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-critical-soft text-critical font-medium">
                    {p.alerts} alert{p.alerts > 1 ? "s" : ""}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    p.risk === "HIGH"
                      ? "bg-critical-soft text-critical"
                      : p.risk === "MED"
                      ? "bg-warning-soft text-warning"
                      : "bg-success-soft text-success"
                  }`}
                >
                  {p.risk} RISK
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="col-span-12 xl:col-span-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-critical" />
              <h2 className="text-base font-semibold">Recent Critical Alerts</h2>
            </div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <div className="p-3 space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3.5 ${
                  a.severity === "critical"
                    ? "border-critical-soft bg-critical-soft"
                    : "border-warning-soft bg-warning-soft"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`size-7 shrink-0 rounded-md flex items-center justify-center ${
                      a.severity === "critical"
                        ? "bg-critical text-critical-foreground"
                        : "bg-warning text-warning-foreground"
                    }`}
                  >
                    <AlertTriangle className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide ${
                          a.severity === "critical" ? "text-critical" : "text-warning"
                        }`}
                      >
                        {a.severity}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                    </div>
                    <div className="text-sm font-medium mt-1">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.patient} — {a.detail}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="col-span-12 xl:col-span-7 rounded-xl border border-border bg-gradient-to-br from-card to-accent/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold">AI-Generated Clinical Insights</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-primary font-semibold">
              Updated 5 min ago
            </span>
          </div>
          <ul className="space-y-2.5">
            {insights.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                <span className="text-foreground/90">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activity */}
        <div className="col-span-12 xl:col-span-5 rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h2 className="text-base font-semibold">Activity Timeline</h2>
          </div>
          <ol className="p-5 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="relative">
                  <div className="size-2 rounded-full bg-primary mt-1.5" />
                  {i < activity.length - 1 && (
                    <div className="absolute left-1/2 top-3 -translate-x-1/2 w-px h-8 bg-border" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.when}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick actions */}
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: ClipboardList, label: "Order Review" },
            { icon: Pill, label: "Medication Reconciliation" },
            { icon: HeartPulse, label: "Risk Assessment" },
            { icon: FileSearch, label: "Document Analysis" },
          ].map((a) => (
            <button
              key={a.label}
              className="rounded-xl border border-border bg-card hover:bg-accent/40 transition p-4 flex items-center gap-3 text-left"
            >
              <div className="size-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <a.icon className="size-5" />
              </div>
              <span className="text-sm font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
