import React, { useState, useEffect } from 'react';
import { Camera, VehicleDetection, RTORecord, CloneAlert, SystemLog } from './types';
import {
  INITIAL_CAMERAS,
  INITIAL_RTO_REGISTRY,
  INITIAL_DETECTIONS,
  INITIAL_ALERTS,
  INITIAL_LOGS,
} from './mockData';
import {
  calculateHaversineDistance,
  calculateTimeDifferenceInMinutes,
  calculateRequiredSpeed,
  isSpeedPhysicallyImpossible,
} from './utils/haversine';

import CCTVStream from './components/CCTVStream';
import CloneAlertPanel from './components/CloneAlertPanel';
import RTORegistry from './components/RTORegistry';
import VehicleSearch from './components/VehicleSearch';
import StatisticsView from './components/StatisticsView';
import CameraManager from './components/CameraManager';
import AIInvestigator from './components/AIInvestigator';

import {
  Activity,
  AlertTriangle,
  Clock,
  Database,
  Layers,
  MapPin,
  Search,
  Shield,
  TrendingUp,
  Sliders,
  Bot,
  Terminal,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  // Global State
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [rtoRegistry, setRtoRegistry] = useState<RTORecord[]>(INITIAL_RTO_REGISTRY);
  const [detections, setDetections] = useState<VehicleDetection[]>(INITIAL_DETECTIONS);
  const [alerts, setAlerts] = useState<CloneAlert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  
  const [activeCameraId, setActiveCameraId] = useState<string>('CAM-02'); // Indira Nagar
  const [currentTab, setCurrentTab] = useState<'CONSOLE' | 'SURVEILLANCE' | 'RTO' | 'ANALYTICS' | 'CAMERAS' | 'AI_INVESTIGATOR'>('CONSOLE');
  const [serverTime, setServerTime] = useState<string>('');

  // Update digital server clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const dy = String(now.getDate()).padStart(2, '0');
      const time = now.toTimeString().split(' ')[0];
      setServerTime(`${yr}.${mo}.${dy} | ${time}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCamera = cameras.find(c => c.id === activeCameraId) || cameras[0];

  // Core Intelligence Engine: Check violations and process new detections
  const handleNewDetection = (newDet: VehicleDetection) => {
    // 1. Add detection to list
    setDetections(prev => [newDet, ...prev]);

    const uniqueSuffix = Math.random().toString(36).substring(2, 9);

    // 2. Generate initial system log
    const scanLog: SystemLog = {
      id: `LOG-${Date.now()}-${uniqueSuffix}`,
      timestamp: newDet.captureTime,
      level: 'INFO',
      message: `Camera ${newDet.cameraId} scanned plate ${newDet.vehicleNumber} (${newDet.color} ${newDet.model}).`,
      cameraId: newDet.cameraId,
    };
    setLogs(prev => [scanLog, ...prev]);

    // 3. Compare with RTO database records (Mismatch checks -> MEDIUM RISK)
    const cleanPlate = newDet.vehicleNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const rtoMatch = rtoRegistry.find(
      r => r.registrationNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase() === cleanPlate
    );

    if (rtoMatch) {
      const isColorMismatch = rtoMatch.color.toLowerCase() !== newDet.color.toLowerCase();
      const isModelMismatch = !newDet.model.toLowerCase().includes(rtoMatch.model.toLowerCase()) && 
                               !rtoMatch.model.toLowerCase().includes(newDet.model.toLowerCase());
      const isTypeMismatch = rtoMatch.type.toLowerCase() !== newDet.type.toLowerCase();

      if (isColorMismatch || isModelMismatch || isTypeMismatch) {
        // Trigger MEDIUM RISK discrepancy alert
        const mismatchReason = [];
        if (isColorMismatch) mismatchReason.push(`Color mismatch (Scan: ${newDet.color} vs RTO: ${rtoMatch.color})`);
        if (isModelMismatch) mismatchReason.push(`Model mismatch (Scan: ${newDet.model} vs RTO: ${rtoMatch.model})`);
        if (isTypeMismatch) mismatchReason.push(`Type mismatch (Scan: ${newDet.type} vs RTO: ${rtoMatch.type})`);

        const alertReason = `RTO Registry specifications mismatch detected: ${mismatchReason.join(', ')}.`;

        const newAlert: CloneAlert = {
          id: `ALT-M-${Date.now()}-${uniqueSuffix}`,
          vehicleNumber: newDet.vehicleNumber,
          camera1Id: newDet.cameraId,
          camera2Id: newDet.cameraId,
          time1: newDet.captureTime,
          time2: newDet.captureTime,
          distanceKm: 0,
          actualTimeMinutes: 0,
          requiredSpeedKmh: 0,
          riskLevel: 'MEDIUM',
          reason: alertReason,
          status: 'PENDING',
          detectedAt: new Date().toISOString(),
          comparison: {
            color1: `${newDet.color} (Scan)`,
            color2: `${rtoMatch.color} (RTO)`,
            model1: newDet.model,
            model2: rtoMatch.model,
            type1: newDet.type,
            type2: rtoMatch.type,
          },
        };

        setAlerts(prev => [newAlert, ...prev]);
        
        // Add WARNING system log
        const warningLog: SystemLog = {
          id: `LOG-W-${Date.now()}-${uniqueSuffix}`,
          timestamp: newDet.captureTime,
          level: 'WARNING',
          message: `VEHICLE MISMATCH on ${newDet.vehicleNumber} at Cam ${newDet.cameraId}: CV detected ${newDet.color} ${newDet.model}, RTO says ${rtoMatch.color} ${rtoMatch.model}.`,
          cameraId: newDet.cameraId,
        };
        setLogs(prev => [warningLog, ...prev]);
      }
    }

    // 4. Compare with historical scans to identify speed-distance impossibilities (HIGH RISK CLONE)
    // Find previous scans of this exact same plate on the SAME day at a DIFFERENT camera
    const previousScans = detections.filter(
      d =>
        d.vehicleNumber.toUpperCase() === newDet.vehicleNumber.toUpperCase() &&
        d.cameraId !== newDet.cameraId &&
        d.captureDate === newDet.captureDate
    );

    if (previousScans.length > 0) {
      // Sort to find the most recent previous scan
      const mostRecentPrev = previousScans[0]; // array is pre-sorted desc
      
      const cam1 = cameras.find(c => c.id === mostRecentPrev.cameraId);
      const cam2 = cameras.find(c => c.id === newDet.cameraId);

      if (cam1 && cam2) {
        // Compute geodetic physical distance in km
        const distance = calculateHaversineDistance(
          cam1.latitude,
          cam1.longitude,
          cam2.latitude,
          cam2.longitude
        );

        // Compute elapsed time in minutes
        const timeDiff = calculateTimeDifferenceInMinutes(mostRecentPrev.captureTime, newDet.captureTime);
        
        // Compute speed required
        const speed = calculateRequiredSpeed(distance, timeDiff);

        // Check if physically possible (>180 km/h)
        if (isSpeedPhysicallyImpossible(speed)) {
          // Trigger HIGH RISK physical duplication alert
          const newAlert: CloneAlert = {
            id: `ALT-H-${Date.now()}-${uniqueSuffix}`,
            vehicleNumber: newDet.vehicleNumber,
            camera1Id: mostRecentPrev.cameraId,
            camera2Id: newDet.cameraId,
            time1: mostRecentPrev.captureTime,
            time2: newDet.captureTime,
            distanceKm: distance,
            actualTimeMinutes: timeDiff,
            requiredSpeedKmh: speed,
            riskLevel: 'HIGH',
            reason: `Time-distance physical impossibility. Same plate registered at ${cam2.name} only ${timeDiff} minutes after being scanned at ${cam1.name} (distance: ${distance} km, requires ${speed} km/h).`,
            status: 'PENDING',
            detectedAt: new Date().toISOString(),
            comparison: {
              color1: `${mostRecentPrev.color} (${mostRecentPrev.cameraId})`,
              color2: `${newDet.color} (${newDet.cameraId})`,
              model1: mostRecentPrev.model,
              model2: newDet.model,
              type1: mostRecentPrev.type,
              type2: newDet.type,
            },
          };

          setAlerts(prev => [newAlert, ...prev]);

          // Add CRITICAL system log
          const alertLog: SystemLog = {
            id: `LOG-A-${Date.now()}-${uniqueSuffix}`,
            timestamp: newDet.captureTime,
            level: 'ALERT',
            message: `🚨 CLONE DETECTED: Plate ${newDet.vehicleNumber} scanned at ${cam2.id} ${timeDiff}m after ${cam1.id}. Speed: ${speed} km/h (Physically Impossible!).`,
            cameraId: newDet.cameraId,
          };
          setLogs(prev => [alertLog, ...prev]);

          // Optional: Trigger computer audio beep (or browser vibration) to grab investigator's attention
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
            osc.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
          } catch (e) {
            // fail-silent if audio sandbox restrictions block context
          }
        }
      }
    }
  };

  const handleResolveAlert = (alertId: string, status: 'RESOLVED' | 'DISMISSED') => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status } : a))
    );

    // Append resolution log
    const currentClock = new Date().toTimeString().split(' ')[0];
    const targetAlert = alerts.find(a => a.id === alertId);
    if (targetAlert) {
      const resolveLog: SystemLog = {
        id: `LOG-R-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: currentClock,
        level: 'SUCCESS',
        message: `ALERT RESOLUTION: Incident ${alertId} (${targetAlert.vehicleNumber}) marked as ${status}. Authorities updated.`,
      };
      setLogs(prev => [resolveLog, ...prev]);
    }
  };

  // RTO Record mutations
  const handleAddRtoRecord = (record: RTORecord) => {
    setRtoRegistry(prev => [record, ...prev]);
  };

  const handleUpdateRtoRecord = (updated: RTORecord) => {
    setRtoRegistry(prev =>
      prev.map(r => (r.registrationNumber === updated.registrationNumber ? updated : r))
    );
  };

  const handleDeleteRtoRecord = (regNum: string) => {
    setRtoRegistry(prev => prev.filter(r => r.registrationNumber !== regNum));
  };

  const handleToggleCameraStatus = (cameraId: string) => {
    setCameras(prev =>
      prev.map(c => (c.id === cameraId ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div id="v_watch_dashboard" className="w-full min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-sans flex flex-col overflow-x-hidden antialiased select-none">
      
      {/* Top Header Navigation */}
      <nav className="h-16 border-b border-[#2d2d33] flex items-center justify-between px-6 bg-[#111114] shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 font-mono">
            V-WATCH <span className="text-blue-500 font-light text-sm tracking-wider uppercase bg-blue-950/40 border border-blue-900/40 px-1.5 py-0.5 rounded">AI-CORE v2</span>
          </span>
        </div>

        {/* Global tab toggles */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#0a0a0c] p-1 border border-[#2d2d33] rounded-lg text-xs font-mono">
          <button
            onClick={() => setCurrentTab('CONSOLE')}
            className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'CONSOLE' ? 'bg-[#1e1e24] text-white border border-[#2d2d33]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={13} /> Console Center
          </button>
          <button
            onClick={() => setCurrentTab('SURVEILLANCE')}
            className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'SURVEILLANCE' ? 'bg-[#1e1e24] text-white border border-[#2d2d33]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search size={13} /> Search Log
          </button>
          <button
            onClick={() => setCurrentTab('RTO')}
            className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'RTO' ? 'bg-[#1e1e24] text-white border border-[#2d2d33]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database size={13} /> RTO Registry
          </button>
          <button
            onClick={() => setCurrentTab('ANALYTICS')}
            className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'ANALYTICS' ? 'bg-[#1e1e24] text-white border border-[#2d2d33]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={13} /> Analytics
          </button>
          <button
            onClick={() => setCurrentTab('CAMERAS')}
            className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'CAMERAS' ? 'bg-[#1e1e24] text-white border border-[#2d2d33]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin size={13} /> GPS Cams
          </button>
          <button
            onClick={() => setCurrentTab('AI_INVESTIGATOR')}
            className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'AI_INVESTIGATOR' ? 'bg-[#1e1e24] text-white border border-[#2d2d33]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot size={13} /> AI Copilot
          </button>
        </div>

        {/* System parameters */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest font-mono">System Live</span>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[8px] text-[#8e9299] uppercase tracking-widest font-mono">Server Time (UTC)</p>
            <p className="text-xs font-mono text-white tracking-wider">{serverTime || 'Loading time...'}</p>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-[#2d2d33] border border-[#3e3e46] flex items-center justify-center text-xs font-bold font-mono">
            JD
          </div>
        </div>
      </nav>

      {/* Mobile responsive tab toggler bar */}
      <div className="flex md:hidden items-center justify-around bg-[#111114] border-b border-[#2d2d33] p-2.5 overflow-x-auto text-[10px] font-mono shrink-0">
        <button onClick={() => setCurrentTab('CONSOLE')} className={`px-2.5 py-1.5 font-bold rounded ${currentTab === 'CONSOLE' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Console</button>
        <button onClick={() => setCurrentTab('SURVEILLANCE')} className={`px-2.5 py-1.5 font-bold rounded ${currentTab === 'SURVEILLANCE' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Search</button>
        <button onClick={() => setCurrentTab('RTO')} className={`px-2.5 py-1.5 font-bold rounded ${currentTab === 'RTO' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>RTO</button>
        <button onClick={() => setCurrentTab('ANALYTICS')} className={`px-2.5 py-1.5 font-bold rounded ${currentTab === 'ANALYTICS' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Stats</button>
        <button onClick={() => setCurrentTab('CAMERAS')} className={`px-2.5 py-1.5 font-bold rounded ${currentTab === 'CAMERAS' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Map</button>
        <button onClick={() => setCurrentTab('AI_INVESTIGATOR')} className={`px-2.5 py-1.5 font-bold rounded ${currentTab === 'AI_INVESTIGATOR' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>AI</button>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full gap-4">
        
        {/* Dynamic tab contents switcher */}
        {currentTab === 'CONSOLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            
            {/* Left Col: Stream + Last Scan Logs (takes 2 cols in wide grid) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {/* CCTV Feed Viewport */}
              <div className="flex-1 min-h-[350px]">
                <CCTVStream
                  activeCamera={activeCamera}
                  onVehicleDetected={handleNewDetection}
                  onCloneAlertTriggered={(alt) => setAlerts(prev => [alt, ...prev])}
                  rtoRegistry={rtoRegistry}
                  detections={detections}
                />
              </div>

              {/* Edge Node Live Logging Feed Terminal */}
              <div className="bg-[#111114] border border-[#2d2d33] rounded-xl p-3.5 h-48 flex flex-col">
                <h3 className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono border-b border-[#2d2d33]/50 pb-1 shrink-0">
                  <Terminal size={12} className="text-blue-500" /> Active Edge Node Event Logs
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] pr-1">
                  {logs.map(log => {
                    const colorClass =
                      log.level === 'ALERT'
                        ? 'text-red-400 font-bold bg-red-950/20 px-1 rounded border border-red-900/30'
                        : log.level === 'WARNING'
                        ? 'text-yellow-400 font-bold bg-yellow-950/20 px-1 rounded border border-yellow-900/30'
                        : log.level === 'SUCCESS'
                        ? 'text-green-400 font-bold bg-green-950/20 px-1 rounded border border-green-900/30'
                        : 'text-slate-400';
                    return (
                      <div key={log.id} className="flex items-start gap-2.5 py-0.5 hover:bg-[#1a1a22] rounded px-1.5 transition-colors">
                        <span className="text-blue-500 shrink-0">[{log.timestamp}]</span>
                        <span className={`${colorClass} flex-1 leading-relaxed`}>{log.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Active Cloned Alerts and Quick Stats */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              
              {/* Clone alert panels and incident details */}
              <div className="flex-1">
                <CloneAlertPanel
                  alerts={alerts}
                  cameras={cameras}
                  rtoRegistry={rtoRegistry}
                  onResolveAlert={handleResolveAlert}
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === 'SURVEILLANCE' && (
          <div className="flex-1">
            <VehicleSearch
              detections={detections}
              rtoRegistry={rtoRegistry}
              cameras={cameras}
            />
          </div>
        )}

        {currentTab === 'RTO' && (
          <div className="flex-1">
            <RTORegistry
              registry={rtoRegistry}
              onAddRecord={handleAddRtoRecord}
              onUpdateRecord={handleUpdateRtoRecord}
              onDeleteRecord={handleDeleteRtoRecord}
            />
          </div>
        )}

        {currentTab === 'ANALYTICS' && (
          <div className="flex-1">
            <StatisticsView
              detections={detections}
              alerts={alerts}
              cameras={cameras}
            />
          </div>
        )}

        {currentTab === 'CAMERAS' && (
          <div className="flex-1">
            <CameraManager
              cameras={cameras}
              activeCamera={activeCamera}
              onSelectCamera={(cam) => setActiveCameraId(cam.id)}
              onToggleCameraStatus={handleToggleCameraStatus}
              detections={detections}
            />
          </div>
        )}

        {currentTab === 'AI_INVESTIGATOR' && (
          <div className="flex-1">
            <AIInvestigator
              detections={detections}
              alerts={alerts}
              rtoRegistry={rtoRegistry}
            />
          </div>
        )}

      </main>

      {/* Bottom Status Information Footer */}
      <footer className="h-8 bg-[#111114] border-t border-[#2d2d33] flex items-center px-6 justify-between text-[10px] font-mono text-slate-500 shrink-0 z-20">
        <div className="flex gap-4">
          <span>DB_CONN: SQLITE_SIMULATOR_ACTIVE</span>
          <span className="hidden sm:inline">MODEL_VER: YOLOv8x-PLATE-SURVEIL</span>
          <span>GEO_STATION: 12.9716° N, 77.5946° E</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span>BENGALURU HW SURVEILLANCE DIVISION</span>
        </div>
      </footer>
    </div>
  );
}
