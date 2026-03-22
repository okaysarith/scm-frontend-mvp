// Network Analysis Service for SCM Digital Twin Backend

// Connects to network design and compliance endpoints



import { apiRequest } from './apiService';



export const networkService = {

  // 1. Find nearest hub for a pincode

  findNearestHub: (pincode: string) => 

    apiRequest('/api/network/nearest-hub', {

      method: 'POST',

      body: JSON.stringify({ pincode }),

    }),

  

  // 2. Analyze network coverage for multiple PIN codes

  analyzeNetworkCoverage: (pincodes: string[]) => 

    apiRequest('/api/network/network-coverage', {

      method: 'POST',

      body: JSON.stringify({ pincodes }),

    }),

  

  // 3. Get current network service status

  getNetworkStatus: () => 

    // Mock response for now since backend doesn't have network routes

    Promise.resolve({

      status: 'healthy',

      hubs_info: {

        total_hubs: 25,

        pincode_mapping_size: 15000

      },

      data_status: {

        order_data_available: true,

        master_data_available: true

      },

      service_health: {

        database: 'healthy' as const,

        api: 'healthy' as const

      }

    }),

  

  // 4. Profile single order risk before dispatch

  profileOrderRisk: (orderNo: string, sku: string, customerPincode: string, deliveryPeriod: number = 2) => 

    apiRequest('/api/network/order-risk', {

      method: 'POST',

      body: JSON.stringify({ 

        order_no: orderNo,

        sku: sku,

        customer_pincode: customerPincode,

        delivery_period: deliveryPeriod 

      }),

    }),

  

  // 5. Generate baseline network using real CSV data

  generateComprehensiveBaseline: (limit?: number) => 

    apiRequest('/api/network/comprehensive-baseline', {

      method: 'POST',

      body: JSON.stringify(limit ? { limit } : {}),

    }),

  

  // 6. Calculate dispatch compliance metrics

  calculateComprehensiveCompliance: (costPerKm: number = 2.5) => 

    apiRequest('/api/network/comprehensive-compliance', {

      method: 'POST',

      body: JSON.stringify({ cost_per_km: costPerKm }),

    }),

  

  // 7. Upload CSV files for network analysis

  uploadCSVFiles: (orderDataFile: File, pickDataFile: File) => {

    const formData = new FormData();

    formData.append('order_data', orderDataFile);

    formData.append('pick_data', pickDataFile);

    

    return fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/network/upload-csv`, {

      method: 'POST',

      body: formData,

    }).then(response => {

      if (!response.ok) {

        throw new Error(`Upload failed: ${response.statusText}`);

      }

      return response.json();

    });

  },



  // 11. Merge CSV files with automatic download

  mergeCSVFiles: (orderDataFile: File, pickDataFile: File, outputFilename?: string) => {

    const formData = new FormData();

    formData.append('order_data', orderDataFile);

    formData.append('pick_data', pickDataFile);

    if (outputFilename) {

      formData.append('output_filename', outputFilename);

    }

    

    return fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/network/merge-csv`, {

      method: 'POST',

      body: formData,

    }).then(response => {

      if (!response.ok) {

        throw new Error(`Merge failed: ${response.statusText}`);

      }

      // Handle file download

      const contentDisposition = response.headers.get('content-disposition');

      const filename = contentDisposition 

        ? contentDisposition.split('filename=')[1].replace(/"/g, '')

        : 'merged_data.csv';

      

      return response.blob().then(blob => ({

        blob,

        filename,

        stats: response.headers.get('x-merge-stats')

      }));

    });

  },



  // 12. Preview merged CSV file

  previewMergedCSV: (filename: string) => 

    apiRequest(`/api/network/merge-preview/${filename}`, {

      method: 'GET',

    }),



  // 13. Telemetry endpoints

  telemetry: {

    // 10. Health check for telemetry service

    getHealth: () => 

      // Mock response for now since telemetry endpoint might not work

      Promise.resolve({

        status: 'healthy' as const,

        last_update: new Date().toISOString(),

        active_devices: 8,

        total_devices: 10

      }),

    

    // 11. Get all telemetry data

    getAllData: (deviceId?: string, metricName?: string) => {

      // Mock response for now since backend endpoints might not work

      return Promise.resolve([

        {

          device_id: 'device_001',

          metric_name: 'temperature',

          value: 25.5,

          timestamp: new Date().toISOString(),

          unit: '°C'

        },

        {

          device_id: 'device_002',

          metric_name: 'humidity',

          value: 65,

          timestamp: new Date().toISOString(),

          unit: '%'

        }

      ]);

    },

    

    // 12. List unique device IDs

    getDevices: () => 

      // Mock response for now since backend endpoints might not work

      Promise.resolve([

        {

          device_id: 'device_001',

          device_name: 'Temperature Sensor 1',

          status: 'online' as const,

          last_seen: new Date().toISOString(),

          metrics_count: 150

        },

        {

          device_id: 'device_002',

          device_name: 'Humidity Sensor 1',

          status: 'online' as const,

          last_seen: new Date().toISOString(),

          metrics_count: 120

        }

      ]),

    

    // 13. List available metrics

    getMetrics: (deviceId?: string) => {

      // Mock response for now since backend endpoints might not work

      return Promise.resolve([

        {

          metric_name: 'temperature',

          description: 'Temperature reading',

          unit: '°C',

          data_type: 'numeric' as const

        },

        {

          metric_name: 'humidity',

          description: 'Humidity percentage',

          unit: '%',

          data_type: 'numeric' as const

        }

      ]);

    }

  }

};



export default networkService;

