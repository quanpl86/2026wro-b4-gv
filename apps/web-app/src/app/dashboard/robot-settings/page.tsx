'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import {
    Bot,
    Globe,
    Settings,
    Zap,
    Radio,
    Keyboard,
    Gamepad2,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    CircleOff,
    Palette,
    Waves,
    Compass,
    MousePointerClick,
    Loader2
} from 'lucide-react';

export default function RobotSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        const { data, error } = await supabase
            .from('robot_profiles')
            .select('*')
            .eq('is_active', true)
            .single();

        if (data) setProfile(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!supabase) return;
        setSaving(true);
        const { error } = await supabase
            .from('robot_profiles')
            .update(profile)
            .eq('id', profile.id);

        if (error) {
            setSaveStatus({ type: 'error', message: 'Lỗi: ' + error.message });
            setSaving(false);
        } else {
            setSaveStatus({ type: 'success', message: '✅ Đã lưu cấu hình thành công!' });
            setSaving(false);

            // Tự động chuyển trang sau 1.5 giây hoặc để người dùng tự nhấn
            setTimeout(() => {
                router.push('/dashboard/test-control');
            }, 1500);
        }
    };

    const createDefaultProfile = async () => {
        setLoading(true);
        const defaultProfile = {
            name: "EV3 v1.0",
            motor_ports: { left: "outB", right: "outC", aux1: "outA", aux2: "outD" },
            sensor_config: {
                in1: { type: 'color', mode: 'color' },
                in2: { type: 'ultrasonic' },
                in3: { type: 'gyro' },
                in4: { type: 'touch' }
            },
            speed_profile: { forward: 100, backward: 100, turn: 50 },
            aux_settings: {
                aux1: { value: 1, unit: 'rotations' },
                aux2: { value: 1, unit: 'rotations' }
            },
            key_mappings: {
                forward: "ArrowUp", backward: "ArrowDown", left: "ArrowLeft", right: "ArrowRight",
                aux1: "KeyQ", aux2: "KeyE"
            },
            hub_ip: "localhost",
            is_active: true
        };

        const { data, error } = await supabase
            .from('robot_profiles')
            .insert([defaultProfile])
            .select()
            .single();

        if (error) {
            alert('Lỗi tạo profile: ' + error.message);
            setLoading(false);
        } else {
            setProfile(data);
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Đang tải...</div>;

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white text-center">
                <div className="w-20 h-20 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center mb-6">
                    <Bot className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Chưa có cấu hình Robot</h2>
                <p className="text-slate-400 mb-8 max-w-sm">Dữ liệu cấu hình đã bị xóa. Bạn cần khởi tạo lại để có thể điều khiển Robot.</p>
                <button
                    onClick={createDefaultProfile}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold transition-all active:scale-95"
                >
                    KHỞI TẠO CẤU HÌNH MẶC ĐỊNH
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 pb-32 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-3">
                        Robot Configuration
                    </h1>
                    <p className="text-slate-400 text-lg">Thiết lập cổng kết nối và tốc độ cho EV3</p>
                </header>

                <div className="space-y-8">
                    {/* Network Settings */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center gap-3">
                            <Globe className="w-7 h-7" />
                            Network Settings
                        </h2>
                        <div className="flex flex-col space-y-3">
                            <label className="text-sm text-slate-400 uppercase font-bold tracking-wider ml-1">AI Brain (Hub) IP Address</label>
                            <input
                                type="text"
                                value={profile.hub_ip || ''}
                                onChange={(e) => setProfile({ ...profile, hub_ip: e.target.value })}
                                placeholder="e.g. 192.168.1.15 or localhost"
                                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xl text-white outline-none focus:border-blue-500 font-mono transition-all"
                            />
                            <p className="text-sm text-slate-500 italic mt-1 ml-1">
                                IP này giúp Robot Eyes (Điện thoại) tìm thấy Laptop của bạn trên mạng Wi-Fi.
                            </p>
                        </div>
                    </section>

                    {/* Motor Ports */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-purple-400 flex items-center gap-3">
                            <Settings className="w-7 h-7" />
                            Cấu hình Cổng Động cơ
                        </h2>

                        {profile.motor_ports.left === profile.motor_ports.right && (
                            <div className="mb-6 p-5 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-400 text-base font-bold flex items-center gap-4 animate-pulse">
                                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                                ⚠️ CẢNH BÁO: Cổng Bánh xe Trái và Phải đang bị trùng nhau ({profile.motor_ports.left}). Vui lòng đổi cổng khác!
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PortInput
                                label="Bánh xe Trái"
                                value={profile.motor_ports.left}
                                onChange={(val: string) => setProfile({ ...profile, motor_ports: { ...profile.motor_ports, left: val } })}
                            />
                            <PortInput
                                label="Bánh xe Phải"
                                value={profile.motor_ports.right}
                                onChange={(val: string) => setProfile({ ...profile, motor_ports: { ...profile.motor_ports, right: val } })}
                            />
                            <PortInput
                                label="Động cơ Phụ 1"
                                value={profile.motor_ports.aux1}
                                onChange={(val: string) => setProfile({ ...profile, motor_ports: { ...profile.motor_ports, aux1: val } })}
                            />
                            <PortInput
                                label="Động cơ Phụ 2"
                                value={profile.motor_ports.aux2}
                                onChange={(val: string) => setProfile({ ...profile, motor_ports: { ...profile.motor_ports, aux2: val } })}
                            />
                        </div>
                    </section>

                    {/* Speed Profile */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-pink-400 flex items-center gap-3">
                            <Zap className="w-7 h-7" />
                            Thiết lập Tốc độ (%)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SpeedInput
                                label="Tiến/Lùi"
                                value={profile.speed_profile.forward}
                                onChange={(val: number) => setProfile({ ...profile, speed_profile: { ...profile.speed_profile, forward: val, backward: val } })}
                            />
                            <SpeedInput
                                label="Xoay"
                                value={profile.speed_profile.turn}
                                onChange={(val: number) => setProfile({ ...profile, speed_profile: { ...profile.speed_profile, turn: val } })}
                            />
                        </div>
                    </section>

                    {/* Sensor Ports */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center gap-3">
                            <Radio className="w-7 h-7" />
                            Cấu hình Cảm biến (Ports 1-4)
                        </h2>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {['in1', 'in2', 'in3', 'in4'].map((port) => (
                                <SensorConfigInput
                                    key={port}
                                    port={port}
                                    config={profile.sensor_config?.[port] || { type: 'none' }}
                                    onChange={(newCfg: any) => setProfile({
                                        ...profile,
                                        sensor_config: {
                                            ...(profile.sensor_config || {}),
                                            [port]: newCfg
                                        }
                                    })}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Keyboard Mapping */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-blue-400 flex items-center gap-3">
                                <Keyboard className="w-7 h-7" />
                                Ánh xạ Phím Bàn phím
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setProfile({
                                        ...profile,
                                        key_mappings: {
                                            forward: "KeyW", backward: "KeyS", left: "KeyA", right: "KeyD",
                                            aux1: "KeyQ", aux2: "KeyE"
                                        }
                                    })}
                                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-400 transition-colors"
                                >
                                    WASD PRESET
                                </button>
                                <button
                                    onClick={() => setProfile({
                                        ...profile,
                                        key_mappings: {
                                            forward: "ArrowUp", backward: "ArrowDown", left: "ArrowLeft", right: "ArrowRight",
                                            aux1: "KeyQ", aux2: "KeyE"
                                        }
                                    })}
                                    className="px-4 py-2 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 rounded-xl text-xs font-bold text-slate-400 transition-colors"
                                >
                                    ARROWS PRESET
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <KeyMappingInput
                                label="Tiến"
                                action="forward"
                                value={profile.key_mappings?.forward || "ArrowUp"}
                                onChange={(val: string) => setProfile({ ...profile, key_mappings: { ...profile.key_mappings, forward: val } })}
                            />
                            <KeyMappingInput
                                label="Lùi"
                                action="backward"
                                value={profile.key_mappings?.backward || "ArrowDown"}
                                onChange={(val: string) => setProfile({ ...profile, key_mappings: { ...profile.key_mappings, backward: val } })}
                            />
                            <KeyMappingInput
                                label="Trái"
                                action="left"
                                value={profile.key_mappings?.left || "ArrowLeft"}
                                onChange={(val: string) => setProfile({ ...profile, key_mappings: { ...profile.key_mappings, left: val } })}
                            />
                            <KeyMappingInput
                                label="Phải"
                                action="right"
                                value={profile.key_mappings?.right || "ArrowRight"}
                                onChange={(val: string) => setProfile({ ...profile, key_mappings: { ...profile.key_mappings, right: val } })}
                            />
                            <KeyMappingInput
                                label="Aux 1 (Loader)"
                                action="aux1"
                                value={profile.key_mappings?.aux1 || "KeyQ"}
                                onChange={(val: string) => setProfile({ ...profile, key_mappings: { ...profile.key_mappings, aux1: val } })}
                            />
                            <KeyMappingInput
                                label="Aux 2 (Grappler)"
                                action="aux2"
                                value={profile.key_mappings?.aux2 || "KeyE"}
                                onChange={(val: string) => setProfile({ ...profile, key_mappings: { ...profile.key_mappings, aux2: val } })}
                            />
                        </div>
                    </section>

                    {/* Aux Motor Settings */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-emerald-400 flex items-center gap-3">
                            <Gamepad2 className="w-7 h-7" />
                            Mặc định Động cơ Phụ
                        </h2>
                        <div className="space-y-6">
                            <AuxSettingInput
                                label="Động cơ Phụ 1 (Loader)"
                                settings={profile.aux_settings?.aux1 || { value: 1, unit: 'rotations' }}
                                onChange={(newVal: any) => setProfile({
                                    ...profile,
                                    aux_settings: {
                                        ...(profile.aux_settings || {}),
                                        aux1: newVal
                                    }
                                })}
                            />
                            <AuxSettingInput
                                label="Động cơ Phụ 2 (Grappler)"
                                settings={profile.aux_settings?.aux2 || { value: 1, unit: 'rotations' }}
                                onChange={(newVal: any) => setProfile({
                                    ...profile,
                                    aux_settings: {
                                        ...(profile.aux_settings || {}),
                                        aux2: newVal
                                    }
                                })}
                            />
                        </div>
                    </section>

                    <div className="space-y-6 pt-6">
                        {saveStatus.type && (
                            <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${saveStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                }`}>
                                <span className="text-2xl">{saveStatus.type === 'success' ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}</span>
                                <span className="font-bold text-lg tracking-tight">{saveStatus.message}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-3xl font-bold text-xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                                    ĐANG LƯU...
                                </>
                            ) : 'LUU CẤU HÌNH'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PortInput({ label, value, onChange, options = ['outA', 'outB', 'outC', 'outD'] }: any) {
    return (
        <div className="flex flex-col space-y-3">
            <label className="text-sm text-slate-400 uppercase font-bold tracking-wider ml-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-lg outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
            >
                {options.map((opt: string) => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
            </select>
        </div>
    );
}

function SpeedInput({ label, value, onChange }: any) {
    return (
        <div className="flex flex-col space-y-3">
            <label className="text-sm text-slate-400 uppercase font-bold tracking-wider ml-1">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-lg outline-none focus:border-pink-500"
                min="0" max="100"
            />
        </div>
    );
}

function AuxSettingInput({ label, settings, onChange }: any) {
    return (
        <div className="flex items-center justify-between gap-6 bg-slate-800/30 p-6 rounded-3xl border border-slate-800/50">
            <span className="text-lg font-medium text-slate-300">{label}</span>
            <div className="flex gap-3">
                <input
                    type="number"
                    value={settings.value}
                    onChange={(e) => onChange({ ...settings, value: parseFloat(e.target.value) || 0 })}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg text-white outline-none text-center"
                />
                <select
                    value={settings.unit}
                    onChange={(e) => onChange({ ...settings, unit: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 outline-none uppercase tracking-wide cursor-pointer"
                >
                    <option value="rotations">ROT</option>
                    <option value="degrees">DEG</option>
                </select>
            </div>
        </div>
    );
}

function KeyMappingInput({ label, value, onChange }: any) {
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!isListening) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            onChange(e.code);
            setIsListening(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isListening, onChange]);

    return (
        <div className="flex flex-col space-y-3">
            <label className="text-sm text-slate-400 uppercase font-bold tracking-wider ml-1">{label}</label>
            <button
                onClick={() => setIsListening(true)}
                className={`bg-slate-800 border ${isListening ? 'border-blue-500 animate-pulse' : 'border-slate-700'} rounded-2xl p-5 text-white text-base font-mono transition-all flex items-center justify-between group h-[72px]`}
            >
                <span className={isListening ? 'text-blue-400' : ''}>
                    {isListening ? 'NHẤN MỘT PHÍM...' : getKeyLabel(value)}
                </span>
                {!isListening && <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">CHANGE</span>}
            </button>
        </div>
    );
}

function getKeyLabel(code: string) {
    if (!code) return 'NONE';
    return code
        .replace('Key', '')
        .replace('Arrow', '')
        .replace('Digit', '')
        .toUpperCase();
}

function SensorConfigInput({ port, config, onChange }: any) {
    const sensorTypes = [
        { id: 'none', label: 'None', icon: <CircleOff className="w-6 h-6" /> },
        { id: 'color', label: 'Color', icon: <Palette className="w-6 h-6" /> },
        { id: 'ultrasonic', label: 'Ultrasonic', icon: <Waves className="w-6 h-6" /> },
        { id: 'gyro', label: 'Gyro', icon: <Compass className="w-6 h-6" /> },
        { id: 'touch', label: 'Touch', icon: <MousePointerClick className="w-6 h-6" /> }
    ];

    const colorModes = [
        { id: 'color', label: 'Color ID' },
        { id: 'reflected', label: 'Reflected' },
        { id: 'ambient', label: 'Ambient' }
    ];

    return (
        <div className="bg-slate-800/40 p-6 rounded-[28px] border border-slate-700/50 space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-slate-500 uppercase">Input Port {port.replace('in', '')}</span>
                <span className="text-sm font-bold text-blue-400/60 uppercase">{config.type}</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {sensorTypes.map((t) => (
                    <button
                        key={t.id}
                        title={t.label}
                        onClick={() => onChange({ type: t.id, mode: t.id === 'color' ? 'color' : undefined })}
                        className={`py-4 rounded-2xl border transition-all flex items-center justify-center ${config.type === t.id ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-800 text-slate-600 hover:border-slate-600'}`}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>

            {config.type === 'color' && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    {colorModes.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => onChange({ ...config, mode: m.id })}
                            className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${config.mode === m.id ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
