// ============================================
// SUPPLY CHAIN DIGITAL TWIN MAP SERVICE
// 12 DTDL Twins + 14 Routes
// ============================================

export interface TwinRelationship {
  type: string;
  target: string;
  label: string;
}

export interface TwinTelemetry {
  temperature?: number;
  defectRate?: number;
  assemblyRate?: number;
  inventoryLevel?: number;
  repairCapacity?: number;
  activeRepairs?: number;
  stockLevel?: number;
  salesRate?: number;
}

export interface SupplyChainTwin {
  id: string;
  name: string;
  type: 'manufacturing' | 'assembly' | 'storage' | 'retail' | 'after-sales';
  icon: string;
  city: string;
  model: string;
  product: string;
  lat: number;
  lon: number;
  x: number; // Percentage x position on map
  y: number; // Percentage y position on map
  telemetry: TwinTelemetry;
  relationships: TwinRelationship[];
  status: 'healthy' | 'warning' | 'critical' | 'offline';
}

export interface Route {
  id: string;
  from: string;
  to: string;
  type: 'supplies' | 'distribution' | 'reverse_logistics' | 'returns';
  label: string;
  color: string;
  strokeWidth: number;
  strokeDasharray: string;
}

export const SUPPLY_CHAIN_TWINS: Record<string, SupplyChainTwin> = {
  // STAGE 1: COMPONENT MANUFACTURING
  CM44210: {
    id: "CM44210",
    name: "Component Manufacturing",
    type: "manufacturing",
    icon: "🏭",
    city: "Pune",
    model: "dtmi:demo:adtga:component_manufacturing;1",
    product: "ALL",
    lat: 18.5204,
    lon: 73.8567,
    x: 48,
    y: 62,
    telemetry: {
      temperature: 42,
      defectRate: 0.015,
    },
    relationships: [
      { type: "supplies", target: "AP89114-23", label: "Components to North" },
      { type: "supplies", target: "AP89125-17", label: "Components to South" },
    ],
    status: "healthy",
  },

  // STAGE 2: ASSEMBLY PLANTS
  "AP89125-17": {
    id: "AP89125-17",
    name: "Assembly Plant South",
    type: "assembly",
    icon: "🏗",
    city: "Chennai",
    model: "dtmi:demo:adtga:assembly_plant;1",
    product: "Flagship",
    lat: 13.0827,
    lon: 80.2707,
    x: 55,
    y: 70,
    telemetry: {
      assemblyRate: 245,
      temperature: 38,
    },
    relationships: [
      { type: "receives", target: "CM44210", label: "Components from Manufacturing" },
      { type: "supplies", target: "SR90200", label: "Finished Goods to Warehouse" },
    ],
    status: "healthy",
  },

  "AP89114-23": {
    id: "AP89114-23",
    name: "Assembly Plant North",
    type: "assembly",
    icon: "🏗",
    city: "Noida",
    model: "dtmi:demo:adtga:assembly_plant;1",
    product: "Mid-Range",
    lat: 28.5355,
    lon: 77.391,
    x: 52,
    y: 35,
    telemetry: {
      assemblyRate: 210,
      temperature: 44,
    },
    relationships: [
      { type: "receives", target: "CM44210", label: "Components from Manufacturing" },
      { type: "supplies", target: "SR90200", label: "Finished Goods to Warehouse" },
    ],
    status: "warning",
  },

  // STAGE 3: CENTRAL WAREHOUSE
  SR90200: {
    id: "SR90200",
    name: "Central Warehouse",
    type: "storage",
    icon: "📦",
    city: "Nagpur",
    model: "dtmi:demo:adtga:storage_room;1",
    product: "ALL",
    lat: 21.1458,
    lon: 79.0882,
    x: 50,
    y: 52,
    telemetry: {
      inventoryLevel: 85,
      temperature: 25,
    },
    relationships: [
      { type: "receives", target: "AP89125-17", label: "From South Assembly" },
      { type: "receives", target: "AP89114-23", label: "From North Assembly" },
      { type: "supplies", target: "RD4465879", label: "To Mumbai Retail" },
      { type: "supplies", target: "RD4465858", label: "To Delhi Retail" },
      { type: "supplies", target: "RD4465859", label: "To Bengaluru Retail" },
      { type: "supplies", target: "RD4465860", label: "To Hyderabad Retail" },
      { type: "supplies", target: "RD4465861", label: "To Kolkata Retail" },
      { type: "supplies", target: "RD4465862", label: "To Ahmedabad Retail" },
    ],
    status: "healthy",
  },

  // STAGE 4: RETAIL DISTRIBUTION NODES
  RD4465879: {
    id: "RD4465879",
    name: "Retail Mumbai",
    type: "retail",
    icon: "🏪",
    city: "Mumbai",
    model: "dtmi:demo:adtga:retail_distribution;1",
    product: "ALL",
    lat: 19.076,
    lon: 72.8777,
    x: 42,
    y: 55,
    telemetry: {
      stockLevel: 450,
      salesRate: 32,
    },
    relationships: [
      { type: "receives", target: "SR90200", label: "From Central Warehouse" },
      { type: "supplies", target: "ASRL44600-01", label: "Returns to Service" },
    ],
    status: "healthy",
  },

  RD4465858: {
    id: "RD4465858",
    name: "Retail Delhi",
    type: "retail",
    icon: "🏪",
    city: "Delhi",
    model: "dtmi:demo:adtga:retail_distribution;1",
    product: "Flagship",
    lat: 28.7041,
    lon: 77.1025,
    x: 50,
    y: 28,
    telemetry: {
      stockLevel: 380,
      salesRate: 45,
    },
    relationships: [
      { type: "receives", target: "SR90200", label: "From Central Warehouse" },
    ],
    status: "healthy",
  },

  RD4465859: {
    id: "RD4465859",
    name: "Retail Bengaluru",
    type: "retail",
    icon: "🏪",
    city: "Bengaluru",
    model: "dtmi:demo:adtga:retail_distribution;1",
    product: "Budget",
    lat: 12.9716,
    lon: 77.5946,
    x: 52,
    y: 75,
    telemetry: {
      stockLevel: 520,
      salesRate: 38,
    },
    relationships: [
      { type: "receives", target: "SR90200", label: "From Central Warehouse" },
      { type: "supplies", target: "ASRL44600-02", label: "Returns to Service" },
    ],
    status: "healthy",
  },

  RD4465860: {
    id: "RD4465860",
    name: "Retail Hyderabad",
    type: "retail",
    icon: "🏪",
    city: "Hyderabad",
    model: "dtmi:demo:adtga:retail_distribution;1",
    product: "Mid-Range",
    lat: 17.385,
    lon: 78.4867,
    x: 55,
    y: 62,
    telemetry: {
      stockLevel: 290,
      salesRate: 28,
    },
    relationships: [
      { type: "receives", target: "SR90200", label: "From Central Warehouse" },
    ],
    status: "warning",
  },

  RD4465861: {
    id: "RD4465861",
    name: "Retail Kolkata",
    type: "retail",
    icon: "🏪",
    city: "Kolkata",
    model: "dtmi:demo:adtga:retail_distribution;1",
    product: "Budget",
    lat: 22.5726,
    lon: 88.3639,
    x: 68,
    y: 48,
    telemetry: {
      stockLevel: 180,
      salesRate: 22,
    },
    relationships: [
      { type: "receives", target: "SR90200", label: "From Central Warehouse" },
    ],
    status: "critical",
  },

  RD4465862: {
    id: "RD4465862",
    name: "Retail Ahmedabad",
    type: "retail",
    icon: "🏪",
    city: "Ahmedabad",
    model: "dtmi:demo:adtga:retail_distribution;1",
    product: "Mid-Range",
    lat: 23.0225,
    lon: 72.5714,
    x: 40,
    y: 45,
    telemetry: {
      stockLevel: 340,
      salesRate: 25,
    },
    relationships: [
      { type: "receives", target: "SR90200", label: "From Central Warehouse" },
    ],
    status: "healthy",
  },

  // STAGE 5: AFTER-SALES SERVICE
  "ASRL44600-01": {
    id: "ASRL44600-01",
    name: "Service Center North",
    type: "after-sales",
    icon: "🔧",
    city: "Gurgaon",
    model: "dtmi:demo:adtga:after_sales;1",
    product: "ALL",
    lat: 28.4595,
    lon: 77.0266,
    x: 48,
    y: 32,
    telemetry: {
      repairCapacity: 100,
      activeRepairs: 45,
    },
    relationships: [
      { type: "receives", target: "RD4465879", label: "Returns from Mumbai" },
      { type: "supplies", target: "SR90200", label: "Refurbished to Warehouse" },
    ],
    status: "healthy",
  },

  "ASRL44600-02": {
    id: "ASRL44600-02",
    name: "Service Center South",
    type: "after-sales",
    icon: "🔧",
    city: "Bengaluru",
    model: "dtmi:demo:adtga:after_sales;1",
    product: "ALL",
    lat: 12.9352,
    lon: 77.6245,
    x: 54,
    y: 78,
    telemetry: {
      repairCapacity: 80,
      activeRepairs: 72,
    },
    relationships: [
      { type: "receives", target: "RD4465859", label: "Returns from Bengaluru Retail" },
      { type: "supplies", target: "SR90200", label: "Refurbished to Warehouse" },
    ],
    status: "warning",
  },
};

export const ROUTES: Route[] = [
  // Forward Supply - Component to Assembly (Blue)
  {
    id: "CM-AP-N",
    from: "CM44210",
    to: "AP89114-23",
    type: "supplies",
    label: "Material Supply",
    color: "#0099ff",
    strokeWidth: 2.5,
    strokeDasharray: "none",
  },
  {
    id: "CM-AP-S",
    from: "CM44210",
    to: "AP89125-17",
    type: "supplies",
    label: "Material Supply",
    color: "#0099ff",
    strokeWidth: 2.5,
    strokeDasharray: "none",
  },

  // Assembly to Warehouse (Green)
  {
    id: "AP-N-SR",
    from: "AP89114-23",
    to: "SR90200",
    type: "supplies",
    label: "Assembled Units",
    color: "#00d084",
    strokeWidth: 2.5,
    strokeDasharray: "none",
  },
  {
    id: "AP-S-SR",
    from: "AP89125-17",
    to: "SR90200",
    type: "supplies",
    label: "Assembled Units",
    color: "#00d084",
    strokeWidth: 2.5,
    strokeDasharray: "none",
  },

  // Distribution - Warehouse to Retail (Orange Dashed)
  {
    id: "SR-RD-Mumbai",
    from: "SR90200",
    to: "RD4465879",
    type: "distribution",
    label: "Distribution",
    color: "#ffa502",
    strokeWidth: 1.8,
    strokeDasharray: "6,4",
  },
  {
    id: "SR-RD-Delhi",
    from: "SR90200",
    to: "RD4465858",
    type: "distribution",
    label: "Distribution",
    color: "#ffa502",
    strokeWidth: 1.8,
    strokeDasharray: "6,4",
  },
  {
    id: "SR-RD-Bengaluru",
    from: "SR90200",
    to: "RD4465859",
    type: "distribution",
    label: "Distribution",
    color: "#ffa502",
    strokeWidth: 1.8,
    strokeDasharray: "6,4",
  },
  {
    id: "SR-RD-Hyderabad",
    from: "SR90200",
    to: "RD4465860",
    type: "distribution",
    label: "Distribution",
    color: "#ffa502",
    strokeWidth: 1.8,
    strokeDasharray: "6,4",
  },
  {
    id: "SR-RD-Kolkata",
    from: "SR90200",
    to: "RD4465861",
    type: "distribution",
    label: "Distribution",
    color: "#ffa502",
    strokeWidth: 1.8,
    strokeDasharray: "6,4",
  },
  {
    id: "SR-RD-Ahmedabad",
    from: "SR90200",
    to: "RD4465862",
    type: "distribution",
    label: "Distribution",
    color: "#ffa502",
    strokeWidth: 1.8,
    strokeDasharray: "6,4",
  },

  // Reverse Logistics - Retail to Service (Red Dashed)
  {
    id: "RD-Mumbai-ASRL-G",
    from: "RD4465879",
    to: "ASRL44600-01",
    type: "reverse_logistics",
    label: "Returns & Support",
    color: "#ff4757",
    strokeWidth: 1.5,
    strokeDasharray: "4,3",
  },
  {
    id: "RD-Bengaluru-ASRL-B",
    from: "RD4465859",
    to: "ASRL44600-02",
    type: "reverse_logistics",
    label: "Returns & Support",
    color: "#ff4757",
    strokeWidth: 1.5,
    strokeDasharray: "4,3",
  },

  // Returns - Service to Warehouse (Purple Dotted)
  {
    id: "ASRL-G-SR",
    from: "ASRL44600-01",
    to: "SR90200",
    type: "returns",
    label: "Reverse Flow",
    color: "#9c27b0",
    strokeWidth: 1.2,
    strokeDasharray: "3,5",
  },
  {
    id: "ASRL-B-SR",
    from: "ASRL44600-02",
    to: "SR90200",
    type: "returns",
    label: "Reverse Flow",
    color: "#9c27b0",
    strokeWidth: 1.2,
    strokeDasharray: "3,5",
  },
];

// Helper Functions
export function getAllMapTwins(): SupplyChainTwin[] {
  return Object.values(SUPPLY_CHAIN_TWINS);
}

export function getTwinById(id: string): SupplyChainTwin | undefined {
  return SUPPLY_CHAIN_TWINS[id];
}

export function getTwinsByType(type: SupplyChainTwin['type']): SupplyChainTwin[] {
  return Object.values(SUPPLY_CHAIN_TWINS).filter(twin => twin.type === type);
}

export function getTwinsByProduct(product: string): SupplyChainTwin[] {
  if (product === 'ALL') return getAllMapTwins();
  return Object.values(SUPPLY_CHAIN_TWINS).filter(
    twin => twin.product === product || twin.product === 'ALL'
  );
}

export function getRoutes(): Route[] {
  return ROUTES;
}

export function getRoutesForTwin(twinId: string): Route[] {
  return ROUTES.filter(route => route.from === twinId || route.to === twinId);
}

export function getStatusColor(status: SupplyChainTwin['status']): string {
  switch (status) {
    case 'healthy': return 'hsl(150, 60%, 45%)';
    case 'warning': return 'hsl(38, 95%, 50%)';
    case 'critical': return 'hsl(0, 75%, 55%)';
    case 'offline': return 'hsl(220, 10%, 40%)';
    default: return 'hsl(220, 10%, 40%)';
  }
}

export function getTypeLabel(type: SupplyChainTwin['type']): string {
  switch (type) {
    case 'manufacturing': return 'Component Manufacturing';
    case 'assembly': return 'Assembly Plant';
    case 'storage': return 'Central Warehouse';
    case 'retail': return 'Retail Distribution';
    case 'after-sales': return 'After-Sales Service';
    default: return 'Unknown';
  }
}
