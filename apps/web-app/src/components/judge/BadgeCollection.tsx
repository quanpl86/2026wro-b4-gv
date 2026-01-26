'use client';

import { motion } from 'framer-motion';
import HeritageBadge, { BadgeTier } from '../interactive/HeritageBadge';
import config from '../../../../../packages/shared-config/config.json';

interface BadgeCollectionProps {
    scores: Record<string, number>; // siteId -> score
    onClose: () => void;
}

export default function BadgeCollection({ scores, onClose }: BadgeCollectionProps) {
    const sites = Object.values(config.heritage_info as any);

    const getEarnedTier = (siteId: string, siteData: any): BadgeTier | 'locked' => {
        const score = scores[siteId];
        if (score === undefined) return 'locked';

        // Calculate max possible points for this site
        const maxPoints = siteData.quiz_data?.reduce((acc: number, q: any) => acc + q.points, 0) || 100;
        const ratio = score / maxPoints;

        if (ratio === 1) return 'platinum';
        if (ratio >= 0.8) return 'gold';
        if (ratio >= 0.5) return 'silver';
        return 'bronze';
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 w-full max-w-6xl max-h-[90vh] h-auto rounded-[32px] md:rounded-[40px] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* HEADER */}
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <span className="text-3xl md:text-4xl">🎒</span> Explorer's Collection
                        </h2>
                        <p className="text-slate-400 mt-1 md:mt-2 text-sm md:text-base">Thu thập Huy hiệu từ các Di sản Thế giới</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* GRID */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {sites.map((site: any) => {
                            const tier = getEarnedTier(site.id, site);
                            return (
                                <motion.div
                                    key={site.id}
                                    layoutId={`badge-${site.id}`}
                                    className="flex flex-col items-center p-4 rounded-2xl hover:bg-white/5 transition-colors"
                                >
                                    <HeritageBadge
                                        image={site.badge_image}
                                        siteName={site.name}
                                        tier={tier === 'locked' ? 'platinum' : tier}
                                        isLocked={tier === 'locked'}
                                        size={140}
                                    />
                                    <div className="mt-4 text-center">
                                        <h3 className="text-white font-bold text-base md:text-lg">{site.name}</h3>
                                        <p className="text-slate-500 text-xs md:text-sm mt-1">
                                            {tier === 'locked' ? 'Chưa sở hữu' : `Unlocked: ${new Date().toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 md:p-6 border-t border-white/5 bg-slate-800/30 text-center text-slate-500 text-xs md:text-sm">
                    Antigravity Heritage System v1.0
                </div>
            </motion.div>
        </div>
    );
}
