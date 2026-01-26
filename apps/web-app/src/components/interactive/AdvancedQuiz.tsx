'use client';

import { motion, Reorder } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

// --- TYPES ---
export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'true_false' | 'matching' | 'sequencing';
    question: string;
    options?: string[]; // For MCQ / TF
    correct_answer?: string; // For MCQ / TF
    items?: string[]; // For Sequencing
    correct_order?: string[]; // For Sequencing
    pairs?: { left: string; right: string }[]; // For Matching
    explanation: string;
    points: number;
}

// --- SUB-COMPONENTS ---

function MultipleChoice({ data, onAnswer }: { data: QuizQuestion, onAnswer: (isCorrect: boolean) => void }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {data.options?.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => onAnswer(opt === data.correct_answer)}
                    className="p-6 bg-white/5 border-2 border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-400 transition-all text-left group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-sm font-bold group-hover:border-blue-400 group-hover:bg-blue-500/20">
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-lg font-medium">{opt}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}

function TrueFalse({ data, onAnswer }: { data: QuizQuestion, onAnswer: (isCorrect: boolean) => void }) {
    return (
        <div className="grid grid-cols-2 gap-8 h-64">
            <button
                onClick={() => onAnswer(data.correct_answer === 'Đúng')}
                className="bg-emerald-500/20 border-2 border-emerald-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-emerald-500/30 transition-all"
            >
                <div className="text-6xl">✅</div>
                <div className="text-3xl font-black uppercase text-emerald-400">ĐÚNG</div>
            </button>
            <button
                onClick={() => onAnswer(data.correct_answer === 'Sai')}
                className="bg-rose-500/20 border-2 border-rose-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-rose-500/30 transition-all"
            >
                <div className="text-6xl">❌</div>
                <div className="text-3xl font-black uppercase text-rose-400">SAI</div>
            </button>
        </div>
    );
}

function Sequencing({ data, onAnswer }: { data: QuizQuestion, onAnswer: (isCorrect: boolean) => void }) {
    const [items, setItems] = useState(data.items || []);

    const checkOrder = () => {
        const isCorrect = JSON.stringify(items) === JSON.stringify(data.correct_order);
        onAnswer(isCorrect);
    };

    return (
        <div>
            <div className="mb-6 text-sm text-slate-400 italic text-center">
                Kéo thả các thẻ để sắp xếp theo đúng thứ tự
            </div>
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
                {items.map((item) => (
                    <Reorder.Item key={item} value={item}>
                        <div className="p-4 bg-slate-800 rounded-xl border border-white/10 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-lg">
                            <span className="text-2xl opacity-50">☰</span>
                            <span className="text-lg font-bold">{item}</span>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <button
                onClick={checkOrder}
                className="w-full mt-8 py-4 bg-blue-600 rounded-xl font-bold uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
                Kiểm tra Kết quả
            </button>
        </div>
    );
}

function Matching({ data, onAnswer }: { data: QuizQuestion, onAnswer: (isCorrect: boolean) => void }) {
    // Simplified Matching for MVP: Click Left -> Click Right
    const [leftSelected, setLeftSelected] = useState<string | null>(null);
    const [matches, setMatches] = useState<Record<string, string>>({});

    // Shuffle pairs for display
    const leftItems = data.pairs?.map(p => p.left) || [];
    const rightItems = data.pairs?.map(p => p.right).sort() || []; // Sort right to hide direct mapping

    const handleSelect = (side: 'left' | 'right', val: string) => {
        if (side === 'left') {
            setLeftSelected(val);
        } else {
            if (leftSelected) {
                setMatches(prev => ({ ...prev, [leftSelected]: val }));
                setLeftSelected(null);
            }
        }
    };

    const checkMatches = () => {
        let correctCount = 0;
        data.pairs?.forEach(p => {
            if (matches[p.left] === p.right) correctCount++;
        });
        // Require 100% correct
        onAnswer(correctCount === (data.pairs?.length || 0));
    };

    return (
        <div>
            <div className="mb-6 text-sm text-slate-400 italic text-center">
                Chọn mốc bên trái, sau đó chọn sự kiện bên phải để nối
            </div>
            <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                    {leftItems.map(item => (
                        <button
                            key={item}
                            onClick={() => !matches[item] && handleSelect('left', item)}
                            disabled={!!matches[item]}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${matches[item] ? 'border-emerald-500 bg-emerald-500/10 opacity-50' :
                                    leftSelected === item ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    {rightItems.map(item => {
                        const matchedKey = Object.keys(matches).find(k => matches[k] === item);
                        return (
                            <button
                                key={item}
                                onClick={() => handleSelect('right', item)}
                                disabled={!!matchedKey}
                                className={`w-full p-4 rounded-xl border-2 text-right transition-all ${matchedKey ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>
            </div>
            <button
                onClick={checkMatches}
                disabled={Object.keys(matches).length < leftItems.length}
                className="w-full mt-8 py-4 bg-purple-600 rounded-xl font-bold uppercase hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Xác nhận
            </button>
        </div>
    );
}

// --- MAIN WRAPPER ---
interface AdvancedQuizProps {
    stationId: string;
    questions: QuizQuestion[];
    onClose: () => void;
    onScoreUpdate: (points: number) => void;
}

export default function AdvancedQuiz({ stationId, questions, onClose, onScoreUpdate }: AdvancedQuizProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [phase, setPhase] = useState<'question' | 'feedback'>('question');
    const [isCorrect, setIsCorrect] = useState(false);
    const currentQ = questions[currentIdx];

    const playSound = (type: 'correct' | 'wrong') => {
        const audio = new Audio(type === 'correct' ? '/assets/quiz/audio/correct.mp3' : '/assets/quiz/audio/wrong.mp3');
        audio.play().catch(() => { });
    };

    const handleAnswer = (correct: boolean) => {
        setIsCorrect(correct);
        setPhase('feedback');
        playSound(correct ? 'correct' : 'wrong');
        if (correct) {
            onScoreUpdate(currentQ.points);
        }
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setPhase('question');
        } else {
            onClose(); // End of Quiz
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* HEADER */}
                <div className="h-2 bg-slate-800 w-full relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                </div>

                <div className="p-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-purple-400 font-black uppercase tracking-[0.2em] text-sm">
                            Question {currentIdx + 1} / {questions.length}
                        </span>
                        <div className="px-4 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/20">
                            +{currentQ.points} Points
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-12 leading-relaxed">
                        {currentQ.question}
                    </h2>

                    {/* DYNAMIC QUESTION TYPE */}
                    <div className="flex-1">
                        {phase === 'question' ? (
                            <>
                                {currentQ.type === 'multiple_choice' && <MultipleChoice data={currentQ} onAnswer={handleAnswer} />}
                                {currentQ.type === 'true_false' && <TrueFalse data={currentQ} onAnswer={handleAnswer} />}
                                {currentQ.type === 'sequencing' && <Sequencing data={currentQ} onAnswer={handleAnswer} />}
                                {currentQ.type === 'matching' && <Matching data={currentQ} onAnswer={handleAnswer} />}
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-center p-8 rounded-3xl border-2 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-rose-500/10 border-rose-500/50'}`}
                            >
                                <div className="text-6xl mb-4">{isCorrect ? '🎉' : '🤔'}</div>
                                <h3 className={`text-2xl font-black uppercase mb-2 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isCorrect ? 'Chính xác!' : 'Tiếc quá!'}
                                </h3>
                                <p className="text-slate-300 text-lg mb-8">{currentQ.explanation}</p>
                                <button
                                    onClick={nextQuestion}
                                    className="px-8 py-3 bg-white text-black font-bold uppercase rounded-xl hover:scale-105 transition-transform"
                                >
                                    {currentIdx < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
