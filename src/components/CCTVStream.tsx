import React, { useState, useEffect, useRef } from 'react';
import { Camera, VehicleDetection, RTORecord } from '../types';
import { INITIAL_CAMERAS } from '../mockData';
import { Play, Pause, AlertTriangle, Upload, RefreshCw, Layers } from 'lucide-react';

interface CCTVStreamProps {
  activeCamera: Camera;
  onVehicleDetected: (detection: VehicleDetection) => void;
  onCloneAlertTriggered: (alert: any) => void;
  rtoRegistry: RTORecord[];
  detections: VehicleDetection[];
}

export default function CCTVStream({
  activeCamera,
  onVehicleDetected,
  onCloneAlertTriggered,
  rtoRegistry,
  detections,
}: CCTVStreamProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [streamFps, setStreamFps] = useState(30);
  const [detectionMode, setDetectionMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Simulation car queue
  const carTypes = ['Car', 'Bike', 'Bus', 'Truck', 'Auto', 'Van'] as const;
  const colors = ['White', 'Red', 'Blue', 'Black', 'Teal', 'Grey', 'Silver', 'Yellow'];
  const modelsMap: Record<string, string[]> = {
    Car: ['Toyota Fortuner', 'Hyundai i20', 'Maruti Swift', 'Mahindra XUV700', 'Tata Nexon', 'Honda City'],
    Bike: ['Classic 350', 'Yamaha R15', 'KTM Duke', 'Activa 6G'],
    Bus: ['Volvo B11R', 'Scania Metrolink', 'Tata Starbus'],
    Truck: ['Tata Ace', 'Ashok Leyland Dost', 'Mahindra Bolero Pickup'],
    Auto: ['RE Optima', 'Piaggio Ape'],
    Van: ['Maruti Eeco', 'Force Traveller']
  };

  const plateStates = ['KA', 'DL', 'MH', 'HR', 'UP', 'TS', 'AP'];

  // Current drawing state
  const carX = useRef(100);
  const carSpeed = useRef(4);
  const currentCarDetails = useRef({
    plate: 'KA01MJ4521',
    color: 'White',
    type: 'Car' as 'Car' | 'Bike' | 'Bus' | 'Truck' | 'Auto' | 'Van',
    model: 'Toyota Fortuner',
    confidence: 0.98,
    plateBox: { x: 340, y: 155, w: 50, h: 18 }
  });

  // Generate random plate
  const generateRandomPlate = () => {
    const state = plateStates[Math.floor(Math.random() * plateStates.length)];
    const code = String(Math.floor(Math.random() * 90) + 10).padStart(2, '0');
    const series = String.fromCharCode(
      Math.floor(Math.random() * 26) + 65,
      Math.floor(Math.random() * 26) + 65
    );
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return `${state}${code}${series}${num}`;
  };

  // Switch car details when it loops or on-demand
  const cycleCar = () => {
    // 80% chance it is in the RTO database, 20% random
    const isRegistered = Math.random() < 0.8;
    if (isRegistered && rtoRegistry.length > 0) {
      const rto = rtoRegistry[Math.floor(Math.random() * rtoRegistry.length)];
      currentCarDetails.current = {
        plate: rto.registrationNumber,
        color: rto.color,
        type: rto.type,
        model: rto.model,
        confidence: Number((0.92 + Math.random() * 0.07).toFixed(2)),
        plateBox: { x: 280, y: 150, w: 54, h: 20 }
      };
    } else {
      const type = carTypes[Math.floor(Math.random() * carTypes.length)];
      const modelList = modelsMap[type];
      const model = modelList[Math.floor(Math.random() * modelList.length)];
      currentCarDetails.current = {
        plate: generateRandomPlate(),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: type,
        model: model,
        confidence: Number((0.90 + Math.random() * 0.08).toFixed(2)),
        plateBox: { x: 280, y: 150, w: 54, h: 20 }
      };
    }
  };

  // Main canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrame = 0;

    const render = () => {
      localFrame++;
      
      // Clear canvas
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background perspective road
      ctx.strokeStyle = '#2d2d33';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 280);
      ctx.lineTo(540, 280);
      ctx.stroke();

      // Road markings (perspective lanes)
      ctx.fillStyle = '#1c1c22';
      ctx.beginPath();
      ctx.moveTo(150, 280);
      ctx.lineTo(250, 100);
      ctx.lineTo(390, 100);
      ctx.lineTo(490, 280);
      ctx.closePath();
      ctx.fill();

      // Lane dividers
      ctx.strokeStyle = '#ef4444'; // Red edge alert boundaries
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(270, 280);
      ctx.lineTo(320, 100);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw camera info text
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`CAM FPS: ${streamFps}`, 20, 25);
      ctx.fillText(`LATENCY: ${18 + Math.round(Math.random() * 10)}ms`, 120, 25);
      ctx.fillText(`COORD: ${activeCamera.latitude.toFixed(4)} N, ${activeCamera.longitude.toFixed(4)} E`, 230, 25);

      // Move simulated vehicle if isPlaying
      if (isPlaying) {
        carX.current += carSpeed.current;
        if (carX.current > canvas.width + 150) {
          carX.current = -120;
          cycleCar();
          // Trigger actual detection event inside state
          if (detectionMode === 'AUTO') {
            triggerDetectionEvent();
          }
        }
      }

      // Draw car body & wheels
      const cx = carX.current;
      const cy = 170;
      const carType = currentCarDetails.current.type;
      const bodyColor = currentCarDetails.current.color;

      // Color mapping
      const colorHexMap: Record<string, string> = {
        White: '#f8fafc',
        Red: '#ef4444',
        Blue: '#3b82f6',
        Black: '#0f172a',
        Teal: '#14b8a6',
        Grey: '#64748b',
        Silver: '#cbd5e1',
        Yellow: '#eab308'
      };
      const carHex = colorHexMap[bodyColor] || '#3b82f6';

      // Draw bounding box
      const isOverlappingDetectionZone = cx > 180 && cx < 420;
      if (isOverlappingDetectionZone) {
        // Red glow box
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 85, cy - 65, 170, 95);
        
        // Bounding box tag
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(cx - 85, cy - 85, 130, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`VEHICLE_${carType.toUpperCase()} [${currentCarDetails.current.confidence}]`, cx - 80, cy - 72);

        // Plate bounding box (license plate area)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        const plateOffsetLeft = carType === 'Bike' ? -15 : -35;
        const plateOffsetTop = carType === 'Bike' ? 10 : 12;
        const pWidth = carType === 'Bike' ? 30 : 70;
        const pHeight = carType === 'Bike' ? 14 : 16;
        ctx.strokeRect(cx + plateOffsetLeft, cy + plateOffsetTop, pWidth, pHeight);

        // Plate tag
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cx + plateOffsetLeft, cy + plateOffsetTop - 12, 60, 12);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('PLATE OCR', cx + plateOffsetLeft + 4, cy + plateOffsetTop - 3);
      }

      // Render actual vehicle structure
      if (carType === 'Car' || carType === 'Van' || carType === 'Truck') {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(cx - 70, cy + 22, 140, 10);

        // Body
        ctx.fillStyle = carHex;
        ctx.beginPath();
        ctx.moveTo(cx - 60, cy + 5);
        ctx.lineTo(cx - 55, cy - 25);
        ctx.lineTo(cx - 20, cy - 40);
        ctx.lineTo(cx + 25, cy - 40);
        ctx.lineTo(cx + 55, cy - 10);
        ctx.lineTo(cx + 65, cy + 5);
        ctx.lineTo(cx + 65, cy + 20);
        ctx.lineTo(cx - 60, cy + 20);
        ctx.closePath();
        ctx.fill();

        // Windows
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy - 36);
        ctx.lineTo(cx - 50, cy - 22);
        ctx.lineTo(cx - 25, cy - 22);
        ctx.closePath();
        ctx.fill();

        ctx.fillRect(cx - 20, cy - 36, 40, 14);

        // Wheels
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(cx - 40, cy + 20, 12, 0, Math.PI * 2);
        ctx.arc(cx + 40, cy + 20, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(cx - 40, cy + 20, 5, 0, Math.PI * 2);
        ctx.arc(cx + 40, cy + 20, 5, 0, Math.PI * 2);
        ctx.fill();

        // Front grill and lights
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(cx + 58, cy + 2, 8, 8); // Headlight right
        ctx.fillStyle = '#f97316';
        ctx.fillRect(cx - 60, cy + 2, 6, 6); // Taillight left

        // Real plate drawing inside license plate area
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 25, cy + 10, 50, 12);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 25, cy + 10, 50, 12);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentCarDetails.current.plate, cx, cy + 19);
        ctx.textAlign = 'left';
      } else if (carType === 'Bike') {
        // Bike drawing
        ctx.fillStyle = carHex;
        ctx.fillRect(cx - 20, cy - 10, 40, 15);
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(cx - 25, cy + 15, 10, 0, Math.PI * 2);
        ctx.arc(cx + 25, cy + 15, 10, 0, Math.PI * 2);
        ctx.fill();
        // Helmet rider
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111114';
        ctx.fillRect(cx, cy - 10, 12, 15);

        // Plate drawing
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 15, cy + 5, 30, 10);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentCarDetails.current.plate.substring(0, 5), cx, cy + 10);
        ctx.textAlign = 'left';
      } else {
        // Heavy vehicle / Bus / Truck representation
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx - 80, cy - 50, 160, 70);
        ctx.fillStyle = carHex;
        ctx.fillRect(cx - 80, cy - 20, 160, 30);
        // Wheels
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 50, cy + 15, 15, 0, Math.PI * 2);
        ctx.arc(cx + 50, cy + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        // Plate drawing
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 25, cy + 5, 50, 12);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentCarDetails.current.plate, cx, cy + 14);
        ctx.textAlign = 'left';
      }

      // Visual scan lines / overlay effects
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Scanning radar line
      const pulseY = (localFrame * 2) % canvas.height;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, pulseY);
      ctx.lineTo(canvas.width, pulseY);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, activeCamera, streamFps, rtoRegistry, detectionMode]);

  // Handle triggering detection updates in backend state
  const triggerDetectionEvent = () => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const dateStr = new Date().toISOString().split('T')[0];
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const newDetection: VehicleDetection = {
      id: `DET-${Date.now()}-${uniqueSuffix}`,
      vehicleNumber: currentCarDetails.current.plate,
      color: currentCarDetails.current.color,
      model: currentCarDetails.current.model,
      type: currentCarDetails.current.type,
      cameraId: activeCamera.id,
      captureTime: timeStr,
      captureDate: dateStr,
      imageSeed: Math.floor(Math.random() * 100) + 1,
      confidence: currentCarDetails.current.confidence,
    };
    onVehicleDetected(newDetection);
  };

  // Trigger high-risk distance speed cloning violation manually
  const simulateClonedViolation = () => {
    const testPlate = 'KA03MX9912'; // registered to Red Hyundai i20
    
    // First scan details (happened 2 minutes ago at CAM-03 Electronic City)
    const now = new Date();
    const time2Str = now.toTimeString().split(' ')[0];
    
    const time1Obj = new Date(now.getTime() - 2 * 60 * 1000 - 30 * 1000); // 2.5 minutes ago
    const time1Str = time1Obj.toTimeString().split(' ')[0];
    
    // Position car immediately in scanning zone
    carX.current = 250;
    currentCarDetails.current = {
      plate: testPlate,
      color: 'Red',
      type: 'Car',
      model: 'Hyundai i20',
      confidence: 0.98,
      plateBox: { x: 280, y: 150, w: 54, h: 20 }
    };
    
    const uniqueSuffix1 = Math.random().toString(36).substring(2, 9);
    // Log the first scan at Electronic city (if it wasn't already in history)
    const prevDetection: VehicleDetection = {
      id: `DET-PREV-${Date.now()}-${uniqueSuffix1}`,
      vehicleNumber: testPlate,
      color: 'Red',
      model: 'Hyundai i20',
      type: 'Car',
      cameraId: 'CAM-03', // Electronic City
      captureTime: time1Str,
      captureDate: now.toISOString().split('T')[0],
      imageSeed: 55,
      confidence: 0.98,
    };
    onVehicleDetected(prevDetection);

    const uniqueSuffix2 = Math.random().toString(36).substring(2, 9);
    // Log the second scan right now at current active camera (e.g. CAM-05 Whitefield or any other)
    const currentCameraId = activeCamera.id === 'CAM-03' ? 'CAM-05' : activeCamera.id;
    
    const currentDetection: VehicleDetection = {
      id: `DET-CURR-${Date.now()}-${uniqueSuffix2}`,
      vehicleNumber: testPlate,
      color: 'Red',
      model: 'Hyundai i20',
      type: 'Car',
      cameraId: currentCameraId,
      captureTime: time2Str,
      captureDate: now.toISOString().split('T')[0],
      imageSeed: 56,
      confidence: 0.99,
    };
    onVehicleDetected(currentDetection);
  };

  // Trigger color mismatch discrepancy manually
  const simulateColorDiscrepancy = () => {
    const testPlate = 'KA51EZ5566'; // Registered to Teal Tata Nexon
    carX.current = 250;
    currentCarDetails.current = {
      plate: testPlate,
      color: 'Black', // Live scan mismatch color
      type: 'Car',
      model: 'Tata Nexon',
      confidence: 0.97,
      plateBox: { x: 280, y: 150, w: 54, h: 20 }
    };

    const timeStr = new Date().toTimeString().split(' ')[0];
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const newDetection: VehicleDetection = {
      id: `DET-${Date.now()}-${uniqueSuffix}`,
      vehicleNumber: testPlate,
      color: 'Black',
      model: 'Tata Nexon',
      type: 'Car',
      cameraId: activeCamera.id,
      captureTime: timeStr,
      captureDate: new Date().toISOString().split('T')[0],
      imageSeed: 88,
      confidence: 0.97,
    };
    onVehicleDetected(newDetection);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsProcessingVideo(true);
      // Simulate video processing
      setTimeout(() => {
        setIsProcessingVideo(false);
        // Position car and perform detection
        carX.current = 250;
        cycleCar();
        triggerDetectionEvent();
      }, 3000);
    }
  };

  return (
    <div id="cctv_stream_panel" className="bg-[#111114] border border-[#2d2d33] rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="h-12 border-b border-[#2d2d33] px-4 flex items-center justify-between bg-[#141418]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">
            LIVE FEED: {activeCamera.name} ({activeCamera.id})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            id="btn_play_pause"
            className="p-1.5 rounded-md hover:bg-[#2d2d33] text-slate-400 hover:text-white transition-colors"
            title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => {
              cycleCar();
              if (canvasRef.current) carX.current = 100;
            }}
            id="btn_skip_car"
            className="p-1.5 rounded-md hover:bg-[#2d2d33] text-slate-400 hover:text-white transition-colors"
            title="Simulate Next Vehicle"
          >
            <RefreshCw size={14} />
          </button>
          <div className="h-4 w-[1px] bg-[#2d2d33]"></div>
          <div className="flex rounded-md bg-[#0a0a0c] p-0.5 border border-[#2d2d33]">
            <button
              onClick={() => setDetectionMode('AUTO')}
              className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${
                detectionMode === 'AUTO' ? 'bg-[#3b82f6] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AUTO
            </button>
            <button
              onClick={() => setDetectionMode('MANUAL')}
              className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${
                detectionMode === 'MANUAL' ? 'bg-[#3b82f6] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MANUAL
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center min-h-[250px]">
        {/* Cam identifier overlay */}
        <div className="absolute top-4 left-4 z-10 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-[10px] font-mono tracking-wider text-slate-200">
          📍 {activeCamera.location}
        </div>

        {/* Processing Indicator */}
        {isProcessingVideo && (
          <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={32} className="text-blue-500 animate-spin" />
            <span className="text-xs font-mono text-slate-300">Analyzing uploaded footage frames...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={580}
          height={280}
          className="w-full h-full object-cover max-h-[300px]"
        />

        {/* Bounding box models used tags */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <div className="px-2 py-1 bg-blue-600 text-[9px] font-bold rounded text-white tracking-widest shadow-md">
            YOLOv8
          </div>
          <div className="px-2 py-1 bg-purple-600 text-[9px] font-bold rounded text-white tracking-widest shadow-md">
            EasyOCR
          </div>
        </div>
      </div>

      {/* Controls & Quick Actions */}
      <div className="p-3 border-t border-[#2d2d33] bg-[#141418] grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Live scanner readout */}
        <div className="bg-[#0a0a0c] border border-[#2d2d33] rounded-lg p-2.5 flex items-center gap-3">
          <div className="bg-white text-black px-2.5 py-1.5 rounded border border-slate-400 flex flex-col items-center shrink-0 shadow-lg">
            <span className="text-[7px] font-extrabold tracking-widest text-slate-500 -mb-1 leading-none">IND</span>
            <span className="text-lg font-bold font-mono tracking-tight leading-none">
              {currentCarDetails.current.plate.replace(/([A-Z]{2})([0-9]{2})([A-Z]{2})([0-9]{4})/, '$1-$2-$3-$4')}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">TYPE:</span>
              <span className="text-white font-bold truncate">{currentCarDetails.current.type} ({currentCarDetails.current.color})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MODEL:</span>
              <span className="text-white font-bold truncate">{currentCarDetails.current.model}</span>
            </div>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex flex-col gap-1.5 justify-center">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={simulateClonedViolation}
              id="btn_sim_clone"
              className="py-1.5 px-2 bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 text-red-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertTriangle size={11} /> Clone Speed Viol
            </button>
            <button
              onClick={simulateColorDiscrepancy}
              id="btn_sim_mismatch"
              className="py-1.5 px-2 bg-yellow-950/40 border border-yellow-500/40 hover:bg-yellow-900/50 text-yellow-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers size={11} /> Color Discrepancy
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              id="btn_upload_cctv"
              className="flex-1 py-1 px-2 border border-[#3e3e46] hover:bg-[#2d2d33] text-slate-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload size={11} />
              {uploadedFileName ? `${uploadedFileName.substring(0, 12)}...` : 'Upload CCTV Video'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/*"
              className="hidden"
            />
            {detectionMode === 'MANUAL' && (
              <button
                onClick={triggerDetectionEvent}
                className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold"
              >
                Log Capture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
