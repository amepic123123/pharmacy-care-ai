import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FlaskConical,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Patients", url: "/patient", icon: Users },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-[230px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-2.5 px-5 h-[68px] border-b border-sidebar-border">
        <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center">
          <FlaskConical className="size-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sidebar-foreground font-semibold text-[15px]">
            SmartPharm <span className="text-primary">AI</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            AI Clinical Assistant
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.url === "/" ? path === "/" : path.startsWith(item.url);
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className={`size-[18px] ${active ? "text-primary" : ""}`} />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-critical text-critical-foreground rounded-full size-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border text-xs text-muted-foreground">
        « Collapse
      </div>
    </aside>
  );
}
