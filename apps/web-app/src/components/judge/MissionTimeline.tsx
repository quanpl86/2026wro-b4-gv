'use client';

interface MissionStep {
    id: string;
    label: string;
    status: 'pending' | 'current' | 'completed';
}

export default function MissionTimeline({ steps }: { steps: MissionStep[] }) {
    return (
        <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-4 z-10">Mission Timeline</h3>

            <div className="relative z-10 flex-1 flex flex-col gap-0">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex gap-4 relative flex-1 min-h-[60px]">
                        {/* Line Connector */}
                        {index !== steps.length - 1 && (
                            <div className={`absolute left-[15px] top-[30px] w-0.5 h-[calc(100%-10px)] 
                                 ${step.status === 'completed' ? 'bg-green-500' : 'bg-slate-800'}`}
                            />
                        )}

                        {/* Dot Indicator */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-all border-2
                             ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-black' :
                                step.status === 'current' ? 'bg-blue-600 border-blue-400 text-white animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.5)]' :
                                    'bg-slate-800 border-slate-700 text-slate-500'}`}>
                            {index + 1}
                        </div>

                        {/* Text Content */}
                        <div className="pt-1.5 pb-6">
                            <div className={`text-sm font-bold uppercase tracking-tight transition-colors
                                 ${step.status === 'current' ? 'text-white scale-105 origin-left' :
                                    step.status === 'completed' ? 'text-green-400' : 'text-slate-600'}`}>
                                {step.label}
                            </div>
                            {step.status === 'current' && (
                                <div className="text-[10px] text-blue-300 mt-1 animate-in fade-in slide-in-from-left-2">
                                    Current Objective
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
