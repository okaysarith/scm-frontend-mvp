// Device Telemetry Store - Global state for IoT device data
// Manages real-time telemetry updates and device status

export interface TelemetryMessage {
  device_id: string;
  asset_type: string;
  telemetry: Record<string, number | string>;
  metadata: Record<string, any>;
}

export interface DeviceState {
  device_id: string;
  asset_type: string;
  telemetry: Record<string, number | string>;
  metadata: Record<string, any>;
  lastSeenTs: number;
  status: 'running' | 'stale' | 'offline';
  history: Record<string, (number | string)[]>; // Rolling history per metric
}

export interface DeviceTelemetryState {
  devicesById: Record<string, DeviceState>;
  selectedDeviceId: string | null;
  lastUpdate: number;
}

// Device state reducer for immutable updates
export function deviceTelemetryReducer(
  state: DeviceTelemetryState,
  action: any
): DeviceTelemetryState {
  switch (action.type) {
    case 'ADD_TELEMETRY': {
      const { message }: { message: TelemetryMessage } = action.payload;
      const now = Date.now();
      
      // Determine device status based on last seen time
      const status: 'running' | 'stale' | 'offline' = 
        now - (state.devicesById[message.device_id]?.lastSeenTs || 0) < 10000 
          ? 'running' 
          : now - (state.devicesById[message.device_id]?.lastSeenTs || 0) < 60000 
            ? 'stale' 
            : 'offline';

      // Update history (keep last 30 points per metric)
      const existingHistory = state.devicesById[message.device_id]?.history || {};
      const updatedHistory: Record<string, (number | string)[]> = {};
      
      Object.entries(message.telemetry).forEach(([key, value]) => {
        const metricHistory = existingHistory[key] || [];
        updatedHistory[key] = [...metricHistory, value].slice(-30);
      });

      const updatedDevice: DeviceState = {
        device_id: message.device_id,
        asset_type: message.asset_type,
        telemetry: message.telemetry,
        metadata: message.metadata,
        lastSeenTs: now,
        status,
        history: updatedHistory
      };

      return {
        ...state,
        devicesById: {
          ...state.devicesById,
          [message.device_id]: updatedDevice
        },
        lastUpdate: now
      };
    }

    case 'SELECT_DEVICE': {
      return {
        ...state,
        selectedDeviceId: action.payload.deviceId
      };
    }

    case 'UPDATE_DEVICE_STATUSES': {
      const now = Date.now();
      const updatedDevices = { ...state.devicesById };
      
      Object.values(updatedDevices).forEach(device => {
        const timeSinceLastSeen = now - device.lastSeenTs;
        device.status = 
          timeSinceLastSeen < 10000 
            ? 'running' 
            : timeSinceLastSeen < 60000 
              ? 'stale' 
              : 'offline';
      });

      return {
        ...state,
        devicesById: updatedDevices
      };
    }

    default:
      return state;
  }
}

// Initial state
export const initialDeviceTelemetryState: DeviceTelemetryState = {
  devicesById: {},
  selectedDeviceId: null,
  lastUpdate: 0
};
