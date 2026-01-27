'use client';

import { motion, Reorder } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Check, X, CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import HeritageBadge, { BadgeTier } from './HeritageBadge';
import AIAvatar from './AIAvatar';
import { useRobotEmotion } from '@/stores/useRobotEmotion';
import { MascotVideoEmotion } from './VideoMascot';

// --- TYPES ---
export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'multiple_response' | 'true_false' | 'matching' | 'sequencing';
    question: string;
    options?: string[]; // For MC, MR, TF
    correct_answer?: string; // For MC / TF
    correct_answers?: string[]; // For MR
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

function MultipleResponse({ data, onAnswer }: { data: QuizQuestion, onAnswer: (isCorrect: boolean) => void }) {
    const [selected, setSelected] = useState<string[]>([]);

    // Check correctness against data.correct_answers array
    const submit = () => {
        // Sort both arrays to disregard order
        const correct = data.correct_answers?.slice().sort() || [];
        const user = selected.slice().sort();
        const isCorrect = JSON.stringify(correct) === JSON.stringify(user);
        onAnswer(isCorrect);
    };

    const toggle = (opt: string) => {
        if (selected.includes(opt)) {
            setSelected(selected.filter(s => s !== opt));
        } else {
            setSelected([...selected, opt]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {data.options?.map((opt, idx) => {
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={idx}
                            onClick={() => toggle(opt)}
                            className={`p-6 border-2 rounded-2xl transition-all text-left group flex items-center justify-between
                                ${isSelected ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                        >
                            <span className="text-lg font-medium">{opt}</span>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-transparent' : 'border-white/30'}`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                        </button>
                    )
                })}
            </div>

            <button
                onClick={submit}
                disabled={selected.length === 0}
                className="w-full py-4 bg-purple-600 rounded-xl font-bold uppercase hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Trả lời
            </button>
        </div>
    );
}

function TrueFalse({ data, onAnswer }: { data: QuizQuestion, onAnswer: (isCorrect: boolean) => void }) {
    return (
        <div className="grid grid-cols-2 gap-8 h-64">
            <button
                onClick={() => onAnswer(data.correct_answer === 'Đúng')}
                className="bg-emerald-500/20 border-2 border-emerald-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-emerald-500/30 transition-all group"
            >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black uppercase text-emerald-400">ĐÚNG</div>
            </button>
            <button
                onClick={() => onAnswer(data.correct_answer === 'Sai')}
                className="bg-rose-500/20 border-2 border-rose-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-rose-500/30 transition-all group"
            >
                <XCircle className="w-16 h-16 text-rose-500 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black uppercase text-rose-400">SAI</div>
            </button>
        </div>
    );
}

function Sequencing({ data, onAnswer }: { data: QuizQuestion, onAnswer: (isCorrect: boolean) => void }) {
    // Shuffle items on init if not already shuffled (simple fisher-yates for visual effect)
    // NOTE: In the editor we saved 'items' as the generic correct order. 
    // Ideally we should shuffle them here.
    const [items, setItems] = useState(() => {
        const raw = [...(data.items || [])];
        return raw.sort(() => Math.random() - 0.5);
    });

    const checkOrder = () => {
        const isCorrect = JSON.stringify(items) === JSON.stringify(data.correct_order); // compare vs stored correct order
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
                            <GripVertical className="w-5 h-5 text-slate-500" />
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
    const [matches, setMatches] = useState<{ left: string; right: string; color: string }[]>([]);
    const [dragging, setDragging] = useState<{ start: string; x: number; y: number } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Shuffle right items once
    const [rightItems] = useState(() => data.pairs?.map(p => p.right).sort(() => Math.random() - 0.5) || []);
    const leftItems = data.pairs?.map(p => p.left) || [];

    const colors = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']; // Red, Blue, Green, Amber, Purple

    const getPoint = (id: string, side: 'left' | 'right') => {
        const el = document.getElementById(`${side}-${id}`);
        if (!el || !containerRef.current) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left + (rect.width / 2),
            y: rect.top - containerRect.top + (rect.height / 2)
        };
    };

    const handleStartDrag = (item: string, e: React.MouseEvent | React.TouchEvent) => {
        // Prevent double matching left side
        if (matches.find(m => m.left === item)) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Get initial point relative to container
        if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            setDragging({ start: item, x: clientX - containerRect.left, y: clientY - containerRect.top });
            setMousePos({ x: clientX - containerRect.left, y: clientY - containerRect.top });
        }
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragging || !containerRef.current) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const containerRect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: clientX - containerRect.left, y: clientY - containerRect.top });
    };

    const handleDrop = (item: string) => {
        if (!dragging) return;
        // Don't modify if already matched
        if (matches.find(m => m.right === item)) return;

        // Assign next available color
        const color = colors[matches.length % colors.length];
        setMatches(prev => [...prev, { left: dragging.start, right: item, color }]);
        setDragging(null);
        setMousePos(null);
    };

    // Global move/up listener for drag
    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMove as any);
            window.addEventListener('mouseup', () => setDragging(null));
            window.addEventListener('touchmove', handleMove as any);
            window.addEventListener('touchend', () => setDragging(null));
        }
        return () => {
            window.removeEventListener('mousemove', handleMove as any);
            window.removeEventListener('mouseup', () => setDragging(null));
            window.removeEventListener('touchmove', handleMove as any);
            window.removeEventListener('touchend', () => setDragging(null));
        };
    }, [dragging]);

    const checkMatches = () => {
        let correctCount = 0;
        data.pairs?.forEach(p => {
            const match = matches.find(m => m.left === p.left);
            if (match && match.right === p.right) correctCount++;
        });
        onAnswer(correctCount === (data.pairs?.length || 0));
    };

    const reset = () => setMatches([]);

    return (
        <div className="relative select-none" ref={containerRef}>
            <div className="mb-6 text-sm text-slate-400 italic text-center">
                Kéo dây từ đầu nối màu TRẮNG sang đầu nối màu XÁM
            </div>

            {/* SVG OVERLAY */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {/* Existing Connections */}
                {matches.map((m, i) => {
                    const start = getPoint(m.left, 'left');
                    const end = getPoint(m.right, 'right');
                    return (
                        <line
                            key={i}
                            x1={start.x} y1={start.y}
                            x2={end.x} y2={end.y}
                            stroke={m.color}
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    );
                })}
                {/* Active Dragging Line */}
                {dragging && mousePos && (
                    <line
                        x1={getPoint(dragging.start, 'left').x}
                        y1={getPoint(dragging.start, 'left').y}
                        x2={mousePos.x}
                        y2={mousePos.y}
                        stroke="white"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        strokeOpacity="0.5"
                    />
                )}
            </svg>

            <div className="grid grid-cols-2 gap-24 relative z-20">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                    {leftItems.map(item => {
                        const isMatched = matches.find(m => m.left === item);
                        return (
                            <div key={item} className="relative flex items-center">
                                <div className="flex-1 p-4 bg-slate-800 rounded-xl border border-white/10 text-white font-medium">
                                    {item}
                                </div>
                                {/* Connector */}
                                <div
                                    id={`left-${item}`}
                                    onMouseDown={(e) => handleStartDrag(item, e)}
                                    onTouchStart={(e) => handleStartDrag(item, e)}
                                    className={`w-6 h-6 rounded-full border-4 absolute -right-3 cursor-crosshair transition-all hover:scale-125 ${isMatched ? 'bg-slate-900 border-transparent' : 'bg-white border-blue-500'}`}
                                    style={{ borderColor: isMatched?.color }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                    {rightItems.map(item => {
                        const match = matches.find(m => m.right === item);
                        return (
                            <div key={item} className="relative flex items-center">
                                {/* Target Connector */}
                                <div
                                    id={`right-${item}`}
                                    onMouseUp={() => handleDrop(item)}
                                    onTouchEnd={() => handleDrop(item)}
                                    className={`w-6 h-6 rounded-full border-4 absolute -left-3 cursor-pointer transition-all hover:scale-150 ${match ? 'bg-slate-900 border-transparent' : 'bg-slate-600 border-white'}`}
                                    style={{ borderColor: match?.color }}
                                />
                                <div className="flex-1 p-4 bg-slate-800 rounded-xl border border-white/10 text-white font-medium text-right">
                                    {item}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-8">
                <button
                    onClick={reset}
                    className="px-6 py-4 bg-white/5 rounded-xl font-bold uppercase hover:bg-white/10 transition-all border border-white/10"
                >
                    Làm lại
                </button>
                <button
                    onClick={checkMatches}
                    disabled={matches.length < leftItems.length}
                    className="flex-1 py-4 bg-purple-600 rounded-xl font-bold uppercase hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Xác nhận
                </button>
            </div>
        </div>
    );
}

// --- MAIN WRAPPER ---
interface AdvancedQuizProps {
    stationId: string;
    questions: QuizQuestion[];
    onClose: () => void;
    onScoreUpdate: (points: number) => void;
    onAnswerResult?: (isCorrect: boolean) => void;
    onComplete?: () => void;
    badgeImage?: string; // New prop for badge visual
}

export default function AdvancedQuiz({ stationId, questions, onClose, onScoreUpdate, onAnswerResult, onComplete, badgeImage }: AdvancedQuizProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [phase, setPhase] = useState<'question' | 'feedback' | 'reward'>('question');
    const { currentEmotion } = useRobotEmotion();

    const hasTriggeredReward = useRef(false);
    useEffect(() => {
        if (phase === 'reward' && !hasTriggeredReward.current && onComplete) {
            onComplete();
            hasTriggeredReward.current = true;
        }
    }, [phase, onComplete]);

    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0); // Track local score for badge calc

    if (!questions || questions.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 p-8">
                <div className="bg-slate-900 border border-white/10 p-12 rounded-[40px] text-center max-w-md">
                    <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4">Dữ liệu Quiz chưa sẵn sàng</h2>
                    <p className="text-slate-400 mb-8">Rất tiếc, hiện tại trạm di sản này chưa có câu hỏi thử thách. Bạn hãy quay lại sau nhé.</p>
                    <button onClick={onClose} className="px-8 py-3 bg-white text-black font-black uppercase rounded-xl">Đóng</button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIdx];

    const playSound = (type: 'correct' | 'wrong' | 'win') => {
        const audio = new Audio(type === 'win' ? '/assets/quiz/audio/win.mp3' : type === 'correct' ? '/assets/quiz/audio/correct.mp3' : '/assets/quiz/audio/wrong.mp3');
        audio.play().catch(() => { });
    };

    const handleAnswer = (correct: boolean) => {
        setIsCorrect(correct);
        setPhase('feedback');
        playSound(correct ? 'correct' : 'wrong');
        if (onAnswerResult) onAnswerResult(correct);
        if (correct) {
            const points = currentQ.points;
            setScore(prev => prev + points);
            onScoreUpdate(points);
        }
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setPhase('question');
        } else {
            setPhase('reward'); // Unlock Badge Phase
            playSound('win');
        }
    };

    const getBadgeTier = (): BadgeTier => {
        const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
        const ratio = score / totalPoints;
        if (ratio === 1) return 'platinum';
        if (ratio >= 0.8) return 'gold';
        if (ratio >= 0.5) return 'silver';
        return 'bronze';
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-950 p-0 overflow-hidden relative pb-32">
            {/* AMBIENT ATMOSPHERE */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-purple-900/20 to-transparent pointer-events-none" />

            <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="w-full h-full max-w-6xl max-h-[90vh] bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[60px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col relative"
            >
                {/* REWARD PHASE */}
                {phase === 'reward' ? (
                    <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center min-h-[450px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent pointer-events-none" />

                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="mb-6 mt-2 relative z-10"
                        >
                            <HeritageBadge
                                image={badgeImage || ''}
                                siteName={stationId}
                                tier={getBadgeTier()}
                                size={200}
                            />
                        </motion.div>

                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-3 tracking-widest relative z-10">
                            New Badge Unlocked!
                        </h2>
                        <p className="text-slate-400 text-base md:text-lg mb-8 max-w-md relative z-10">
                            Chúc mừng bạn đã hoàn thành thử thách và nhận được huy hiệu danh giá này.
                        </p>

                        <div className="flex gap-4 relative z-10">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-white/10"
                            >
                                Collect & Close
                            </button>
                        </div>
                    </div>
                ) : (
                    // QUIZ PHASES (Existing Render Logic)
                    <div className="flex-1 flex flex-col h-full">
                        {/* HEADER */}
                        <div className="h-2 bg-slate-800 w-full relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                        </div>

                        <div className="p-10 flex-col flex h-full">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-purple-400 font-black uppercase tracking-[0.2em] text-sm">
                                    Question {currentIdx + 1} / {questions.length}
                                </span>
                                {currentQ && (
                                    <div className="px-4 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/20">
                                        +{currentQ.points} Points
                                    </div>
                                )}
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-12 leading-relaxed">
                                {currentQ.question}
                            </h2>

                            {/* DYNAMIC QUESTION TYPE */}
                            <div className="flex-1">
                                {phase === 'question' ? (
                                    <>
                                        {currentQ.type === 'multiple_choice' && <MultipleChoice data={currentQ} onAnswer={handleAnswer} />}
                                        {currentQ.type === 'multiple_response' && <MultipleResponse data={currentQ} onAnswer={handleAnswer} />}
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
                    </div>
                )}
            </motion.div>

            {/* IMMERSIVE MASCOT IN CORNER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="fixed bottom-12 right-12 z-[220] pointer-events-none"
            >
                <div className="relative group pointer-events-auto">
                    <div className="absolute inset-[-20px] bg-slate-900/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-3xl" />

                    <AIAvatar
                        emotion={currentEmotion as MascotVideoEmotion}
                        isTalking={currentEmotion === 'talking'}
                        size={180}
                    />

                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl border border-white/20 whitespace-nowrap">
                        Quiz Master
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
