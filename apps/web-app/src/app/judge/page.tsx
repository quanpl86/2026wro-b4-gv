'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import VerticalMissionTimeline from '@/components/judge/VerticalMissionTimeline';
import JudgePinModal from '@/components/judge/JudgePinModal';
import SiteEditorModal from '@/components/judge/SiteEditorModal';
import ImmersiveArena, { Site } from '@/components/judge/ImmersiveArena';
import ScoreLeaderboard from '@/components/judge/ScoreLeaderboard';
import AdvancedQuiz from '@/components/interactive/AdvancedQuiz';
import HeritageBook from '@/components/interactive/HeritageBook';
import BadgeCollection from '@/components/judge/BadgeCollection';
import VoiceAssistant from '@/components/interactive/VoiceAssistant';
import AIAvatar from '@/components/interactive/AIAvatar';
import { MascotVideoEmotion } from '@/components/interactive/VideoMascot';
import { useRobotEmotion, Emotion } from '@/stores/useRobotEmotion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import config from '@/data/config.json';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Battery,
    Trophy,
    Activity,
    Flag,
    Anchor,
    Mountain,
    Landmark,
    Map as MapIcon,
    Zap,
    Diamond,
    Clock,
    ShoppingBag,
    Cpu,
    Mic,
    ChevronRight,
    Search,
    Settings,
    History
} from 'lucide-react';

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
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    const [stationStatuses, setStationStatuses] = useState<Record<string, { status: string, action?: string }>>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(undefined);
    const [currentTheme, setCurrentTheme] = useState('#0f172a'); // Default slate-900

    // Haptic Feedback Generator
    const playHaptic = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { /* Fallback for browsers that block auto-audio */ }
    }, []);

    const [mapSites, setMapSites] = useState([
        {
            id: 'pho_co_hoi_an',
            name: 'Hội An',
            description: 'Đô thị cổ được bảo tồn nguyên vẹn.',
            icon: 'Landmark',
            badge: '/assets/badges/pho_co_hoi_an.png',
            posX: 54.5, posY: 53.5,
            color: 'from-orange-400 to-amber-600',
            pathColor: '#fb923c'
        },
        {
            id: 'trang_an',
            name: 'Tràng An',
            description: 'Di sản thế giới kép Ninh Bình.',
            icon: 'Mountain',
            badge: '/assets/badges/trang_an.png',
            posX: 43.5, posY: 28.5,
            color: 'from-emerald-400 to-teal-600',
            pathColor: '#22c55e'
        },
        {
            id: 'vinh_ha_long',
            name: 'Vịnh Hạ Long',
            description: 'Kỳ quan thiên nhiên thế giới.',
            icon: 'Anchor',
            badge: '/assets/badges/vinh_ha_long.png',
            posX: 51.5, posY: 22.5,
            color: 'from-blue-400 to-cyan-600',
            pathColor: '#3b82f6'
        },
        {
            id: 'cot_co',
            name: 'Cột cờ Hà Nội',
            description: 'Biểu tượng lịch sử của thủ đô.',
            icon: 'Flag',
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
    const [isAITalking, setIsAITalking] = useState(false);
    const [selectedBookSite, setSelectedBookSite] = useState<Site | null>(null);
    const [isAutoPlayBook, setIsAutoPlayBook] = useState(false);
    const [pendingIntro, setPendingIntro] = useState<{
        site: Site;
        phase: 'greeting' | 'invitation';
    } | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(360);
    const [isResizing, setIsResizing] = useState(false);

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

    // Resizing Logic
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isResizing) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const newWidth = window.innerWidth - clientX;
        if (newWidth > 280 && newWidth < 800) {
            setSidebarWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            window.addEventListener('touchmove', resize);
            window.addEventListener('touchend', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('touchmove', resize);
            window.removeEventListener('touchend', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('touchmove', resize);
            window.removeEventListener('touchend', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

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

    // --- HERITAGE INTRO SEQUENCER ---
    useEffect(() => {
        const handleSpeakEnd = () => {
            if (!pendingIntro) return;

            if (pendingIntro.phase === 'greeting') {
                // Phase 1 finished -> Start Phase 2
                setTimeout(() => {
                    setPendingIntro({ ...pendingIntro, phase: 'invitation' });
                    const inviteText = "Chúng ta cùng nhau tìm hiểu về địa danh nổi tiếng này nhé";
                    setCurrentSubtitle(inviteText);
                    // Stop any previous speech before starting next phase
                    window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: '', action: 'stop' } }));
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: inviteText } }));
                    }, 100);
                }, 800);
            } else if (pendingIntro.phase === 'invitation') {
                // Phase 2 finished -> Open Book in Auto Mode
                setTimeout(() => {
                    // STOP any intro speech before opening book (which will start its own speech)
                    window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: '', action: 'stop' } }));

                    setTimeout(() => {
                        setSelectedBookSite(pendingIntro.site);
                        setIsAutoPlayBook(true);
                        setPendingIntro(null);
                    }, 200);
                }, 800);
            }
        };

        window.addEventListener('ai-speak-end', handleSpeakEnd);
        return () => window.removeEventListener('ai-speak-end', handleSpeakEnd);
    }, [pendingIntro, mapSites]);

    // Phase 1 Trigger: Start Greeting AFTER Map Zoom settles
    useEffect(() => {
        if (pendingIntro?.phase === 'greeting') {
            const timer = setTimeout(() => {
                const greetingText = `Mời bạn đến tham quan địa danh ${pendingIntro.site.name}`;
                setCurrentSubtitle(greetingText);
                // Stop any accidental noise before starting lead intro
                window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: '', action: 'stop' } }));
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: greetingText } }));
                }, 100);
            }, 2000); // 2.0s delay for smooth Zoom & Pin animation settle
            return () => clearTimeout(timer);
        }
    }, [pendingIntro?.site.id, pendingIntro?.phase]);

    // WebSocket (Robot Connection)
    useEffect(() => {
        if (!isAuthorized || !hubIp) return;

        const connectWs = () => {
            try {
                const isNgrok = hubIp.includes('ngrok');
                const wsUrl = isNgrok
                    ? `wss://${hubIp}`
                    : `ws://${hubIp}:8765`;
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
                        // Trigger TTS (VoiceAssistant will handle the 'talking' emotion update via Global Store)
                        window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: data.text } }));
                    } else if (data.type === 'event' && data.event === 'site_discovered') {
                        const siteId = data.station_id;
                        console.log("📍 Site Discovered via AI Brain:", siteId);

                        // Find the site object from mapSites
                        const siteObj = mapSites.find(s => s.id === siteId);

                        // --- GUARD: Don't re-trigger if already busy with this site or any other ---
                        if (siteObj && !selectedBookSite && !activeQuizStation && !pendingIntro) {
                            // Start Intro Sequence: UI state change first (triggers Zoom)
                            setPendingIntro({ site: siteObj, phase: 'greeting' });
                            setEmotion('curious');
                            // Voice will be triggered by useEffect after a delay
                        } else {
                            console.log("⏭️ Site Discovery ignored (Busy or Invalid):", siteId);
                        }
                    } else if (data.type === 'station_status') {
                        setStationStatuses(prev => ({
                            ...prev,
                            [data.station_id]: { status: data.status, action: data.action }
                        }));
                        // Dynamic Theme Update
                        if (data.status === 'busy' || data.status === 'online') {
                            const site = mapSites.find(s => s.id === data.station_id);
                            if (site) {
                                // Extract the second color from Tailwind gradient "from-X to-Y"
                                const colorMap: Record<string, string> = {
                                    'pho_co_hoi_an': '#451a03', // Deep Amber
                                    'trang_an': '#064e3b',       // Deep Emerald
                                    'vinh_ha_long': '#164e63',   // Deep Cyan
                                    'cot_co': '#4c0519'          // Deep Rose
                                };
                                setCurrentTheme(colorMap[site.id] || '#0f172a');
                                playHaptic();
                            }
                        }
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

    // --- EMOTION SYNC (New) ---
    // Sync global emotion store (from VoiceAssistant) to Robot (via WebSocket)
    const { currentEmotion, setEmotion } = useRobotEmotion();

    useEffect(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Send emotion command to Hub, which broadcasts to Robot Face
            wsRef.current.send(JSON.stringify({
                command: 'set_emotion',
                params: { emotion: currentEmotion }
            }));
            console.log("📡 Emotion Synced to Robot:", currentEmotion);
        }
    }, [currentEmotion]);

    // --- RESILIENCE: Telemetry ⇌ Emotion ---
    useEffect(() => {
        if (wsStatus === 'Disconnected') {
            setEmotion('sleepy');
        } else if (batteryLevel < 15) {
            setEmotion('angry');
        } else if (currentEmotion === 'sleepy' || currentEmotion === 'angry') {
            // Recover to neutral if previously in error state
            setEmotion('neutral');
        }
    }, [wsStatus, batteryLevel, setEmotion]);

    // --- IDLE BEHAVIOR: Random micro-animations ---
    useEffect(() => {
        if (currentEmotion !== 'neutral') return;

        const triggerIdle = () => {
            if (currentEmotion === 'neutral') {
                const idles: Emotion[] = ['curious', 'happy', 'shy'];
                const randomIdle = idles[Math.floor(Math.random() * idles.length)];
                setEmotion(randomIdle);
                // Return to neutral after 3s
                setTimeout(() => setEmotion('neutral'), 3000);
            }
        };

        const interval = setInterval(triggerIdle, 25000 + Math.random() * 20000); // 25-45s
        return () => clearInterval(interval);
    }, [currentEmotion, setEmotion]);

    // Handle Score
    const handleScoreUpdate = useCallback(async (points: number, stationId: string) => {
        const newScore = currentScore + points;
        setCurrentScore(newScore);

        setSessionScores(prev => ({ ...prev, [stationId]: (prev[stationId] || 0) + points }));

        setEmotion('celebrate');
        setTimeout(() => setEmotion('neutral'), 3000);

        if (sessionId && supabase) {
            await supabase.from('game_sessions').update({ score: newScore }).eq('id', sessionId);
            await supabase.from('game_scores').insert({
                session_id: sessionId,
                event_type: 'quiz_pass',
                station_id: stationId,
                points: points
            });
        }
    }, [currentScore, sessionId, supabase, setEmotion]);

    const handleAnswerResult = useCallback((isCorrect: boolean) => {
        if (isCorrect) {
            setEmotion('celebrate');
        } else {
            setEmotion('sad');
        }
        setTimeout(() => setEmotion('neutral'), 2500);
    }, [setEmotion]);

    const handleQuizComplete = useCallback(() => {
        setEmotion('celebrate');
    }, [setEmotion]);

    const handleVoiceCommand = (text: string, lang: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setCurrentSubtitle("⚠️ Hệ thống mất kết nối, vui lòng thử lại sau.");
            return;
        }
        wsRef.current.send(JSON.stringify({
            command: 'voice_command',
            params: { text, lang }
        }));
        setEmotion('think');
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
        const exists = mapSites.find(s => s.id === updatedSite.id);
        const newSites = exists
            ? mapSites.map(site => site.id === updatedSite.id ? updatedSite : site)
            : [...mapSites, updatedSite];

        setMapSites(newSites);
        setEditingSite(null);

        setCurrentSubtitle(`⏳ Đang lưu thay đổi cho ${updatedSite.name}...`);
        const success = await persistMapConfig(newSites, robotHome, backgroundUrl);

        if (success) {
            setCurrentSubtitle(exists ? `Đã cập nhật & lưu: ${updatedSite.name}` : `Đã thêm trạm mới: ${updatedSite.name}`);
        }
    };

    const createNewSite = () => {
        const newSite: Site = {
            id: `site_${Date.now()}`,
            name: 'Trạm Di Sản Mới',
            description: 'Mô tả trạm di sản mới...',
            icon: 'MapPin',
            badge: '', // Added to fix lint error
            posX: 48,
            posY: 48,
            color: 'from-slate-400 to-slate-600',
            pathColor: '#64748b'
        };
        setEditingSite(newSite);
    };

    const missionSteps = [
        { id: 'start', label: 'Tp. Hồ Chí Minh', status: 'completed' as const, icon: <MapIcon className="w-5 h-5" /> },
        { id: 'hoi_an', label: 'Hội An', status: 'current' as const, icon: 'Landmark' },
        { id: 'trang_an', label: 'Tràng An', status: 'pending' as const, icon: 'Mountain' },
        { id: 'ha_long', label: 'Vịnh Hạ Long', status: 'pending' as const, icon: 'Anchor' },
        { id: 'cot_co', label: 'Cột cờ Hà Nội', status: 'pending' as const, icon: 'Flag' },
        { id: 'finish', label: 'Hoàn thành', status: 'pending' as const, icon: <Trophy className="w-5 h-5" /> },
    ];

    if (!isAuthorized) return (
        <JudgePinModal
            onSuccess={(role) => {
                setIsAuthorized(true);
                setUserRole(role);
                // Auto-enable editor mode for admins to prevent confusion
                if (role === 'admin') {
                    setIsEditorMode(true);
                    setCurrentSubtitle("Chế độ Quản trị viên đã được kích hoạt.");
                } else {
                    setCurrentSubtitle("Chế độ Giám khảo kích hoạt.");
                }
            }}
        />
    );

    return (
        <motion.div
            animate={{ backgroundColor: currentTheme }}
            transition={{ duration: 2 }}
            className={`h-screen w-screen flex flex-col text-white overflow-hidden font-sans selection:bg-purple-500/30 ${isResizing ? 'cursor-col-resize select-none' : ''}`}
        >

            {/* --- TOP BAR --- */}
            <header className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50 shrink-0 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <MapIcon className="w-6 h-6 text-white" />
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
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span className={`text-xs font-bold ${wsStatus === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {wsStatus === 'Connected' ? `ONLINE (${latency}ms)` : 'OFFLINE'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5">
                        <Battery className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-bold text-slate-300">{batteryLevel}%</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5">
                        <Diamond className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-white">{currentScore} PTS</span>
                    </div>

                    <button
                        onClick={() => setShowBadges(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg border border-white/20 shadow-lg hover:scale-105 transition-all text-white group"
                    >
                        <ShoppingBag className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black">{Object.keys(sessionScores).length}</span>
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-2 text-xl font-black font-mono tracking-tight text-slate-200">
                        <Clock className="w-5 h-5 text-slate-400" />
                        {currentTime}
                    </div>
                </div>
            </header>

            {/* --- MAIN 3-COLUMN CONTENT --- */}
            <div className="flex-1 flex min-h-0 relative">

                {/* LEFT: MISSION TRACKING (Col 1-2 equivalent) */}
                <div className="w-[80px] shrink-0 z-10">
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
                            onSiteDiscover={(id) => {
                                setActiveQuizStation(id);
                                if (id) setEmotion('curious');
                            }}
                            stationStatuses={stationStatuses}
                            isEditorMode={isEditorMode}
                            onEditSite={setEditingSite}
                            sites={[...mapSites].sort((a, b) => {
                                const order = ['pho_co_hoi_an', 'trang_an', 'vinh_ha_long', 'cot_co'];
                                return order.indexOf(a.id) - order.indexOf(b.id);
                            })}
                            onPosUpdate={handlePosUpdate}
                            onRobotPosUpdate={handleRobotPosUpdate}
                            backgroundUrl={backgroundUrl}
                            onSiteClick={setSelectedBookSite}
                            focusedSiteId={activeQuizStation || pendingIntro?.site.id || selectedBookSite?.id}
                            isLocked={!!pendingIntro}
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
                                            onClick={createNewSite}
                                            className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-purple-600 border-2 border-white text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            ADD NEW SITE
                                        </button>

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
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[250] w-full max-w-3xl px-6 pointer-events-none">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentSubtitle}
                                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -10, opacity: 0, scale: 0.95 }}
                                className="bg-slate-900/20 backdrop-blur-2xl border border-white/5 px-8 py-5 rounded-xl shadow-2xl text-center ring-1 ring-white/5 transition-all duration-500"
                            >
                                <p className="text-lg md:text-xl font-bold text-white leading-relaxed drop-shadow-md italic">
                                    "{currentSubtitle}"
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- RESIZER HANDLE --- */}
                <div
                    onMouseDown={startResizing}
                    onTouchStart={startResizing}
                    className={`w-1.5 hover:w-2 bg-transparent hover:bg-purple-500/30 cursor-col-resize z-[60] transition-all relative flex items-center justify-center group ${isResizing ? 'bg-purple-500/40 w-2' : ''}`}
                >
                    <div className="w-[1px] h-12 bg-white/10 group-hover:bg-white/40 rounded-full" />
                </div>

                {/* RIGHT SIDEBAR (Mascot & Interaction) */}
                <div
                    style={{ width: `${sidebarWidth}px` }}
                    className="bg-slate-900/60 backdrop-blur-3xl border-l border-white/5 flex flex-col shrink-0 z-40 shadow-2xl overflow-hidden"
                >
                    {/* MASCOT AREA - Scales with sidebarWidth */}
                    <div
                        style={{ height: `${sidebarWidth * 1.16}px` }}
                        className="relative border-b border-white/5 bg-gradient-to-b from-slate-950/40 to-slate-800/20 overflow-hidden shrink-0"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AIAvatar
                                emotion={currentEmotion as MascotVideoEmotion}
                                isTalking={currentEmotion === 'talking'}
                                size={sidebarWidth}
                            />
                        </div>
                        <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 text-purple-400 text-[9px] font-black rounded-full uppercase tracking-wider border border-purple-500/30 backdrop-blur-md z-10">
                            AI Storyteller
                        </div>
                    </div>

                    <div className="p-5 border-b border-white/5 bg-slate-900/20 shrink-0">
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1 h-1 bg-purple-500 rounded-full" />
                            Voice Assistant
                        </h3>
                        <VoiceAssistant
                            lang={voiceLang}
                            onCommand={(text) => handleVoiceCommand(text, voiceLang)}
                            onLangChange={setVoiceLang}
                            isTalking={isAITalking}
                        />
                    </div>

                    <div className="flex-1 flex flex-col p-5 mt-8 min-h-0 overflow-hidden relative">
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 shrink-0 flex items-center gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full" />
                            Session Leaderboard
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mx-2 px-2">
                            <ScoreLeaderboard />
                        </div>
                        {/* Subtle bottom fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* --- OVERLAYS --- */}


            <AnimatePresence>
                {showBadges && (
                    <BadgeCollection
                        scores={sessionScores}
                        onClose={() => setShowBadges(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedBookSite && (
                    <div className="fixed top-16 left-0 right-0 bottom-0 z-[100]">
                        <HeritageBook
                            siteId={selectedBookSite.id}
                            pages={(config.heritage_info as any)[selectedBookSite.id]?.pages || []}
                            onClose={() => {
                                setSelectedBookSite(null);
                                setIsAutoPlayBook(false);
                            }}
                            onQuizStart={() => {
                                setActiveQuizStation(selectedBookSite.id);
                                setSelectedBookSite(null);
                                setIsAutoPlayBook(false);
                            }}
                            isAutoPlay={isAutoPlayBook}
                        />
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeQuizStation && (
                    <div className="fixed top-16 left-0 right-0 bottom-0 z-[200]">
                        <AdvancedQuiz
                            stationId={activeQuizStation}
                            questions={(config.heritage_info as any)[activeQuizStation]?.quiz_data || []}
                            badgeImage={(config.heritage_info as any)[activeQuizStation]?.badge_image}
                            onClose={() => {
                                setActiveQuizStation(null);
                                setIsAutoPlayBook(false);
                                setSelectedBookSite(null);
                                const endText = "Chúng ta cùng tiếp tục cuộc hành trình nhé";
                                setCurrentSubtitle(endText);
                                window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: endText } }));
                            }}
                            onScoreUpdate={(points) => handleScoreUpdate(points, activeQuizStation)}
                            onAnswerResult={handleAnswerResult}
                            onComplete={handleQuizComplete}
                        />
                    </div>
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
        </motion.div>
    );
}
