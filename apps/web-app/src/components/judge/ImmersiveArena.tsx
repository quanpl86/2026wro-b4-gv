'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Point {
    x: number;
    y: number;
}

interface Site {
    id: string;
    name: string;
    description: string;
    icon: string;
    gridX: number;
    gridY: number;
    color: string;
}

interface ImmersiveArenaProps {
    currentPos: Point;
    path: Point[];
    onSiteDiscover?: (siteId: string) => void;
}

export default function ImmersiveArena({ currentPos, path, onSiteDiscover }: ImmersiveArenaProps) {
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);

    const sites: Site[] = [
        {
            id: 'trang_an',
            name: 'Tràng An',
            description: 'Di sản thế giới kép tại Ninh Bình, nổi tiếng với quần thể núi đá vôi và hang động lung linh.',
            icon: '⛰️',
            gridX: 2, gridY: 2,
            color: 'from-emerald-400 to-teal-600'
        },
        {
            id: 'cot_co',
            name: 'Cột cờ Hà Nội',
            description: 'Biểu tượng lịch sử của thủ đô, được xây dựng từ đầu thế kỷ 19 dưới triều Nguyễn.',
            icon: '🚩',
            gridX: 7, gridY: 1,
            color: 'from-red-400 to-rose-600'
        },
        {
            id: 'vinh_ha_long',
            name: 'Vịnh Hạ Long',
            description: 'Kỳ quan thiên nhiên thế giới với hàng ngàn hòn đảo đá vôi kỳ vĩ giữa biển khơi.',
            icon: '⛵',
            gridX: 8, gridY: 4,
            color: 'from-blue-400 to-cyan-600'
        },
        {
            id: 'pho_co_hoi_an',
            name: 'Hội An',
            description: 'Đô thị cổ được bảo tồn gần như nguyên vẹn, phản ánh nét giao lưu văn hóa Đông - Tây.',
            icon: '🏮',
            gridX: 4, gridY: 3,
            color: 'from-orange-400 to-amber-600'
        }
    ];

    // Normalize coordinates to 0-100% for the grid container
    // Original space is roughly 640x480 (from LiveMap telemetry)
    const getPercentX = (x: number) => (x / 640) * 100;
    const getPercentY = (y: number) => (y / 480) * 100;

    return (
        <div className="relative w-full h-[500px] bg-slate-950 rounded-[40px] border border-white/5 overflow-hidden group">
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* PATH TRACE */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <motion.path
                    d={`M ${path.map(p => `${getPercentX(p.x)}% ${getPercentY(p.y)}%`).join(' L ')}`}
                    fill="none"
                    stroke="url(#pathGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="8 8"
                    animate={{ strokeDashoffset: [0, -16] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
            </svg>

            {/* HERITAGE SITES */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-5 p-8">
                {sites.map((site) => (
                    <div
                        key={site.id}
                        style={{ gridColumnStart: site.gridX, gridRowStart: site.gridY }}
                        className="flex items-center justify-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedSite(site)}
                            className="relative group/site"
                        >
                            <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${site.color} flex items-center justify-center text-3xl shadow-lg shadow-${site.color.split('-')[1]}/20 ring-4 ring-white/10`}>
                                {site.icon}
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover/site:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{site.name}</span>
                            </div>
                        </motion.button>
                    </div>
                ))}
            </div>

            {/* ROBOT AVATAR (Digital Twin) */}
            <motion.div
                animate={{
                    left: `${getPercentX(currentPos.x)}%`,
                    top: `${getPercentY(currentPos.y)}%`
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-40"
            >
                <div className="relative">
                    {/* Shadow/Glow */}
                    <div className="absolute inset-0 bg-blue-500/50 blur-xl animate-pulse" />
                    {/* Robot Shell */}
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden border-2 border-blue-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
                        <span className="text-xl relative z-10">🤖</span>
                    </div>
                    {/* Position Label */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 px-2 py-0.5 rounded text-[8px] font-black text-white whitespace-nowrap">
                        ACTIVE SYNC: {Math.round(currentPos.x)}, {Math.round(currentPos.y)}
                    </div>
                </div>
            </motion.div>

            {/* DETAIL OVERLAY */}
            <AnimatePresence>
                {selectedSite && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl p-12 flex flex-col items-center justify-center text-center"
                    >
                        <motion.button
                            onClick={() => setSelectedSite(null)}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 transition-all"
                        >
                            ✕
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className={`w-32 h-32 rounded-[40px] bg-gradient-to-br ${selectedSite.color} flex items-center justify-center text-6xl mb-8 shadow-2xl shadow-purple-500/20`}
                        >
                            {selectedSite.icon}
                        </motion.div>

                        <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 text-white">
                            {selectedSite.name}
                        </h2>
                        <p className="text-slate-400 max-w-md text-lg leading-relaxed mb-8">
                            {selectedSite.description}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    if (onSiteDiscover) onSiteDiscover(selectedSite.id);
                                    setSelectedSite(null);
                                }}
                                className="px-8 py-4 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-110 active:scale-95 transition-all"
                            >
                                Thử thách Quiz 🎯
                            </button>
                            <button
                                onClick={() => setSelectedSite(null)}
                                className="px-8 py-4 bg-white/5 border border-white/10 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
