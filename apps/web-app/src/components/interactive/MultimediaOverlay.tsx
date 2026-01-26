'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface InfographicData {
    [key: string]: string;
}

interface MediaData {
    hero_video?: string;
    cover_image: string;
    gallery: string[];
    infographic: InfographicData;
}

interface MultimediaOverlayProps {
    siteId: string;
    siteName: string;
    description: string;
    media: MediaData;
    onClose: () => void;
    onQuizStart: () => void;
}

export default function MultimediaOverlay({
    siteId,
    siteName,
    description,
    media,
    onClose,
    onQuizStart
}: MultimediaOverlayProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'gallery'>('info');
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-5xl h-[80vh] bg-slate-900 rounded-[40px] border border-white/10 overflow-hidden flex shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                >
                    ✕
                </button>

                {/* LEFT: VISUAL HERO */}
                <div className="w-1/2 relative bg-black h-full">
                    {activeTab === 'info' ? (
                        media.hero_video ? (
                            <video
                                src={media.hero_video}
                                autoPlay
                                loop
                                muted
                                className="w-full h-full object-cover opacity-80"
                            />
                        ) : (
                            <img
                                src={media.cover_image}
                                alt={siteName}
                                className="w-full h-full object-cover opacity-80"
                            />
                        )
                    ) : (
                        <div className="relative w-full h-full group">
                            <img
                                key={currentImageIdx}
                                src={media.gallery[currentImageIdx]}
                                alt="Gallery"
                                className="w-full h-full object-cover animate-in fade-in duration-500"
                            />
                            {/* Navigation */}
                            <button
                                onClick={() => setCurrentImageIdx((prev) => (prev - 1 + media.gallery.length) % media.gallery.length)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => setCurrentImageIdx((prev) => (prev + 1) % media.gallery.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                →
                            </button>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {media.gallery.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white w-6' : 'bg-white/30'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2 leading-none">
                            {siteName}
                        </h2>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white text-black' : 'bg-black/50 text-white border border-white/20'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-white text-black' : 'bg-black/50 text-white border border-white/20'}`}
                            >
                                Gallery ({media.gallery.length})
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: CONTENT & INFOGRAPHIC */}
                <div className="w-1/2 p-10 flex flex-col h-full bg-slate-900/50 backdrop-blur-md">
                    <div className="flex-1 overflow-y-auto mb-8 custom-scrollbar pr-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-4">Heritage Insights</h3>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8 font-light">
                            {description}
                        </p>

                        {/* INFOGRAPHIC GRID */}
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(media.infographic).map(([key, value]) => (
                                <div key={key} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{key}</div>
                                    <div className="text-xl font-bold text-white">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="mt-auto pt-8 border-t border-white/5">
                        <button
                            onClick={onQuizStart}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-black uppercase tracking-[0.2em] text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 group"
                        >
                            <span>Start Challenge</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <p className="text-center text-[10px] text-slate-500 mt-4">
                            Kiến thức của bạn sẽ được ghi nhận vào Bảng Xếp Hạng
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
