import React, { useState } from 'react';
import { RTORecord } from '../types';
import { Plus, Search, Edit2, Trash2, X, Check, Database, Save } from 'lucide-react';

interface RTORegistryProps {
  registry: RTORecord[];
  onAddRecord: (record: RTORecord) => void;
  onUpdateRecord: (record: RTORecord) => void;
  onDeleteRecord: (registrationNumber: string) => void;
}

export default function RTORegistry({
  registry,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}: RTORegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RTORecord | null>(null);

  // Form states
  const [regNum, setRegNum] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState<'Car' | 'Bike' | 'Bus' | 'Truck' | 'Auto' | 'Van'>('Car');
  const [manufacturer, setManufacturer] = useState('');
  const [engine, setEngine] = useState('');
  const [chassis, setChassis] = useState('');
  const [regDate, setRegDate] = useState('');
  const [fuel, setFuel] = useState<'Petrol' | 'Diesel' | 'EV' | 'CNG'>('Petrol');

  const handleEditClick = (record: RTORecord) => {
    setEditingRecord(record);
    setRegNum(record.registrationNumber);
    setOwnerName(record.ownerName);
    setAddress(record.ownerAddress);
    setPhone(record.phone);
    setModel(record.model);
    setColor(record.color);
    setType(record.type);
    setManufacturer(record.manufacturer);
    setEngine(record.engineNumber);
    setChassis(record.chassisNumber);
    setRegDate(record.registrationDate);
    setFuel(record.fuelType);
    setIsAdding(true);
  };

  const resetForm = () => {
    setRegNum('');
    setOwnerName('');
    setAddress('');
    setPhone('');
    setModel('');
    setColor('');
    setType('Car');
    setManufacturer('');
    setEngine('');
    setChassis('');
    setRegDate('');
    setFuel('Petrol');
    setIsAdding(false);
    setEditingRecord(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum) return;

    const recordData: RTORecord = {
      registrationNumber: regNum.replace(/\s+/g, '').toUpperCase(),
      ownerName,
      ownerAddress: address,
      phone,
      model,
      color,
      type,
      manufacturer,
      engineNumber: engine,
      chassisNumber: chassis,
      registrationDate: regDate || new Date().toISOString().split('T')[0],
      fuelType: fuel,
    };

    if (editingRecord) {
      onUpdateRecord(recordData);
    } else {
      onAddRecord(recordData);
    }
    resetForm();
  };

  const filteredRegistry = registry.filter(
    record =>
      record.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="rto_registry_view" className="bg-[#111114] border border-[#2d2d33] rounded-xl p-5 flex flex-col h-full gap-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="text-blue-500 w-5 h-5" />
          <h2 className="text-white font-bold text-base uppercase tracking-tight">RTO Registry (Local DB Simulator)</h2>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-60">
            <span className="absolute left-3 top-2.5 text-slate-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search plate, owner, model..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0a0a0c] border border-[#2d2d33] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            id="btn_add_rto"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add Record
          </button>
        </div>
      </div>

      {/* Form Overlay Modal / Expandable form */}
      {isAdding && (
        <div className="bg-[#0a0a0c] border border-blue-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2d2d33] pb-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              {editingRecord ? '✏️ Edit RTO Registration Record' : '➕ Create New RTO Registry Entry'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Plate Registration Number *</label>
              <input
                type="text"
                required
                disabled={!!editingRecord}
                placeholder="e.g. KA01MJ4521"
                value={regNum}
                onChange={e => setRegNum(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500 uppercase disabled:opacity-50"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Owner Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Sharma"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Contact Phone *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-slate-500 font-mono">Registered Home Address</label>
              <input
                type="text"
                placeholder="e.g. Flat 402, Shanthi Residency, Indira Nagar, Bengaluru"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Vehicle Class / Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Bus">Bus</option>
                <option value="Truck">Truck</option>
                <option value="Auto">Auto</option>
                <option value="Van">Van</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Manufacturer Brand</label>
              <input
                type="text"
                placeholder="e.g. Toyota"
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Model Name</label>
              <input
                type="text"
                placeholder="e.g. Fortuner"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Registered Color *</label>
              <input
                type="text"
                required
                placeholder="e.g. White"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Fuel Type</label>
              <select
                value={fuel}
                onChange={e => setFuel(e.target.value as any)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="EV">EV</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Registration Date</label>
              <input
                type="date"
                value={regDate}
                onChange={e => setRegDate(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Engine Serial Number</label>
              <input
                type="text"
                placeholder="e.g. E-1234567"
                value={engine}
                onChange={e => setEngine(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 font-mono">Chassis Serial Number</label>
              <input
                type="text"
                placeholder="e.g. C-7891011"
                value={chassis}
                onChange={e => setChassis(e.target.value)}
                className="bg-[#111114] border border-[#2d2d33] rounded px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex items-end justify-end md:col-span-1 gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[#2d2d33] text-slate-300 rounded font-bold hover:bg-[#2d2d33] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save size={14} /> {editingRecord ? 'Save Changes' : 'Create Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Database Table & Mobile List */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {/* Table for large screens */}
        <table className="w-full text-left border-collapse text-xs hidden sm:table">
          <thead>
            <tr className="border-b border-[#2d2d33] text-slate-500 font-mono uppercase bg-[#141418]">
              <th className="py-3 px-4">Plate No.</th>
              <th className="py-3 px-4">Owner Name</th>
              <th className="py-3 px-4">Model Description</th>
              <th className="py-3 px-4">Color</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Fuel</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d2d33]/50 font-mono text-slate-300">
            {filteredRegistry.length > 0 ? (
              filteredRegistry.map(rec => (
                <tr key={rec.registrationNumber} className="hover:bg-[#1a1a1f] transition-all">
                  <td className="py-3 px-4">
                    <span className="bg-white text-black px-2 py-0.5 rounded border border-slate-500 font-bold text-[10px]">
                      {rec.registrationNumber.replace(/([A-Z]{2})([0-9]{2})([A-Z]{2})([0-9]{4})/, '$1-$2-$3-$4')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{rec.ownerName}</td>
                  <td className="py-3 px-4">{rec.manufacturer} {rec.model}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-600 inline-block"
                        style={{
                          backgroundColor:
                            rec.color.toLowerCase() === 'white'
                              ? '#ffffff'
                              : rec.color.toLowerCase() === 'black'
                              ? '#000000'
                              : rec.color.toLowerCase() === 'red'
                              ? '#ef4444'
                              : rec.color.toLowerCase() === 'blue'
                              ? '#3b82f6'
                              : rec.color.toLowerCase() === 'teal'
                              ? '#14b8a6'
                              : rec.color.toLowerCase() === 'yellow'
                              ? '#eab308'
                              : '#888888',
                        }}
                      />
                      {rec.color}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-[#1e1e24] px-2 py-0.5 rounded text-slate-400 font-bold text-[10px]">
                      {rec.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-blue-400 font-bold">{rec.fuelType}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(rec)}
                        className="p-1.5 hover:bg-[#2d2d33] text-blue-400 rounded transition-colors"
                        title="Edit registry details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteRecord(rec.registrationNumber)}
                        className="p-1.5 hover:bg-red-950/40 text-red-400 rounded transition-colors"
                        title="Delete registry entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                  No registered vehicles found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* List of cards for small mobile screens */}
        <div className="block sm:hidden space-y-3">
          {filteredRegistry.length > 0 ? (
            filteredRegistry.map(rec => (
              <div key={rec.registrationNumber} className="bg-[#0a0a0c] border border-[#2d2d33] p-3 rounded-lg space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="bg-white text-black px-2.5 py-0.5 rounded border border-slate-500 font-bold text-[10px] whitespace-nowrap inline-block font-sans">
                    {rec.registrationNumber.replace(/([A-Z]{2})([0-9]{2})([A-Z]{2})([0-9]{4})/, '$1-$2-$3-$4')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditClick(rec)}
                      className="p-1.5 hover:bg-[#2d2d33] text-blue-400 rounded transition-colors"
                      title="Edit registry details"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteRecord(rec.registrationNumber)}
                      className="p-1.5 hover:bg-red-950/40 text-red-400 rounded transition-colors"
                      title="Delete registry entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#2d2d33]/50">
                  <div>
                    <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Registered Owner</p>
                    <p className="text-white font-bold">{rec.ownerName}</p>
                    <p className="text-[9px] text-slate-400">{rec.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Vehicle details</p>
                    <p className="text-white font-bold">{rec.manufacturer} {rec.model}</p>
                    <p className="text-[9px] text-slate-400">{rec.color} • {rec.type} ({rec.fuelType})</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500 italic">
              No registered vehicles found matching the filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
