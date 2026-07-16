import React, { useState, useRef, useEffect } from 'react';
import { VehicleDetection, CloneAlert, RTORecord } from '../types';
import { Send, Sparkles, Bot, User, Trash2, ArrowRight } from 'lucide-react';

interface AIInvestigatorProps {
  detections: VehicleDetection[];
  alerts: CloneAlert[];
  rtoRegistry: RTORecord[];
}

interface Message {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  timestamp: string;
}

export default function AIInvestigator({ detections, alerts, rtoRegistry }: AIInvestigatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'BOT',
      text: "V-WATCH AI Investigator active. I can audit number plates, analyze time-distance physical anomalies, retrieve registered owner records from the RTO database, or suggest highway patrol coordinates. What can I investigate for you?",
      timestamp: '08:00',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const uniqueIdSuffix = Math.random().toString(36).substring(2, 9);
    const userMsg: Message = {
      id: `user-${Date.now()}-${uniqueIdSuffix}`,
      sender: 'USER',
      text: input,
      timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Copilot Response based on live database queries
    setTimeout(() => {
      const query = input.toLowerCase().trim().replace(/[-\s]/g, '');
      let replyText = '';

      // Rule-based Intelligent Agent Query Parser
      if (query.includes('plate') || query.includes('vehicle') || query.includes('audit') || /[a-z]{2}[0-9]{2}[a-z]{2}[0-9]{4}/i.test(query)) {
        // Try to match a plate number
        const matchedPlate = rtoRegistry.find(r => 
          query.includes(r.registrationNumber.toLowerCase()) || 
          r.registrationNumber.toLowerCase().includes(query)
        ) || rtoRegistry.find(r => 
          detections.some(d => d.vehicleNumber.toLowerCase() === r.registrationNumber.toLowerCase() && query.includes(d.vehicleNumber.toLowerCase()))
        );

        if (matchedPlate) {
          const registry = matchedPlate;
          const capturedScans = detections.filter(d => d.vehicleNumber.toUpperCase() === registry.registrationNumber.toUpperCase());
          const activeAlerts = alerts.filter(a => a.vehicleNumber.toUpperCase() === registry.registrationNumber.toUpperCase());

          replyText = `🔍 **Surveillance Audit Report for Plate: ${registry.registrationNumber}**\n\n` +
            `• **Registered Owner:** ${registry.ownerName}\n` +
            `• **Contact Info:** ${registry.phone}\n` +
            `• **RTO Vehicle Profile:** ${registry.manufacturer} ${registry.model} (${registry.color}, ${registry.type}, ${registry.fuelType} Fuel)\n` +
            `• **Logged Scans:** ${capturedScans.length} detections in active camera network.\n\n`;

          if (activeAlerts.length > 0) {
            replyText += `⚠️ **CRITICAL INCIDENTS FLAGGED:**\n`;
            activeAlerts.forEach(alt => {
              replyText += `- **[${alt.riskLevel} RISK]** ${alt.reason} (Status: ${alt.status})\n`;
            });
          } else {
            replyText += `✅ **Security Clearance:** No visual mismatched body properties or velocity travel anomalies detected. Plate matches current registered vehicle specifications.`;
          }
        } else {
          replyText = "I checked our local RTO registry for that plate number but did not find an exact match. Ensure the plate registration number is typed correctly (e.g. 'KA01MJ4521').";
        }
      } else if (query.includes('alert') || query.includes('anomaly') || query.includes('clone')) {
        const activeClones = alerts.filter(a => a.status === 'PENDING');
        if (activeClones.length > 0) {
          replyText = `🚨 **Audit of Current Active Cloned Anomalies:**\n\n`;
          activeClones.forEach((alt, i) => {
            replyText += `**Anomaly #${i+1}: Vehicle ${alt.vehicleNumber}**\n` +
              `• Risk Level: **${alt.riskLevel}**\n` +
              `• Trigger Reason: ${alt.reason}\n` +
              `• Action Recommended: Deploy highway interceptors immediately.\n\n`;
          });
        } else {
          replyText = "Excellent. There are currently no unresolved high-risk or medium-risk clone alerts in the system. All scanned plates match standard registry profiles.";
        }
      } else if (query.includes('explain') || query.includes('rule') || query.includes('how')) {
        replyText = "🧠 **V-WATCH AI Clone Detection Algorithm Rules:**\n\n" +
          "1. **Computer Vision Body Matching (Medium Risk):** YOLOv8 classifies the vehicle body type, and a custom color classifier extracts dominant color attributes. If the scanned vehicle type/color differs from the RTO registration records for that plate, a **Medium Risk** discrepancy alert is flagged.\n\n" +
          "2. **Velocity travel physical limit (High Risk):** If the same plate is scanned at Camera A and then at Camera B within elapsed time T, the system uses the geodetic **Haversine Formula** to compute physical distance D. If calculated required speed `S = D / T` exceeds 180 km/h, it is physically impossible. A **High Risk** Clone alert is generated with timestamp coordinates.";
      } else if (query.includes('clear') || query.includes('reset')) {
        setMessages([
          {
            id: `msg-init-${Math.random().toString(36).substring(2, 9)}`,
            sender: 'BOT',
            text: "Console cleared. Ready for next query.",
            timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
          }
        ]);
        setIsTyping(false);
        return;
      } else {
        replyText = "Understood. I can help you compile reports or perform SQL searches on vehicles. Try asking me:\n\n" +
          "• *'Analyze plate KA01MJ4521'* to audit a registered car.\n" +
          "• *'What clone alerts are active?'* to review speed anomalies.\n" +
          "• *'How do clone rules work?'* to audit our ML classifier guidelines.";
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: 'BOT',
        text: replyText,
        timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickQuestion = (text: string) => {
    setInput(text);
  };

  return (
    <div id="ai_investigator_panel" className="bg-[#111114] border border-[#2d2d33] rounded-xl p-5 flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2d2d33] pb-3">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-500 w-5 h-5" />
          <h2 className="text-white font-bold text-base uppercase tracking-tight">AI Copilot Investigator</h2>
        </div>
        <button
          onClick={() => setMessages([{
            id: `msg-init-${Math.random().toString(36).substring(2, 9)}`,
            sender: 'BOT',
            text: "V-WATCH AI Investigator active. Send a plate registration number to audit.",
            timestamp: '08:00'
          }])}
          className="p-1.5 hover:bg-[#2d2d33] text-slate-500 hover:text-white rounded transition-colors"
          title="Clear Conversation History"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0c] border border-[#2d2d33] rounded-xl p-3 space-y-3 min-h-[160px] max-h-[350px]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[85%] text-xs leading-relaxed ${
              msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
              msg.sender === 'USER' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {msg.sender === 'USER' ? <User size={12} /> : <Bot size={12} />}
            </div>

            {/* Bubble */}
            <div className="flex flex-col gap-1">
              <div className={`rounded-xl px-3 py-2 border whitespace-pre-line ${
                msg.sender === 'USER'
                  ? 'bg-blue-600/10 border-blue-500/30 text-white'
                  : 'bg-[#111114] border-[#2d2d33] text-slate-200'
              }`}>
                {msg.text}
              </div>
              <span className="text-[8px] font-mono text-slate-600 self-end px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 text-slate-500 max-w-[80%] items-center text-xs">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <Bot size={12} />
            </div>
            <div className="bg-[#111114] border border-[#2d2d33] rounded-xl px-3 py-1.5 flex gap-1 items-center font-mono text-[10px]">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce [animation-delay:0.2s]">●</span>
              <span className="animate-bounce [animation-delay:0.4s]">●</span>
              <span>Auditing database...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Helper */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => handleQuickQuestion('Analyze plate KA01MJ4521')}
          className="px-2.5 py-1 bg-[#141418] border border-[#2d2d33] hover:border-slate-500 text-slate-400 hover:text-white rounded-md text-[10px] font-mono transition-all cursor-pointer"
        >
          🔍 Audit Fortuner
        </button>
        <button
          onClick={() => handleQuickQuestion('What clone alerts are active?')}
          className="px-2.5 py-1 bg-[#141418] border border-[#2d2d33] hover:border-slate-500 text-slate-400 hover:text-white rounded-md text-[10px] font-mono transition-all cursor-pointer"
        >
          🚨 active alerts
        </button>
        <button
          onClick={() => handleQuickQuestion('How do clone rules work?')}
          className="px-2.5 py-1 bg-[#141418] border border-[#2d2d33] hover:border-slate-500 text-slate-400 hover:text-white rounded-md text-[10px] font-mono transition-all cursor-pointer"
        >
          🧠 explain rules
        </button>
      </div>

      {/* Input controls */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask AI Copilot (e.g. audit plate KA03MX9912)..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-[#0a0a0c] border border-[#2d2d33] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer shadow-md shadow-blue-500/10"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
