'use client';

import { useState, useEffect } from 'react';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
            <div className={`p-10 rounded-[40px] bg-slate-900 border border-white/10 shadow-2xl flex flex-col items-center gap-8 transition-all duration-300 ${error ? 'shake-animation border-red-500/50' : ''}`}>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-4 ring-white/5">
                        🛡️
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase mt-4">Judge Entry</h2>
                    <p className="text-slate-400 text-xs font-bold tracking-widest uppercase opacity-60">Authorization Required</p>
                </div>

                {/* PIN Display */}
                <div className="flex gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all duration-200 ${pin.length > i
                                ? 'border-purple-500 bg-purple-500/10 text-white scale-105 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                : 'border-white/10 bg-white/5 text-slate-700'
                                }`}
                        >
                            {pin[i] ? '•' : ''}
                        </div>
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'C'].map((digit, i) => (
                        <button
                            key={i}
                            disabled={!digit && digit !== '0'}
                            onClick={() => {
                                if (digit === 'C') setPin('');
                                else if (digit) handleInput(digit);
                            }}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${!digit
                                ? 'opacity-0'
                                : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-purple-500/20 active:border-purple-500/50'
                                }`}
                        >
                            {digit}
                        </button>
                    ))}
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
