// Telemetry Service for SCM Digital Twin Backend
// Connects to all telemetry endpoints

import { apiRequest } from './apiService';

export const telemetryService = {
  // 7. Health check for telemetry service
  getHealth: () => 
    apiRequest('/telemetry/health', {
      method: 'GET',
    }),
  
  // 8. Get all telemetry data with optional filters
  getAllTelemetry: (deviceId?: string, metricName?: string) => {
    const params = new URLSearchParams();
    if (deviceId) params.append('device_id', deviceId);
    if (metricName) params.append('metric_name', metricName);
    
    return apiRequest(`/telemetry/all?${params.toString()}`, {
      method: 'GET',
    });
  },
  
  // 9. List unique device IDs
  getDevices: () => 
    apiRequest('/telemetry/devices', {
      method: 'GET',
    }),
  
  // 10. List available metrics
  getMetrics: (deviceId?: string) => {
    const params = deviceId ? `?device_id=${deviceId}` : '';
    return apiRequest(`/telemetry/metrics${params}`, {
      method: 'GET',
    });
  },
};

export default telemetryService;
