import { useState, useEffect, useRef } from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Client } from '@stomp/stompjs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CanMessage {
  timestamp: number;
  canId: string;
  dlc: number;
  data: string[];
  flag: string;
}

interface PredictionResult {
  message: CanMessage;
  predictionLabel: number;
  predictionClass: string;
  latencyMs: number;
  anomalyScore: number;
}

interface TimelinePoint {
  time: string;
  normal: number;
  attack: number;
}

export default function App() {
  let [connected, setConnected] = useState(false);
  let [currentTime, setCurrentTime] = useState("-");
  
  // Dashboard State
  let [totalPackets, setTotalPackets] = useState(0);
  let [alerts, setAlerts] = useState<PredictionResult[]>([]);
  let [rawEvents, setRawEvents] = useState<PredictionResult[]>([]);
  let [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  let [summary, setSummary] = useState({ dos: 0, fuzzy: 0, spoofing: 0 });
  let [lastLatency, setLastLatency] = useState(0);
  
  // Refs for tracking timeline buckets
  const bucketRef = useRef<{time: string, normal: number, attack: number} | null>(null);

  useEffect(() => {
    let clock = setInterval(() => {
      let now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    // Initialize initial timeline data
    let initialTimeline: TimelinePoint[] = [];
    let now = new Date();
    for (let i = 60; i >= 0; i--) {
        let t = new Date(now.getTime() - i * 1000);
        initialTimeline.push({
            time: t.toLocaleTimeString('en-US', { hour12: false }),
            normal: 0,
            attack: 0
        });
    }
    setTimelineData(initialTimeline);

    // Setup STOMP client
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws/alerts',
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/alerts', (msg) => {
          try {
            const payload = JSON.parse(msg.body) as PredictionResult;
            handleNewData(payload);
          } catch (e) {
            console.error(e);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onWebSocketError: () => {
        setConnected(false);
      }
    });

    client.activate();

    return () => {
      client.deactivate();
      clearInterval(clock);
    };
  }, []);

  // Aggregation ticker for timeline
  useEffect(() => {
    const ticker = setInterval(() => {
        let now = new Date();
        let timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        
        setTimelineData(prev => {
            let newArr = [...prev.slice(1)];
            if (bucketRef.current) {
                newArr.push({ ...bucketRef.current, time: timeStr });
            } else {
                newArr.push({ time: timeStr, normal: 0, attack: 0 });
            }
            return newArr;
        });
        
        // Reset bucket
        bucketRef.current = { time: timeStr, normal: 0, attack: 0 };
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const handleNewData = (payload: PredictionResult) => {
    setTotalPackets(prev => prev + 1);
    setLastLatency(payload.latencyMs);

    const isAttack = payload.predictionLabel !== 0;

    // Update bucket
    if (bucketRef.current) {
        if (isAttack) bucketRef.current.attack++;
        else bucketRef.current.normal++;
    }

    if (isAttack) {
      setAlerts(prev => {
        const newAlerts = [payload, ...prev];
        if (newAlerts.length > 50) return newAlerts.slice(0, 50);
        return newAlerts;
      });

      setSummary(prev => {
        const next = { ...prev };
        if (payload.predictionClass === 'DoS') next.dos++;
        else if (payload.predictionClass === 'Fuzzy') next.fuzzy++;
        else if (payload.predictionClass === 'Spoofing') next.spoofing++;
        return next;
      });
    }

    setRawEvents(prev => {
      const newEvents = [payload, ...prev];
      if (newEvents.length > 30) return newEvents.slice(0, 30);
      return newEvents;
    });
  };

  let statusText = "OPERATIONAL";
  let statusBg = "bg-[#198754] text-white";
  if (!connected) {
    statusText = "INACTIVE";
    statusBg = "bg-[#6c757d] text-white";
  } else {
    let recentAttacks = timelineData.slice(-10).reduce((sum, pt) => sum + pt.attack, 0);
    if (recentAttacks > 50) {
      statusText = "CRITICAL";
      statusBg = "bg-[#dc3545] text-white";
    } else if (recentAttacks > 10) {
      statusText = "ELEVATED";
      statusBg = "bg-[#fd7e14] text-white";
    }
  }

  const renderIncidentId = (index: number) => {
    let baseNum = 10023 + index;
    return `INC-2026-${baseNum}`;
  };

  const getSeverity = (label: string) => {
    if (label === 'DoS') return 'CRITICAL';
    if (label === 'Spoofing') return 'HIGH';
    if (label === 'Fuzzy') return 'MEDIUM';
    return 'LOW';
  };

  const formatDataHex = (dataArr: string[]) => {
    if (!dataArr) return "";
    return dataArr.map(d => d.padStart(2, '0').toUpperCase()).join(' ');
  };

  const maxCategoryCount = Math.max(summary.dos, summary.fuzzy, summary.spoofing, 1);

  return (
    <div className="h-screen w-screen bg-[#f8f9fa] text-[#212529] flex flex-col overflow-hidden select-none font-sans">
      
      {/* 1. HEADER */}
      <header className="h-14 shrink-0 bg-[#1E3A5F] text-white border-b border-[#13243a] px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold tracking-wider uppercase">
            National Cyber Security Monitoring Centre
          </h1>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/50 text-[10px] font-mono font-bold">
            OFFLINE MODE (EDGE AI)
          </span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono font-bold">
            NODE: VE-CAN-01
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-300">SYSTEM STATUS:</span>
            <span className={cn("px-2.5 py-0.5 text-[10px] font-extrabold rounded tracking-wider", statusBg)}>
              {statusText}
            </span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="flex flex-col items-end font-mono text-[10px]">
            <span className="text-[8px] text-slate-400 font-sans">CURRENT TIME</span>
            <span className="font-bold text-[#20c997]">{currentTime}</span>
          </div>
        </div>
      </header>

      {/* 2. KPI STRIP */}
      <section className="h-16 shrink-0 bg-white border-b border-[#dee2e6] grid grid-cols-4 divide-x divide-[#dee2e6] px-6 py-2 shadow-sm z-0">
        <div className="flex items-center justify-between px-6">
          <span className="text-[10px] text-[#495057] font-bold tracking-wider">TOTAL MESSAGES</span>
          <span className="text-lg font-bold font-mono text-[#1E3A5F]">{totalPackets.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between px-6">
          <span className="text-[10px] text-[#495057] font-bold tracking-wider">DETECTED ANOMALIES</span>
          <span className={cn("text-lg font-bold font-mono", summary.dos + summary.fuzzy + summary.spoofing > 0 ? "text-[#dc3545]" : "text-[#198754]")}>
            {summary.dos + summary.fuzzy + summary.spoofing}
          </span>
        </div>
        <div className="flex items-center justify-between px-6">
          <span className="text-[10px] text-[#495057] font-bold tracking-wider">LATEST LATENCY</span>
          <span className="text-lg font-bold font-mono text-[#1E3A5F]">{lastLatency.toFixed(2)} ms</span>
        </div>
        <div className="flex items-center justify-between px-6">
          <span className="text-[10px] text-[#495057] font-bold tracking-wider">STREAM STATUS</span>
          <span className={cn("text-base font-bold font-mono", connected ? "text-[#198754]" : "text-[#dc3545]")}>
            {connected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </section>

      {/* 3. MAIN BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL — THREAT BREAKDOWN & MODEL INFO */}
        <aside className="w-80 xl:w-96 shrink-0 border-r border-[#dee2e6] bg-[#f8f9fa] flex flex-col overflow-y-auto custom-scrollbar p-4 gap-4">
          
          <div className="gov-panel p-4">
            <h4 className="text-[10px] font-bold text-[#495057] tracking-wider mb-4 uppercase border-b border-[#dee2e6] pb-2">
              Threat Breakdown
            </h4>
            <div className="space-y-4">
              {/* DoS */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">DoS Attacks</span>
                  <span className="font-mono font-bold text-slate-900">{summary.dos}</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                  <div 
                    className="bg-[#dc3545] h-full transition-all duration-300"
                    style={{ width: `${(summary.dos / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
              {/* Spoofing */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Spoofing Attempts</span>
                  <span className="font-mono font-bold text-slate-900">{summary.spoofing}</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                  <div 
                    className="bg-[#fd7e14] h-full transition-all duration-300"
                    style={{ width: `${(summary.spoofing / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
              {/* Fuzzy */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Fuzzy Anomalies</span>
                  <span className="font-mono font-bold text-slate-900">{summary.fuzzy}</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                  <div 
                    className="bg-[#ffc107] h-full transition-all duration-300"
                    style={{ width: `${(summary.fuzzy / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="gov-panel p-4 flex-1">
            <h4 className="text-[10px] font-bold text-[#495057] tracking-wider mb-4 uppercase border-b border-[#dee2e6] pb-2">
              Model Info (EdgeGuard)
            </h4>
            
            <div className="space-y-3 text-[11px]">
                <div className="flex justify-between border-b border-dashed border-[#ced4da] pb-1">
                    <span className="font-bold text-slate-700">Accuracy</span>
                    <span className="font-mono font-bold text-[#1E3A5F]">70.08%</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-[#ced4da] pb-1">
                    <span className="font-bold text-slate-700">Macro F1</span>
                    <span className="font-mono font-bold text-[#1E3A5F]">75.85%</span>
                </div>
                
                <div className="pt-2">
                    <span className="font-bold text-slate-700 mb-1 block">Per-Class F1 Scores</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[10px]">
                        <div>Normal: <span className="font-bold text-[#198754]">0.9679</span></div>
                        <div>DoS: <span className="font-bold text-[#dc3545]">0.7011</span></div>
                        <div>Fuzzy: <span className="font-bold text-[#ffc107]">0.6288</span></div>
                        <div>Spoofing: <span className="font-bold text-[#fd7e14]">0.7362</span></div>
                    </div>
                </div>

                <div className="bg-[#e9ecef] p-2 rounded mt-3 text-[10px] text-slate-700 leading-tight">
                    <span className="font-bold">Methodology:</span> Evaluated using a strict chronological split (not random) to avoid temporal leakage on the HCRL dataset.
                </div>

                <div className="bg-amber-100 border border-amber-300 text-amber-900 p-2 rounded mt-3 text-[10px] leading-tight font-semibold">
                    *Known Limitations:* Attack-type sub-classification remains an active research challenge; binary attack detection (Normal vs Anomalous) achieves ~96% reliability.
                </div>
            </div>
          </div>

        </aside>

        {/* CENTER PANEL — TIMELINE CHART */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden border-r border-[#dee2e6]">
          <div className="px-4 py-2 bg-[#e9ecef] border-b border-[#dee2e6] text-[10px] text-[#495057] font-bold tracking-wider shrink-0 flex justify-between">
            <span>TRAFFIC & THREAT TIMELINE (60s)</span>
          </div>
          
          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#198754" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#198754" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc3545" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#dc3545" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dee2e6" />
                <XAxis dataKey="time" minTickGap={30} tick={{fontSize: 10, fill: '#6c757d'}} tickMargin={10} />
                <YAxis tick={{fontSize: 10, fill: '#6c757d'}} tickFormatter={(val) => Math.round(val).toString()} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#212529', border: 'none', borderRadius: '3px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="normal" stroke="#198754" fillOpacity={1} fill="url(#colorNormal)" isAnimationActive={false} name="Normal Msgs/s" />
                <Area type="stepAfter" dataKey="attack" stroke="#dc3545" fillOpacity={1} fill="url(#colorAttack)" isAnimationActive={false} name="Attack Msgs/s" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </main>

        {/* RIGHT PANEL — INCIDENT REGISTER */}
        <aside className="w-80 xl:w-[450px] shrink-0 bg-[#f8f9fa] flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-[#e9ecef] border-b border-[#dee2e6] text-[10px] text-[#495057] font-bold tracking-wider">
            ANOMALY LOG (LATEST 50)
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-2">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>INCIDENT ID</th>
                  <th>TIMESTAMP</th>
                  <th>CAN ID</th>
                  <th>CLASSIFICATION</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-slate-500 font-semibold text-xs">
                      No anomalies detected.
                    </td>
                  </tr>
                ) : alerts.map((alert, idx) => {
                  const severity = getSeverity(alert.predictionClass);
                  return (
                    <tr key={idx}>
                      <td className="font-mono text-[#1E3A5F]">{renderIncidentId(idx)}</td>
                      <td className="font-mono text-[10px]">{alert.message.timestamp.toFixed(4)}</td>
                      <td className="font-mono font-bold text-slate-800">{alert.message.canId}</td>
                      <td>
                        <span className={cn(
                          severity === 'CRITICAL' ? "badge-critical" :
                          severity === 'HIGH' ? "badge-high" :
                          severity === 'MEDIUM' ? "badge-medium" :
                          "badge-low"
                        )}>
                          {alert.predictionClass}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </aside>

      </div>

      {/* 4. BOTTOM PANEL — RAW PACKET TABLE */}
      <footer className="h-56 shrink-0 bg-[#f8f9fa] border-t border-[#dee2e6] flex flex-col overflow-hidden">
        <div className="px-4 py-2 bg-[#e9ecef] border-b border-[#dee2e6] text-[10px] text-[#495057] font-bold tracking-wider">
          LIVE CAN BUS TRAFFIC STREAM
        </div>
        <div className="flex-1 overflow-auto p-2 custom-scrollbar">
          <table className="gov-table w-full">
            <thead className="sticky top-0 z-10 bg-[#e9ecef]">
              <tr>
                <th className="w-24">Timestamp</th>
                <th className="w-16">CAN ID</th>
                <th className="w-12 text-center">DLC</th>
                <th>Payload (Hex)</th>
                <th className="w-24 text-center">Latency</th>
                <th className="w-28 text-center">Prediction</th>
              </tr>
            </thead>
            <tbody>
              {rawEvents.map((e, idx) => (
                <tr key={idx} className="hover:bg-[#e9ecef]">
                  <td className="font-mono text-[10px] text-slate-600">{e.message.timestamp.toFixed(4)}</td>
                  <td className="font-mono font-bold text-[#1E3A5F]">{e.message.canId}</td>
                  <td className="font-mono text-center">{e.message.dlc}</td>
                  <td className="font-mono tracking-widest text-slate-700">{formatDataHex(e.message.data)}</td>
                  <td className="font-mono text-center text-slate-600">{e.latencyMs.toFixed(2)} ms</td>
                  <td className="text-center">
                    <span className={cn(
                      "px-1.5 py-0.5 text-[9px] font-bold rounded",
                      e.predictionLabel !== 0 ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"
                    )}>
                      {e.predictionClass}
                    </span>
                  </td>
                </tr>
              ))}
              {rawEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-semibold">
                    Waiting for CAN bus stream...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </footer>

    </div>
  );
}
