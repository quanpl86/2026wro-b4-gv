import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Emotion = 'neutral' | 'happy' | 'sleepy' | 'curious' | 'blink_left' | 'blink_right' | 'talking' | 'love' | 'angry' | 'think' | 'sad' | 'shy' | 'celebrate';

interface RobotFaceProps {
    emotion?: Emotion;
}

const RobotFace: React.FC<RobotFaceProps> = ({ emotion = 'neutral' }) => {
    const [blink, setBlink] = useState(false);
    const [mouthOpen, setMouthOpen] = useState(false);

    // Pupil Position (Range: -10 to 10 pixels usually)
    const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

    // Auto-blink logic
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, 3000 + Math.random() * 2000);
        return () => clearInterval(blinkInterval);
    }, []);

    // Talking Animation
    useEffect(() => {
        if (emotion === 'talking') {
            const talkInterval = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 150);
            return () => clearInterval(talkInterval);
        } else {
            setMouthOpen(false);
        }
    }, [emotion]);

    // EYE MOVEMENT LOGIC (Saccades)
    useEffect(() => {
        if (emotion === 'neutral' || emotion === 'talking' || emotion === 'curious' || emotion === 'shy') {
            const lookInterval = setInterval(() => {
                // SHY: Random nervous jitter
                if (emotion === 'shy') {
                    setPupilPos({
                        x: (Math.random() - 0.5) * 30, // Random +/- 15px
                        y: 15 + Math.random() * 10    // Random jitter around bottom pos
                    });
                    return;
                }

                // Random gaze
                const x = (Math.random() - 0.5) * 30; // +/- 15px
                const y = (Math.random() - 0.5) * 10; // +/- 5px
                setPupilPos({ x, y });

                // Reset to center sometimes
                if (Math.random() > 0.6) setTimeout(() => setPupilPos({ x: 0, y: 0 }), 1000);

            }, emotion === 'shy' ? 600 : 2000 + Math.random() * 1000);
            return () => clearInterval(lookInterval);
        } else if (emotion === 'think') {
            setPupilPos({ x: 15, y: -15 }); // Look up right
        } else if (emotion === 'sad') {
            setPupilPos({ x: 0, y: 15 }); // Look down
        } else {
            setPupilPos({ x: 0, y: 0 }); // Reset
        }
    }, [emotion]);

    // --- RENDERERS ---

    const renderEye = (side: 'left' | 'right') => {
        // Base Colors
        // Base Colors
        const colorClass = emotion === 'angry' ? 'bg-red-500 shadow-red-500'
            : emotion === 'love' ? 'bg-pink-400 shadow-pink-400'
                : emotion === 'celebrate' ? 'bg-yellow-400 shadow-yellow-400'
                    : 'bg-cyan-400 shadow-cyan-400';

        // White Blurred Pupil as requested (Sharper now)
        const pupilColor = emotion === 'angry' ? 'bg-red-100/90 blur-[0.5px]'
            : emotion === 'celebrate' ? 'bg-yellow-100/90 blur-[1px]'
                : 'bg-white/90 blur-[0.5px]';

        // Blink Check
        const isBlinking = blink || emotion === 'sleepy' ||
            (emotion === 'blink_left' && side === 'left') ||
            (emotion === 'blink_right' && side === 'right');

        if (isBlinking) {
            return (
                <div className={`w-40 h-4 ${colorClass.split(' ')[0]} rounded-full mt-20 shadow-[0_0_20px_currentColor] opacity-80`} />
            );
        }

        // Shapes based on Emotion

        // CELEBRATE: Star Eyes
        if (emotion === 'celebrate') {
            return (
                <div className="relative mt-10 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.9)]"
                    >
                        <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    </motion.div>
                </div>
            );
        }

        // HAPPY: Semi-circle (Flat Bottom) - NO PUPIL
        if (emotion === 'happy') {
            return (
                <div className={`w-40 h-32 ${colorClass} rounded-t-full rounded-b-[10px] mt-10 shadow-[0_0_50px_currentColor] animate-bounce`} />
            );
        }

        // LOVE: Hearts - NO PUPIL
        if (emotion === 'love') {
            return (
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.9, 1, 0.9]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="text-pink-400 drop-shadow-[0_0_30px_rgba(244,114,182,0.8)] mt-10"
                >
                    <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </motion.div>
            );
        }

        // ANGRY: Angled Domes with Pupil
        if (emotion === 'angry') {
            return (
                <div className="relative mt-10 flex items-center justify-center overflow-hidden">
                    <div className={`w-40 h-32 ${colorClass} rounded-t-full rounded-b-[20px] shadow-[0_0_60px_currentColor] flex items-center justify-center`}>
                        {/* Pupil */}
                        <div className={`${pupilColor} w-6 h-6 rounded-full absolute transition-all duration-300`}
                            style={{ transform: `translate(${pupilPos.x * 0.5}px, ${pupilPos.y * 0.5 + 20}px)` }} />
                    </div>
                    {/* Eyebrow Cut */}
                    <div className={`absolute -top-10 w-48 h-24 bg-[#0f172a] transition-transform duration-300 ${side === 'left' ? 'rotate-12 -left-4' : '-rotate-12 -right-4'}`} />
                </div>
            );
        }

        // NEUTRAL/CURIOUS/THINK: Rounder shapes with Pupil
        return (
            <div className={`relative transition-all duration-300 flex items-center justify-center`}>
                <div className={`relative w-40 h-36 ${colorClass} rounded-[40px] shadow-[0_0_60px_currentColor] flex items-center justify-center overflow-hidden`}>
                    {/* Pupil (Dark Circle) - Reduced Blur & Size */}
                    <div className={`${pupilColor} w-10 h-10 rounded-full transition-all duration-500 ease-out opacity-90 blur-[0.5px] relative overflow-hidden`}
                        style={{
                            transform: `translate(${pupilPos.x + (emotion === 'sad' ? (side === 'left' ? 8 : -8) : 0)}px, ${pupilPos.y}px)`
                        }}
                    >
                        {/* SAD: Teary Effect (Glistening) */}
                        {emotion === 'sad' && (
                            <>
                                <div className="absolute bottom-1 left-2 w-3 h-3 bg-white blur-[1px] rounded-full animate-pulse" />
                                <div className="absolute bottom-2 right-2 w-2 h-2 bg-blue-200 blur-[0.5px] rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                                <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-t from-blue-300/40 to-transparent" />
                            </>
                        )}
                    </div>

                    {/* Reflection Highlight (Static relative to eye) */}
                    <div className="absolute top-6 right-6 w-8 h-4 bg-white/40 rounded-full blur-[2px]" />
                </div>

                {/* SHY: Blush Effect (Pink lines below eye) */}
                {emotion === 'shy' && (
                    <div className="absolute -bottom-12 flex gap-3 w-full justify-center opacity-70">
                        <div className="w-12 h-2.5 bg-pink-400/60 rounded-full blur-[4px] rotate-[-8deg] shadow-[0_0_10px_rgba(244,114,182,0.3)]" />
                        <div className="w-12 h-2.5 bg-pink-400/60 rounded-full blur-[4px] rotate-[8deg] shadow-[0_0_10px_rgba(244,114,182,0.3)]" />
                    </div>
                )}

                {/* THINK: 3 Dots Animation (Right Eye Top - Outside Container) */}
                {emotion === 'think' && side === 'right' && (
                    <div className="absolute -top-8 -right-4 flex gap-1 z-20">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-5 h-5 rounded-full bg-white animate-bounce shadow-[0_0_15px_white]"
                                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderMouth = () => {
        // Base Colors
        const colorClass = emotion === 'angry' ? 'bg-red-500 shadow-red-500'
            : emotion === 'love' ? 'bg-pink-400 shadow-pink-400'
                : emotion === 'celebrate' ? 'bg-yellow-400 shadow-yellow-400'
                    : 'bg-cyan-400 shadow-cyan-400';

        // CELEBRATE: Curved Line Smile (SVG Inverse of Sad)
        if (emotion === 'celebrate') {
            return (
                <div className="mt-2 opacity-90 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] transition-all">
                    <svg width="100" height="40" viewBox="0 0 100 40">
                        <path
                            d="M 10 10 Q 50 40 90 10"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="text-yellow-400"
                        />
                    </svg>
                </div>
            );
        }

        // HAPPY/LOVE: Filled Bowl (Smile)
        if (emotion === 'happy' || emotion === 'love') {
            return (
                <div className="mt-2 transition-all">
                    <div className={`w-28 h-14 ${colorClass} rounded-b-full shadow-[0_5px_30px_currentColor]`} />
                </div>
            );
        }

        // TALKING: Oval opening
        if (emotion === 'talking') {
            return (
                <div
                    className={`${colorClass} rounded-full shadow-[0_0_30px_currentColor] transition-all`}
                    style={{ width: mouthOpen ? '60px' : '80px', height: mouthOpen ? '40px' : '10px' }}
                />
            );
        }

        // CURIOUS: Circle "O"
        if (emotion === 'curious') {
            return <div className={`w-16 h-16 border-[12px] ${emotion === 'curious' ? 'border-cyan-400' : ''} rounded-full shadow-[0_0_30px_rgba(34,211,238,0.6)] bg-transparent`} />;
        }

        // ANGRY: Frown
        if (emotion === 'angry') {
            return <div className={`w-28 h-6 ${colorClass} rounded-full mt-4`} />;
        }

        // SAD: Curved Line Frown (SVG)
        if (emotion === 'sad') {
            return (
                <div className="mt-2 opacity-80 decoration-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all">
                    <svg width="120" height="40" viewBox="0 0 100 40">
                        <path
                            d="M 10 35 Q 50 5 90 35"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="text-cyan-400"
                        />
                    </svg>
                </div>
            );
        }

        // NEUTRAL: Small Line
        return <div className={`w-20 h-4 ${colorClass} rounded-full opacity-60 shadow-[0_0_20px_currentColor]`} />;
    };

    return (
        // BACKGROUND: Radial Gradient Blue-Black
        <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-[#050b14] to-black overflow-hidden relative">

            {/* Falling Tears Overlay (Sad Emotion) */}
            {emotion === 'sad' && (
                <div className="absolute inset-0 pointer-events-none z-30">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: '35%', x: i % 2 === 0 ? '42%' : '58%', opacity: 0 }}
                            animate={{
                                y: ['35%', '60%'],
                                opacity: [0, 1, 0],
                                scale: [0.5, 1, 0.5]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2,
                                delay: i * 0.5,
                                ease: "easeIn"
                            }}
                            className="absolute w-2 h-4 bg-cyan-300/40 rounded-full blur-[2px]"
                        />
                    ))}
                </div>
            )}

            {/* Eyes */}
            <div className="flex gap-16">
                {renderEye('left')}
                {renderEye('right')}
            </div>

            {/* Mouth (Positioned closer to eyes) */}
            <div className="mt-4">
                {renderMouth()}
            </div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-blue-900/10 pointer-events-none" />
        </div>
    );
};

export default RobotFace;
