'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function GameControllerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [lastCommand, setLastCommand] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);

    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
    const [isLandscape, setIsLandscape] = useState(true);

    useEffect(() => {
        const mq = window.matchMedia('(orientation: landscape)');
        const checkOrientation = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsLandscape(e.matches);
        };
        checkOrientation(mq);
        mq.addEventListener('change', checkOrientation);
        return () => mq.removeEventListener('change', checkOrientation);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeKeys.has(e.code) || !profile?.key_mappings) return;

            const mappings = profile.key_mappings;
            const newKeys = new Set(activeKeys);
            newKeys.add(e.code);
            setActiveKeys(newKeys);

            if (e.code === mappings.forward) sendCommand('move', { direction: 'forward', speed: profile.speed_profile.forward });
            else if (e.code === mappings.backward) sendCommand('move', { direction: 'backward', speed: profile.speed_profile.forward });
            else if (e.code === mappings.left) sendCommand('move', { direction: 'left', speed: profile.speed_profile.turn });
            else if (e.code === mappings.right) sendCommand('move', { direction: 'right', speed: profile.speed_profile.turn });
            else if (e.code === mappings.aux1) sendCommand('aux_move', { port: 'aux1', value: profile.aux_settings.aux1.value, unit: profile.aux_settings.aux1.unit });
            else if (e.code === mappings.aux2) sendCommand('aux_move', { port: 'aux2', value: profile.aux_settings.aux2.value, unit: profile.aux_settings.aux2.unit });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!profile?.key_mappings) return;
            const mappings = profile.key_mappings;

            const newKeys = new Set(activeKeys);
            newKeys.delete(e.code);
            setActiveKeys(newKeys);

            const isMoveKey = [mappings.forward, mappings.backward, mappings.left, mappings.right].includes(e.code);
            if (isMoveKey) {
                sendCommand('stop');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [profile, activeKeys]);

    const fetchProfile = async () => {
        if (!supabase) return;
        const { data } = await supabase
            .from('robot_profiles')
            .select('*')
            .eq('is_active', true)
            .single();
        if (data) setProfile(data);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const sendCommand = async (command: string, params: object = {}) => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('command_queue')
                .insert([
                    {
                        target: 'ev3_robot',
                        command: command,
                        params: params,
                        status: 'pending'
                    }
                ]);

            if (error) throw error;
            setLastCommand(command);
        } catch (error) {
            console.error('Error sending command:', error);
        } finally {
            setLoading(false);
        }
    };

    const getKeyLabel = (code: string) => {
        if (!code) return '';
        return code.replace('Key', '').replace('Arrow', '').replace('Digit', '').toUpperCase();
    };

    return (
        <div className="fixed inset-0 bg-slate-950 text-white flex items-center justify-center p-2 md:p-8 font-sans overflow-hidden selection:bg-none touch-none overscroll-none">
            {/* Orientation Lock Overlay */}
            {!isLandscape && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 text-center md:hidden">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <span className="text-4xl text-blue-400">🔄</span>
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter mb-2">VUI LÒNG XOAY NGANG</h2>
                    <p className="text-slate-400 text-sm max-w-[200px]">Xoay màn hình ngang để có trải nghiệm điều khiển Robot tốt nhất.</p>
                </div>
            )}
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
            </div>

            <div className={`relative w-[95%] h-[95%] md:w-full max-w-7xl md:h-full max-h-screen md:min-h-0 md:aspect-[21/10] bg-slate-900/40 border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-4 md:p-12 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(0,0,0,1)] flex flex-row items-stretch gap-4 md:gap-8 select-none touch-none`}>

                {/* LEFT: D-PAD (Directional) */}
                <div className="flex-1 flex flex-col items-center justify-center order-1">
                    <div className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-72 lg:h-72 grid grid-cols-3 gap-2 sm:gap-3 p-2 bg-slate-800/20 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-700/30">
                        <div />
                        <DPadButton
                            icon="↑"
                            label="UP"
                            kLabel={getKeyLabel(profile?.key_mappings?.forward)}
                            onPress={() => sendCommand('move', { direction: 'forward', speed: profile?.speed_profile?.forward || 100 })}
                            onRelease={() => sendCommand('stop')}
                        />
                        <div />

                        <DPadButton
                            icon="←"
                            label="LEFT"
                            kLabel={getKeyLabel(profile?.key_mappings?.left)}
                            onPress={() => sendCommand('move', { direction: 'left', speed: profile?.speed_profile?.turn || 60 })}
                            onRelease={() => sendCommand('stop')}
                        />
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/30 flex items-center justify-center shadow-inner">
                            <div className="w-3 h-3 rounded-full bg-blue-500/40 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                        <DPadButton
                            icon="→"
                            label="RIGHT"
                            kLabel={getKeyLabel(profile?.key_mappings?.right)}
                            onPress={() => sendCommand('move', { direction: 'right', speed: profile?.speed_profile?.turn || 60 })}
                            onRelease={() => sendCommand('stop')}
                        />

                        <div />
                        <DPadButton
                            icon="↓"
                            label="DOWN"
                            kLabel={getKeyLabel(profile?.key_mappings?.backward)}
                            onPress={() => sendCommand('move', { direction: 'backward', speed: profile?.speed_profile?.forward || 100 })}
                            onRelease={() => sendCommand('stop')}
                        />
                        <div />
                    </div>
                </div>

                {/* CENTER: CORE SYSTEM */}
                <div className="w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent order-2" />

                <div className="flex-[0.4] sm:flex-[0.6] flex-shrink-0 flex flex-col items-center justify-between py-2 sm:py-4 order-3">
                    <header className="text-center group cursor-pointer" onClick={() => router.push('/')}>
                        <h1 className="text-xl md:text-3xl font-black italic tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent group-hover:from-blue-400 transition-all">
                            EV3 CONTROLLER
                        </h1>
                        <div className="h-0.5 w-6 md:w-8 bg-blue-500 mx-auto mt-1 rounded-full group-hover:w-16 transition-all" />
                    </header>

                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-8 my-6">
                        <button
                            onMouseDown={() => sendCommand('emergency')}
                            onTouchStart={() => sendCommand('emergency')}
                            className="group relative w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center transition-all hover:bg-red-500/20 hover:border-red-500/40 active:scale-90 shadow-lg shadow-red-900/10"
                        >
                            <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <span className="text-red-500 font-black text-[8px] sm:text-[10px] lg:text-[14px] leading-tight z-10 tracking-tighter">EMERGENCY<br />STOP</span>
                        </button>

                        <div className="text-center min-w-[100px] md:min-w-[120px]">
                            <span className="text-[8px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Link Status</span>
                            <div className={`w-full py-1 rounded-full border text-[10px] md:text-xs font-bold transition-all flex items-center justify-center mx-auto ${loading ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                {loading ? 'SENDING' : 'ONLINE'}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/dashboard/robot-settings')}
                            className="px-4 py-2 bg-slate-800/50 rounded-xl text-[10px] text-slate-400 hover:text-white transition-colors border border-slate-700/50 uppercase font-bold"
                        >
                            ⚙️ SETTINGS
                        </button>
                        <button
                            onClick={() => router.push('/vision')}
                            className="px-4 py-2 bg-blue-600/20 rounded-xl text-[10px] text-blue-400 hover:text-white transition-all border border-blue-500/30 hover:bg-blue-600/30 uppercase font-bold animate-pulse"
                        >
                            👁️ VISION MODE
                        </button>
                    </div>
                </div>

                <div className="w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent order-4" />

                {/* RIGHT: ACTION PANEL (Aux Motors) */}
                <div className="flex-1 flex flex-col justify-center order-5">
                    <div className="space-y-4 md:space-y-6">
                        <h2 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mb-2 text-center md:text-left">Precision Actuators</h2>

                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                            <GameAuxRow
                                title="LOADER (Aux 1)"
                                color="blue"
                                kLabel={getKeyLabel(profile?.key_mappings?.aux1)}
                                defaultValue={profile?.aux_settings?.aux1 || { value: 1, unit: 'rotations' }}
                                onSend={(val: number, unit: 'rotations' | 'degrees') => sendCommand('aux_move', { port: 'aux1', value: val, unit: unit })}
                            />
                            <GameAuxRow
                                title="GRAPPLER (Aux 2)"
                                color="purple"
                                kLabel={getKeyLabel(profile?.key_mappings?.aux2)}
                                defaultValue={profile?.aux_settings?.aux2 || { value: 1, unit: 'rotations' }}
                                onSend={(val: number, unit: 'rotations' | 'degrees') => sendCommand('aux_move', { port: 'aux2', value: val, unit: unit })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DPadButton({ icon, label, kLabel, onPress, onRelease }: {
    icon: string,
    label: string,
    kLabel?: string,
    onPress: () => void,
    onRelease: () => void
}) {
    return (
        <button
            onMouseDown={onPress}
            onMouseUp={onRelease}
            onMouseLeave={onRelease}
            onTouchStart={(e) => { e.preventDefault(); onPress(); }}
            onTouchEnd={(e) => { e.preventDefault(); onRelease(); }}
            className="group relative flex flex-col items-center justify-center rounded-2xl border transition-all active:brightness-125 bg-slate-800/80 border-slate-700 hover:bg-slate-700 hover:border-slate-600 shadow-xl"
        >
            <span className="text-2xl transition-transform group-hover:scale-110 text-blue-400">{icon}</span>
            {kLabel && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[8px] font-mono text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/50 transition-colors">
                    {kLabel}
                </div>
            )}
        </button>
    );
}

function GameAuxRow({ title, color, kLabel, defaultValue, onSend }: { title: string, color: string, kLabel?: string, defaultValue: any, onSend: (val: number, unit: 'rotations' | 'degrees') => void }) {
    const colorStyles: { [key: string]: string } = {
        blue: "hover:bg-blue-500/10 border-blue-500/20 text-blue-400",
        purple: "hover:bg-purple-500/10 border-purple-500/20 text-purple-400"
    };

    return (
        <button
            onMouseDown={() => onSend(defaultValue.value, defaultValue.unit)}
            onTouchStart={() => onSend(defaultValue.value, defaultValue.unit)}
            className={`w-full bg-slate-800/40 p-5 md:p-8 rounded-[2rem] border backdrop-blur-md transition-all active:brightness-125 group text-left flex items-center justify-between ${colorStyles[color]}`}
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-2 h-5 mb-1">
                    <span className="text-[10px] font-black tracking-widest opacity-50 uppercase">{title}</span>
                    {kLabel ? (
                        <span className="px-1.5 py-0.5 bg-slate-900/50 border border-slate-700 rounded text-[9px] font-mono text-slate-500 group-hover:text-current transition-colors">
                            {kLabel}
                        </span>
                    ) : (
                        <div className="w-4 h-4" /> // Spacer to prevent jumps
                    )}
                </div>
                <span className="text-lg md:text-2xl font-black italic tracking-tighter group-hover:translate-x-1 transition-transform">ACTIVATE</span>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-bold opacity-40 uppercase">Default</div>
                <div className="text-sm md:text-lg font-mono font-bold">{defaultValue.value} <span className="text-[10px]">{defaultValue.unit === 'rotations' ? 'ROT' : 'DEG'}</span></div>
            </div>
        </button>
    );
}
