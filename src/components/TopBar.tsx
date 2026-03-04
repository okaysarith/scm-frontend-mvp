import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StatusCount {
  healthy: number;
  warning: number;
  critical: number;
}

interface TopBarProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  statusCounts: StatusCount;
}

const PHONE_MODELS = ["ALL", "Flagship", "Mid-Range", "Budget"];

export default function TopBar({ selectedModel, onModelChange, statusCounts }: TopBarProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">📱</span>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Mobile Manufacturing Supply Chain Digital Twin
        </h1>
      </div>

      {/* Center: Model Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Filter:</span>
        <div className="flex gap-1.5">
          {PHONE_MODELS.map((model) => (
            <button
              key={model}
              onClick={() => onModelChange(model)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                selectedModel === model
                  ? "bg-primary text-primary-foreground shadow-glow-primary"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Status Indicators */}
      <div className="flex items-center gap-4">
        <StatusBadge 
          label="Normal" 
          count={statusCounts.healthy} 
          variant="healthy" 
        />
        <StatusBadge 
          label="Warning" 
          count={statusCounts.warning} 
          variant="warning" 
        />
        <StatusBadge 
          label="Critical" 
          count={statusCounts.critical} 
          variant="critical" 
        />
      </div>
    </header>
  );
}

interface StatusBadgeProps {
  label: string;
  count: number;
  variant: 'healthy' | 'warning' | 'critical';
}

function StatusBadge({ label, count, variant }: StatusBadgeProps) {
  const variantStyles = {
    healthy: "bg-status-healthy/20 text-status-healthy border-status-healthy/30",
    warning: "bg-status-warning/20 text-status-warning border-status-warning/30",
    critical: "bg-status-critical/20 text-status-critical border-status-critical/30",
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono",
      variantStyles[variant]
    )}>
      <span className="w-2 h-2 rounded-full bg-current animate-pulse-glow" />
      <span className="font-medium">{count}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}
