// SignalR Service - Real-time telemetry connection
// Connects to Azure SignalR for live IoT device updates

import * as signalR from "@microsoft/signalr";
import { TelemetryMessage } from "@/state/deviceTelemetryStore";

export interface SignalRService {
  connection: signalR.HubConnection | null;
  startConnection: () => Promise<void>;
  stopConnection: () => Promise<void>;
  isConnected: boolean;
}

class SignalRServiceImpl implements SignalRService {
  public connection: signalR.HubConnection | null = null;
  private onTelemetryReceived?: (message: TelemetryMessage) => void;
  
  constructor() {
    
  }

  private async createConnection() {
  const res = await fetch("https://iottodigitaltwins.azurewebsites.net/api/negotiate");
  const { url, accessToken } = await res.json();
  
  this.connection = new signalR.HubConnectionBuilder()
    .withUrl(url, { accessTokenFactory: () => accessToken })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
    
  this.setupEventHandlers();
}
  

  private setupEventHandlers() {
    if (!this.connection) return;

    // Handle incoming telemetry messages
    this.connection.on("telemetry", (data: any) => {
  console.log("Received telemetry:", data);
  console.log("Telemetry data object:", data.data); // Changed from data.telemetry
  console.log("Telemetry data type:", typeof data.data); // Changed from data.telemetry
  
  // Normalize the telemetry message to match our interface
  const normalizedMessage: TelemetryMessage = {
    device_id: data.device_id || data.deviceId || data.twinId || "unknown",
    asset_type: data.asset_type || data.assetType || "unknown",
    telemetry: data.data || {}, // Use data.data instead of data.telemetry
    metadata: data.metadata || {}
  };

  console.log("Normalized telemetry message:", normalizedMessage);
  this.onTelemetryReceived?.(normalizedMessage);
});
this.connection.on("twin-update", (data: any) => {
  console.log("Received twin update:", data);
  
  // Extract telemetry from patch
  const telemetry: any = {};
  if (data.data?.patch) {
    console.log("Patch data:", data.data.patch);
    data.data.patch.forEach((p: any) => {
      console.log("Processing patch:", p);
      if (p.op === "replace" && p.path.startsWith("/telemetry/")) {
        const key = p.path.split('/').pop();
        telemetry[key] = p.value;
        console.log(`Extracted telemetry: ${key} = ${p.value}`);
      }
    });
  }
  
  console.log("Final telemetry object:", telemetry);
  
  const normalizedMessage: TelemetryMessage = {
    device_id: data.twinId || "unknown",
    asset_type: data.assetType || "unknown", 
    telemetry: telemetry,
    metadata: data.metadata || {}
  };
  this.onTelemetryReceived?.(normalizedMessage);
});
    // Handle connection events
    this.connection.onreconnected(() => {
      console.log("SignalR reconnected");
    });

    this.connection.onclose(() => {
      console.log("SignalR connection closed");
    });

    this.connection.onreconnecting(() => {
      console.log("SignalR reconnecting...");
    });
  }

  public async startConnection(): Promise<void> {
    if (!this.connection) {
      await this.createConnection();
    }

    try {
      await this.connection!.start();
      console.log("SignalR connected successfully");
    } catch (error) {
      console.error("SignalR connection failed:", error);
      throw error;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log("SignalR connection stopped");
    }
  }

  public get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // Register callback for telemetry updates
  public onTelemetry(callback: (message: TelemetryMessage) => void) {
    this.onTelemetryReceived = callback;
  }
}

// Singleton instance
export const signalRService = new SignalRServiceImpl();
export default signalRService;
