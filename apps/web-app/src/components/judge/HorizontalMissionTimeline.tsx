'use client';

import { motion } from 'framer-motion';

interface Step {
    id: string;
    label: string;
    status: 'pending' | 'current' | 'completed';
}

interface HorizontalMissionTimelineProps {
    steps: Step[];
}

export default function HorizontalMissionTimeline({ steps }: HorizontalMissionTimelineProps) {
    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-md border-t border-white/10 p-4 relative z-30">
            <div className="max-w-6xl mx-auto flex items-center justify-between relative">

                {/* Connecting Line - Background */}
                <div className="absolute top-[14px] left-0 right-0 h-1 bg-slate-800 rounded-full z-0" />

                {/* Connecting Line - Progress */}
                <div className="absolute top-[14px] left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full z-0 transition-all duration-1000"
                    style={{
                        width: `${(steps.filter(s => s.status === 'completed').length / (steps.length - 1)) * 100}%`
                    }}
                />

                {steps.map((step, idx) => {
                    const isCompleted = step.status === 'completed';
                    const isCurrent = step.status === 'current';

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center group">
                            {/* Connector Dot */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    boxShadow: isCurrent ? "0 0 20px rgba(249, 115, 22, 0.6)" : "none"
                                }}
                                className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-colors duration-300
                                    ${isCompleted ? 'bg-slate-900 border-blue-500' :
                                        isCurrent ? 'bg-orange-500 border-orange-200' :
                                            'bg-slate-900 border-slate-700'}
                                `}
                            >
                                {isCompleted && (
                                    <span className="text-blue-400 text-xs">✓</span>
                                )}
                                {isCurrent && (
                                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                )}
                            </motion.div>

                            {/* Label */}
                            <div className={`mt-3 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors text-center max-w-[120px]
                                ${isCompleted ? 'text-blue-400' :
                                    isCurrent ? 'text-orange-400' :
                                        'text-slate-600'}
                            `}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
