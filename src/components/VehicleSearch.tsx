import React, { useState } from 'react';
import { VehicleDetection, RTORecord, Camera } from '../types';
import { Search, MapPin, Calendar, Clock, Sparkles, Filter } from 'lucide-react';

interface VehicleSearchProps {
  detections: VehicleDetection[];
  rtoRegistry: RTORecord[];
  cameras: Camera[];
}

export default function VehicleSearch({ detections, rtoRegistry, cameras }: VehicleSearchProps) {
  const [plateQuery, setPlateQuery] = useState('');
  const [ownerQuery, setOwnerQuery] = useState('');
  const [colorQuery, setColorQuery] = useState('ALL');
  const [typeQuery, setTypeQuery] = useState('ALL');
  const [cameraQuery, setCameraQuery] = useState('ALL');
  const [dateQuery, setDateQuery] = useState('');

  // Get unique colors and types from logs to populate selects
  const uniqueColors = Array.from(new Set(detections.map(d => d.color)));
  const uniqueTypes = Array.from(new Set(detections.map(d => d.type)));

  const getOwnerName = (plate: string) => {
    const cleanPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const rto = rtoRegistry.find(
      r => r.registrationNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase() === cleanPlate
    );
    return rto ? rto.ownerName : 'Unknown / Unregistered';
  };

  const getCameraName = (id: string) => {
    return cameras.find(c => c.id === id)?.name || id;
  };

  // Perform search filter logic
  const filteredDetections = detections.filter(det => {
    const cleanPlate = det.vehicleNumber.toLowerCase();
    const matchPlate = cleanPlate.includes(plateQuery.toLowerCase());
    
    const ownerName = getOwnerName(det.vehicleNumber).toLowerCase();
    const matchOwner = ownerName.includes(ownerQuery.toLowerCase());

    const matchColor = colorQuery === 'ALL' || det.color === colorQuery;
    const matchType = typeQuery === 'ALL' || det.type === typeQuery;
    const matchCamera = cameraQuery === 'ALL' || det.cameraId === cameraQuery;
    const matchDate = !dateQuery || det.captureDate === dateQuery;

    return matchPlate && matchOwner && matchColor && matchType && matchCamera && matchDate;
  });

  return (
    <div id="vehicle_search_view" className="bg-[#111114] border border-[#2d2d33] rounded-xl p-5 flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2d2d33] pb-3">
        <Search className="text-blue-500 w-5 h-5" />
        <h2 className="text-white font-bold text-base uppercase tracking-tight">Active Vehicle Search & Surveillance Log</h2>
      </div>

      {/* Advanced Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-[#0a0a0c] border border-[#2d2d33] p-4 rounded-xl text-xs font-mono">
        {/* Plate search */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Plate Number</label>
          <div className="relative">
            <span className="absolute left-2.5 top-2.5 text-slate-500"><Search size={12} /></span>
            <input
              type="text"
              placeholder="e.g. KA01"
              value={plateQuery}
              onChange={e => setPlateQuery(e.target.value)}
              className="w-full bg-[#111114] border border-[#2d2d33] rounded px-2 py-1.5 pl-8 text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
            />
          </div>
        </div>

        {/* Owner Name Search */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Registered Owner</label>
          <input
            type="text"
            placeholder="e.g. Suresh"
            value={ownerQuery}
            onChange={e => setOwnerQuery(e.target.value)}
            className="w-full bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Camera Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">CCTV Camera</label>
          <select
            value={cameraQuery}
            onChange={e => setCameraQuery(e.target.value)}
            className="w-full bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">ALL CAMERAS</option>
            {cameras.map(cam => (
              <option key={cam.id} value={cam.id}>{cam.id} - {cam.name.substring(0, 15)}...</option>
            ))}
          </select>
        </div>

        {/* Vehicle Classification Type */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Body Type</label>
          <select
            value={typeQuery}
            onChange={e => setTypeQuery(e.target.value)}
            className="w-full bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">ALL TYPES</option>
            {uniqueTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Color Match */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Detected Color</label>
          <select
            value={colorQuery}
            onChange={e => setColorQuery(e.target.value)}
            className="w-full bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">ALL COLORS</option>
            {uniqueColors.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Specific Date Range */}
        <div className="flex flex-col gap-1">
          <label className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Capture Date</label>
          <input
            type="date"
            value={dateQuery}
            onChange={e => setDateQuery(e.target.value)}
            className="w-full bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-1 text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono px-1">
        <span>Surveillance index match count: <strong className="text-white">{filteredDetections.length} matches</strong></span>
        <span className="text-blue-400">Computer Vision precision filter: Active</span>
      </div>

      {/* Results Table & Mobile List */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {/* Table for large screens */}
        <table className="w-full text-left border-collapse text-xs hidden sm:table">
          <thead>
            <tr className="border-b border-[#2d2d33] text-slate-500 font-mono uppercase bg-[#141418]">
              <th className="py-3 px-4">Captured Image</th>
              <th className="py-3 px-4">Plate No.</th>
              <th className="py-3 px-4">Live Classification</th>
              <th className="py-3 px-4">RTO Registered Owner</th>
              <th className="py-3 px-4">Scanned Camera Location</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d2d33]/50 font-mono text-slate-300">
            {filteredDetections.length > 0 ? (
              filteredDetections.map(det => (
                <tr key={det.id} className="hover:bg-[#1a1a1f] transition-all">
                  {/* Generated mini visual vehicle SVG instead of empty block */}
                  <td className="py-3 px-4">
                    <div className="w-12 h-8 rounded bg-[#1c1c22] border border-[#2d2d33] flex items-center justify-center overflow-hidden">
                      <span
                        className="w-4 h-4 rounded-sm inline-block"
                        style={{
                          backgroundColor:
                            det.color.toLowerCase() === 'white' ? '#e2e8f0' :
                            det.color.toLowerCase() === 'black' ? '#0f172a' :
                            det.color.toLowerCase() === 'red' ? '#ef4444' :
                            det.color.toLowerCase() === 'blue' ? '#3b82f6' :
                            det.color.toLowerCase() === 'teal' ? '#14b8a6' :
                            det.color.toLowerCase() === 'yellow' ? '#eab308' : '#64748b'
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-white text-black px-2.5 py-0.5 rounded border border-slate-500 font-bold text-[10px] whitespace-nowrap inline-block">
                      {det.vehicleNumber.replace(/([A-Z]{2})([0-9]{2})([A-Z]{2})([0-9]{4})/, '$1-$2-$3-$4')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">
                    <span className="font-bold">{det.model}</span>
                    <span className="text-[9px] text-slate-500 block">Color: {det.color} • Body: {det.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white block font-semibold">{getOwnerName(det.vehicleNumber)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white font-bold block">{getCameraName(det.cameraId)}</span>
                    <span className="text-[9px] text-slate-500 block">ID: {det.cameraId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white block">{det.captureTime}</span>
                    <span className="text-[9px] text-slate-500 block">{det.captureDate}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-blue-950/40 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-900/40 text-[10px]">
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                  No vehicle detections matched your specified criteria. Apply wider filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* List of cards for small mobile screens */}
        <div className="block sm:hidden space-y-3">
          {filteredDetections.length > 0 ? (
            filteredDetections.map(det => (
              <div key={det.id} className="bg-[#0a0a0c] border border-[#2d2d33] p-3 rounded-lg space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="bg-white text-black px-2.5 py-0.5 rounded border border-slate-500 font-bold text-[10px] whitespace-nowrap inline-block">
                    {det.vehicleNumber.replace(/([A-Z]{2})([0-9]{2})([A-Z]{2})([0-9]{4})/, '$1-$2-$3-$4')}
                  </span>
                  <span className="bg-blue-950/40 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-900/40 text-[9px]">
                    {(det.confidence * 100).toFixed(0)}% Match
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#2d2d33]/50">
                  <div>
                    <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Classification</p>
                    <p className="text-white font-bold">{det.model}</p>
                    <p className="text-[9px] text-slate-400">{det.color} • {det.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Registered Owner</p>
                    <p className="text-white font-bold">{getOwnerName(det.vehicleNumber)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#2d2d33]/50">
                  <div>
                    <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Location</p>
                    <p className="text-white font-semibold truncate">{getCameraName(det.cameraId)}</p>
                    <p className="text-[9px] text-slate-500">ID: {det.cameraId}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Captured At</p>
                    <p className="text-white font-semibold">{det.captureTime}</p>
                    <p className="text-[9px] text-slate-500">{det.captureDate}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500 italic">
              No vehicle detections matched your specified criteria. Apply wider filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
