import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { usePatients } from "@/contexts/PatientContext";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  Users, 
  UserPlus, 
  MoreHorizontal,
  ChevronRight,
  X
} from "lucide-react";

export const Route = createFileRoute("/patient/")({
  component: PatientsListPage,
});

function PatientsListPage() {
  const { patients } = usePatients();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.mrn.includes(search) || 
                            p.dept.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter ? p.risk === riskFilter : true;
      return matchesSearch && matchesRisk;
    });
  }, [patients, search, riskFilter]);

  const highRiskCount = useMemo(() => patients.filter(p => p.risk === "HIGH").length, [patients]);
  const criticalAlertsCount = useMemo(() => patients.reduce((acc, p) => acc + p.alerts, 0), [patients]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Patient Management</div>
          <h1 className="text-2xl font-semibold mt-1">Patient Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Managing {filteredPatients.length} patients in the current view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {riskFilter && (
            <button 
              onClick={() => setRiskFilter(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-primary text-xs font-semibold transition"
            >
              Clear Filter <X className="size-3" />
            </button>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border text-sm font-medium hover:bg-accent transition shadow-sm">
            <Filter className="size-4" /> Advanced
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-sm">
            <UserPlus className="size-4" /> Add Patient
          </button>
        </div>
      </div>

      {/* Search and Quick Stats */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name, MRN, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition shadow-sm"
          />
        </div>
        <div className="col-span-12 lg:col-span-4 flex items-center gap-3">
          <button 
            onClick={() => setRiskFilter(riskFilter === "HIGH" ? null : "HIGH")}
            className={`flex-1 rounded-xl border px-4 py-2.5 flex items-center justify-between transition-all ${
              riskFilter === "HIGH" ? "border-critical bg-critical-soft ring-2 ring-critical/20" : "border-border bg-card hover:border-critical/30"
            }`}
          >
            <div className="text-xs text-muted-foreground">High Risk</div>
            <div className="text-sm font-bold text-critical">{highRiskCount}</div>
          </button>
          <div className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total Alerts</div>
            <div className="text-sm font-bold text-critical">{criticalAlertsCount}</div>
          </div>
        </div>
      </div>

      {/* Risk Filter Pills */}
      <div className="flex gap-2">
        {["HIGH", "MED", "LOW"].map((risk) => (
          <button
            key={risk}
            onClick={() => setRiskFilter(riskFilter === risk ? null : risk)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition ${
              riskFilter === risk 
                ? (risk === "HIGH" ? "bg-critical text-critical-foreground" : risk === "MED" ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground")
                : "bg-surface-elevated text-muted-foreground hover:bg-accent border border-border"
            }`}
          >
            {risk} RISK
          </button>
        ))}
      </div>

      {/* Patients Table/List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm min-h-[400px]">
        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-[11px]">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-muted-foreground">Patient Info</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-muted-foreground">Status & Alerts</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="group hover:bg-accent/30 transition-colors animate-in fade-in duration-300">
                    <td className="px-6 py-4">
                      <Link 
                        to="/patient/$patientId" 
                        params={{ patientId: p.id }}
                        className="flex items-center gap-4 group/link"
                      >
                        <div className="size-10 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-primary group-hover/link:ring-2 group-hover/link:ring-primary/30 transition">
                          {p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold group-hover/link:text-primary transition">{p.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">MRN {p.mrn} · {p.age} · {p.gender}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                          p.risk === "HIGH" 
                            ? "bg-critical-soft border-critical-soft text-critical" 
                            : p.risk === "MED" 
                              ? "bg-warning-soft border-warning-soft text-warning" 
                              : "bg-success-soft border-success-soft text-success"
                        }`}>
                          {p.risk} RISK
                        </span>
                        {p.alerts > 0 && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-critical">
                            <div className="size-1.5 rounded-full bg-critical animate-pulse" />
                            {p.alerts} Alert{p.alerts > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-foreground/80 px-2.5 py-1 rounded-full bg-surface-elevated border border-border">
                        {p.dept}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to="/patient/$patientId" 
                          params={{ patientId: p.id }}
                          className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                        >
                          <ChevronRight className="size-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="size-12 text-muted/30 mb-4" />
            <div className="text-lg font-semibold text-foreground">No patients found</div>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setSearch(""); setRiskFilter(null); }}
              className="mt-6 text-sm font-medium text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Footer / Pagination Mock */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div>Showing 1-{filteredPatients.length} of {filteredPatients.length} patients</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded border border-border bg-card opacity-50 cursor-not-allowed">Prev</button>
            <button className="px-3 py-1 rounded border border-primary bg-primary/10 text-primary font-medium">1</button>
            <button className="px-3 py-1 rounded border border-border bg-card opacity-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

