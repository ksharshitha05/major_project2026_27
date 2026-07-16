import React, { useState } from 'react';
import { CloneAlert, Camera, RTORecord } from '../types';
import { ShieldAlert, MapPin, Clock, ArrowRight, CheckCircle2, User, Phone, Home, RefreshCw } from 'lucide-react';

interface CloneAlertPanelProps {
  alerts: CloneAlert[];
  cameras: Camera[];
  rtoRegistry: RTORecord[];
  onResolveAlert: (alertId: string, status: 'RESOLVED' | 'DISMISSED') => void;
}

export default function CloneAlertPanel({
  alerts,
  cameras,
  rtoRegistry,
  onResolveAlert,
}: CloneAlertPanelProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );

  // Fallback in case state shifts
  const activeAlertId = selectedAlertId || (alerts.length > 0 ? alerts[0].id : null);
  const selectedAlert = alerts.find(a => a.id === activeAlertId);

  const getCameraName = (id: string) => {
    return cameras.find(c => c.id === id)?.name || id;
  };

  const getOwnerDetails = (plateNum: string) => {
    // Strip space or hyphens for clean matching
    const cleanPlate = plateNum.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return rtoRegistry.find(
      r => r.registrationNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase() === cleanPlate
    );
  };

  const owner = selectedAlert ? getOwnerDetails(selectedAlert.vehicleNumber) : null;

  return (
    <div id="clone_alert_panel" className="flex flex-col h-full gap-4">
      {/* Active High Risk Alert Display */}
      {selectedAlert ? (
        <div className={`rounded-xl p-5 border flex flex-col gap-4 transition-all shadow-lg ${
          selectedAlert.riskLevel === 'HIGH'
            ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            : 'bg-yellow-950/20 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center animate-pulse ${
              selectedAlert.riskLevel === 'HIGH' ? 'bg-red-600' : 'bg-yellow-600'
            }`}>
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`font-extrabold uppercase tracking-tight text-base ${
                selectedAlert.riskLevel === 'HIGH' ? 'text-red-500' : 'text-yellow-500'
              }`}>
                CLONED VEHICLE DETECTED
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                {selectedAlert.riskLevel} Risk • {selectedAlert.status}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3.5 text-xs font-mono">
            {/* Plate Number Showcase */}
            <div className="flex justify-between items-end border-b border-[#2d2d33] pb-2">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">VEHICLE NUMBER</span>
              <span className="text-xl font-bold text-white tracking-widest">{selectedAlert.vehicleNumber}</span>
            </div>

            {/* Travel Path & Locations */}
            {selectedAlert.riskLevel === 'HIGH' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111114] border border-[#2d2d33] p-2.5 rounded-lg">
                  <p className="text-[9px] text-slate-500 mb-1 uppercase tracking-widest">Original Camera (Primary)</p>
                  <p className="text-[11px] text-white font-bold truncate">{getCameraName(selectedAlert.camera1Id)}</p>
                  <p className="text-[10px] font-mono text-blue-400 mt-1 flex items-center gap-1">
                    <Clock size={10} /> {selectedAlert.time1}
                  </p>
                </div>
                <div className="bg-[#111114] border border-[#2d2d33] p-2.5 rounded-lg">
                  <p className="text-[9px] text-slate-500 mb-1 uppercase tracking-widest">Duplicate Camera (Secondary)</p>
                  <p className="text-[11px] text-white font-bold truncate">{getCameraName(selectedAlert.camera2Id)}</p>
                  <p className="text-[10px] font-mono text-blue-400 mt-1 flex items-center gap-1">
                    <Clock size={10} /> {selectedAlert.time2}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#111114] border border-[#2d2d33] p-2.5 rounded-lg">
                <p className="text-[9px] text-slate-500 mb-1 uppercase tracking-widest">Detection Camera</p>
                <p className="text-[11px] text-white font-bold">{getCameraName(selectedAlert.camera1Id)}</p>
                <p className="text-[10px] font-mono text-blue-400 mt-1 flex items-center gap-1">
                  <Clock size={10} /> {selectedAlert.time1}
                </p>
              </div>
            )}

            {/* Violations and Speeds */}
            {selectedAlert.riskLevel === 'HIGH' && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-red-200">Distance Traveled:</span>
                  <span className="text-white font-bold">{selectedAlert.distanceKm} KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">Actual Time Taken:</span>
                  <span className="text-white font-bold">{selectedAlert.actualTimeMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">Required Speed:</span>
                  <span className="text-white font-bold text-red-400">{selectedAlert.requiredSpeedKmh} KM/H</span>
                </div>
                <div className="h-[1px] bg-red-500/20 my-1"></div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-red-400 font-bold">Physical status:</span>
                  <span className="text-red-400 font-bold uppercase tracking-widest animate-pulse">PHYSICALLY IMPOSSIBLE</span>
                </div>
              </div>
            )}

            {/* Vehicle Comparison Breakdown */}
            <div className="bg-[#111114] border border-[#2d2d33] p-3 rounded-lg space-y-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">Computer Vision vs. Registry Mismatch</p>
              <div className="grid grid-cols-3 gap-2 text-[10px] border-b border-[#2d2d33]/50 pb-2">
                <span className="text-slate-500">Feature</span>
                <span className="text-slate-400 font-bold">Scan / Original</span>
                <span className="text-slate-400 font-bold">RTO / Duplicate</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <span className="text-slate-500">Color:</span>
                <span className="text-white font-bold">{selectedAlert.comparison.color1}</span>
                <span className="text-white font-bold">{selectedAlert.comparison.color2}</span>
                
                <span className="text-slate-500">Model:</span>
                <span className="text-white font-bold truncate">{selectedAlert.comparison.model1}</span>
                <span className="text-white font-bold truncate">{selectedAlert.comparison.model2}</span>
                
                <span className="text-slate-500">Body Type:</span>
                <span className="text-white font-bold">{selectedAlert.comparison.type1}</span>
                <span className="text-white font-bold">{selectedAlert.comparison.type2}</span>
              </div>
            </div>

            {/* Registered Owner details */}
            <div className="bg-[#111114]/50 border border-[#2d2d33] p-3 rounded-lg text-[11px] space-y-1.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
                <User size={10} /> RTO Registered Owner Details
              </p>
              {owner ? (
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Owner Name:</span>
                    <span className="text-white font-bold">{owner.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact No:</span>
                    <span className="text-blue-400 font-bold">{owner.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Model:</span>
                    <span className="text-white">{owner.manufacturer} {owner.model}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-[#2d2d33]/50">
                    <p className="leading-relaxed"><span className="text-slate-500">Address:</span> {owner.ownerAddress}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">No RTO Record found for this plate number.</p>
              )}
            </div>

            {/* Alert reason and rules triggered */}
            <p className="text-[10px] text-slate-400 italic bg-[#1c1c22] p-2.5 rounded-lg border border-[#2d2d33] leading-relaxed">
              ⚠️ <span className="text-slate-300 font-bold">Incident Reason:</span> {selectedAlert.reason}
            </p>
          </div>

          {/* Action buttons */}
          {selectedAlert.status === 'PENDING' ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => onResolveAlert(selectedAlert.id, 'RESOLVED')}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-blue-500/20 cursor-pointer"
              >
                Notify Authority
              </button>
              <button
                onClick={() => onResolveAlert(selectedAlert.id, 'DISMISSED')}
                className="py-2.5 bg-[#2d2d33] hover:bg-[#3e3e46] text-slate-300 font-bold rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Dismiss Alert
              </button>
            </div>
          ) : (
            <div className="bg-green-950/20 border border-green-500/30 p-3 rounded-lg text-green-400 text-xs font-bold flex items-center justify-center gap-2 mt-2">
              <CheckCircle2 size={16} /> Alert marked as {selectedAlert.status}. Response dispatched.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#111114] border border-[#2d2d33] rounded-xl p-6 text-center text-slate-500 flex flex-col items-center justify-center min-h-[350px]">
          <CheckCircle2 size={40} className="text-green-500 mb-3 opacity-60" />
          <h3 className="text-white font-bold mb-1 text-sm uppercase">No Active Clone Alerts</h3>
          <p className="text-xs max-w-xs">All vehicle plates scanned match their registry details and conform to physical travel limits.</p>
        </div>
      )}

      {/* Mini Queue of Pending/Historical Alerts */}
      <div className="bg-[#111114] border border-[#2d2d33] rounded-xl p-3 flex flex-col flex-1 min-h-[160px] overflow-hidden">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Alerts Stack ({alerts.length})</span>
          <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-mono">
            {alerts.filter(a => a.status === 'PENDING').length} PENDING
          </span>
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {alerts.map(alt => {
            const isSelected = alt.id === activeAlertId;
            return (
              <button
                key={alt.id}
                onClick={() => setSelectedAlertId(alt.id)}
                className={`w-full p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e1e24] border-blue-500/50'
                    : 'bg-[#0c0c0e] border-[#2d2d33] hover:bg-[#141418]'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alt.riskLevel === 'HIGH' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-white font-bold truncate">{alt.vehicleNumber}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      alt.riskLevel === 'HIGH' ? 'bg-red-950/40 text-red-400' : 'bg-yellow-950/40 text-yellow-400'
                    }`}>
                      {alt.riskLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {getCameraName(alt.camera1Id)}
                  </p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-1">
                    <span>{alt.time1}</span>
                    <span className={`font-bold ${alt.status === 'PENDING' ? 'text-red-400' : 'text-green-500'}`}>
                      {alt.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
