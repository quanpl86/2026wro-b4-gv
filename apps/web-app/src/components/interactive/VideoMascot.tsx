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
    const [activeKey, setActiveKey] = useState<string>('idle');

    // Xác định video key cần chạy
    useEffect(() => {
        if (isTalking) {
            setActiveKey('talking');
        } else {
            switch (emotion) {
                case 'think':
                    setActiveKey('think');
                    break;
                case 'sad':
                case 'angry':
                    setActiveKey('sad');
                    break;
                case 'celebrate':
                    setActiveKey('celebrate');
                    break;
                case 'sleepy':
                case 'neutral':
                default:
                    setActiveKey('idle');
                    break;
            }
        }
    }, [emotion, isTalking]);

    return (
        <div className={`relative overflow-hidden rounded-3xl aspect-[9/16] bg-slate-900/50 shadow-2xl border border-white/10 ${className}`}>
            {/* Preload & Render All Videos */}
            {Object.entries(VIDEO_MAP).map(([key, src]) => (
                <video
                    key={key}
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${activeKey === key ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                />
            ))}

            {/* Hiệu ứng kính bóng/phản chiếu phía trên (Glass Overlay) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-50 z-20" />

            {/* Hiệu ứng viền phát sáng nhẹ */}
            <div className="absolute inset-0 rounded-3xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] z-20" />
        </div>
    );
}
