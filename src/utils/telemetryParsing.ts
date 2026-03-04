// Telemetry parsing utilities and metric thresholds
// Handles location parsing and alert threshold rules

export interface Location {
  longitude: number;
  latitude: number;
}

// Parse POINT(lon lat) format from metadata
export function parseLocation(locationString: string): Location | null {
  if (!locationString || typeof locationString !== 'string') {
    return null;
  }

  // Match POINT(lon lat) pattern
  const pointMatch = locationString.match(/POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i);
  
  if (pointMatch) {
    const longitude = parseFloat(pointMatch[1]);
    const latitude = parseFloat(pointMatch[2]);
    
    if (!isNaN(longitude) && !isNaN(latitude)) {
      return { longitude, latitude };
    }
  }

  return null;
}

// Metric threshold rules per asset type
export interface ThresholdRule {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  severity: 'warning' | 'critical';
  message: string;
}

export interface AssetTypeThresholds {
  [assetType: string]: ThresholdRule[];
}

export const THRESHOLD_RULES: AssetTypeThresholds = {
  'raw_material_storage': [
    {
      metric: 'Ambient_Temperature',
      operator: 'gt',
      value: 30,
      severity: 'warning',
      message: 'High temperature detected'
    },
    {
      metric: 'Ambient_Temperature',
      operator: 'gt',
      value: 35,
      severity: 'critical',
      message: 'Critical temperature exceeded'
    },
    {
      metric: 'Humidity_Level',
      operator: 'gt',
      value: 60,
      severity: 'warning',
      message: 'High humidity level'
    },
    {
      metric: 'Humidity_Level',
      operator: 'gt',
      value: 70,
      severity: 'critical',
      message: 'Critical humidity level'
    }
  ],
  
  'manufacturing_line': [
    {
      metric: 'defectRate',
      operator: 'gt',
      value: 5,
      severity: 'warning',
      message: 'Elevated defect rate'
    },
    {
      metric: 'defectRate',
      operator: 'gt',
      value: 10,
      severity: 'critical',
      message: 'Critical defect rate'
    },
    {
      metric: 'assemblyRate',
      operator: 'lt',
      value: 0.5,
      severity: 'warning',
      message: 'Low assembly rate'
    },
    {
      metric: 'assemblyRate',
      operator: 'lt',
      value: 0.2,
      severity: 'critical',
      message: 'Critical assembly rate'
    }
  ],
  
  'finished_goods_storage': [
    {
      metric: 'inventoryLevel',
      operator: 'lt',
      value: 20,
      severity: 'warning',
      message: 'Low inventory level'
    },
    {
      metric: 'inventoryLevel',
      operator: 'lt',
      value: 10,
      severity: 'critical',
      message: 'Critical inventory level'
    }
  ],
  
  'quality_control': [
    {
      metric: 'qualityScore',
      operator: 'lt',
      value: 0.95,
      severity: 'warning',
      message: 'Quality score below threshold'
    },
    {
      metric: 'qualityScore',
      operator: 'lt',
      value: 0.90,
      severity: 'critical',
      message: 'Critical quality score'
    }
  ]
};

// Check if a device has any active alerts based on thresholds
export function checkDeviceAlerts(
  assetType: string, 
  telemetry: Record<string, number | string>
): ThresholdRule[] {
  const rules = THRESHOLD_RULES[assetType] || [];
  const activeAlerts: ThresholdRule[] = [];

  rules.forEach(rule => {
    const metricValue = telemetry[rule.metric];
    
    if (typeof metricValue === 'number') {
      let isTriggered = false;
      
      switch (rule.operator) {
        case 'gt':
          isTriggered = metricValue > rule.value;
          break;
        case 'lt':
          isTriggered = metricValue < rule.value;
          break;
        case 'eq':
          isTriggered = metricValue === rule.value;
          break;
      }
      
      if (isTriggered) {
        activeAlerts.push(rule);
      }
    }
  });

  return activeAlerts;
}

// Get the highest severity alert for a device
export function getHighestAlertSeverity(alerts: ThresholdRule[]): 'none' | 'warning' | 'critical' {
  if (alerts.length === 0) return 'none';
  
  return alerts.some(alert => alert.severity === 'critical') ? 'critical' : 'warning';
}

// Format telemetry value for display
export function formatTelemetryValue(value: number | string | any): string {
  if (typeof value === 'number') {
    // Format numbers with appropriate precision
    if (Number.isInteger(value)) {
      return value.toString();
    } else {
      return value.toFixed(2);
    }
  }
  
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  
  return String(value);
}

// Get human-readable asset type name
export function formatAssetType(assetType: string): string {
  return assetType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
