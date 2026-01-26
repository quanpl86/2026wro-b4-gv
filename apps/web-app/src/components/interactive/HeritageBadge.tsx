'use client';

import { motion } from 'framer-motion';

export type BadgeTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'locked';

interface HeritageBadgeProps {
    image: string;
    siteName: string;
    tier: BadgeTier;
    isLocked?: boolean;
    size?: number; // px
    showLabel?: boolean;
}

const TIER_STYLES: Record<BadgeTier, string> = {
    platinum: 'border-slate-300 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-100 shadow-[0_0_20px_rgba(226,232,240,0.6)]',
    gold: 'border-yellow-400 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600 shadow-[0_0_20px_rgba(250,204,21,0.6)]',
    silver: 'border-slate-400 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 shadow-[0_0_20px_rgba(148,163,184,0.6)]',
    bronze: 'border-orange-700 bg-gradient-to-br from-orange-200 via-orange-600 to-orange-800 shadow-[0_0_20px_rgba(194,65,12,0.6)]',
    locked: 'border-white/10 bg-slate-800 grayscale opacity-50'
};

const TIER_LABELS: Record<BadgeTier, string> = {
    platinum: 'DIAMOND MASTER',
    gold: 'GOLD EXPLORER',
    silver: 'SILVER SEEKER',
    bronze: 'ROOKIE',
    locked: 'LOCKED'
};

export default function HeritageBadge({ image, siteName, tier, isLocked = false, size = 160, showLabel = true }: HeritageBadgeProps) {
    const finalTier = isLocked ? 'locked' : tier;

    return (
        <motion.div
            className="flex flex-col items-center gap-4 group"
            whileHover={{ scale: 1.05, rotateZ: 2 }}
        >
            {/* 3D BADGE CONTAINER */}
            <div
                className={`relative rounded-full border-[8px] overflow-hidden flex items-center justify-center bg-white ${TIER_STYLES[finalTier]}`}
                style={{ width: size, height: size }}
            >
                {/* 3D Reflection Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent z-20 pointer-events-none" />

                {/* Image */}
                <div className="w-[90%] h-[90%] rounded-full overflow-hidden relative z-10 border-4 border-white/50 shadow-inner">
                    {image ? (
                        <img
                            src={image}
                            alt={siteName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                            {siteName}
                        </div>
                    )}
                </div>

                {/* Metallic Shine Animation for High Tiers */}
                {(tier === 'platinum' || tier === 'gold') && !isLocked && (
                    <motion.div
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: Math.random() * 2 }}
                        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-30 pointer-events-none"
                    />
                )}
            </div>

            {showLabel && (
                <div className="text-center">
                    <div className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isLocked ? 'border-white/10 text-slate-500' : 'bg-slate-900 border-white/20 text-white'}`}>
                        {TIER_LABELS[finalTier]}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
