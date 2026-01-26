'use client';

import { useState, useEffect, useRef } from 'react';
import VerticalMissionTimeline from '@/components/judge/VerticalMissionTimeline';
import JudgePinModal from '@/components/judge/JudgePinModal';
import SiteEditorModal from '@/components/judge/SiteEditorModal';
import ImmersiveArena from '@/components/judge/ImmersiveArena';
import ScoreLeaderboard from '@/components/judge/ScoreLeaderboard';
import AdvancedQuiz from '@/components/interactive/AdvancedQuiz';
import BadgeCollection from '@/components/judge/BadgeCollection';
import VoiceAssistant from '@/components/interactive/VoiceAssistant';
import AIAvatar, { MascotEmotion } from '@/components/interactive/AIAvatar';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import config from '../../../../../packages/shared-config/config.json';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_HUB_IP = 'localhost';

export default function JudgePage() {
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);

    // Auth & Role
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'judge' | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // UI State
    const [currentTime, setCurrentTime] = useState('');
    const [wsStatus, setWsStatus] = useState('Disconnected');
    const [hubIp, setHubIp] = useState<string | null>(null);
    const [activeQuizStation, setActiveQuizStation] = useState<string | null>(null);
    const [voiceLang, setVoiceLang] = useState<'vi-VN' | 'en-US'>('vi-VN');
    const [showBadges, setShowBadges] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState<string>("Hệ thống đang chờ lệnh...");
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [editingSite, setEditingSite] = useState<any | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(undefined);
    const [mapSites, setMapSites] = useState([
        {
            id: 'pho_co_hoi_an',
            name: 'Hội An',
            description: 'Đô thị cổ được bảo tồn nguyên vẹn.',
            icon: '🏮',
            badge: '/assets/badges/pho_co_hoi_an.png',
            posX: 54.5, posY: 53.5,
            color: 'from-orange-400 to-amber-600',
            pathColor: '#fb923c'
        },
        {
            id: 'trang_an',
            name: 'Tràng An',
            description: 'Di sản thế giới kép Ninh Bình.',
            icon: '⛰️',
            badge: '/assets/badges/trang_an.png',
            posX: 43.5, posY: 28.5,
            color: 'from-emerald-400 to-teal-600',
            pathColor: '#22c55e'
        },
        {
            id: 'vinh_ha_long',
            name: 'Vịnh Hạ Long',
            description: 'Kỳ quan thiên nhiên thế giới.',
            icon: '⛵',
            badge: '/assets/badges/vinh_ha_long.png',
            posX: 51.5, posY: 22.5,
            color: 'from-blue-400 to-cyan-600',
            pathColor: '#3b82f6'
        },
        {
            id: 'cot_co',
            name: 'Cột cờ Hà Nội',
            description: 'Biểu tượng lịch sử của thủ đô.',
            icon: '🚩',
            badge: '/assets/badges/cot_co.png',
            posX: 44.5, posY: 24.5,
            color: 'from-red-500 to-rose-600',
            pathColor: '#f43f5e'
        }
    ]);

    // Telemetry
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [latency, setLatency] = useState(0);
    const [currentScore, setCurrentScore] = useState(0);
    const [sessionScores, setSessionScores] = useState<Record<string, number>>({});
    const [robotHome, setRobotHome] = useState({ x: 0, y: 0 }); // Saved calibration offset
    const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });  // Live hardware relative pos
    const [path, setPath] = useState<{ x: number, y: number }[]>([]);

    // AI State
    const [mascotEmotion, setMascotEmotion] = useState<MascotEmotion>('neutral');
    const [isAITalking, setIsAITalking] = useState(false);

    // --- EFFECTS & LOGIC ---

    // Session Init
    useEffect(() => {
        if (!isAuthorized || !supabase) return;
        const initSession = async () => {
            const { data } = await supabase
                .from('game_sessions')
                .insert({ player_name: 'Judge', status: 'active' })
                .select()
                .single();
            if (data) setSessionId(data.id);
        };
        initSession();
    }, [isAuthorized]);

    // Fetch Hub IP
    useEffect(() => {
        if (!isAuthorized) return;
        const getHubIp = async () => {
            if (!supabase) {
                setHubIp(DEFAULT_HUB_IP);
                return;
            }
            try {
                const { data: profiles, error: fetchErr } = await supabase
                    .from('robot_profiles')
                    .select('hub_ip, map_config, is_active')
                    .order('is_active', { ascending: false });

                if (fetchErr) throw fetchErr;

                const activeProfile = profiles?.[0];

                if (activeProfile?.hub_ip) {
                    setHubIp(activeProfile.hub_ip);
                    console.log("🔗 Hub IP Synced:", activeProfile.hub_ip);
                } else {
                    setHubIp(DEFAULT_HUB_IP);
                }

                if (activeProfile?.map_config) {
                    const config = activeProfile.map_config;
                    console.log("🗺️ Map Config Synced:", config);
                    if (config.sites) setMapSites(config.sites);
                    if (config.background_url) setBackgroundUrl(config.background_url);
                    if (config.robot_home) {
                        setRobotHome(config.robot_home);
                        console.log("🏠 Robot Home Position Loaded:", config.robot_home);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch Map/Hub config", err);
                setHubIp(DEFAULT_HUB_IP);
            }
        };
        getHubIp();
    }, [isAuthorized]);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // WebSocket (Robot Connection)
    useEffect(() => {
        if (!isAuthorized || !hubIp) return;

        const connectWs = () => {
            try {
                const wsUrl = `ws://${hubIp}:8765`;
                const socket = new WebSocket(wsUrl);

                socket.onopen = () => setWsStatus('Connected');
                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'telemetry') {
                        setBatteryLevel(data.battery || 100);
                        // ONLY update live position if NOT in editor mode
                        if (!isEditorMode) {
                            setRobotPos(data.pos || { x: 0, y: 0 });
                            if (data.pos) {
                                setPath(prev => [...prev, data.pos].slice(-50));
                            }
                        }
                        setLatency(data.latency || 0);
                    } else if (data.type === 'voice_response') {
                        setCurrentSubtitle(data.text);
                        setMascotEmotion('talking');
                        setIsAITalking(true);
                        window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: data.text } }));
                        setTimeout(() => {
                            setIsAITalking(false);
                            setMascotEmotion('neutral');
                        }, Math.min(data.text.length * 50, 5000) + 1000);
                    }
                };
                socket.onclose = () => {
                    setWsStatus('Disconnected');
                    setTimeout(connectWs, 3000);
                };
                wsRef.current = socket;
            } catch (err) {
                console.error("WS Error", err);
            }
        };
        connectWs();
        return () => wsRef.current?.close();
    }, [isAuthorized, hubIp]);

    // Handle Score
    const handleScoreUpdate = async (points: number, stationId: string) => {
        const newScore = currentScore + points;
        setCurrentScore(newScore);

        setSessionScores(prev => ({ ...prev, [stationId]: (prev[stationId] || 0) + points }));

        setMascotEmotion('excited');
        setTimeout(() => setMascotEmotion('neutral'), 3000);

        if (sessionId && supabase) {
            await supabase.from('game_sessions').update({ score: newScore }).eq('id', sessionId);
            await supabase.from('game_scores').insert({
                session_id: sessionId,
                event_type: 'quiz_pass',
                station_id: stationId,
                points: points
            });
        }
    };

    const handleVoiceCommand = (text: string, lang: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setCurrentSubtitle("⚠️ Hệ thống mất kết nối, vui lòng thử lại sau.");
            return;
        }
        wsRef.current.send(JSON.stringify({
            command: 'voice_command',
            params: { text, lang }
        }));
        setMascotEmotion('thinking');
        setCurrentSubtitle(`Đang xử lý: "${text}"...`);
    };

    const handlePosUpdate = (siteId: string, x: number, y: number) => {
        setMapSites(prev => prev.map(site =>
            site.id === siteId ? { ...site, posX: x, posY: y } : site
        ));
    };

    const handleRobotPosUpdate = (newX: number, newY: number) => {
        // If the user drags the robot icon, they are setting the map-relative HOME position.
        // We calculate the home offset by subtracting the CURRENT telemetry pos.
        // home + telemetry = displayed_pos => home = displayed_pos - telemetry
        setRobotHome({
            x: newX - robotPos.x,
            y: newY - robotPos.y
        });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !supabase) return;

        setIsUploading(true);
        setCurrentSubtitle("🛰️ Đang tải ảnh bản đồ lên hệ thống...");

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `map_${Date.now()}.${fileExt}`;
            const filePath = `custom/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('maps')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('maps')
                .getPublicUrl(filePath);

            setBackgroundUrl(publicUrl);
            setCurrentSubtitle("✅ Tải ảnh bản đồ thành công!");
        } catch (err: any) {
            console.error("Upload Error", err);
            setCurrentSubtitle(`❌ Lỗi tải ảnh: ${err.message || "Kiểm tra quyền truy cập Storage"}`);
        } finally {
            setIsUploading(false);
        }
    };

    const persistMapConfig = async (currentSites: any[], currentHome: any, currentBg: string | undefined) => {
        if (!supabase) return false;
        try {
            const fullConfig = {
                sites: currentSites,
                robot_home: currentHome,
                background_url: currentBg
            };

            const { data: profiles } = await supabase
                .from('robot_profiles')
                .select('id, is_active')
                .order('is_active', { ascending: false });

            const targetId = profiles?.[0]?.id;

            if (!targetId) {
                throw new Error("Không tìm thấy profile Robot để lưu.");
            }

            const { error } = await supabase
                .from('robot_profiles')
                .update({ map_config: fullConfig } as any)
                .eq('id', targetId);

            if (error) throw error;
            return true;
        } catch (err: any) {
            console.error("Save Error Details:", err);
            const msg = err.message || "Lỗi lưu cấu hình";
            setCurrentSubtitle(`❌ Lỗi: ${msg}`);
            return false;
        }
    };

    const saveMapConfig = async () => {
        const success = await persistMapConfig(mapSites, robotHome, backgroundUrl);
        if (success) {
            setIsEditorMode(false);
            setCurrentSubtitle("✅ Đã lưu cấu hình bản đồ thành công!");
        }
    };

    const handleSiteUpdate = async (updatedSite: any) => {
        const newSites = mapSites.map(site => site.id === updatedSite.id ? updatedSite : site);
        setMapSites(newSites);
        setEditingSite(null);

        setCurrentSubtitle(`⏳ Đang lưu thay đổi cho ${updatedSite.name}...`);
        const success = await persistMapConfig(newSites, robotHome, backgroundUrl);

        if (success) {
            setCurrentSubtitle(`✅ Đã cập nhật & lưu: ${updatedSite.name}`);
        }
    };

    const missionSteps = [
        { id: 'start', label: 'Tp. Hồ Chí Minh', status: 'completed' as const, icon: '🏙️' },
        { id: 'hoi_an', label: 'Hội An', status: 'current' as const, icon: '🏮' },
        { id: 'trang_an', label: 'Tràng An', status: 'pending' as const, icon: '⛰️' },
        { id: 'ha_long', label: 'Vịnh Hạ Long', status: 'pending' as const, icon: '⛵' },
        { id: 'cot_co', label: 'Cột cờ Hà Nội', status: 'pending' as const, icon: '🚩' },
        { id: 'finish', label: 'Hoàn thành', status: 'pending' as const, icon: '🏆' },
    ];

    if (!isAuthorized) return (
        <JudgePinModal
            onSuccess={(role) => {
                setIsAuthorized(true);
                setUserRole(role);
                // Auto-enable editor mode for admins to prevent confusion
                if (role === 'admin') {
                    setIsEditorMode(true);
                    setCurrentSubtitle("🔓 Chế độ Quản trị viên đã được kích hoạt.");
                } else {
                    setCurrentSubtitle("🛡️ Chế độ Giám khảo kích hoạt.");
                }
            }}
        />
    );

    return (
        <div className="h-screen w-screen bg-slate-950 flex flex-col text-white overflow-hidden font-sans selection:bg-purple-500/30">

            {/* --- TOP BAR --- */}
            <header className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50 shrink-0 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <span className="text-xl">🇻🇳</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Heritage Keeper
                        </h1>
                        <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Vietnam Edition • 2026</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5">
                        <div className={`w-2 h-2 rounded-full ${wsStatus === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className={`text-xs font-bold ${wsStatus === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {wsStatus === 'Connected' ? `ONLINE (${latency}ms)` : 'OFFLINE'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5">
                        <span className="text-yellow-400 text-xs">⚡</span>
                        <span className="text-xs font-bold text-slate-300">{batteryLevel}%</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5">
                        <span className="text-blue-400 text-xs">💎</span>
                        <span className="text-xs font-bold text-white">{currentScore} PTS</span>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="text-xl font-black font-mono tracking-tight text-slate-200">{currentTime}</div>
                </div>
            </header>

            {/* --- MAIN 3-COLUMN CONTENT --- */}
            <div className="flex-1 flex min-h-0 relative">

                {/* LEFT: MISSION TRACKING (Col 1-2 equivalent) */}
                <div className="w-[300px] shrink-0 z-10">
                    <VerticalMissionTimeline steps={missionSteps} />
                </div>

                {/* MIDDLE: VIETNAM MAP (Main Focus) */}
                <div className="flex-1 relative flex flex-col bg-slate-900/10">
                    <div className="flex-1 relative p-10">
                        <ImmersiveArena
                            robotPos={{
                                x: robotHome.x + robotPos.x,
                                y: robotHome.y + robotPos.y
                            }}
                            robotHome={robotHome}
                            path={path.map(p => ({
                                x: p.x + robotHome.x,
                                y: p.y + robotHome.y
                            }))}
                            onSiteDiscover={setActiveQuizStation}
                            isEditorMode={isEditorMode}
                            onEditSite={setEditingSite}
                            sites={[...mapSites].sort((a, b) => {
                                const order = ['pho_co_hoi_an', 'trang_an', 'vinh_ha_long', 'cot_co'];
                                return order.indexOf(a.id) - order.indexOf(b.id);
                            })}
                            onPosUpdate={handlePosUpdate}
                            onRobotPosUpdate={handleRobotPosUpdate}
                            backgroundUrl={backgroundUrl}
                        />

                        {/* Editor Controls (ADMIN ONLY) */}
                        <div className="absolute top-14 right-14 flex flex-col gap-3 z-[60]">
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => setIsEditorMode(!isEditorMode)}
                                    className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 
                                        ${isEditorMode ? 'bg-orange-600 border-white text-white shadow-xl' : 'bg-slate-800/80 border-white/10 text-slate-400 hover:text-white'}`}
                                >
                                    {isEditorMode ? 'ESC EDITOR' : 'MAP EDITOR'}
                                </button>
                            )}

                            <AnimatePresence>
                                {isEditorMode && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex flex-col gap-3"
                                    >
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-blue-600 border-2 border-white text-white shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isUploading ? 'UPLOADING...' : 'UPLOAD NEW MAP'}
                                        </button>

                                        <button
                                            onClick={saveMapConfig}
                                            className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 border-2 border-white text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            SAVE CONFIG
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* SUBTITLE OVERLAY (Bottom-Middle of the whole screen area) */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-6 pointer-events-none">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentSubtitle}
                                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -10, opacity: 0, scale: 0.95 }}
                                className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 px-8 py-5 rounded-[32px] shadow-2xl text-center ring-1 ring-white/5"
                            >
                                <p className="text-lg md:text-xl font-bold text-white leading-relaxed drop-shadow-md italic">
                                    "{currentSubtitle}"
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT SIDEBAR (Mascot & Interaction) */}
                <div className="w-[360px] bg-slate-900/60 backdrop-blur-xl border-l border-white/5 flex flex-col shrink-0 z-40 shadow-2xl">
                    <div className="h-[320px] relative border-b border-white/5 bg-gradient-to-b from-slate-900/0 to-slate-800/30">
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <AIAvatar
                                emotion={mascotEmotion}
                                isTalking={isAITalking}
                                size={300}
                            />
                        </div>
                        <div className="absolute top-6 right-6 px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-purple-500/30 backdrop-blur-md">
                            AI Storyteller
                        </div>
                    </div>

                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Voice Assistant</h3>
                        <VoiceAssistant
                            lang={voiceLang}
                            onCommand={(text) => handleVoiceCommand(text, voiceLang)}
                            onLangChange={setVoiceLang}
                            isTalking={isAITalking}
                        />
                    </div>

                    <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
                        <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-4 shrink-0">Session Leaderboard</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                            <ScoreLeaderboard />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- OVERLAYS --- */}

            <button
                onClick={() => setShowBadges(true)}
                className="fixed bottom-10 left-10 z-[60] w-20 h-20 bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 rounded-[28px] shadow-[0_20px_40px_rgba(234,88,12,0.3)] flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all border-4 border-white/20 group"
            >
                <span className="group-hover:rotate-12 transition-transform">🎒</span>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black text-xs font-black border-2 border-orange-500">
                    {Object.keys(sessionScores).length}
                </div>
            </button>

            <AnimatePresence>
                {showBadges && (
                    <BadgeCollection
                        scores={sessionScores}
                        onClose={() => setShowBadges(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeQuizStation && (
                    <AdvancedQuiz
                        stationId={activeQuizStation}
                        questions={(config.heritage_info as any)[activeQuizStation]?.quiz_data || []}
                        badgeImage={(config.heritage_info as any)[activeQuizStation]?.badge_image}
                        onClose={() => setActiveQuizStation(null)}
                        onScoreUpdate={(points) => handleScoreUpdate(points, activeQuizStation)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingSite && (
                    <SiteEditorModal
                        site={editingSite}
                        onSave={handleSiteUpdate}
                        onCancel={() => setEditingSite(null)}
                    />
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
}
