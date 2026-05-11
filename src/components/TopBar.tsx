import { AlertTriangle, Calendar, ChevronDown, Bell, ShieldAlert, Pill, X, Clock } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { mockPatients } from "@/lib/mock-data";

export function TopBar() {
  const [showAlerts, setShowAlerts] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();

  // Track recently viewed patients
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("recent_patients");
    return saved ? JSON.parse(saved) : [];
  });

  // Safely find the patientId from active matches
  const patientId = useMemo(() => {
    const patientMatch = routerState.matches.find(m => m.routeId === "/patient/$patientId");
    return (patientMatch?.params as any)?.patientId;
  }, [routerState.matches]);

  // Update recent list when patientId changes
  useEffect(() => {
    if (patientId) {
      setRecentIds(prev => {
        const next = [patientId, ...prev.filter(id => id !== patientId)].slice(0, 5);
        localStorage.setItem("recent_patients", JSON.stringify(next));
        return next;
      });
    }
  }, [patientId]);

  const patient = useMemo(() => {
    return mockPatients.find(p => p.id === patientId) || mockPatients[0];
  }, [patientId]);

  const recentPatients = useMemo(() => {
    // Show recent ones excluding the current one
    return recentIds
      .filter(id => id !== patientId)
      .map(id => mockPatients.find(p => p.id === id))
      .filter((p): p is typeof mockPatients[0] => !!p);
  }, [recentIds, patientId]);

  const notifications = useMemo(() => {
    if (patient.id === "1") {
      return [
        { type: "critical", msg: "Potassium levels rising (5.8 mEq/L)", time: "2m ago" },
        { type: "critical", msg: "Contraindicated: Metformin + Contrast", time: "15m ago" },
        { type: "warning", msg: "Lisinopril dosage review required", time: "1h ago" },
      ];
    }
    if (patient.id === "2") {
      return [
        { type: "critical", msg: "Recent AFib episode detected", time: "5m ago" },
        { type: "warning", msg: "INR check required", time: "30m ago" },
      ];
    }
    return [
      { type: "critical", msg: `New clinical event for ${patient.name}`, time: "10m ago" },
      { type: "warning", msg: "Medication review due", time: "2h ago" },
    ];
  }, [patient]);

  const handleAlertClick = () => {
    if (patientId) {
      navigate({
        to: "/patient/$patientId",
        params: { patientId },
        search: { tab: "alerts" },
        replace: true
      });
      setShowAlerts(false);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = recentIds.filter(rid => rid !== id);
    setRecentIds(next);
    localStorage.setItem("recent_patients", JSON.stringify(next));
    if (patientId === id) {
      navigate({ to: "/" });
    }
  };

  const handleSwitchPatient = (id: string) => {
    navigate({ to: "/patient/$patientId", params: { patientId: id } });
  };

  const [showSwitcher, setShowSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(() => {
    return mockPatients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.includes(searchQuery)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleOpenPatient = (id: string) => {
    handleSwitchPatient(id);
    setShowSwitcher(false);
    setSearchQuery("");
  };

  return (
    <header className="h-[68px] shrink-0 border-b border-border bg-surface/60 backdrop-blur flex items-center px-4 gap-4 relative z-50 overflow-hidden">
      <div className="flex-1 flex items-center h-full overflow-x-auto no-scrollbar gap-1">
        {recentIds.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground animate-in fade-in slide-in-from-left-4 duration-500">
            <ShieldAlert className="size-4 opacity-50" />
            <span className="text-xs font-medium uppercase tracking-widest">No Active Sessions</span>
          </div>
        ) : (
          <div className="flex items-end h-full pt-2 gap-1">
            {recentIds.map((id) => {
              const p = mockPatients.find(mp => mp.id === id);
              if (!p) return null;
              const isActive = patientId === id;

              return (
                <button
                  key={id}
                  onClick={() => handleSwitchPatient(id)}
                  className={`group relative flex items-center gap-3 px-4 h-[46px] rounded-t-xl border-t border-x transition-all min-w-[160px] max-w-[240px] truncate ${isActive
                      ? "bg-surface border-border text-foreground shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-surface/40"
                    }`}
                >
                  <div className={`size-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                    {p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-xs font-bold truncate w-full">{p.name}</span>
                    <span className="text-[9px] font-medium opacity-60 truncate">MRN: {p.mrn}</span>
                  </div>
                  <button
                    onClick={(e) => handleCloseTab(e, id)}
                    className={`ml-auto p-1 rounded-md hover:bg-muted transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    <X className="size-3" />
                  </button>
                  {isActive && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary z-10" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {/* Global Notifications/Status always visible on the right */}
        {patientId && (
          <div className="flex items-center gap-2 mr-2 animate-in fade-in duration-300">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-critical-soft text-critical text-xs font-bold hover:bg-critical hover:text-critical-foreground transition-all"
            >
              <ShieldAlert className="size-3.5" /> 2 Critical
            </button>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning-soft text-warning text-xs font-bold hover:bg-warning hover:text-warning-foreground transition-all"
            >
              <AlertTriangle className="size-3.5" /> 1 Warning
            </button>
          </div>
        )}

        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated border border-border text-muted-foreground text-[10px] font-bold uppercase">
          <Calendar className="size-3" /> 10 May 2026
        </span>

        <button className="flex items-center gap-2 pl-4 border-l border-border ml-2 group">
          <div className="flex flex-col items-end mr-1 hidden sm:flex">
            <span className="text-xs font-bold text-foreground">Dr. A. Chen, MD</span>
            <span className="text-[10px] text-muted-foreground font-medium">Attending Physician</span>
          </div>
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-chart-5 p-0.5 group-hover:ring-2 ring-primary/20 transition-all shadow-sm">
            <div className="size-full rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white bg-primary/20">
              AC
            </div>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* Alerts Dropdown Logic (re-used) */}
      {showAlerts && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
          <div className="absolute top-[60px] right-6 w-80 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Dropdown content... */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="text-[10px] font-bold uppercase tracking-wider text-foreground">Active Clinical Alerts</div>
              <button onClick={() => setShowAlerts(false)}><X className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={i} onClick={handleAlertClick} className="p-4 hover:bg-accent/40 transition-colors cursor-pointer group">
                  <div className="flex gap-3">
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === "critical" ? "bg-critical text-critical-foreground" : "bg-warning text-warning-foreground"}`}>
                      {n.type === "critical" ? <ShieldAlert className="size-4" /> : <AlertTriangle className="size-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium group-hover:text-primary transition-colors">{n.msg}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 font-medium">{n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

