import React from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'healthy' | 'warning' | 'critical';
  icon?: React.ReactNode;
}

export default function KPICard({ label, value, unit, trend, status = 'healthy', icon }: KPICardProps) {
  const statusStyles = {
    healthy: "border-status-healthy/30 shadow-[0_0_20px_hsl(var(--status-healthy)/0.1)]",
    warning: "border-status-warning/30 shadow-[0_0_20px_hsl(var(--status-warning)/0.1)]",
    critical: "border-status-critical/30 shadow-[0_0_20px_hsl(var(--status-critical)/0.1)]",
  };

  const valueStyles = {
    healthy: "text-status-healthy",
    warning: "text-status-warning",
    critical: "text-status-critical",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  return (
    <div className={cn(
      "bg-card rounded-lg border p-4 transition-all duration-300 hover:scale-[1.02]",
      statusStyles[status]
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-lg opacity-60">{icon}</span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-3xl font-bold font-mono tracking-tight",
          valueStyles[status]
        )}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground font-medium">
            {unit}
          </span>
        )}
        {trend && (
          <span className={cn(
            "text-sm font-bold ml-auto",
            trend === 'up' && "text-status-healthy",
            trend === 'down' && "text-status-critical",
            trend === 'stable' && "text-muted-foreground"
          )}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}
