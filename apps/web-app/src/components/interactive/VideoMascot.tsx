'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MascotVideoEmotion = 'neutral' | 'think' | 'sad' | 'celebrate' | 'talking' | 'sleepy' | 'angry' | 'curious';

interface VideoMascotProps {
    emotion?: MascotVideoEmotion;
    isTalking?: boolean;
    className?: string;
}

const VIDEO_MAP: Record<string, string> = {
    'talking': '/assets/videos/Kitten-Talking.mp4',
    'think': '/assets/videos/Kitten-Thinking.mp4',
    'sad': '/assets/videos/Kitten-Sad.mp4',
    'celebrate': '/assets/videos/Kitten-Celebrate.mp4',
    'idle': '/assets/videos/Kitten-Wait.mp4',
};

export default function VideoMascot({ emotion = 'neutral', isTalking = false, className = '' }: VideoMascotProps) {
    const [activeVideo, setActiveVideo] = useState<string>(VIDEO_MAP.idle);

    // Xác định video cần chạy dựa trên props
    useEffect(() => {
        if (isTalking) {
            setActiveVideo(VIDEO_MAP.talking);
        } else {
            switch (emotion) {
                case 'think':
                    setActiveVideo(VIDEO_MAP.think);
                    break;
                case 'sad':
                case 'angry':
                    setActiveVideo(VIDEO_MAP.sad);
                    break;
                case 'celebrate':
                    setActiveVideo(VIDEO_MAP.celebrate);
                    break;
                case 'sleepy':
                case 'neutral':
                default:
                    setActiveVideo(VIDEO_MAP.idle);
                    break;
            }
        }
    }, [emotion, isTalking]);

    return (
        <div className={`relative overflow-hidden rounded-3xl aspect-[9/16] bg-slate-900/50 shadow-2xl border border-white/10 ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeVideo}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={activeVideo} type="video/mp4" />
                    </video>
                </motion.div>
            </AnimatePresence>

            {/* Hiệu ứng kính bóng/phản chiếu phía trên (Glass Overlay) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-50" />

            {/* Hiệu ứng viền phát sáng nhẹ */}
            <div className="absolute inset-0 rounded-3xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
        </div>
    );
}
