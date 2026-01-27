'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import AIAvatar from './AIAvatar';
import { useRobotEmotion } from '@/stores/useRobotEmotion';
import { MascotVideoEmotion } from './VideoMascot';

interface BookPage {
    type: 'cover' | 'content' | 'infographic' | 'media' | 'end';
    title?: string;
    subtitle?: string;
    heading?: string;
    text?: string;
    image?: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    data?: Record<string, string>;
    caption?: string;
    images?: string[];
    action?: string;
    voice_text?: string;
}

interface HeritageBookProps {
    siteId: string;
    pages: BookPage[];
    onClose: () => void;
    onQuizStart: () => void;
    isAutoPlay?: boolean;
}

export default function HeritageBook({ siteId, pages, onClose, onQuizStart, isAutoPlay = false }: HeritageBookProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const lastSpokenRef = useRef<string>('');
    const { currentEmotion } = useRobotEmotion();

    // Auto-advance logic
    useEffect(() => {
        if (!isAutoPlay) return;

        const handleSpeakEnd = (e: any) => {
            const endedText = e.detail?.text;
            const currentPageText = pages[currentPage]?.voice_text;

            // Important: Only advance if the text that just ended matches our current page
            if (endedText !== currentPageText) return;

            // Give 1s pause after voice ends
            setTimeout(() => {
                if (currentPage < pages.length - 1) {
                    nextPage();
                } else {
                    // It's the end page, auto-trigger quiz after finishing final speech
                    onQuizStart();
                }
            }, 1000);
        };

        window.addEventListener('ai-speak-end', handleSpeakEnd);
        return () => window.removeEventListener('ai-speak-end', handleSpeakEnd);
    }, [isAutoPlay, currentPage, pages]);

    const speakCurrentPage = () => {
        const page = pages[currentPage];
        if (page?.voice_text && page.voice_text !== lastSpokenRef.current) {
            lastSpokenRef.current = page.voice_text;
            // First stop any current speech
            window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: '', action: 'stop' } }));
            // Then speak new text
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('ai-speak', { detail: { text: page.voice_text } }));
            }, 150);
        }
    };

    // TTS Synchronization
    useEffect(() => {
        speakCurrentPage();
    }, [currentPage, pages]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextPage();
            if (e.key === 'ArrowLeft') prevPage();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage]);

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            setIsFlipped(true);
            setTimeout(() => setIsFlipped(false), 600);
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setIsFlipped(true);
            setTimeout(() => setIsFlipped(false), 600);
            setCurrentPage(prev => prev - 1);
        }
    };

    const renderPageContent = (page: BookPage) => {
        switch (page.type) {
            case 'cover':
                return (
                    <div className="flex flex-col items-center justify-center p-8 h-full bg-amber-50 text-center border-l-8 border-amber-900 shadow-inner">
                        <div className="border-4 border-double border-amber-900/20 p-8 w-full h-full flex flex-col justify-center rounded-lg">
                            <h1 className="text-4xl font-black font-serif uppercase tracking-widest text-amber-900 mb-2">{page.title}</h1>
                            <div className="w-20 h-1 bg-amber-900 mx-auto mb-4" />
                            <p className="text-amber-800/80 italic font-serif mb-8">{page.subtitle}</p>
                            {page.image && (
                                <div className="w-full h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-white mb-8 transform hover:scale-105 transition-transform duration-500">
                                    <img src={page.image} alt="Cover" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="mt-auto">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-900/50">Di San Van Hoa The Gioi</p>
                            </div>
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div className="grid grid-cols-2 h-full p-8 gap-8 bg-amber-50">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-3xl font-black font-serif text-amber-900 mb-6 border-b-2 border-amber-900/10 pb-4">{page.heading}</h2>
                            <p className="font-serif text-lg leading-loose text-amber-950/90 text-justify">{page.text}</p>
                        </div>
                        <div className="flex items-center justify-center p-4 bg-white shadow-xl rotate-2 rounded-xl border border-amber-900/10">
                            {page.media_type === 'video' ? (
                                <video src={page.media_url} autoPlay loop muted className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <img src={page.media_url} alt="Media" className="w-full h-full object-cover rounded-lg" />
                            )}
                        </div>
                    </div>
                );
            case 'infographic':
                return (
                    <div className="h-full p-12 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <h2 className="relative z-10 text-3xl font-black uppercase tracking-[0.2em] mb-12 text-center text-amber-400">Key Facts</h2>
                        <div className="grid grid-cols-1 gap-6 relative z-10">
                            {page.data && Object.entries(page.data).map(([key, value], idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.2 }}
                                    key={key}
                                    className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10"
                                >
                                    <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">{key}</span>
                                    <span className="text-2xl font-black text-white">{value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            case 'media':
                return (
                    <div className="h-full bg-black relative flex items-center justify-center p-4">
                        <div className="w-full h-full grid grid-cols-2 gap-4">
                            {page.images?.map((img, idx) => (
                                <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 group">
                                    <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-6 left-0 w-full text-center bg-gradient-to-t from-black to-transparent pt-12 pb-2">
                            <p className="text-white/80 font-serif italic text-lg">{page.caption}</p>
                        </div>
                    </div>
                );
            case 'end':
                return (
                    <div className="h-full flex flex-col items-center justify-center bg-amber-50 p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                        <h2 className="text-4xl font-black text-amber-900 mb-6">{page.heading}</h2>
                        <p className="text-xl text-amber-800 mb-12 max-w-md">{page.text}</p>
                        <button
                            onClick={onQuizStart}
                            className="px-12 py-6 bg-amber-900 text-amber-50 text-xl font-bold uppercase tracking-widest rounded-full shadow-2xl hover:scale-110 hover:bg-amber-800 transition-all border-4 border-amber-50 outline outline-4 outline-amber-900/20 flex items-center gap-3"
                        >
                            <Play className="w-6 h-6 fill-amber-50" />
                            Start Quiz
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-950 p-0 overflow-hidden relative">
            {/* AMBIENT BACKGROUND LAYER */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* IMMERSIVE SPACE CONTAINER - Lifted slightly to avoid Mascot overlap */}
            <div className="relative w-full h-full flex items-center justify-center perspective-3000 pb-32">
                {/* CLOSE BUTTON - Now more prominent in full screen */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-white/40 hover:text-white uppercase font-black tracking-[0.3em] text-[10px] flex items-center gap-3 transition-all z-[150] bg-white/5 px-6 py-3 rounded-full border border-white/10 hover:bg-white/10"
                >
                    <span>Exit Space</span> <X className="w-4 h-4" />
                </button>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotateX: 10 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                    className="w-[1200px] h-[750px] max-w-[95vw] max-h-[85vh] relative preserve-3d shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-tr-[40px] rounded-br-[40px] bg-amber-900 ring-1 ring-white/10"
                >
                    {/* BINDING */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-800 rounded-l-md z-20 shadow-2xl border-r border-amber-950/30" />

                    {/* PAGES */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, rotateY: -10 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: 10, transition: { duration: 0.3 } }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-y-4 right-4 left-6 bg-white shadow-xl rounded-r-2xl overflow-hidden border-l border-amber-100 origin-left"
                        >
                            {renderPageContent(pages[currentPage])}

                            {/* Page Number */}
                            <div className="absolute bottom-4 right-6 text-amber-900/30 font-mono text-xs">
                                Page {currentPage + 1} / {pages.length}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* NAVIGATION ARROWS */}
                    {currentPage > 0 && (
                        <button
                            onClick={prevPage}
                            className="absolute -left-24 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-95 border border-white/5 group"
                        >
                            <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
                        </button>
                    )}
                    {currentPage < pages.length - 1 && (
                        <button
                            onClick={nextPage}
                            className="absolute -right-24 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-95 border border-white/5 group"
                        >
                            <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </motion.div>
            </div>

            {/* FLOATING MASCOT IN CORNER */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-12 right-12 z-[120] pointer-events-none"
            >
                <div className="relative group pointer-events-auto">
                    <div className="absolute inset-[-20px] bg-slate-900/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-3xl" />

                    <AIAvatar
                        emotion={currentEmotion as MascotVideoEmotion}
                        isTalking={currentEmotion === 'talking'}
                        size={160}
                    />

                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl border border-white/20 whitespace-nowrap">
                        Heritage Guide
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
