'use client';

import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Circle } from 'lucide-react';
import { renderLucideIcon } from '@/utils/iconMapping';

interface Step {
    id: string;
    label: string;
    status: 'pending' | 'current' | 'completed';
    icon?: string | React.ReactNode;
}

interface VerticalMissionTimelineProps {
    steps: Step[];
}

export default function VerticalMissionTimeline({ steps }: VerticalMissionTimelineProps) {
    return (
        <div className="h-full flex flex-col items-center py-8 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 relative overflow-y-auto custom-scrollbar w-full">
            <div className="relative flex-1 flex flex-col items-center">
                {/* Vertical Line Connector */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-slate-800 rounded-full" />

                {/* Active Progress Line Overlay */}
                <motion.div
                    initial={{ height: 0 }}
                    animate={{
                        height: `${Math.max(0, (steps.filter(s => s.status === 'completed').length / (steps.length - 1)) * 100)}%`
                    }}
                    className="absolute left-1/2 -translate-x-1/2 top-4 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 rounded-full z-0 origin-top"
                />

                <div className="space-y-16 relative z-10">
                    {steps.map((step, idx) => {
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative flex items-center justify-center"
                            >
                                {/* Marker Container */}
                                <div className="relative shrink-0">
                                    <motion.div
                                        animate={{
                                            scale: isCurrent ? [1, 1.1, 1] : 1,
                                            borderColor: isCurrent ? "#fff" : isCompleted ? "#3b82f6" : "#334155",
                                            backgroundColor: isCurrent ? "rgb(147, 51, 234)" : isCompleted ? "rgba(59, 130, 246, 0.1)" : "rgb(15, 23, 42)"
                                        }}
                                        transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 
                                            ${isCompleted ? 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                                                isCurrent ? 'shadow-lg ring-4 ring-purple-500/30' :
                                                    'ring-1 ring-white/5'}`}
                                    >
                                        <span className={`${isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                                            {renderLucideIcon(step.icon, "w-6 h-6") || (
                                                isCompleted ? <CheckCircle className="w-6 h-6 text-blue-400" /> :
                                                    isCurrent ? <MapPin className="w-6 h-6 text-white" /> :
                                                        <Circle className="w-5 h-5 text-slate-500" />
                                            )}
                                        </span>
                                    </motion.div>

                                    {/* Tooltip on hover */}
                                    <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                        {step.label}
                                    </div>

                                    {isCurrent && (
                                        <motion.div
                                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 bg-purple-500 rounded-2xl -z-10"
                                        />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Tactile Decor */}
            <div className="h-10 flex items-center justify-center opacity-10">
                <div className="w-1 h-1 bg-white rounded-full mx-1" />
                <div className="w-1 h-1 bg-white rounded-full mx-1" />
                <div className="w-1 h-1 bg-white rounded-full mx-1" />
            </div>
        </div>
    );
}
