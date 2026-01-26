'use client';

import { motion } from 'framer-motion';

interface Step {
    id: string;
    label: string;
    status: 'pending' | 'current' | 'completed';
    icon?: string;
}

interface VerticalMissionTimelineProps {
    steps: Step[];
}

export default function VerticalMissionTimeline({ steps }: VerticalMissionTimelineProps) {
    return (
        <div className="h-full flex flex-col p-6 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 relative overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-8 shrink-0">
                Mission Progress
            </h3>

            <div className="relative flex-1">
                {/* Vertical Line Connector */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-800 rounded-full" />

                {/* Active Progress Line Overlay */}
                <motion.div
                    initial={{ height: 0 }}
                    animate={{
                        height: `${Math.max(0, (steps.filter(s => s.status === 'completed').length / (steps.length - 1)) * 100)}%`
                    }}
                    className="absolute left-6 top-8 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 rounded-full z-0 origin-top"
                />

                <div className="space-y-12 relative z-10">
                    {steps.map((step, idx) => {
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-6 group"
                            >
                                {/* Marker Container */}
                                <div className="relative shrink-0 mt-1">
                                    <motion.div
                                        animate={{
                                            scale: isCurrent ? [1, 1.2, 1] : 1,
                                            boxShadow: isCurrent ? "0 0 20px rgba(168, 85, 247, 0.4)" : "none"
                                        }}
                                        transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 
                                            ${isCompleted ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                                                isCurrent ? 'bg-purple-600 border-white shadow-lg' :
                                                    'bg-slate-900 border-slate-700'}`}
                                    >
                                        <span className={`text-xl ${isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                                            {step.icon || (isCompleted ? '✅' : isCurrent ? '📍' : '⚪')}
                                        </span>
                                    </motion.div>

                                    {isCurrent && (
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 bg-purple-500 rounded-2xl -z-10"
                                        />
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 p-4 rounded-2xl border transition-all duration-300 
                                    ${isCurrent ? 'bg-white/10 border-white/20 shadow-xl translate-x-1' :
                                        isCompleted ? 'bg-slate-800/30 border-blue-500/20' :
                                            'bg-transparent border-transparent opacity-40'}`}>
                                    <h4 className={`text-sm font-black uppercase tracking-wider 
                                        ${isCurrent ? 'text-white' : isCompleted ? 'text-blue-400' : 'text-slate-500'}`}>
                                        {step.label}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-1 font-bold">
                                        {isCompleted ? 'Nhiệm vụ hoàn tất' : isCurrent ? 'Đang thực hiện...' : 'Chờ khám phá'}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Tactile Decor */}
            <div className="mt-8 pt-6 border-t border-white/5 opacity-20 text-[10px] font-mono tracking-tighter">
                MISSION_SYNC_v2.1 // ACTIVE
            </div>
        </div>
    );
}
