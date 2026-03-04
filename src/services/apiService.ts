// API Service for SCM Digital Twin Backend Integration
// Base URL for FastAPI backend - use environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Generic API request helper
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Health check API
export const healthCheck = () => apiRequest('/health');

// Root API info
export const getApiInfo = () => apiRequest('/');

// Telemetry API endpoints
export const telemetryService = {
  // Get telemetry data
  getTelemetryData: (params?: Record<string, any>) => 
    apiRequest('/api/telemetry/data', { 
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined 
    }),
  
  // Get telemetry metrics
  getTelemetryMetrics: () => apiRequest('/api/telemetry/metrics'),
  
  // Get telemetry status
  getTelemetryStatus: () => apiRequest('/api/telemetry/status'),
};

// What-If Analysis API endpoints
export const whatIfService = {
  // Get available options for what-if analysis
  getOptions: () => apiRequest('/api/what_if/options'),
  
  // Analyze warehouse relocation
  analyzeWarehouseRelocation: (data: any) => 
    apiRequest('/api/what_if/warehouse', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Analyze SKU priority
  analyzeSKUPriority: (data: any) => 
    apiRequest('/api/what_if/sku-priority', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Compare multiple scenarios
  compareScenarios: (scenarios: any[]) => 
    apiRequest('/api/what_if/compare', {
      method: 'POST',
      body: JSON.stringify({ scenarios }),
    }),
  
  // Legacy methods for backward compatibility
  runScenario: (scenarioData: any) => 
    apiRequest('/api/what_if/analyze', {
      method: 'POST',
      body: JSON.stringify(scenarioData),
    }),
  
  getScenarios: () => apiRequest('/api/what_if/scenarios'),
  
  getScenarioResults: (scenarioId: string) => 
    apiRequest(`/api/what_if/results/${scenarioId}`),
};

// Machine Learning API endpoints
export const mlService = {
  // Validate training data
  validateData: (data: any) => 
    apiRequest('/api/ML/validate-data', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Detect features from data
  detectFeatures: (data: any[], dateColumn?: string) => 
    apiRequest('/api/ML/detect-features', {
      method: 'POST',
      body: JSON.stringify({ data, date_column: dateColumn }),
    }),
  
  // Train demand forecast model
  trainDemandForecast: (data: any) => 
    apiRequest('/api/ML/train/demand-forecast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Make single prediction
  predictDemand: (data: any) => 
    apiRequest('/api/ML/predict/demand', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Make batch predictions
  batchPredictDemand: (data: any) => 
    apiRequest('/api/ML/predict/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Get model performance history
  getModelPerformance: (modelName: string, limit?: number) => 
    apiRequest(`/api/ML/models/${modelName}/performance?limit=${limit || 100}`),
  
  // Get available models
  getModels: () => apiRequest('/api/ML/models'),
  
  // Get model info
  getModelInfo: (modelName: string) => 
    apiRequest(`/api/ML/models/${modelName}`),
  
  // Legacy methods for backward compatibility
  getPredictions: (modelType: string, inputData: any) => 
    apiRequest(`/api/ML/predict/${modelType}`, {
      method: 'POST',
      body: JSON.stringify(inputData.features || inputData),
    }),
  
  getModelMetrics: (modelId: string) => 
    apiRequest(`/api/ML/metrics/${modelId}`),
  
  trainModel: (modelConfig: any) => 
    apiRequest('/api/ML/train', {
      method: 'POST',
      body: JSON.stringify(modelConfig),
    }),
};

// Mock Data API endpoints (for Grafana/testing)
export const mockDataService = {
  // Get mock telemetry data
  getMockTelemetry: (params?: Record<string, any>) => 
    apiRequest('/api/mock/telemetry', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    }),
  
  // Generate mock data
  generateMockData: (config: any) => 
    apiRequest('/api/mock/generate', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
};

export default {
  healthCheck,
  getApiInfo,
  telemetryService,
  whatIfService,
  mlService,
  mockDataService,
};
