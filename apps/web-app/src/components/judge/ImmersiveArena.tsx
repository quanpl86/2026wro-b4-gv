'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Bot, MapPin, Landmark, Mountain, Anchor, Flag, ZoomIn, ZoomOut, Maximize, RefreshCw, Hand, Move } from 'lucide-react';
import HeritageBook from '@/components/interactive/HeritageBook';
import config from '@/data/config.json';
import { renderLucideIcon } from '@/utils/iconMapping';

interface Point {
    x: number;
    y: number;
}

export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'multiple_response' | 'true_false' | 'matching' | 'sequencing';
    question: string;
    options?: string[];
    correct_answer?: string;
    correct_answers?: string[];
    items?: string[];
    correct_order?: string[];
    pairs?: { left: string; right: string }[];
    explanation: string;
    points: number;
}

export interface Site {
    id: string;
    name: string;
    description: string;
    icon: string | React.ReactNode;
    badge: string;
    posX: number;
    posY: number;
    color: string;
    pathColor?: string;
    quiz_data?: QuizQuestion[];
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
    stationStatuses?: Record<string, { status: string, action?: string }>;
    onSiteClick?: (site: Site) => void;
    focusedSiteId?: string | null;
}

export default function ImmersiveArena({ robotPos, robotHome, path, onSiteDiscover, isEditorMode, onEditSite, sites, onPosUpdate, onRobotPosUpdate, backgroundUrl, stationStatuses = {}, onSiteClick, focusedSiteId }: ImmersiveArenaProps) {
    const [hoveredSite, setHoveredSite] = useState<string | null>(null);
    const [isPanMode, setIsPanMode] = useState(false);
    const [isMoveMode, setIsMoveMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imageBounds, setImageBounds] = useState<{ width: number, height: number, left: number, top: number } | null>(null);

    const zoomVal = useMotionValue(1);
    const panXVal = useMotionValue(0);
    const panYVal = useMotionValue(0);

    const zoom = useSpring(zoomVal, { stiffness: 400, damping: 40 });
    const panX = useSpring(panXVal, { stiffness: 400, damping: 40 });
    const panY = useSpring(panYVal, { stiffness: 400, damping: 40 });

    const [isDraggingMap, setIsDraggingMap] = useState(false);

    const resetView = useCallback(() => {
        zoomVal.set(1);
        panXVal.set(0);
        panYVal.set(0);
    }, [zoomVal, panXVal, panYVal]);

    const handleFocusSite = (site: Site) => {
        const targetZoom = 2.5;
        zoomVal.set(targetZoom);

        // Correct Centering Math:
        // We want to bring (site.posX, site.posY) to (50, 50) of the container.
        // The container center is already at the image's center (50, 50).
        // The offset needed is the difference from center, scaled by the zoom factor.
        // We use a factor of 8-10 for the percentage-to-pixel conversion assuming typical screen widths.
        const multiplier = 10;
        const targetX = (50 - site.posX) * targetZoom * multiplier;
        const targetY = (50 - site.posY) * targetZoom * multiplier;

        panXVal.set(targetX);
        panYVal.set(targetY);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (isEditorMode) return;
        const delta = e.deltaY * -0.002;
        const currentZone = zoomVal.get();
        zoomVal.set(Math.min(Math.max(currentZone + delta, 0.5), 6));
    };

    // Auto-focus when focusedSiteId changes
    useEffect(() => {
        if (focusedSiteId) {
            const site = sites.find(s => s.id === focusedSiteId);
            if (site) {
                handleFocusSite(site);
            }
        } else {
            resetView();
        }
    }, [focusedSiteId, sites, resetView]);

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
            rw = cw; rh = cw / imageAspect; left = 0; top = (ch - rh) / 2;
        } else {
            rh = ch; rw = ch * imageAspect; top = 0; left = (cw - rw) / 2;
        }
        setImageBounds({ width: rw, height: rh, left, top });
    };

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(updateImageBounds);
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const getPercentX = (x: number) => 45 + (x / 640) * 20;
    const getPercentY = (y: number) => 82 - (y / 480) * 70;
    const getRawX = (pctX: number) => ((pctX - 45) / 20) * 640;
    const getRawY = (pctY: number) => ((82 - pctY) / 70) * 480;

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950/20 rounded-[40px] overflow-hidden group border border-white/5 perspective-[2000px]">
            <motion.div
                className="relative w-full h-full preserve-3d"
                initial={{ rotateX: 20, y: 50, scale: 0.95 }}
                animate={{ rotateX: 25, y: 0, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <motion.div
                    className="absolute inset-0 flex justify-center items-center p-4 preserve-3d will-change-transform"
                    style={{ scale: zoom, x: panX, y: panY }}
                    onWheel={handleWheel}
                >
                    <img
                        ref={imgRef}
                        src={backgroundUrl || "/assets/maps/vietnam_illustrated.png"}
                        className="max-w-full max-h-full object-contain opacity-40 grayscale-20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] pointer-events-none"
                        onLoad={updateImageBounds}
                        alt="Arena Map"
                    />
                </motion.div>

                {imageBounds && (
                    <motion.div
                        className="absolute pointer-events-none preserve-3d will-change-transform"
                        style={{
                            width: imageBounds.width,
                            height: imageBounds.height,
                            left: imageBounds.left,
                            top: imageBounds.top,
                            scale: zoom,
                            x: panX,
                            y: panY
                        }}
                    >
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible preserve-3d">
                            <defs>
                                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                            {path.length > 1 && (
                                <path
                                    d={`M ${path.map(p => `${getPercentX(p.x)} ${getPercentY(p.y)}`).join(' L ')}`}
                                    fill="none"
                                    stroke="url(#pathGradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="animate-[dash_10s_linear_infinite]"
                                    style={{ strokeDasharray: '10 10' }}
                                />
                            )}
                        </svg>

                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <defs>
                                {sites.map((site, i) => (
                                    <linearGradient key={`grad-${site.id}`} id={`grad-${site.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={i === 0 ? "#3b82f6" : (sites[i - 1].pathColor || "#3b82f6")} />
                                        <stop offset="100%" stopColor={site.pathColor || "#f43f5e"} />
                                    </linearGradient>
                                ))}
                            </defs>
                            {sites.map((site, i) => {
                                const startX = i === 0 ? (robotHome ? getPercentX(robotHome.x) : sites[0].posX) : sites[i - 1].posX;
                                const startY = i === 0 ? (robotHome ? getPercentY(robotHome.y) : sites[0].posY) : sites[i - 1].posY;
                                return (
                                    <motion.path
                                        key={`segment-${site.id}`}
                                        d={`M ${startX} ${startY} L ${site.posX} ${site.posY}`}
                                        fill="none"
                                        stroke={`url(#grad-${site.id})`}
                                        strokeWidth="1"
                                        strokeDasharray="2 1.5"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, delay: i * 0.5 }}
                                    />
                                );
                            })}
                        </svg>

                        {sites.map((site) => {
                            const isFocus = focusedSiteId === site.id;
                            const isHovered = hoveredSite === site.id || isFocus;
                            const isDiscovering = stationStatuses[site.id]?.status === 'busy';
                            return (
                                <motion.div
                                    key={site.id}
                                    drag={isEditorMode && isMoveMode}
                                    dragMomentum={false}
                                    onDragEnd={(_, info) => {
                                        if (!onPosUpdate || !imageBounds || !containerRef.current) return;
                                        const rect = containerRef.current.getBoundingClientRect();

                                        // De-transform math: Accounts for Zoom and Pan
                                        const mouseX_rel_center = info.point.x - (rect.left + rect.width / 2);
                                        const mouseY_rel_center = info.point.y - (rect.top + rect.height / 2);

                                        const mapX = (mouseX_rel_center - panXVal.get()) / zoomVal.get();
                                        const mapY = (mouseY_rel_center - panYVal.get()) / zoomVal.get();

                                        // Convert map-center-relative back to image-left-relative (percentage)
                                        const imgRelX = mapX + (rect.width / 2 - imageBounds.left);
                                        const imgRelY = mapY + (rect.height / 2 - imageBounds.top);

                                        const newX = (imgRelX / imageBounds.width) * 100;
                                        const newY = (imgRelY / imageBounds.height) * 100;

                                        onPosUpdate(site.id, Math.round(newX * 10) / 10, Math.round(newY * 10) / 10);
                                    }}
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 preserve-3d ${isEditorMode && isMoveMode ? 'z-[100] cursor-move pointer-events-auto' : isEditorMode ? 'z-50 cursor-pointer pointer-events-auto' : 'z-30 pointer-events-auto'}`}
                                    style={{
                                        left: `${site.posX}%`,
                                        top: `${site.posY}%`,
                                        zIndex: isHovered || isDiscovering ? 60 : 30
                                    }}
                                >
                                    <motion.div className="preserve-3d" animate={{ rotateX: -25 }}>
                                        <div className="relative flex flex-col items-center justify-center">
                                            {isEditorMode && (
                                                <div className="absolute -top-10 bg-slate-800 text-[8px] font-mono px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                                                    X:{site.posX} Y:{site.posY}
                                                </div>
                                            )}
                                            <AnimatePresence>
                                                {(isHovered || isFocus) && !isEditorMode && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 15, scale: 0.8 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 15, scale: 0.8 }}
                                                        className="absolute bottom-full mb-6 w-36 h-36 bg-slate-900/95 backdrop-blur-2xl rounded-[32px] border-2 border-white/20 p-2 shadow-2xl flex items-center justify-center group/card cursor-pointer z-50 overflow-visible"
                                                        onClick={() => onSiteClick?.(site)}
                                                    >
                                                        <img src={site.badge} alt={site.name} className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover/card:scale-110 transition-transform duration-500" />
                                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white text-black text-[11px] font-black px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-[0.15em] shadow-[0_10px_20px_rgba(255,255,255,0.1)] ring-4 ring-black/10">
                                                            {site.name}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <motion.button
                                                onMouseEnter={() => setHoveredSite(site.id)}
                                                onMouseLeave={() => setHoveredSite(null)}
                                                onClick={() => {
                                                    if (isMoveMode) return;
                                                    isEditorMode ? onEditSite?.(site) : handleFocusSite(site);
                                                }}
                                                whileHover={{ scale: isMoveMode ? 1 : 1.3 }}
                                                className={`w-10 h-10 rounded-[14px] border-2 border-white flex items-center justify-center bg-gradient-to-br ${site.color} shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative group/pin`}
                                            >
                                                {renderLucideIcon(site.icon, "w-5 h-5")}
                                                {stationStatuses[site.id]?.status === 'busy' ? (
                                                    <div className="absolute inset-[-8px] border-4 border-amber-500 rounded-[18px] animate-[spin_3s_linear_infinity]">
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="absolute inset-[-10px] border-2 border-white/20 rounded-[20px] animate-ping" />
                                                        <div className="absolute inset-[-4px] border border-white/40 rounded-[16px] animate-pulse" />
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                        {/* ROBOT AVATAR - Now inside the transformed plane */}
                        <motion.div
                            animate={{
                                left: `${getPercentX(robotPos.x)}%`,
                                top: `${getPercentY(robotPos.y)}%`
                            }}
                            transition={isEditorMode ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 15 }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 preserve-3d ${isEditorMode && isMoveMode ? 'z-[110] cursor-move pointer-events-auto' : 'z-40 pointer-events-auto'}`}
                            drag={isEditorMode && isMoveMode}
                            dragMomentum={false}
                            onDragEnd={(_, info) => {
                                if (!onRobotPosUpdate || !imageBounds || !containerRef.current) return;
                                const rect = containerRef.current.getBoundingClientRect();

                                const mouseX_rel_center = info.point.x - (rect.left + rect.width / 2);
                                const mouseY_rel_center = info.point.y - (rect.top + rect.height / 2);

                                const mapX = (mouseX_rel_center - panXVal.get()) / zoomVal.get();
                                const mapY = (mouseY_rel_center - panYVal.get()) / zoomVal.get();

                                const pctX = (mapX + (rect.width / 2 - imageBounds.left)) / imageBounds.width * 100;
                                const pctY = (mapY + (rect.height / 2 - imageBounds.top)) / imageBounds.height * 100;

                                onRobotPosUpdate(getRawX(pctX), getRawY(pctY));
                            }}
                        >
                            <motion.div className="preserve-3d" animate={{ rotateX: -25 }}>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/40 blur-2xl animate-pulse scale-150" />
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-2xl border-4 border-blue-500 flex items-center justify-center relative overflow-hidden">
                                        <Bot className="w-6 h-6 text-blue-600 relative z-10" />
                                    </div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black text-white whitespace-nowrap shadow-xl">
                                        ROBOT
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}

                {/* GLOBAL DRAG LAYER - Only active when Pan Mode is ON */}
                {!isEditorMode && isPanMode && (
                    <motion.div
                        className="absolute inset-0 cursor-grab active:cursor-grabbing z-[80]"
                        drag
                        dragConstraints={{ left: -3000, right: 3000, top: -3000, bottom: 3000 }}
                        onDragStart={() => setIsDraggingMap(true)}
                        onDrag={(event, info) => {
                            panXVal.set(panXVal.get() + info.delta.x);
                            panYVal.set(panYVal.get() + info.delta.y);
                        }}
                        onDragEnd={() => setIsDraggingMap(false)}
                        onWheel={handleWheel}
                    />
                )}
            </motion.div>

            <div className="absolute top-8 left-8 flex flex-col gap-2 z-[60]">
                <button onClick={() => zoomVal.set(Math.min(zoomVal.get() + 0.5, 6))} className="w-12 h-12 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-2xl">
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={() => zoomVal.set(Math.max(zoomVal.get() - 0.5, 0.5))} className="w-12 h-12 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-2xl">
                    <ZoomOut className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setIsPanMode(!isPanMode)}
                    className={`w-12 h-12 backdrop-blur-xl border rounded-xl flex items-center justify-center transition-all shadow-2xl active:scale-90
                        ${isPanMode ? 'bg-purple-600 border-white text-white rotate-12' : 'bg-slate-900/80 border-white/10 text-white hover:bg-slate-800'}`}
                    title={isPanMode ? "Exit Pan Mode" : "Enable Pan Mode"}
                >
                    <Hand className="w-5 h-5" />
                </button>
                {isEditorMode && (
                    <button
                        onClick={() => setIsMoveMode(!isMoveMode)}
                        className={`w-12 h-12 backdrop-blur-xl border rounded-xl flex items-center justify-center transition-all shadow-2xl active:scale-90
                            ${isMoveMode ? 'bg-emerald-600 border-white text-white' : 'bg-slate-900/80 border-white/10 text-white hover:bg-slate-800'}`}
                        title={isMoveMode ? "Lock Pins" : "Move Pins"}
                    >
                        <Move className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={resetView}
                    className="w-12 h-12 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 transition-all shadow-2xl group/reset active:scale-90"
                    title="Reset View"
                >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                </button>
            </div>
        </div>
    );
}
