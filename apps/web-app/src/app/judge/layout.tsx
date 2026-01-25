'use client';

import { useEffect, useState } from 'react';

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
    const [isLandscape, setIsLandscape] = useState(true);

    useEffect(() => {
        const checkOrientation = () => {
            if (window.innerWidth < 768) {
                // Mobile/Tablet simplistic check
                setIsLandscape(window.innerWidth > window.innerHeight);
            } else {
                // Desktop is always considered "landscape" enough or we use media query
                setIsLandscape(true);
            }

            // Precise media query check
            const mq = window.matchMedia('(orientation: landscape)');
            setIsLandscape(mq.matches);
        };

        const mq = window.matchMedia('(orientation: landscape)');
        const handleChange = (e: MediaQueryListEvent) => setIsLandscape(e.matches);

        // Initial check
        setIsLandscape(mq.matches);

        mq.addEventListener('change', handleChange);
        return () => mq.removeEventListener('change', handleChange);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden">
            {/* Orientation Lock Overlay */}
            {!isLandscape && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <span className="text-4xl text-purple-400">🔄</span>
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter mb-2">LANDSCAPE REQUIRED</h2>
                    <p className="text-slate-400 text-sm max-w-[250px]">
                        Giao diện Giám khảo được tối ưu cho iPad ngang. Vui lòng xoay thiết bị.
                    </p>
                </div>
            )}

            {/* Background Ambient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col">
                {children}
            </div>
        </div>
    );
}
