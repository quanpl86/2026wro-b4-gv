'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRobotEmotion } from '@/stores/useRobotEmotion';
import AIAvatar from './AIAvatar';
import { MascotVideoEmotion } from './VideoMascot';

interface QuizProps {
    stationId: string;
    onClose: () => void;
    onScoreUpdate?: (points: number) => void;
}

export default function QuizOverlay({ stationId, onClose, onScoreUpdate }: QuizProps) {
    const { currentEmotion, setEmotion } = useRobotEmotion();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!supabase) return;
            const { data } = await supabase
                .from('heritage_quizzes')
                .select('*')
                .eq('station_id', stationId)
                .maybeSingle();

            if (data) setQuiz(data);
            setLoading(false);
        };
        fetchQuiz();
    }, [stationId]);

    useEffect(() => {
        if (isSubmitted || loading) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsSubmitted(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isSubmitted, loading]);

    const handleOptionSelect = (idx: number) => {
        if (isSubmitted) return;
        setSelectedIdx(idx);
    };

    const handleSubmit = () => {
        if (selectedIdx === null || isSubmitted) return;
        setIsSubmitted(true);
        if (selectedIdx === quiz.correct_index) {
            if (onScoreUpdate) onScoreUpdate(10); // Reward 10 points
            setEmotion('celebrate');
        } else {
            setEmotion('sad');
        }
        setTimeout(() => setEmotion('neutral'), 3000);
    };

    useEffect(() => {
        if (!loading && !quiz) {
            onClose();
        }
    }, [loading, quiz, onClose]);

    if (loading || !quiz) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.3)]"
            >
                {/* Header */}
                <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-1">Knowledge Challenge</h3>
                        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase italic">Di sản & Trí tuệ</h2>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center border border-white/20">
                        <span className="text-[10px] font-black text-white/70 uppercase">Giờ</span>
                        <span className={`text-2xl font-black font-mono leading-none ${timeLeft < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {timeLeft}
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    {/* Question */}
                    <div className="mb-8">
                        <h4 className="text-xl font-bold text-white leading-relaxed">
                            {quiz.question}
                        </h4>
                    </div>

                    {/* Options */}
                    <div className="grid gap-4 mb-8">
                        {quiz.options.map((option: string, idx: number) => {
                            let statusClasses = "bg-slate-800 border-white/5 hover:border-purple-500/50";
                            if (isSubmitted) {
                                if (idx === quiz.correct_index) statusClasses = "bg-green-500/20 border-green-500 text-green-400";
                                else if (idx === selectedIdx) statusClasses = "bg-red-500/20 border-red-500 text-red-400";
                                else statusClasses = "bg-slate-800 opacity-40";
                            } else if (idx === selectedIdx) {
                                statusClasses = "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/20";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={isSubmitted}
                                    className={`p-5 rounded-2xl border text-left transition-all font-bold flex items-center justify-between group ${statusClasses}`}
                                >
                                    <span>{option}</span>
                                    {isSubmitted && idx === quiz.correct_index && (
                                        <span className="text-xl">✅</span>
                                    )}
                                    {isSubmitted && idx === selectedIdx && idx !== quiz.correct_index && (
                                        <span className="text-xl">❌</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4">
                        {!isSubmitted ? (
                            <button
                                onClick={handleSubmit}
                                disabled={selectedIdx === null}
                                className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                            >
                                Submit Answer
                            </button>
                        ) : (
                            <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 text-sm text-slate-400 italic">
                                    <span className="font-bold text-slate-300 not-italic uppercase text-[10px] block mb-1">Giải thích</span>
                                    {quiz.explanation}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-purple-500 transition-all"
                                >
                                    Tiếp tục hành trình →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* FLOATING MASCOT IN CORNER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 50, y: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                className="fixed bottom-8 right-8 z-[120] pointer-events-none"
            >
                <div className="relative group pointer-events-auto">
                    <div className="absolute inset-[-15px] bg-slate-900/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl" />
                    <AIAvatar
                        emotion={currentEmotion as MascotVideoEmotion}
                        isTalking={currentEmotion === 'talking'}
                        size={150}
                    />
                </div>
            </motion.div>
        </div>
    );
}
