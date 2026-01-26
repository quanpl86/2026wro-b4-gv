'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface SessionScore {
    id: string;
    player_name: string;
    total_score: number;
    start_time: string;
}

export default function ScoreLeaderboard() {
    const [rankings, setRankings] = useState<SessionScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            if (!supabase) return;
            const { data } = await supabase
                .from('game_sessions')
                .select('id, player_name, total_score, start_time')
                .order('total_score', { ascending: false })
                .limit(5);

            if (data) setRankings(data);
            setLoading(false);
        };

        fetchRankings();

        // Subscribe to changes
        const subscription = supabase
            ?.channel('leaderboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions' }, fetchRankings)
            .subscribe();

        return () => { subscription?.unsubscribe(); };
    }, []);

    if (loading) return <div className="text-white/50 text-[10px] animate-pulse">Loading rankings...</div>;

    return (
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <span>🏆</span> Session Leaderboard
            </h3>
            <div className="space-y-3">
                {rankings.map((rank, index) => (
                    <motion.div
                        key={rank.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                                    index === 1 ? 'bg-slate-400 text-black' :
                                        index === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                {index + 1}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-300">{rank.player_name}</div>
                                <div className="text-[8px] text-slate-500 font-mono">{new Date(rank.start_time).toLocaleTimeString()}</div>
                            </div>
                        </div>
                        <div className="font-mono font-black text-emerald-400 text-sm">
                            {rank.total_score.toLocaleString()}
                        </div>
                    </motion.div>
                ))}

                {rankings.length === 0 && (
                    <div className="text-center text-[10px] text-slate-600 italic py-2">
                        No sessions recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
}
