import { AlertTriangle, Calendar, ChevronDown } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-[68px] shrink-0 border-b border-border bg-surface/60 backdrop-blur flex items-center px-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-accent flex items-center justify-center text-primary font-semibold text-sm">
          MR
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Margaret R. Collins</div>
          <div className="text-xs text-muted-foreground">
            DOB: 12 Mar 1948 (78Y) · MRN: 847201 · Nephrology
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-critical-soft border border-critical-soft text-critical text-xs font-semibold">
          <AlertTriangle className="size-3.5" /> 2 Critical
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning-soft border border-warning-soft text-warning text-xs font-semibold">
          <AlertTriangle className="size-3.5" /> 1 Warning
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated border border-border text-muted-foreground text-xs font-medium">
          <Calendar className="size-3.5" /> 10 May 2026 · 14:32
        </span>
        <button className="ml-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-elevated border border-border text-sm hover:bg-accent transition-colors">
          <div className="size-7 rounded-full bg-gradient-to-br from-primary to-chart-5" />
          <span className="font-medium">Dr. A. Chen, MD</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
