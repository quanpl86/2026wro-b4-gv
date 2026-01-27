'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import VideoMascot, { MascotVideoEmotion } from './VideoMascot';

interface AIAvatarProps {
    emotion?: MascotVideoEmotion;
    isTalking?: boolean;
    size?: number;
}

export default function AIAvatar({ emotion = 'neutral', isTalking = false, size = 192 }: AIAvatarProps) {
    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: (size * 16) / 9 }}
        >
            {/* Glow Effect */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-x-0 bottom-0 top-1/2 bg-purple-500/20 blur-[40px] rounded-full"
            />

            {/* Video Mascot implementation */}
            <VideoMascot
                emotion={emotion}
                isTalking={isTalking}
                className="w-full h-full"
            />

            {/* Speaking Indicator */}
            <AnimatePresence>
                {isTalking && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-4 -right-4 bg-purple-600 text-white p-2 rounded-xl shadow-lg border border-white/20 z-20"
                    >
                        <div className="flex gap-1 items-end h-3">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.1 }}
                                    className="w-1 bg-white rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
