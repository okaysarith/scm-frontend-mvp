// NavigationSidebar - Main navigation for all backend features
// Provides access to ML endpoints, telemetry, what-if analysis, and other features

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  BarChart3,
  Activity,
  TrendingUp,
  Settings,
  Database,
  MapPin,
  Home,
  ChevronRight,
  Zap,
  Network
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: <Home className="h-4 w-4" />,
        description: "Supply chain overview"
      }
    ]
  },
  {
    title: "Real-time Features",
    items: [
      {
        title: "Live Dashboard",
        href: "/live",
        icon: <Activity className="h-4 w-4" />,
        badge: "Live",
        description: "Real-time IoT monitoring"
      },
      {
        title: "Telemetry",
        href: "/telemetry",
        icon: <Activity className="h-4 w-4" />,
        badge: "Live",
        description: "Real-time sensor data"
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: <BarChart3 className="h-4 w-4" />,
        badge: "15 Charts",
        description: "Comprehensive graphs"
      },
      {
        title: "Device Details",
        href: "/devices",
        icon: <Database className="h-4 w-4" />,
        description: "IoT device management"
      }
    ]
  },
  {
    title: "Analytics & ML",
    items: [
      {
        title: "Network Analysis",
        href: "/network",
        icon: <Network className="h-4 w-4" />,
        badge: "New",
        description: "Hub optimization & compliance"
      },
      {
        title: "ML Predictions",
        href: "/ml",
        icon: <Brain className="h-4 w-4" />,
        badge: "AI",
        description: "Machine learning models"
      },
      {
        title: "What-If Analysis",
        href: "/what-if",
        icon: <BarChart3 className="h-4 w-4" />,
        description: "Scenario simulation"
      },
      {
        title: "Telemetry Analytics",
        href: "/analytics",
        icon: <Activity className="h-4 w-4" />,
        badge: "Charts",
        description: "Data visualization"
      },
      {
        title: "Supply Chain Map",
        href: "/map",
        icon: <MapPin className="h-4 w-4" />,
        description: "Geographic visualization"
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "API Status",
        href: "/api",
        icon: <Settings className="h-4 w-4" />,
        description: "Backend endpoints"
      }
    ]
  }
];

export default function NavigationSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">SCM Digital Twin</h2>
            <p className="text-xs text-muted-foreground">Navigation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Button
                    key={item.href}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      isActive(item.href) && "bg-primary/10 text-primary"
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded",
                        isActive(item.href) ? "bg-primary/20" : "bg-muted"
                      )}>
                        {item.icon}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {isActive(item.href) && (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Backend Connected</span>
          </div>
          <div>ML Endpoints: /api/ML/*</div>
          <div>Telemetry: /api/telemetry/*</div>
        </div>
      </div>
    </div>
  );
}
