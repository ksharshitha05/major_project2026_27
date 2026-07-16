-- Location: /database.sql
-- SQLite / PostgreSQL Schema definition for V-WATCH AI-CORE Clone Detection Platform

-- 1. CAMERA TABLE
CREATE TABLE IF NOT EXISTS Camera (
    camera_id VARCHAR(50) PRIMARY KEY,
    camera_name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL
);

-- 2. VEHICLE DETECTION TABLE
CREATE TABLE IF NOT EXISTS VehicleDetection (
    detection_id VARCHAR(50) PRIMARY KEY,
    vehicle_number VARCHAR(25) NOT NULL,
    vehicle_color VARCHAR(25) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    camera_id VARCHAR(50) NOT NULL,
    capture_time TIME NOT NULL,
    capture_date DATE NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL,
    FOREIGN KEY (camera_id) REFERENCES Camera(camera_id)
);

-- 3. SIMULATED RTO TABLE (REGISTRY)
CREATE TABLE IF NOT EXISTS RTO (
    registration_number VARCHAR(25) PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    owner_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_color VARCHAR(25) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    engine_number VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(50) NOT NULL,
    registration_date DATE NOT NULL,
    fuel_type VARCHAR(15) NOT NULL
);

-- 4. ALERT TABLE
CREATE TABLE IF NOT EXISTS Alerts (
    alert_id VARCHAR(50) PRIMARY KEY,
    vehicle_number VARCHAR(25) NOT NULL,
    camera_1 VARCHAR(50) NOT NULL,
    camera_2 VARCHAR(50) NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    actual_time_minutes DECIMAL(6, 2) NOT NULL,
    required_speed_kmh DECIMAL(6, 2) NOT NULL,
    risk_level VARCHAR(15) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    detected_at TIMESTAMP NOT NULL,
    FOREIGN KEY (camera_1) REFERENCES Camera(camera_id),
    FOREIGN KEY (camera_2) REFERENCES Camera(camera_id)
);

-- 5. LOGS TABLE
CREATE TABLE IF NOT EXISTS Logs (
    log_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    level VARCHAR(15) NOT NULL,
    message TEXT NOT NULL,
    camera_id VARCHAR(50),
    FOREIGN KEY (camera_id) REFERENCES Camera(camera_id)
);

-- Seed Initial Cameras
INSERT INTO Camera (camera_id, camera_name, location, latitude, longitude) VALUES
('CAM-01', 'Central Silk Board Junction', 'Silk Board, Bengaluru', 12.91760000, 77.62440000),
('CAM-02', 'Indira Nagar 100ft Road', 'Indira Nagar, Bengaluru', 12.97160000, 77.64120000),
('CAM-03', 'Electronic City Toll Gate', 'Electronic City, Bengaluru', 12.84850000, 77.67600000),
('CAM-04', 'MG Road Metro Station', 'MG Road, Bengaluru', 12.97400000, 77.60750000),
('CAM-05', 'Whitefield ITPL Entrance', 'Whitefield, Bengaluru', 12.98400000, 77.72890000),
('CAM-06', 'Koramangala 80ft Road', 'Koramangala, Bengaluru', 12.93440000, 77.61800000);

-- Seed Initial RTO Registry
INSERT INTO RTO (registration_number, owner_name, owner_address, phone, vehicle_model, vehicle_color, manufacturer, engine_number, chassis_number, registration_date, fuel_type) VALUES
('KA01MJ4521', 'Suresh Sharma', 'Flat 402, Shanthi Residency, Indira Nagar, Bengaluru', '+91 98765 43210', 'Fortuner', 'White', 'Toyota Kirloskar', '1TR-FE-2394852', 'MHF11GB7790856', '2021-04-12', 'Diesel'),
('KA03MX9912', 'Anjali Rao', '12, 4th Cross, HSR Layout Sector 3, Bengaluru', '+91 91234 56789', 'i20', 'Red', 'Hyundai India', 'G4LA-MS984521', 'MALB351CL-908124', '2023-01-18', 'Petrol'),
('DL03CA1122', 'Karan Johar', 'D-42, Connaught Place, New Delhi', '+91 95556 66777', 'Swift', 'Blue', 'Maruti Suzuki', 'K12M-ZN348521', 'MBHED42S-879124', '2020-11-05', 'Petrol'),
('KA05NH2024', 'Vikas Gowda', '88, 1st Main, Koramangala 4th Block, Bengaluru', '+91 94443 33222', 'XUV700', 'Black', 'Mahindra & Mahindra', 'mStallion-TGDI-56', 'MA1XX700-CK89124', '2024-02-15', 'Petrol'),
('KA51EZ5566', 'Meera Nair', 'Prithvi Apartments, Electronic City Phase 1, Bengaluru', '+91 91112 22333', 'Nexon', 'Teal', 'Tata Motors', 'EV-ZIPTRON-99824', 'MAT90842-EK12854', '2022-08-20', 'EV');
