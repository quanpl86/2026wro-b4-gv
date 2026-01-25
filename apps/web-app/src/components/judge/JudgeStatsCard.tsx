'use client';

interface JudgeStatsCardProps {
    title: string;
    value: string | number;
    icon: string;
    status?: 'normal' | 'warning' | 'critical' | 'success';
    subtext?: string;
}

export default function JudgeStatsCard({ title, value, icon, status = 'normal', subtext }: JudgeStatsCardProps) {
    const statusColors = {
        normal: 'bg-slate-800/50 border-slate-700 text-white',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        critical: 'bg-red-500/10 border-red-500/30 text-red-500',
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    };

    return (
        <div className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between h-[120px] transition-all hover:scale-[1.02] ${statusColors[status]}`}>
            <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{title}</span>
                <span className="text-xl">{icon}</span>
            </div>

            <div className="mt-2">
                <div className="text-3xl font-black italic tracking-tighter">{value}</div>
                {subtext && <div className="text-[10px] opacity-70 mt-1 font-mono">{subtext}</div>}
            </div>
        </div>
    );
}
