# Location: /run.py
# V-WATCH AI-CORE: Vehicle Plate Identification & Cloned Plate Detection Pipeline Simulator
# Written in production-grade Python with modular classes, sqlite3 connectivity, and the Haversine algorithm.

import os
import sqlite3
import time
import math
import random
from datetime import datetime

# Haversine Distance Formula
def calculate_haversine(lat1, lon1, lat2, lon2):
    """
    Computes geodetic distance in kilometers between two GPS coordinates.
    """
    R = 6371.0  # Earth's radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(d_lat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 2)

class VehicleCloneDetectorEngine:
    def __init__(self, db_path="v_watch.db"):
        self.db_path = db_path
        self.initialize_database()

    def initialize_database(self):
        """
        Creates SQLite tables according to specification and inserts starting seed data.
        """
        print("[DB] Initializing V-WATCH SQLite Database...")
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 1. CAMERA TABLE
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Camera (
            camera_id TEXT PRIMARY KEY,
            camera_name TEXT NOT NULL,
            location TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        )""")

        # 2. VEHICLE DETECTION TABLE
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS VehicleDetection (
            detection_id TEXT PRIMARY KEY,
            vehicle_number TEXT NOT NULL,
            vehicle_color TEXT NOT NULL,
            vehicle_model TEXT NOT NULL,
            vehicle_type TEXT NOT NULL,
            camera_id TEXT NOT NULL,
            capture_time TEXT NOT NULL,
            capture_date TEXT NOT NULL,
            confidence REAL NOT NULL,
            FOREIGN KEY (camera_id) REFERENCES Camera(camera_id)
        )""")

        # 3. SIMULATED RTO TABLE
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS RTO (
            registration_number TEXT PRIMARY KEY,
            owner_name TEXT NOT NULL,
            owner_address TEXT NOT NULL,
            phone TEXT NOT NULL,
            vehicle_model TEXT NOT NULL,
            vehicle_color TEXT NOT NULL,
            manufacturer TEXT NOT NULL,
            engine_number TEXT NOT NULL,
            chassis_number TEXT NOT NULL,
            registration_date TEXT NOT NULL,
            fuel_type TEXT NOT NULL
        )""")

        # 4. ALERT TABLE
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Alerts (
            alert_id TEXT PRIMARY KEY,
            vehicle_number TEXT NOT NULL,
            camera_1 TEXT NOT NULL,
            camera_2 TEXT NOT NULL,
            distance_km REAL NOT NULL,
            actual_time_minutes REAL NOT NULL,
            required_speed_kmh REAL NOT NULL,
            risk_level TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT NOT NULL,
            detected_at TEXT NOT NULL,
            FOREIGN KEY (camera_1) REFERENCES Camera(camera_id),
            FOREIGN KEY (camera_2) REFERENCES Camera(camera_id)
        )""")

        # 5. LOGS TABLE
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Logs (
            log_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            camera_id TEXT,
            FOREIGN KEY (camera_id) REFERENCES Camera(camera_id)
        )""")

        # Seed Cameras if empty
        cursor.execute("SELECT COUNT(*) FROM Camera")
        if cursor.fetchone()[0] == 0:
            print("[DB] Seeding camera network pins...")
            cameras = [
                ('CAM-01', 'Central Silk Board Junction', 'Silk Board, Bengaluru', 12.9176, 77.6244),
                ('CAM-02', 'Indira Nagar 100ft Road', 'Indira Nagar, Bengaluru', 12.9716, 77.6412),
                ('CAM-03', 'Electronic City Toll Gate', 'Electronic City, Bengaluru', 12.8485, 77.6760),
                ('CAM-04', 'MG Road Metro Station', 'MG Road, Bengaluru', 12.9740, 77.6075),
                ('CAM-05', 'Whitefield ITPL Entrance', 'Whitefield, Bengaluru', 12.9840, 77.7289)
            ]
            cursor.executemany("INSERT INTO Camera VALUES (?, ?, ?, ?, ?)", cameras)

        # Seed RTO Registry if empty
        cursor.execute("SELECT COUNT(*) FROM RTO")
        if cursor.fetchone()[0] == 0:
            print("[DB] Seeding RTO Registry records...")
            rto_records = [
                ('KA01MJ4521', 'Suresh Sharma', 'Indira Nagar, Bengaluru', '+91 98765 43210', 'Fortuner', 'White', 'Toyota Kirloskar', '1TR-FE-2394852', 'MHF11GB7790856', '2021-04-12', 'Diesel'),
                ('KA03MX9912', 'Anjali Rao', 'HSR Layout, Bengaluru', '+91 91234 56789', 'i20', 'Red', 'Hyundai India', 'G4LA-MS984521', 'MALB351CL-908124', '2023-01-18', 'Petrol'),
                ('DL03CA1122', 'Karan Johar', 'Connaught Place, New Delhi', '+91 95556 66777', 'Swift', 'Blue', 'Maruti Suzuki', 'K12M-ZN348521', 'MBHED42S-879124', '2020-11-05', 'Petrol')
            ]
            cursor.executemany("INSERT INTO RTO VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", rto_records)

        conn.commit()
        conn.close()
        print("[DB] Initialization completed successfully.")

    def log_message(self, level, message, camera_id=None):
        """Adds operational trace lines to logging database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        log_id = f"LOG-{int(time.time()*1000)}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("INSERT INTO Logs VALUES (?, ?, ?, ?, ?)", (log_id, now_str, level, message, camera_id))
        conn.commit()
        conn.close()
        print(f"[{level}] {message}")

    def process_live_cctv_scan(self, plate_number, vehicle_type, vehicle_color, vehicle_model, camera_id):
        """
        Main pipeline function simulating computer vision frames analysis:
        Detects vehicle -> reads plate -> validates RTO specs -> calculates Haversine limits.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        det_id = f"DET-{int(time.time()*1000)}"
        capture_time = datetime.now().strftime("%H:%M:%S")
        capture_date = datetime.now().strftime("%Y-%m-%d")
        confidence = round(random.uniform(0.92, 0.99), 2)

        # 1. Save scan
        cursor.execute("""
            INSERT INTO VehicleDetection (detection_id, vehicle_number, vehicle_color, vehicle_model, vehicle_type, camera_id, capture_time, capture_date, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (det_id, plate_number, vehicle_color, vehicle_model, vehicle_type, camera_id, capture_time, capture_date, confidence))
        conn.commit()
        self.log_message("INFO", f"Registered live detection: {plate_number} at camera {camera_id}.", camera_id)

        # 2. Check for RTO mismatch (MEDIUM RISK)
        cursor.execute("SELECT vehicle_color, vehicle_model, vehicle_type FROM RTO WHERE registration_number = ?", (plate_number,))
        rto_match = cursor.fetchone()

        if rto_match:
          rto_color, rto_model, rto_type = rto_match
          mismatch = []
          if rto_color.lower() != vehicle_color.lower():
              mismatch.append(f"color mismatch (Scan: {vehicle_color} vs RTO: {rto_color})")
          if rto_type.lower() != vehicle_type.lower():
              mismatch.append(f"body type mismatch (Scan: {vehicle_type} vs RTO: {rto_type})")

          if mismatch:
              alert_id = f"ALT-M-{int(time.time()*1000)}"
              reason = f"Property discrepancy: {', '.join(mismatch)}."
              cursor.execute("""
                  INSERT INTO Alerts (alert_id, vehicle_number, camera_1, camera_2, distance_km, actual_time_minutes, required_speed_kmh, risk_level, reason, status, detected_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              """, (alert_id, plate_number, camera_id, camera_id, 0.0, 0.0, 0.0, 'MEDIUM', reason, 'PENDING', datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
              conn.commit()
              self.log_message("WARNING", f"🚨 MISMATCH ALERT: Plate {plate_number} has properties mismatching RTO records.")

        # 3. Check for geodetic travel time limits (HIGH RISK CLONE)
        cursor.execute("""
            SELECT camera_id, capture_time, capture_date FROM VehicleDetection
            WHERE vehicle_number = ? AND camera_id != ? AND capture_date = ?
            ORDER BY capture_time DESC LIMIT 1
        """, (plate_number, camera_id, capture_date))
        prev_scan = cursor.fetchone()

        if prev_scan:
            prev_cam, prev_time_str, _ = prev_scan
            
            # Fetch coordinates
            cursor.execute("SELECT latitude, longitude FROM Camera WHERE camera_id = ?", (prev_cam,))
            c1_coords = cursor.fetchone()
            cursor.execute("SELECT latitude, longitude FROM Camera WHERE camera_id = ?", (camera_id,))
            c2_coords = cursor.fetchone()

            if c1_coords and c2_coords:
                distance = calculate_haversine(c1_coords[0], c1_coords[1], c2_coords[0], c2_coords[1])
                
                # Parse elapsed time
                t1 = datetime.strptime(prev_time_str, "%H:%M:%S")
                t2 = datetime.strptime(capture_time, "%H:%M:%S")
                time_diff_sec = (t2 - t1).total_seconds()
                if time_diff_sec < 0:
                    time_diff_sec += 24 * 3600
                time_diff_min = max(0.1, round(time_diff_sec / 60, 2))

                # Speed calculation
                speed_kmh = round((distance / (time_diff_min / 60)), 2)

                if speed_kmh > 180.0:  # Physical impossibility threshold
                    alert_id = f"ALT-H-{int(time.time()*1000)}"
                    reason = f"Impossibility velocity violation. Travel of {distance} km between {prev_cam} and {camera_id} took {time_diff_min} mins requiring {speed_kmh} km/h speed."
                    
                    cursor.execute("""
                        INSERT INTO Alerts (alert_id, vehicle_number, camera_1, camera_2, distance_km, actual_time_minutes, required_speed_kmh, risk_level, reason, status, detected_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (alert_id, plate_number, prev_cam, camera_id, distance, time_diff_min, speed_kmh, 'HIGH', reason, 'PENDING', datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
                    conn.commit()
                    self.log_message("ALERT", f"🛑 HIGH RISK CLONED DETECTED: Plate {plate_number} required {speed_kmh} km/h speed between camera points.")

        conn.close()

if __name__ == "__main__":
    print("===============================================================")
    print("   V-WATCH AI-CORE: CLONED VEHICLE ANOMALY DETECTION PIPELINE  ")
    print("===============================================================")
    detector = VehicleCloneDetectorEngine()

    print("\n[Simulating Scan 1] Red i20 (Plate KA03MX9912) passes Electronic City Toll Gate...")
    detector.process_live_cctv_scan("KA03MX9912", "Car", "Red", "Hyundai i20", "CAM-03")

    time.sleep(1) # delay
    print("\n[Simulating Scan 2 - Mismatch] Black Swift with Blue Plate (DL03CA1122) passes Indira Nagar...")
    detector.process_live_cctv_scan("DL03CA1122", "Car", "Black", "Maruti Swift", "CAM-02")

    time.sleep(1) # delay
    print("\n[Simulating Scan 3 - Clone Alert] Same Red i20 plate (KA03MX9912) scanned at Whitefield (CAM-05) 1 minute later!")
    # Distance CSB to Whitefield is ~18 km. 1 minute elapsed travel requires 1080 km/h speed!
    detector.process_live_cctv_scan("KA03MX9912", "Car", "Red", "Hyundai i20", "CAM-05")

    print("\n===============================================================")
    print("   Surveillance Simulator Terminated. Logs stored in v_watch.db")
    print("===============================================================")
