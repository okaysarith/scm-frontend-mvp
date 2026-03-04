import React from "react";

interface RouteLayerProps {
  selectedTwinId?: string | null;
}

/**
 * RouteLayer (Layer 3 – Visualization only)
 * Draws SVG lines connecting manufacturing flow:
 * CM44210 (Pune) → AP nodes → SR90200 → RD nodes
 */
export default function RouteLayer({ selectedTwinId }: RouteLayerProps) {
  // Normalized positions (% of container) – match hitbox positions from Map.scss
  const nodes: Record<string, { x: number; y: number }> = {
    "CM44210": { x: 48, y: 62 },        // Pune (Component Manufacturing)
    "AP89125-17": { x: 55, y: 78 },     // Chennai (Assembly Plant South)
    "AP89114-23": { x: 56, y: 28 },     // Noida (Assembly Plant North)
    "SR90200": { x: 52, y: 65 },        // Nagpur (Central Warehouse)
    "RD4465879": { x: 42, y: 68 },      // Mumbai
    "RD4465858": { x: 54, y: 24 },      // Delhi
    "RD4465859": { x: 52, y: 75 },      // Bengaluru
    "RD4465860": { x: 54, y: 72 },      // Hyderabad
    "RD4465861": { x: 68, y: 35 },      // Kolkata
    "RD4465862": { x: 44, y: 50 },      // Ahmedabad
    "ASRL44600-01": { x: 54, y: 25 },   // Gurgaon (After-Sales)
    "ASRL44600-02": { x: 52, y: 75 },   // Bengaluru (After-Sales)
  };

  // Supply chain flow routes
  const routes = [
    // Component Manufacturing to Assembly Plants (Blue - supplies)
    { id: "CM-AP-S", from: "CM44210", to: "AP89125-17", color: "#0099ff", dashed: false, type: "supplies" },
    { id: "CM-AP-N", from: "CM44210", to: "AP89114-23", color: "#0099ff", dashed: false, type: "supplies" },

    // Assembly Plants to Central Storage (Green - assembled units)
    { id: "AP-S-SR", from: "AP89125-17", to: "SR90200", color: "#00d084", dashed: false, type: "supplies" },
    { id: "AP-N-SR", from: "AP89114-23", to: "SR90200", color: "#00d084", dashed: false, type: "supplies" },

    // Central Storage to Retail Nodes (Orange dashed - distribution)
    { id: "SR-RD-Mumbai", from: "SR90200", to: "RD4465879", color: "#ffa502", dashed: true, type: "distribution" },
    { id: "SR-RD-Delhi", from: "SR90200", to: "RD4465858", color: "#ffa502", dashed: true, type: "distribution" },
    { id: "SR-RD-Bengaluru", from: "SR90200", to: "RD4465859", color: "#ffa502", dashed: true, type: "distribution" },
    { id: "SR-RD-Hyderabad", from: "SR90200", to: "RD4465860", color: "#ffa502", dashed: true, type: "distribution" },
    { id: "SR-RD-Kolkata", from: "SR90200", to: "RD4465861", color: "#ffa502", dashed: true, type: "distribution" },
    { id: "SR-RD-Ahmedabad", from: "SR90200", to: "RD4465862", color: "#ffa502", dashed: true, type: "distribution" },

    // Reverse Logistics: Retail → After-Sales (Red dashed)
    { id: "RD-Mumbai-ASRL", from: "RD4465879", to: "ASRL44600-01", color: "#ff4757", dashed: true, type: "reverse" },
    { id: "RD-Bengaluru-ASRL", from: "RD4465859", to: "ASRL44600-02", color: "#ff4757", dashed: true, type: "reverse" },

    // Returns: After-Sales → Storage (Purple dotted)
    { id: "ASRL-G-SR", from: "ASRL44600-01", to: "SR90200", color: "#9c27b0", dashed: true, type: "returns" },
    { id: "ASRL-B-SR", from: "ASRL44600-02", to: "SR90200", color: "#9c27b0", dashed: true, type: "returns" },
  ];

  // Check if route is connected to selected twin
  const isRouteHighlighted = (route: typeof routes[0]) => {
    if (!selectedTwinId) return false;
    return route.from === selectedTwinId || route.to === selectedTwinId;
  };

  return (
    <svg
      className="route-layer"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <style>{`
          .route-line {
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
            transition: opacity 150ms ease, stroke-width 150ms ease;
          }
          .route-dashed {
            stroke-dasharray: 4, 3;
          }
          .route-dotted {
            stroke-dasharray: 2, 2;
          }
          .route-dim {
            opacity: 0.2;
          }
          .route-highlight {
            opacity: 1;
            stroke-width: 0.8;
            filter: drop-shadow(0 0 2px currentColor);
          }
        `}</style>
      </defs>

      {/* Draw routes */}
      {routes.map((route) => {
        const fromNode = nodes[route.from];
        const toNode = nodes[route.to];

        if (!fromNode || !toNode) return null;

        const isHighlighted = isRouteHighlighted(route);
        const isDimmed = selectedTwinId && !isHighlighted;

        return (
          <line
            key={route.id}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            className={`route-line ${route.dashed ? (route.type === "returns" ? "route-dotted" : "route-dashed") : ""} ${isDimmed ? "route-dim" : ""} ${isHighlighted ? "route-highlight" : ""}`}
            stroke={route.color}
            strokeWidth={isHighlighted ? "0.8" : "0.5"}
            style={{ opacity: isDimmed ? 0.2 : (route.dashed ? 0.6 : 0.8) }}
          />
        );
      })}

      {/* Small anchor circles at nodes */}
      {Object.entries(nodes).map(([id, pos]) => {
        const isSelected = id === selectedTwinId;
        return (
          <circle
            key={`anchor-${id}`}
            cx={pos.x}
            cy={pos.y}
            r={isSelected ? "0.6" : "0.4"}
            fill={isSelected ? "rgba(34, 181, 115, 0.5)" : "none"}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.2"
          />
        );
      })}
    </svg>
  );
}
