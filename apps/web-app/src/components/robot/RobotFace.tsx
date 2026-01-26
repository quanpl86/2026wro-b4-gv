import React, { useEffect, useState } from 'react';

type Emotion = 'neutral' | 'happy' | 'sleepy' | 'curious' | 'blink_left' | 'blink_right' | 'talking' | 'love' | 'angry' | 'think';

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
        if (emotion === 'neutral' || emotion === 'talking' || emotion === 'curious') {
            const lookInterval = setInterval(() => {
                // Random gaze
                const x = (Math.random() - 0.5) * 30; // +/- 15px
                const y = (Math.random() - 0.5) * 10; // +/- 5px
                setPupilPos({ x, y });

                // Reset to center sometimes
                if (Math.random() > 0.6) setTimeout(() => setPupilPos({ x: 0, y: 0 }), 1000);

            }, 2000 + Math.random() * 1000);
            return () => clearInterval(lookInterval);
        } else if (emotion === 'think') {
            setPupilPos({ x: 15, y: -15 }); // Look up right
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
                : 'bg-cyan-400 shadow-cyan-400';

        // White Blurred Pupil as requested (Clearer now)
        const pupilColor = emotion === 'angry' ? 'bg-red-100/80 blur-[1px]' : 'bg-white/70 blur-sm';

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

        // HAPPY: Semi-circle (Flat Bottom) - NO PUPIL
        if (emotion === 'happy') {
            return (
                <div className={`w-40 h-32 ${colorClass} rounded-t-full rounded-b-[10px] mt-10 shadow-[0_0_50px_currentColor] animate-bounce`} />
            );
        }

        // LOVE: Hearts - NO PUPIL
        if (emotion === 'love') {
            return (
                <div className="text-pink-400 drop-shadow-[0_0_30px_rgba(244,114,182,0.8)] mt-10 animate-pulse">
                    <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>
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
                    {/* Pupil (Dark Circle) */}
                    <div className={`${pupilColor} w-14 h-14 rounded-full transition-all duration-500 ease-out opacity-80`}
                        style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }} />

                    {/* Reflection Highlight (Static relative to eye) */}
                    <div className="absolute top-6 right-6 w-8 h-4 bg-white/40 rounded-full blur-[2px]" />
                </div>
            </div>
        );
    };

    const renderMouth = () => {
        const colorClass = emotion === 'angry' ? 'bg-red-500 shadow-red-500'
            : emotion === 'love' ? 'bg-pink-400 shadow-pink-400'
                : 'bg-cyan-400 shadow-cyan-400';

        // HAPPY/LOVE: Filled Bowl (Smile)
        if (emotion === 'happy' || emotion === 'love') {
            return <div className={`w-28 h-14 ${colorClass} rounded-b-full shadow-[0_5px_30px_currentColor]`} />;
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

        // NEUTRAL: Small Line
        return <div className={`w-20 h-4 ${colorClass} rounded-full opacity-60 shadow-[0_0_20px_currentColor]`} />;
    };

    return (
        // BACKGROUND: Radial Gradient Blue-Black
        <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-[#050b14] to-black overflow-hidden relative">

            {/* Eyes */}
            <div className="flex gap-16">
                {renderEye('left')}
                {renderEye('right')}
            </div>

            {/* Mouth (Positioned lower) */}
            <div className="mt-16">
                {renderMouth()}
            </div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-blue-900/10 pointer-events-none" />
        </div>
    );
};

export default RobotFace;
