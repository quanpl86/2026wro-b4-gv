'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

export default function GameControllerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [lastCommand, setLastCommand] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [activeInfo, setActiveInfo] = useState<string | null>(null);

    const CONTROL_PARAMS_INFO: Record<string, { title: string, desc: string, tip: string }> = {
        dpad: {
            title: "Directional Control",
            desc: "Điều hướng Robot di chuyển theo 4 hướng cơ bản.",
            tip: "Giữ phím để Robot di chuyển liên tục, thả phím để dừng lại ngay lập tức."
        },
        emergency: {
            title: "Safety System",
            desc: "Dừng mọi hoạt động của Robot ngay lập tức trong trường hợp khẩn cấp.",
            tip: "Cơ chế này gửi lệnh Stop Master để cắt nguồn điện động cơ ngay lập tức."
        },
        actuators: {
            title: "Precision Actuators",
            desc: "Kích hoạt các công cụ phụ trợ (Loader, Grappler) theo cấu hình mặc định.",
            tip: "Bạn có thể thay đổi số vòng quay (Rotations) hoặc độ (Degrees) trong phần Cài đặt."
        }
    };

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
                    <h2 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">VUI LÒNG XOAY NGANG</h2>
                    <p className="text-slate-400 text-sm max-w-[200px]">Xoay màn hình ngang để có trải nghiệm điều khiển Robot tốt nhất.</p>
                </div>
            )}

            {/* Backdrop for Auto-Close Tooltips */}
            {activeInfo && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setActiveInfo(null)}
                    onTouchStart={() => setActiveInfo(null)}
                />
            )}

            <div className={`relative w-[96%] h-[92%] max-w-7xl bg-slate-900/40 border border-white/5 rounded-[3rem] md:rounded-[4rem] p-4 md:p-10 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-row items-stretch gap-4 md:gap-10 select-none touch-none overflow-hidden group/master`}>

                {/* Shine Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/master:translate-x-full transition-transform duration-2000 pointer-events-none" />

                {/* LEFT: D-PAD (Directional) */}
                <div className="flex-1 flex flex-col items-center justify-center order-1 relative">
                    <div className="absolute top-0 left-0 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Navigation</span>
                        <button onClick={() => setActiveInfo(activeInfo === 'dpad' ? null : 'dpad')} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${activeInfo === 'dpad' ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>i</button>
                    </div>

                    {activeInfo === 'dpad' && (
                        <div className="absolute inset-x-0 -top-4 z-50 bg-slate-950/90 border border-blue-500/30 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4 backdrop-blur-xl shadow-2xl">
                            <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-2">{CONTROL_PARAMS_INFO.dpad.title}</h4>
                            <p className="text-[13px] text-slate-300 leading-relaxed mb-4">{CONTROL_PARAMS_INFO.dpad.desc}</p>
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">PRO TiP:</span>
                                <p className="text-xs text-blue-200/70">{CONTROL_PARAMS_INFO.dpad.tip}</p>
                            </div>
                        </div>
                    )}

                    <div className="relative w-48 h-48 sm:w-60 sm:h-60 lg:w-80 lg:h-80 grid grid-cols-3 gap-3 sm:gap-4 p-3 bg-slate-950/40 rounded-[2.5rem] sm:rounded-[3rem] border border-white/5 shadow-inner">
                        <div />
                        <DPadButton
                            icon="↑"
                            kLabel={getKeyLabel(profile?.key_mappings?.forward)}
                            isActive={activeKeys.has(profile?.key_mappings?.forward)}
                            onPress={() => sendCommand('move', { direction: 'forward', speed: profile?.speed_profile?.forward || 100 })}
                            onRelease={() => sendCommand('stop')}
                        />
                        <div />

                        <DPadButton
                            icon="←"
                            kLabel={getKeyLabel(profile?.key_mappings?.left)}
                            isActive={activeKeys.has(profile?.key_mappings?.left)}
                            onPress={() => sendCommand('move', { direction: 'left', speed: profile?.speed_profile?.turn || 60 })}
                            onRelease={() => sendCommand('stop')}
                        />
                        <div className="bg-slate-900/80 rounded-3xl border border-white/5 flex items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                            <div className="w-4 h-4 rounded-full bg-blue-500/40 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.6)] z-10" />
                        </div>
                        <DPadButton
                            icon="→"
                            kLabel={getKeyLabel(profile?.key_mappings?.right)}
                            isActive={activeKeys.has(profile?.key_mappings?.right)}
                            onPress={() => sendCommand('move', { direction: 'right', speed: profile?.speed_profile?.turn || 60 })}
                            onRelease={() => sendCommand('stop')}
                        />

                        <div />
                        <DPadButton
                            icon="↓"
                            kLabel={getKeyLabel(profile?.key_mappings?.backward)}
                            isActive={activeKeys.has(profile?.key_mappings?.backward)}
                            onPress={() => sendCommand('move', { direction: 'backward', speed: profile?.speed_profile?.forward || 100 })}
                            onRelease={() => sendCommand('stop')}
                        />
                        <div />
                    </div>
                </div>

                {/* CENTER: MASTER SYSTEM */}
                <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent order-2" />

                <div className="flex-[0.4] sm:flex-[0.6] flex-shrink-0 flex flex-col items-center justify-between py-4 order-3 relative">
                    <header className="text-center group cursor-pointer" onClick={() => router.push('/')}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/70">Master Engine</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent group-hover:from-blue-400 transition-all uppercase">
                            EV3 MASTER
                        </h1>
                        <div className="h-1 w-8 md:w-12 bg-blue-600 mx-auto mt-2 rounded-full group-hover:w-24 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
                    </header>

                    <div className="flex flex-row md:flex-col items-center gap-6 md:gap-10 my-6 relative">
                        <div className="absolute -top-6 flex items-center gap-2">
                            <button onClick={() => setActiveInfo(activeInfo === 'emergency' ? null : 'emergency')} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${activeInfo === 'emergency' ? 'bg-red-600 border-red-500 text-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>i</button>
                        </div>

                        {activeInfo === 'emergency' && (
                            <div className="absolute left-1/2 -translate-x-1/2 -top-40 z-50 w-64 bg-slate-950/90 border border-red-500/30 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 backdrop-blur-xl shadow-2xl text-center">
                                <h4 className="text-red-400 font-black text-xs uppercase tracking-widest mb-2">{CONTROL_PARAMS_INFO.emergency.title}</h4>
                                <p className="text-[13px] text-slate-300 leading-relaxed mb-4">{CONTROL_PARAMS_INFO.emergency.desc}</p>
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl">
                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Expert Tip:</span>
                                    <p className="text-xs text-red-200/70 italic">{CONTROL_PARAMS_INFO.emergency.tip}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onMouseDown={() => sendCommand('emergency')}
                            onTouchStart={() => sendCommand('emergency')}
                            className="group relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-red-500/5 border-4 border-red-500/20 flex items-center justify-center transition-all hover:bg-red-500/20 hover:border-red-500/40 active:scale-90 shadow-2xl active:shadow-inner"
                        >
                            <div className="absolute inset-0 bg-red-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <div className="text-center z-10">
                                <span className="text-red-500 font-black text-[10px] sm:text-[12px] lg:text-[16px] leading-tight tracking-tighter uppercase block">EMERGENCY</span>
                                <span className="text-red-400/60 font-black text-[8px] sm:text-[10px] lg:text-[12px] tracking-widest uppercase">STOP</span>
                            </div>
                        </button>

                        <div className="text-center min-w-[120px] md:min-w-[140px] bg-slate-950/50 p-4 rounded-[2rem] border border-white/5 shadow-inner">
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] block mb-2">Hệ thống Link</span>
                            <div className={`w-full py-2 rounded-xl border text-[10px] md:text-xs font-black transition-all flex items-center justify-center mx-auto tracking-widest ${loading ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                                {loading ? 'SENDING...' : 'ONLINE'}
                            </div>
                            {lastCommand && (
                                <div className="mt-2 text-[8px] text-slate-600 font-mono uppercase truncate">Last: {lastCommand}</div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/dashboard/robot-settings')}
                            className="px-5 py-2.5 bg-slate-900 border border-white/10 rounded-2xl text-[10px] text-slate-400 hover:text-white hover:border-white/30 transition-all uppercase font-black tracking-widest shadow-xl flex items-center gap-2 group"
                        >
                            <Settings className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                            SETTINGS
                        </button>
                        <button
                            onClick={() => router.push('/vision')}
                            className="px-5 py-2.5 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-[10px] text-blue-400 hover:text-white hover:bg-blue-600/30 transition-all uppercase font-black tracking-widest shadow-xl shadow-blue-900/10 flex items-center gap-2 group"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            VISION
                        </button>
                        <button
                            onClick={() => router.push('/judge')}
                            className="px-5 py-2.5 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl text-[10px] text-indigo-400 hover:text-white hover:bg-indigo-600/30 transition-all uppercase font-black tracking-widest shadow-xl shadow-indigo-900/10 flex items-center gap-2 group"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            JUDGE
                        </button>
                    </div>
                </div>

                <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent order-4" />

                {/* RIGHT: ACTION PANEL (Aux Motors) */}
                <div className="flex-1 flex flex-col justify-center order-5 relative">
                    <div className="absolute top-0 right-0 flex items-center gap-2">
                        <button onClick={() => setActiveInfo(activeInfo === 'actuators' ? null : 'actuators')} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${activeInfo === 'actuators' ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>i</button>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Precision Actuators</span>
                    </div>

                    {activeInfo === 'actuators' && (
                        <div className="absolute inset-x-0 -top-4 z-50 bg-slate-950/90 border border-purple-500/30 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4 backdrop-blur-xl shadow-2xl">
                            <h4 className="text-purple-400 font-black text-xs uppercase tracking-widest mb-2">{CONTROL_PARAMS_INFO.actuators.title}</h4>
                            <p className="text-[13px] text-slate-300 leading-relaxed mb-4">{CONTROL_PARAMS_INFO.actuators.desc}</p>
                            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-2xl">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">PRO TiP:</span>
                                <p className="text-xs text-purple-200/70">{CONTROL_PARAMS_INFO.actuators.tip}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-5 md:space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:gap-5">
                            <GameAuxRow
                                title="LOADER (Aux 1)"
                                color="blue"
                                kLabel={getKeyLabel(profile?.key_mappings?.aux1)}
                                isActive={activeKeys.has(profile?.key_mappings?.aux1)}
                                defaultValue={profile?.aux_settings?.aux1 || { value: 1, unit: 'rotations' }}
                                onSend={(val: number, unit: 'rotations' | 'degrees') => sendCommand('aux_move', { port: 'aux1', value: val, unit: unit })}
                            />
                            <GameAuxRow
                                title="GRAPPLER (Aux 2)"
                                color="purple"
                                kLabel={getKeyLabel(profile?.key_mappings?.aux2)}
                                isActive={activeKeys.has(profile?.key_mappings?.aux2)}
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

function DPadButton({ icon, kLabel, isActive, onPress, onRelease }: {
    icon: string,
    kLabel?: string,
    isActive?: boolean,
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
            className={`group relative flex flex-col items-center justify-center rounded-2xl border transition-all shadow-xl ${isActive
                ? 'brightness-125 bg-slate-700 border-slate-500 scale-95 shadow-inner'
                : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                }`}
        >
            <span className={`text-2xl transition-transform ${isActive ? 'scale-90 text-white' : 'group-hover:scale-110 text-blue-400'}`}>
                {icon}
            </span>
            {kLabel && (
                <div className={`absolute top-1 right-1 px-1.5 py-0.5 border rounded text-[8px] font-mono transition-colors ${isActive
                    ? 'bg-blue-500 text-white border-blue-400'
                    : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/50'
                    }`}>
                    {kLabel}
                </div>
            )}
        </button>
    );
}

function GameAuxRow({ title, color, kLabel, isActive, defaultValue, onSend }: {
    title: string,
    color: string,
    kLabel?: string,
    isActive?: boolean,
    defaultValue: { value: number, unit: 'rotations' | 'degrees' },
    onSend: (val: number, unit: 'rotations' | 'degrees') => void
}) {
    const colorStyles: { [key: string]: string } = {
        blue: "hover:bg-blue-500/10 border-blue-500/20 text-blue-400",
        purple: "hover:bg-purple-500/10 border-purple-500/20 text-purple-400"
    };

    return (
        <button
            onMouseDown={() => onSend(defaultValue.value, defaultValue.unit)}
            onTouchStart={() => onSend(defaultValue.value, defaultValue.unit)}
            className={`w-full p-5 md:p-8 rounded-[2rem] border backdrop-blur-md transition-all group text-left flex items-center justify-between ${isActive
                ? 'scale-[0.98] brightness-125 bg-slate-700 border-white/20'
                : `bg-slate-800/40 active:brightness-125 ${colorStyles[color]}`
                }`}
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
