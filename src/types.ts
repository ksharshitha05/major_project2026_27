export interface Camera {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  active: boolean;
  throughput: number;
}

export interface VehicleDetection {
  id: string;
  vehicleNumber: string;
  color: string;
  model: string;
  type: 'Car' | 'Bike' | 'Bus' | 'Truck' | 'Auto' | 'Van';
  cameraId: string;
  captureTime: string; // HH:MM:SS
  captureDate: string; // YYYY-MM-DD
  imageSeed: number; // for rendering consistent car SVGs
  confidence: number;
}

export interface RTORecord {
  registrationNumber: string;
  ownerName: string;
  ownerAddress: string;
  phone: string;
  model: string;
  color: string;
  type: 'Car' | 'Bike' | 'Bus' | 'Truck' | 'Auto' | 'Van';
  manufacturer: string;
  engineNumber: string;
  chassisNumber: string;
  registrationDate: string;
  fuelType: 'Petrol' | 'Diesel' | 'EV' | 'CNG';
}

export interface CloneAlert {
  id: string;
  vehicleNumber: string;
  camera1Id: string;
  camera2Id: string;
  time1: string;
  time2: string;
  distanceKm: number;
  actualTimeMinutes: number;
  requiredSpeedKmh: number;
  riskLevel: 'HIGH' | 'MEDIUM';
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  detectedAt: string; // timestamp of alert
  comparison: {
    color1: string;
    color2: string;
    model1: string;
    model2: string;
    type1: string;
    type2: string;
  };
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  message: string;
  cameraId?: string;
}
