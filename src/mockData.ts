import { Camera, RTORecord, VehicleDetection, CloneAlert, SystemLog } from './types';

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'Central Silk Board Junction',
    location: 'Silk Board, Bengaluru',
    latitude: 12.9176,
    longitude: 77.6244,
    active: true,
    throughput: 124,
  },
  {
    id: 'CAM-02',
    name: 'Indira Nagar 100ft Road',
    location: 'Indira Nagar, Bengaluru',
    latitude: 12.9716,
    longitude: 77.6412,
    active: true,
    throughput: 98,
  },
  {
    id: 'CAM-03',
    name: 'Electronic City Toll Gate',
    location: 'Electronic City, Bengaluru',
    latitude: 12.8485,
    longitude: 77.6760,
    active: true,
    throughput: 156,
  },
  {
    id: 'CAM-04',
    name: 'MG Road Metro Station',
    location: 'MG Road, Bengaluru',
    latitude: 12.9740,
    longitude: 77.6075,
    active: true,
    throughput: 142,
  },
  {
    id: 'CAM-05',
    name: 'Whitefield ITPL Entrance',
    location: 'Whitefield, Bengaluru',
    latitude: 12.9840,
    longitude: 77.7289,
    active: true,
    throughput: 87,
  },
  {
    id: 'CAM-06',
    name: 'Koramangala 80ft Road',
    location: 'Koramangala, Bengaluru',
    latitude: 12.9344,
    longitude: 77.6180,
    active: true,
    throughput: 110,
  }
];

export const INITIAL_RTO_REGISTRY: RTORecord[] = [
  {
    registrationNumber: 'KA01MJ4521',
    ownerName: 'Suresh Sharma',
    ownerAddress: 'Flat 402, Shanthi Residency, Indira Nagar, Bengaluru',
    phone: '+91 98765 43210',
    model: 'Toyota Fortuner',
    color: 'White',
    type: 'Car',
    manufacturer: 'Toyota Kirloskar',
    engineNumber: '1TR-FE-2394852',
    chassisNumber: 'MHF11GB7790856',
    registrationDate: '2021-04-12',
    fuelType: 'Diesel'
  },
  {
    registrationNumber: 'KA03MX9912',
    ownerName: 'Anjali Rao',
    ownerAddress: '12, 4th Cross, HSR Layout Sector 3, Bengaluru',
    phone: '+91 91234 56789',
    model: 'Hyundai i20',
    color: 'Red',
    type: 'Car',
    manufacturer: 'Hyundai India',
    engineNumber: 'G4LA-MS984521',
    chassisNumber: 'MALB351CL-908124',
    registrationDate: '2023-01-18',
    fuelType: 'Petrol'
  },
  {
    registrationNumber: 'DL03CA1122',
    ownerName: 'Karan Johar',
    ownerAddress: 'D-42, Connaught Place, New Delhi',
    phone: '+91 95556 66777',
    model: 'Maruti Swift',
    color: 'Blue',
    type: 'Car',
    manufacturer: 'Maruti Suzuki',
    engineNumber: 'K12M-ZN348521',
    chassisNumber: 'MBHED42S-879124',
    registrationDate: '2020-11-05',
    fuelType: 'Petrol'
  },
  {
    registrationNumber: 'KA05NH2024',
    ownerName: 'Vikas Gowda',
    ownerAddress: '88, 1st Main, Koramangala 4th Block, Bengaluru',
    phone: '+91 94443 33222',
    model: 'Mahindra XUV700',
    color: 'Black',
    type: 'Car',
    manufacturer: 'Mahindra & Mahindra',
    engineNumber: 'mStallion-TGDI-56',
    chassisNumber: 'MA1XX700-CK89124',
    registrationDate: '2024-02-15',
    fuelType: 'Petrol'
  },
  {
    registrationNumber: 'KA51EZ5566',
    ownerName: 'Meera Nair',
    ownerAddress: 'Prithvi Apartments, Electronic City Phase 1, Bengaluru',
    phone: '+91 91112 22333',
    model: 'Tata Nexon',
    color: 'Teal',
    type: 'Car',
    manufacturer: 'Tata Motors',
    engineNumber: 'EV-ZIPTRON-99824',
    chassisNumber: 'MAT90842-EK12854',
    registrationDate: '2022-08-20',
    fuelType: 'EV'
  },
  {
    registrationNumber: 'KA02JK4455',
    ownerName: 'Rohan Kapoor',
    ownerAddress: '45, 17th Cross, Malleshwaram, Bengaluru',
    phone: '+91 98887 77666',
    model: 'Classic 350',
    color: 'Grey',
    type: 'Bike',
    manufacturer: 'Royal Enfield',
    engineNumber: 'J-SERIES-RE350',
    chassisNumber: 'ME3RE350-GL44128',
    registrationDate: '2023-05-10',
    fuelType: 'Petrol'
  },
  {
    registrationNumber: 'MH12AB8877',
    ownerName: 'Ramesh Patel',
    ownerAddress: 'Flat 101, Galaxy Heights, Aundh, Pune',
    phone: '+91 90000 11122',
    model: 'Honda City',
    color: 'Silver',
    type: 'Car',
    manufacturer: 'Honda Cars',
    engineNumber: 'L15B-HC882415',
    chassisNumber: 'MAKGM668-HL09452',
    registrationDate: '2019-07-25',
    fuelType: 'Petrol'
  },
  {
    registrationNumber: 'KA04ML7711',
    ownerName: 'Amit Verma',
    ownerAddress: 'B-704, Prestige Lakeside, Whitefield, Bengaluru',
    phone: '+91 93333 44444',
    model: 'Tata Ace',
    color: 'White',
    type: 'Truck',
    manufacturer: 'Tata Motors',
    engineNumber: '275-IDI-TRUCK',
    chassisNumber: 'MAT70402-TH88219',
    registrationDate: '2020-03-14',
    fuelType: 'Diesel'
  },
  {
    registrationNumber: 'KA03FH2345',
    ownerName: 'Kaveri Travels',
    ownerAddress: 'Majestic Bus Stand, Bengaluru',
    phone: '+91 92222 88888',
    model: 'Volvo B11R',
    color: 'Blue',
    type: 'Bus',
    manufacturer: 'Volvo Buses',
    engineNumber: 'D11K-430-VOLVO',
    chassisNumber: 'YV3R829E-HL99824',
    registrationDate: '2018-09-10',
    fuelType: 'Diesel'
  },
  {
    registrationNumber: 'KA05AA8888',
    ownerName: 'Manjunath Gowda',
    ownerAddress: 'Auto Stand, Jayanagar 4th Block, Bengaluru',
    phone: '+91 97777 55555',
    model: 'RE Optima',
    color: 'Yellow',
    type: 'Auto',
    manufacturer: 'Bajaj Auto',
    engineNumber: 'RE-200-BAJAJ',
    chassisNumber: 'MD2RE200-AX44821',
    registrationDate: '2022-01-30',
    fuelType: 'CNG'
  },
  {
    registrationNumber: 'KA01VV9900',
    ownerName: 'TechExpress Logistics',
    ownerAddress: 'Outer Ring Road, Bellandur, Bengaluru',
    phone: '+91 96666 44444',
    model: 'Maruti Eeco',
    color: 'Grey',
    type: 'Van',
    manufacturer: 'Maruti Suzuki',
    engineNumber: 'G12B-EECO-99',
    chassisNumber: 'MBHED12V-CH44829',
    registrationDate: '2021-12-05',
    fuelType: 'Petrol'
  }
];

export const INITIAL_DETECTIONS: VehicleDetection[] = [
  {
    id: 'DET-001',
    vehicleNumber: 'KA01MJ4521',
    color: 'White',
    model: 'Toyota Fortuner',
    type: 'Car',
    cameraId: 'CAM-02',
    captureTime: '08:15:32',
    captureDate: '2026-07-06',
    imageSeed: 101,
    confidence: 0.98,
  },
  {
    id: 'DET-002',
    vehicleNumber: 'KA02JK4455',
    color: 'Grey',
    model: 'Classic 350',
    type: 'Bike',
    cameraId: 'CAM-06',
    captureTime: '08:20:11',
    captureDate: '2026-07-06',
    imageSeed: 102,
    confidence: 0.97,
  },
  {
    id: 'DET-003',
    vehicleNumber: 'MH12AB8877',
    color: 'Silver',
    model: 'Honda City',
    type: 'Car',
    cameraId: 'CAM-04',
    captureTime: '08:24:45',
    captureDate: '2026-07-06',
    imageSeed: 103,
    confidence: 0.96,
  },
  {
    id: 'DET-004',
    vehicleNumber: 'KA05NH2024',
    color: 'Black',
    model: 'Mahindra XUV700',
    type: 'Car',
    cameraId: 'CAM-01',
    captureTime: '08:26:02',
    captureDate: '2026-07-06',
    imageSeed: 104,
    confidence: 0.99,
  },
  {
    id: 'DET-005',
    vehicleNumber: 'DL03CA1122',
    color: 'Red', // Discrepancy! RTO says Blue. This should trigger a Medium-Risk Alert.
    model: 'Maruti Swift',
    type: 'Car',
    cameraId: 'CAM-02',
    captureTime: '08:28:40',
    captureDate: '2026-07-06',
    imageSeed: 105,
    confidence: 0.94,
  }
];

export const INITIAL_ALERTS: CloneAlert[] = [
  {
    id: 'ALT-001',
    vehicleNumber: 'DL03CA1122',
    camera1Id: 'CAM-02',
    camera2Id: 'CAM-02', // same location but visual mismatch
    time1: '08:28:40',
    time2: '08:28:40',
    distanceKm: 0,
    actualTimeMinutes: 0,
    requiredSpeedKmh: 0,
    riskLevel: 'MEDIUM',
    reason: 'RTO Registry specifies Blue body color, but live computer vision detected RED body color.',
    status: 'PENDING',
    detectedAt: '2026-07-06T08:28:40',
    comparison: {
      color1: 'Blue (RTO)',
      color2: 'Red (Live Scan)',
      model1: 'Maruti Swift',
      model2: 'Maruti Swift',
      type1: 'Car',
      type2: 'Car'
    }
  },
  {
    id: 'ALT-002',
    vehicleNumber: 'KA03MX9912',
    camera1Id: 'CAM-03', // Electronic City
    camera2Id: 'CAM-05', // Whitefield (Distance is ~18.5 km)
    time1: '08:31:00',
    time2: '08:33:30', // Time delta is 2.5 minutes!
    distanceKm: 18.5,
    actualTimeMinutes: 2.5,
    requiredSpeedKmh: 444, // 18.5 km in 2.5 mins = 444 km/h!
    riskLevel: 'HIGH',
    reason: 'Time-Distance impossible violation. The vehicle scanned at Whitefield only 2.5 minutes after being scanned at Electronic City (Requires 444 km/h speed).',
    status: 'PENDING',
    detectedAt: '2026-07-06T08:33:30',
    comparison: {
      color1: 'Red (CAM-03)',
      color2: 'Red (CAM-05)',
      model1: 'Hyundai i20',
      model2: 'Hyundai i20',
      type1: 'Car',
      type2: 'Car'
    }
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'LOG-001',
    timestamp: '08:00:00',
    level: 'INFO',
    message: 'V-WATCH AI-CORE initialization complete. Connection to Camera Network active.',
  },
  {
    id: 'LOG-002',
    timestamp: '08:05:12',
    level: 'INFO',
    message: 'YOLOv8 vehicle detection models loaded successfully on Edge Nodes.',
  },
  {
    id: 'LOG-003',
    timestamp: '08:05:15',
    level: 'INFO',
    message: 'EasyOCR license plate recognition engine calibrated and online.',
  },
  {
    id: 'LOG-004',
    timestamp: '08:15:32',
    level: 'SUCCESS',
    message: 'Vehicle Toyota Fortuner (KA01MJ4521) detected and parsed at Cam-02 (Indira Nagar). Details matching RTO database.',
    cameraId: 'CAM-02'
  },
  {
    id: 'LOG-005',
    timestamp: '08:28:40',
    level: 'WARNING',
    message: 'VEHICLE MISMATCH: Plate DL03CA1122 scanned at Cam-02. Computer Vision identified color RED; RTO record says BLUE.',
    cameraId: 'CAM-02'
  },
  {
    id: 'LOG-006',
    timestamp: '08:33:30',
    level: 'ALERT',
    message: 'CLONE DETECTED: Plate KA03MX9912 scanned at Cam-05 Whitefield 2.5 minutes after Cam-03 Electronic City scan. Distance: 18.5km. Speed: 444 km/h!',
    cameraId: 'CAM-05'
  }
];
