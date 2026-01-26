'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import VoiceAssistant from '@/components/interactive/VoiceAssistant';
import QuizOverlay from '@/components/interactive/QuizOverlay';

const DEFAULT_HUB_IP = 'localhost';

export default function SimulatorPage() {
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);

    const [wsStatus, setWsStatus] = useState('Disconnected');
    const [hubIp, setHubIp] = useState<string | null>(null);
    const [activeQuizStation, setActiveQuizStation] = useState<string | null>(null);
    const [voiceLang, setVoiceLang] = useState<'vi-VN' | 'en-US'>('vi-VN');
    const [logs, setLogs] = useState<any[]>([]);

    // Fetch Hub IP
    useEffect(() => {
        const getHubIp = async () => {
            if (!supabase) {
                setHubIp(DEFAULT_HUB_IP);
                return;
            }
            try {
                const { data } = await supabase
                    .from('robot_profiles')
                    .select('hub_ip')
                    .eq('is_active', true)
                    .single();
                setHubIp(data?.hub_ip || DEFAULT_HUB_IP);
            } catch (err) {
                setHubIp(DEFAULT_HUB_IP);
            }
        };
        getHubIp();
    }, []);

    // WebSocket Connection
    useEffect(() => {
        if (!hubIp) return;

        const connectWs = () => {
            try {
                const socket = new WebSocket(`ws://${hubIp}:8765`);
                socket.onopen = () => {
                    setWsStatus('Connected');
                    addLog('Virtual link established.', 'system');
                };
                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'voice_response') {
                        window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: data.text } }));
                        addLog(`AI: ${data.text}`, 'system');
                    } else if (data.type === 'event' && data.event === 'site_discovered') {
                        setActiveQuizStation(data.station_id);
                        addLog(`Virtual Discovery: ${data.site_name}`, 'info');
                    }
                };
                socket.onclose = () => {
                    setWsStatus('Disconnected');
                    setTimeout(connectWs, 3000);
                };
                wsRef.current = socket;
            } catch (err) {
                console.error("WS Error:", err);
            }
        };
        connectWs();
        return () => wsRef.current?.close();
    }, [hubIp]);

    const addLog = (msg: string, type = 'info') => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 10));
    };

    const simulateDiscovery = (id: string, name: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                command: 'site_discovered',
                params: { site_id: id, site_name: name }
            }));
            addLog(`Simulated arrival at ${name}`, 'info');
        }
    };

    const handleVoiceCommand = (text: string, lang: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                command: 'voice_command',
                params: { text, lang }
            }));
            addLog(`You: ${text}`, 'info');
        }
    };

    const heritageSites = [
        { id: 'trang_an', name: 'Tràng An (Ninh Bình)', icon: '⛰️' },
        { id: 'cot_co', name: 'Cột cờ Hà Nội', icon: '🚩' },
        { id: 'pho_co_hoi_an', name: 'Phố cổ Hội An', icon: '🏮' },
        { id: 'vinh_ha_long', name: 'Vịnh Hạ Long', icon: '⛵' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-sans overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">

                {/* Header */}
                <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl">🕹️</div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter">Heritage Simulator</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Virtual Test Lab • {wsStatus}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black border ${wsStatus === 'Connected' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'}`}>
                            {wsStatus.toUpperCase()}
                        </div>
                        <button onClick={() => router.push('/judge')} className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black hover:bg-slate-700 transition-all border border-white/5">
                            GO TO JUDGE PORTAL
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Interactive Map Simulation */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                        <div className="bg-slate-900/30 border border-white/5 rounded-[40px] p-8 min-h-[500px] flex flex-col">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 px-2">Click to reach Heritage Site</h3>

                            <div className="grid grid-cols-2 gap-6 flex-1">
                                {heritageSites.map((site) => (
                                    <button
                                        key={site.id}
                                        onClick={() => simulateDiscovery(site.id, site.name)}
                                        className="group relative bg-slate-800/40 border border-white/5 hover:border-purple-500/50 rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-4 hover:bg-slate-800"
                                    >
                                        <span className="text-5xl group-hover:scale-110 transition-transform">{site.icon}</span>
                                        <span className="text-sm font-black uppercase tracking-widest text-slate-300">{site.name}</span>
                                        <div className="absolute inset-x-4 bottom-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-600 w-0 group-hover:w-full transition-all duration-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="bg-black/40 border border-white/5 rounded-[32px] p-6 font-mono text-[11px] h-40 overflow-hidden flex flex-col shadow-inner">
                            <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4 border-b border-white/5 pb-2">Simulator Logs</h4>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-1">
                                        <span className="text-slate-600">[{log.time}]</span>
                                        <span className={log.type === 'system' ? 'text-purple-400' : 'text-slate-300'}>{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Interaction Hub */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-slate-900 border border-white/10 rounded-[40px] p-8 flex flex-col items-center shadow-2xl">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">AI Interaction Lab</h3>
                            <VoiceAssistant
                                activeLanguage={voiceLang}
                                onLanguageChange={setVoiceLang}
                                onCommand={handleVoiceCommand}
                            />
                            <p className="mt-8 text-[9px] text-center text-slate-500 leading-relaxed max-w-[200px]">
                                Use voice or text to interact with Gemini AI. Simulator will trigger Quizzes upon clicking sites.
                            </p>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/5 rounded-[40px] p-8 flex flex-col justify-center items-center text-center gap-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl">🤖</div>
                            <h4 className="font-black italic uppercase tracking-tighter">Smart Guide Active</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">Gemini is ready to storytelling based on your virtual location.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Quiz Overlay for Simulator */}
            {activeQuizStation && (
                <QuizOverlay
                    stationId={activeQuizStation}
                    onClose={() => setActiveQuizStation(null)}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
