// Custom hook for device telemetry state management
// Provides access to device data and update functions

import { useReducer, useEffect, useCallback } from 'react';
import { 
  DeviceTelemetryState, 
  DeviceState, 
  TelemetryMessage, 
  deviceTelemetryReducer, 
  initialDeviceTelemetryState 
} from '@/state/deviceTelemetryStore';
import { checkDeviceAlerts, getHighestAlertSeverity } from '@/utils/telemetryParsing';

export function useDeviceTelemetry() {
  const [state, dispatch] = useReducer(deviceTelemetryReducer, initialDeviceTelemetryState);

  // Add new telemetry message
  const addTelemetry = useCallback((message: TelemetryMessage) => {
    dispatch({
      type: 'ADD_TELEMETRY',
      payload: { message }
    });
  }, []);

  // Select a device
  const selectDevice = useCallback((deviceId: string | null) => {
    dispatch({
      type: 'SELECT_DEVICE',
      payload: { deviceId }
    });
  }, []);

  // Update device statuses (call periodically)
  const updateDeviceStatuses = useCallback(() => {
    dispatch({ type: 'UPDATE_DEVICE_STATUSES' });
  }, []);

  // Get selected device
  const selectedDevice = state.selectedDeviceId 
    ? state.devicesById[state.selectedDeviceId] 
    : null;

  // Get all devices sorted by last seen, but maintain stable positions
  const devicesSorted = Object.values(state.devicesById)
    .sort((a, b) => {
      // First sort by device_id to maintain stable order
      if (a.device_id < b.device_id) return -1;
      if (a.device_id > b.device_id) return 1;
      // Then by last seen as secondary sort
      return b.lastSeenTs - a.lastSeenTs;
    });

  // Get device counts by status
  const deviceCounts = {
    total: devicesSorted.length,
    running: devicesSorted.filter(d => d.status === 'running').length,
    stale: devicesSorted.filter(d => d.status === 'stale').length,
    offline: devicesSorted.filter(d => d.status === 'offline').length
  };

  // Check for alerts on selected device
  const selectedDeviceAlerts = selectedDevice 
    ? checkDeviceAlerts(selectedDevice.asset_type, selectedDevice.telemetry)
    : [];

  const selectedDeviceAlertSeverity = getHighestAlertSeverity(selectedDeviceAlerts);

  // Periodic status updates
  useEffect(() => {
    const interval = setInterval(updateDeviceStatuses, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateDeviceStatuses]);

  return {
    // State
    devicesById: state.devicesById,
    selectedDevice,
    selectedDeviceId: state.selectedDeviceId,
    devicesSorted,
    deviceCounts,
    lastUpdate: state.lastUpdate,
    selectedDeviceAlerts,
    selectedDeviceAlertSeverity,
    
    // Actions
    addTelemetry,
    selectDevice,
    updateDeviceStatuses
  };
}