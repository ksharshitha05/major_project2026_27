import React, { useState } from 'react';
import { Camera, VehicleDetection } from '../types';
import { MapPin, Shield, Layers, Circle, Wifi, WifiOff } from 'lucide-react';

interface CameraManagerProps {
  cameras: Camera[];
  activeCamera: Camera;
  onSelectCamera: (camera: Camera) => void;
  onToggleCameraStatus: (cameraId: string) => void;
  detections: VehicleDetection[];
}

export default function CameraManager({
  cameras,
  activeCamera,
  onSelectCamera,
  onToggleCameraStatus,
  detections,
}: CameraManagerProps) {
  const [hoveredCamera, setHoveredCamera] = useState<Camera | null>(null);

  // Bengaluru coordinates bounding center
  // lat: 12.84 to 12.99, lng: 77.59 to 77.73
  // Let's draw an SVG map of the camera network nodes with interactive hover pins.

  const getDetectionsCount = (cameraId: string) => {
    return detections.filter(d => d.cameraId === cameraId).length;
  };

  return (
    <div id="camera_manager_panel" className="bg-[#111114] border border-[#2d2d33] rounded-xl p-5 flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2d2d33] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="text-blue-500 w-5 h-5" />
          <h2 className="text-white font-bold text-base uppercase tracking-tight">CCTV Edge Camera Network (GPS Map)</h2>
        </div>
        <span className="text-[10px] font-mono bg-[#1c1c22] border border-[#2d2d33] text-blue-400 px-2 py-0.5 rounded">
          {cameras.filter(c => c.active).length} / {cameras.length} Nodes Online
        </span>
      </div>

      {/* SVG Interactive Map Grid */}
      <div className="relative bg-[#0a0a0c] border border-[#2d2d33] rounded-xl h-64 overflow-hidden flex items-center justify-center">
        {/* Abstract road grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          {/* Main Highway Roads (Grid representation of BLR Ring Roads) */}
          <line x1="20" y1="130" x2="380" y2="130" stroke="#475569" strokeWidth="2" />
          <line x1="150" y1="10" x2="150" y2="250" stroke="#475569" strokeWidth="2" />
          
          <path d="M 40 40 Q 200 130 360 220" stroke="#334155" strokeWidth="1.5" fill="none" />
          <path d="M 40 220 Q 200 130 360 40" stroke="#334155" strokeWidth="1.5" fill="none" />

          {/* Concentric grid lines for scanner depth */}
          <circle cx="150" cy="130" r="50" stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="4,4" />
          <circle cx="150" cy="130" r="100" stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="4,4" />
        </svg>

        {/* Camera Map Node Pins */}
        {cameras.map((cam, idx) => {
          // Robust percentage projection coordinates bounds:
          const minLat = 12.8300;
          const maxLat = 12.9950;
          const minLng = 77.5950;
          const maxLng = 77.7400;

          const xPct = ((cam.longitude - minLng) / (maxLng - minLng)) * 100;
          const yPct = (1 - (cam.latitude - minLat) / (maxLat - minLat)) * 100;

          const isSelected = cam.id === activeCamera.id;
          
          return (
            <div
              key={cam.id}
              style={{
                position: 'absolute',
                left: `${Math.max(5, Math.min(95, xPct))}%`,
                top: `${Math.max(5, Math.min(90, yPct))}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-10 group"
              onMouseEnter={() => setHoveredCamera(cam)}
              onMouseLeave={() => setHoveredCamera(null)}
            >
              {/* Pulsing signal halo */}
              {cam.active && (
                <span className={`absolute left-0.5 top-0.5 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 animate-ping ${
                  isSelected ? 'bg-blue-500' : 'bg-green-500'
                }`} />
              )}

              {/* Pin Icon */}
              <button
                onClick={() => onSelectCamera(cam)}
                className={`p-1 rounded-full relative border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 scale-125 z-20'
                    : cam.active
                    ? 'bg-[#111114] text-green-400 border-green-500/50 hover:scale-110'
                    : 'bg-[#111114] text-slate-600 border-[#2d2d33] opacity-60 hover:opacity-100'
                }`}
              >
                <MapPin size={14} />
              </button>

              {/* Floating ID label */}
              <span className="absolute left-6 -top-1 px-1 py-0.5 bg-black/85 text-[8px] font-mono text-white rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {cam.id}
              </span>
            </div>
          );
        })}

        {/* Live coordinate compass overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded border border-white/5 text-[8px] font-mono text-slate-500">
          GRID BOUNDS: BLR_SECTOR_4
        </div>

        {/* Hover/Active Camera Information Card */}
        {(hoveredCamera || activeCamera) && (
          <div className="absolute top-3 right-3 bg-[#111114]/90 backdrop-blur-md border border-slate-700/50 p-2.5 rounded-lg w-44 text-[10px] font-mono leading-relaxed shadow-lg">
            {(() => {
              const displayCam = hoveredCamera || activeCamera;
              return (
                <>
                  <div className="flex justify-between font-bold text-white border-b border-[#2d2d33] pb-1 mb-1">
                    <span className="truncate">{displayCam.id}</span>
                    <span className={displayCam.active ? 'text-green-500' : 'text-red-500'}>
                      ● {displayCam.active ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <p className="text-white font-semibold truncate leading-tight mb-1">{displayCam.name}</p>
                  <p className="text-slate-500">LAT: {displayCam.latitude.toFixed(4)}</p>
                  <p className="text-slate-500">LNG: {displayCam.longitude.toFixed(4)}</p>
                  <div className="flex justify-between text-slate-300 mt-1">
                    <span>Logs captured:</span>
                    <strong className="text-white">{getDetectionsCount(displayCam.id)}</strong>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Camera Controller list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {cameras.map(cam => {
          const isSelected = cam.id === activeCamera.id;
          return (
            <div
              key={cam.id}
              className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-[#1e1e24] border-blue-500/50'
                  : 'bg-[#0c0c0e] border-[#2d2d33]'
              }`}
            >
              <button
                onClick={() => onSelectCamera(cam)}
                className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
              >
                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-blue-600/20 text-blue-400' : 'bg-[#141418] text-slate-400'}`}>
                  <MapPin size={14} />
                </div>
                <div className="truncate">
                  <p className="text-xs text-white font-bold truncate leading-tight">{cam.name}</p>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    ID: {cam.id} • Total {getDetectionsCount(cam.id)} Scans
                  </span>
                </div>
              </button>

              {/* Edge node network state toggles */}
              <button
                onClick={() => onToggleCameraStatus(cam.id)}
                className={`p-1.5 rounded-md ml-2 transition-colors cursor-pointer border ${
                  cam.active
                    ? 'text-green-500 bg-green-950/20 hover:bg-green-900/30 border-green-900/40'
                    : 'text-red-500 bg-red-950/20 hover:bg-red-900/30 border-red-900/40'
                }`}
                title={cam.active ? 'Disable Camera Node' : 'Enable Camera Node'}
              >
                {cam.active ? <Wifi size={13} /> : <WifiOff size={13} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
