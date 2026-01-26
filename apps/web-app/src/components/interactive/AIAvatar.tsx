'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MascotEmotion = 'neutral' | 'happy' | 'thinking' | 'excited' | 'talking';

interface AIAvatarProps {
    emotion?: MascotEmotion;
    isTalking?: boolean;
}

export default function AIAvatar({ emotion = 'neutral', isTalking = false }: AIAvatarProps) {
    const [currentPose, setCurrentPose] = useState<number>(0);

    // Mapping emotions to sprite grid indices (2x2 grid)
    // 0: Neutral (Top-Left)
    // 1: Talking (Top-Right)
    // 2: Thinking (Bottom-Left)
    // 3: Excited/Happy (Bottom-Right)

    useEffect(() => {
        if (isTalking) {
            setCurrentPose(1); // Talking pose
        } else {
            switch (emotion) {
                case 'thinking': setCurrentPose(2); break;
                case 'happy':
                case 'excited': setCurrentPose(3); break;
                default: setCurrentPose(0); break;
            }
        }
    }, [emotion, isTalking]);

    const getPosition = (index: number) => {
        const x = (index % 2) * 100;
        const y = Math.floor(index / 2) * 100;
        return `${x}% ${y}%`;
    };

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Glow Effect */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 bg-purple-500/20 blur-[40px] rounded-full"
            />

            {/* Mascot Sprite */}
            <motion.div
                key={currentPose}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-full relative z-10"
                style={{
                    backgroundImage: `url('/assets/mascot/codekitten.png')`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: getPosition(currentPose),
                    imageRendering: 'crisp-edges'
                }}
            />

            {/* Speaking Indicator */}
            <AnimatePresence>
                {isTalking && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-4 -right-4 bg-purple-600 text-white p-2 rounded-xl shadow-lg border border-white/20"
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
