'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeritageBook from '@/components/interactive/HeritageBook';
import config from '../../../../../packages/shared-config/config.json';

interface Point {
    x: number;
    y: number;
}

interface Site {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge: string;
    posX: number; // percentage 0-100
    posY: number; // percentage 0-100
    color: string;
    pathColor?: string;
}

interface ImmersiveArenaProps {
    robotPos: Point;
    robotHome?: Point;
    path: Point[];
    onSiteDiscover?: (siteId: string) => void;
    isEditorMode?: boolean;
    onEditSite?: (site: Site) => void;
    sites: Site[];
    onPosUpdate?: (siteId: string, x: number, y: number) => void;
    onRobotPosUpdate?: (x: number, y: number) => void;
    backgroundUrl?: string;
}

export default function ImmersiveArena({ robotPos, robotHome, path, onSiteDiscover, isEditorMode, onEditSite, sites, onPosUpdate, onRobotPosUpdate, backgroundUrl }: ImmersiveArenaProps) {
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [hoveredSite, setHoveredSite] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imageBounds, setImageBounds] = useState<{ width: number, height: number, left: number, top: number } | null>(null);

    const updateImageBounds = () => {
        if (!containerRef.current || !imgRef.current) return;
        const container = containerRef.current;
        const img = imgRef.current;

        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        if (!iw || !ih) return;

        const containerAspect = cw / ch;
        const imageAspect = iw / ih;

        let rw, rh, left, top;

        if (imageAspect > containerAspect) {
            rw = cw;
            rh = cw / imageAspect;
            left = 0;
            top = (ch - rh) / 2;
        } else {
            rh = ch;
            rw = ch * imageAspect;
            top = 0;
            left = (cw - rw) / 2;
        }

        setImageBounds({ width: rw, height: rh, left, top });
    };

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(updateImageBounds);
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Map Robot (0-640, 0-480) to Vietnam Viewport in the image
    const getPercentX = (x: number) => 45 + (x / 640) * 20;
    const getPercentY = (y: number) => 82 - (y / 480) * 70;

    // Reverse Mapping: Percent to Raw Robot Coordinates
    const getRawX = (pctX: number) => ((pctX - 45) / 20) * 640;
    const getRawY = (pctY: number) => ((82 - pctY) / 70) * 480;

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950/20 rounded-[40px] overflow-hidden group border border-white/5">

            {/* ILLUSTRATED VIETNAM MAP BACKGROUND */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none p-4">
                <img
                    ref={imgRef}
                    src={backgroundUrl || "/assets/maps/vietnam_illustrated.png"}
                    alt="Vietnam Map"
                    onLoad={updateImageBounds}
                    className="h-full w-auto object-contain opacity-80"
                />
            </div>

            {/* RESPONSIVE MAP CONTENT WRAPPER */}
            {imageBounds && (
                <div
                    className="absolute pointer-events-none z-20"
                    style={{
                        width: imageBounds.width,
                        height: imageBounds.height,
                        left: imageBounds.left,
                        top: imageBounds.top
                    }}
                >
                    {/* CONNECTION LINES BETWEEN SITES (Segmented Journey) */}
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                    >
                        <defs>
                            {sites.map((site, i) => (
                                <linearGradient key={`grad-${site.id}`} id={`grad-${site.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={i === 0 ? "#3b82f6" : (sites[i - 1].pathColor || "#3b82f6")} />
                                    <stop offset="100%" stopColor={site.pathColor || "#f43f5e"} />
                                </linearGradient>
                            ))}
                        </defs>
                        {sites.map((site, i) => {
                            const startX = i === 0
                                ? (robotHome ? getPercentX(robotHome.x) : sites[0].posX)
                                : sites[i - 1].posX;
                            const startY = i === 0
                                ? (robotHome ? getPercentY(robotHome.y) : sites[0].posY)
                                : sites[i - 1].posY;

                            return (
                                <motion.path
                                    key={`segment-${site.id}`}
                                    d={`M ${startX} ${startY} L ${site.posX} ${site.posY}`}
                                    fill="none"
                                    stroke={`url(#grad-${site.id})`}
                                    strokeWidth="1" // Thin stroke because SVG is 100x100
                                    strokeDasharray="2 1.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, delay: i * 0.5 }}
                                    className="drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]"
                                />
                            );
                        })}
                    </svg>

                    {/* ROBOT PATH (Digital Trace) */}
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                    >
                        <motion.path
                            d={`M ${path.map(p => `${getPercentX(p.x)} ${getPercentY(p.y)}`).join(' L ')}`}
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeOpacity="0.4"
                            strokeDasharray="0.2 1.5"
                        />
                    </svg>

                    {/* HERITAGE PINS */}
                    {sites.map((site) => {
                        const isHovered = hoveredSite === site.id;
                        return (
                            <motion.div
                                key={site.id}
                                drag={isEditorMode}
                                dragMomentum={false}
                                onDragEnd={(_, info) => {
                                    if (!onPosUpdate || !imageBounds) return;
                                    const rect = containerRef.current?.getBoundingClientRect();
                                    if (!rect) return;

                                    const relX = info.point.x - rect.left - imageBounds.left;
                                    const relY = info.point.y - rect.top - imageBounds.top;

                                    const newX = (relX / imageBounds.width) * 100;
                                    const newY = (relY / imageBounds.height) * 100;
                                    onPosUpdate(site.id, Math.round(newX * 10) / 10, Math.round(newY * 10) / 10);
                                }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 ${isEditorMode ? 'z-50 cursor-move pointer-events-auto' : 'z-30 pointer-events-auto'}`}
                                style={{ left: `${site.posX}%`, top: `${site.posY}%` }}
                            >
                                <div className="relative flex flex-col items-center justify-center">
                                    {isEditorMode && (
                                        <div className="absolute -top-10 bg-slate-800 text-[8px] font-mono px-2 py-1 rounded border border-white/10 whitespace-nowrap pointer-events-none">
                                            X:{site.posX} Y:{site.posY}
                                        </div>
                                    )}
                                    <AnimatePresence>
                                        {isHovered && !isEditorMode && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                                                className="absolute bottom-full mb-6 w-36 h-36 bg-slate-900/95 backdrop-blur-2xl rounded-[32px] border-2 border-white/20 p-2 shadow-2xl flex items-center justify-center group/card cursor-pointer z-50 overflow-visible"
                                                onClick={() => setSelectedSite(site)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[30px] pointer-events-none" />
                                                <img
                                                    src={site.badge}
                                                    alt={site.name}
                                                    className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover/card:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white text-black text-[11px] font-black px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-[0.15em] shadow-[0_10px_20px_rgba(255,255,255,0.1)] ring-4 ring-black/10">
                                                    {site.name}
                                                </div>
                                                <div className="absolute -top-4 bg-purple-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    Interactive
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.button
                                        onMouseEnter={() => setHoveredSite(site.id)}
                                        onMouseLeave={() => setHoveredSite(null)}
                                        onClick={() => isEditorMode ? onEditSite?.(site) : setSelectedSite(site)}
                                        whileHover={{ scale: 1.3 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`w-10 h-10 rounded-[14px] border-2 border-white flex items-center justify-center bg-gradient-to-br ${site.color} shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative group/pin`}
                                    >
                                        <span className="text-lg group-hover/pin:rotate-12 transition-transform">{site.icon}</span>
                                        <div className="absolute inset-[-10px] border-2 border-white/20 rounded-[20px] animate-ping" />
                                        <div className="absolute inset-[-4px] border border-white/40 rounded-[16px] animate-pulse" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* ROBOT AVATAR */}
                    <motion.div
                        drag={isEditorMode}
                        dragMomentum={false}
                        onDragEnd={(_, info) => {
                            if (!onRobotPosUpdate || !imageBounds) return;
                            const rect = containerRef.current?.getBoundingClientRect();
                            if (!rect) return;

                            const relX = info.point.x - rect.left - imageBounds.left;
                            const relY = info.point.y - rect.top - imageBounds.top;

                            const pctX = (relX / imageBounds.width) * 100;
                            const pctY = (relY / imageBounds.height) * 100;
                            onRobotPosUpdate(getRawX(pctX), getRawY(pctY));
                        }}
                        animate={{
                            left: `${getPercentX(robotPos.x)}%`,
                            top: `${getPercentY(robotPos.y)}%`
                        }}
                        transition={isEditorMode ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 15 }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 ${isEditorMode ? 'z-[70] cursor-move pointer-events-auto' : 'z-40 pointer-events-auto'}`}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/40 blur-2xl animate-pulse scale-150" />
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-2xl border-4 border-blue-500 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />
                                <span className="text-2xl relative z-10">🤖</span>
                            </div>
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-lg border border-blue-400/50 text-[9px] font-black text-white whitespace-nowrap shadow-xl flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                {isEditorMode ? 'CALIBRATE' : 'LIVE'}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* INTERACTION OVERLAY */}
            <AnimatePresence>
                {selectedSite && (
                    <HeritageBook
                        siteId={selectedSite.id}
                        pages={(config.heritage_info as any)[selectedSite.id]?.pages || []}
                        onClose={() => setSelectedSite(null)}
                        onQuizStart={() => {
                            if (onSiteDiscover) onSiteDiscover(selectedSite.id);
                            setSelectedSite(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
