'use client';

import { useState, useEffect, useRef } from 'react';
import JudgeStatsCard from '@/components/judge/JudgeStatsCard';
import MissionTimeline from '@/components/judge/MissionTimeline';
import JudgePinModal from '@/components/judge/JudgePinModal';
import LiveMap from '@/components/judge/LiveMap';
import { useRouter } from 'next/navigation';

const HUB_IP = process.env.NEXT_PUBLIC_HUB_IP || 'localhost';
const WS_URL = `ws://${HUB_IP}:8765`;

export default function JudgePage() {
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);

    // Auth State
    const [isAuthorized, setIsAuthorized] = useState(false);

    // UI Local State
    const [currentTime, setCurrentTime] = useState('');
    const [fps, setFps] = useState(0);
    const [wsStatus, setWsStatus] = useState('Disconnected');

    // Telemetry State
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [latency, setLatency] = useState(0);
    const [currentScore, setCurrentScore] = useState(0);
    const [robotPos, setRobotPos] = useState({ x: 100, y: 100 });
    const [path, setPath] = useState<{ x: number, y: number }[]>([]);
    const [logs, setLogs] = useState<{ time: string, msg: string, type: string }[]>([]);

    const missionSteps = [
        { id: '1', label: 'Khám phá Tràng An', status: 'completed' as const },
        { id: '2', label: 'Thu thập Vật phẩm', status: 'current' as const },
        { id: '3', label: 'Giải đố Cột cờ', status: 'pending' as const },
        { id: '4', label: 'Về đích', status: 'pending' as const },
    ];

    // WebSocket Connection
    useEffect(() => {
        if (!isAuthorized) return;

        const connectWs = () => {
            const socket = new WebSocket(WS_URL);
            const start = Date.now();

            socket.onopen = () => {
                setWsStatus('Connected');
                setLatency(Date.now() - start);
                addLog('Secure bridge established.', 'system');
            };

            socket.onmessage = (event) => {
                try {
                    const data = json_parse(event.data);
                    if (data.type === 'telemetry') {
                        if (data.battery !== undefined) setBatteryLevel(data.battery);
                        if (data.pos) {
                            setRobotPos(data.pos);
                            setPath(prev => [...prev, data.pos].slice(-100)); // Keep last 100 points
                        }
                    }
                } catch (e) { }
            };

            socket.onclose = () => {
                setWsStatus('Disconnected');
                setTimeout(connectWs, 3000);
            };

            wsRef.current = socket;
        };

        connectWs();
        return () => wsRef.current?.close();
    }, [isAuthorized]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const addLog = (msg: string, type = 'info') => {
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 50));
    };

    if (!isAuthorized) {
        return <JudgePinModal onSuccess={() => setIsAuthorized(true)} />;
    }

    return (
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 h-screen max-h-screen bg-slate-950 overflow-hidden">
            {/* TOP BAR */}
            <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md p-5 rounded-[32px] border border-white/10 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)] ring-1 ring-white/20">
                        <span className="text-3xl">📜</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
                                The Storyteller
                            </h1>
                            <div className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-[8px] font-black tracking-widest text-purple-400 uppercase">
                                v2.0 Final
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5 opacity-60 italic">World Robot Olympiad 2026 • Live Surveillance</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-3xl font-black font-mono tracking-tighter text-white tabular-nums">{currentTime}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5 flex items-center justify-end gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Precise Local Time
                        </div>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <button
                        onClick={() => router.push('/')}
                        className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all group"
                    >
                        <span className="text-2xl group-hover:scale-125 transition-transform">🏠</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* LEFT: STATUS & MAP */}
                <div className="col-span-8 flex flex-col gap-6 h-full min-h-0">
                    {/* Status Row */}
                    <div className="grid grid-cols-3 gap-6">
                        <JudgeStatsCard
                            title="Robot Connection"
                            value={wsStatus === 'Connected' ? 'ONLINE' : 'OFFLINE'}
                            icon="🛰️"
                            status={wsStatus === 'Connected' ? 'success' : 'critical'}
                            subtext={`Latency: ${latency}ms`}
                        />
                        <JudgeStatsCard
                            title="Battery Level"
                            value={`${batteryLevel}%`}
                            icon="⚡"
                            status={batteryLevel > 20 ? 'normal' : 'critical'}
                            subtext={batteryLevel > 20 ? "Mission Capable" : "Immediate RTB"}
                        />
                        <JudgeStatsCard
                            title="Global Points"
                            value={currentScore}
                            icon="💎"
                            status="warning"
                            subtext="Live Scoring Feed"
                        />
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 bg-slate-900/30 border border-white/5 rounded-[40px] relative overflow-hidden group shadow-inner">
                        <LiveMap currentPos={robotPos} path={path} />

                        {/* Live Badge */}
                        <div className="absolute top-8 left-8 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black tracking-[0.2em] uppercase rounded-2xl flex items-center gap-3 backdrop-blur-md">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute left-4" />
                            Telemetry: Live
                        </div>
                    </div>
                </div>

                {/* RIGHT: TIMELINE & LOGS */}
                <div className="col-span-4 h-full min-h-0 flex flex-col gap-6">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-2 flex-1 flex flex-col min-h-0 shadow-2xl">
                        <div className="p-6 pb-2">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6 px-2">Objective Tracker</h3>
                            <MissionTimeline steps={missionSteps} />
                        </div>

                        <div className="mt-auto p-4 flex flex-col gap-4">
                            <div className="h-[260px] bg-black/40 border border-white/5 rounded-[32px] p-5 font-mono text-[11px] flex flex-col shadow-inner">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Surveillance Logs</span>
                                    <span className="px-2 py-0.5 bg-blue-500/20 rounded text-blue-400 text-[8px] font-bold">STREAMING</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {logs.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-slate-700 italic">No logs received...</div>
                                    )}
                                    {logs.map((log, i) => (
                                        <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                            <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                            <span className={`${log.type === 'system' ? 'text-blue-400' : 'text-slate-300'}`}>{log.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* QUICK ACTION */}
                            <button className="w-full py-4 bg-red-600/10 border border-red-600/30 rounded-3xl text-red-500 text-[10px] font-black tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all">
                                🚨 Emergency Pause
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}

function json_parse(str: string) {
    try { return JSON.parse(str); } catch (e) { return {}; }
}
