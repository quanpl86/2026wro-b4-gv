'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface JudgePinModalProps {
    onSuccess: (role: 'admin' | 'judge') => void;
}

export default function JudgePinModal({ onSuccess }: JudgePinModalProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const PINS = {
        '2018': 'admin' as const,
        '2026': 'judge' as const
    };

    const handleInput = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            if (newPin.length === 4) {
                const role = (PINS as any)[newPin];
                if (role) {
                    onSuccess(role);
                } else {
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 500);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 sm:p-6 overflow-hidden">
            <div className={`p-4 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-slate-900 border border-white/10 shadow-2xl flex flex-row items-center gap-4 sm:gap-12 transition-all duration-300 ${error ? 'shake-animation border-red-500/50' : ''}`}>

                {/* Left Section: Branding & Display */}
                <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-6">
                    <div className="flex flex-col items-center sm:items-start gap-1 sm:gap-2">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-lg ring-4 ring-white/5">
                            <Shield className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h2 className="text-sm sm:text-2xl font-black italic tracking-tighter uppercase mt-1 sm:mt-4 text-center sm:text-left">Judge Entry</h2>
                        <p className="hidden sm:block text-slate-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-60">Authorization Required</p>
                    </div>

                    {/* PIN Display */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-10 h-12 sm:w-12 sm:h-16 rounded-lg sm:rounded-2xl border-2 flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-200 ${pin.length > i
                                        ? 'border-purple-500 bg-purple-500/10 text-white scale-105 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                        : 'border-white/10 bg-white/5 text-slate-700'
                                        }`}
                                >
                                    {pin[i] ? '•' : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vertical Divider (Hidden on mobile) */}
                <div className="hidden sm:block w-px h-64 bg-white/5" />

                {/* Right Section: Keypad */}
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'C'].map((digit, i) => (
                            <button
                                key={i}
                                disabled={!digit && digit !== '0'}
                                onClick={() => {
                                    if (digit === 'C') setPin('');
                                    else if (digit) handleInput(digit);
                                }}
                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-xl font-black transition-all ${!digit
                                    ? 'opacity-0'
                                    : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-purple-500/20 active:border-purple-500/50'
                                    }`}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>
                </div>

                <style jsx>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-8px); }
                        75% { transform: translateX(8px); }
                    }
                    .shake-animation {
                        animation: shake 0.2s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}
