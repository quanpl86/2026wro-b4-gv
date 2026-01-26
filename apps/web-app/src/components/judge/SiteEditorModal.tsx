'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES (Synced with AdvancedQuiz.tsx) ---
interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'multiple_response' | 'true_false' | 'matching' | 'sequencing';
    question: string;
    options?: string[]; // MC, MR, TF
    correct_answer?: string; // MC, TF
    correct_answers?: string[]; // MR
    items?: string[]; // Sequencing
    correct_order?: string[]; // Sequencing
    pairs?: { left: string; right: string }[]; // Matching
    explanation: string;
    points: number;
}

interface Site {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge: string;
    posX: number;
    posY: number;
    color: string;
    pathColor?: string;
    quiz_data?: QuizQuestion[];
}

interface SiteEditorModalProps {
    site: Site;
    onSave: (updatedSite: Site) => void;
    onCancel: () => void;
}

export default function SiteEditorModal({ site, onSave, onCancel }: SiteEditorModalProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'media' | 'quiz'>('general');
    const [editedSite, setEditedSite] = useState<Site>({ ...site, quiz_data: site.quiz_data || [] });

    // Quiz Editor State
    const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
        type: 'multiple_choice',
        question: '',
        explanation: '',
        points: 10,
        options: ['', '', '', ''],
        correct_answer: '',
        correct_answers: [],
        pairs: [{ left: '', right: '' }, { left: '', right: '' }],
        items: ['', '', '', ''],
        correct_order: []
    });

    const handleSave = () => {
        onSave(editedSite);
    };

    const addQuestion = () => {
        if (!currentQuestion.question) return;

        const newQ: QuizQuestion = {
            id: `q_${Date.now()}`,
            type: currentQuestion.type || 'multiple_choice',
            question: currentQuestion.question || '',
            explanation: currentQuestion.explanation || '',
            points: currentQuestion.points || 10,
            options: currentQuestion.options,
            correct_answer: currentQuestion.correct_answer,
            correct_answers: currentQuestion.correct_answers,
            pairs: currentQuestion.pairs,
            // For Sequencing, initial items should be shuffled by Player, but here we save correct order
            items: currentQuestion.items, // This acts as "Correct Order" in Editor for simplicity
            correct_order: currentQuestion.items // We'll save the intended order
        };

        setEditedSite(prev => ({
            ...prev,
            quiz_data: [...(prev.quiz_data || []), newQ]
        }));

        // Reset
        setCurrentQuestion({
            type: 'multiple_choice',
            question: '',
            explanation: '',
            points: 10,
            options: ['', '', '', ''],
            correct_answer: '',
            correct_answers: [],
            pairs: [{ left: '', right: '' }, { left: '', right: '' }],
            items: ['', '', '', '']
        });
    };

    const removeQuestion = (id: string) => {
        setEditedSite(prev => ({
            ...prev,
            quiz_data: prev.quiz_data?.filter(q => q.id !== id)
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 w-full max-w-5xl max-h-[95vh] rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
                {/* HEADER */}
                <div className="h-20 bg-slate-800/50 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${editedSite.color} flex items-center justify-center text-xl`}>
                            {editedSite.icon}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Edit Site: {editedSite.name}</h2>
                            <p className="text-xs text-slate-400 font-mono">{editedSite.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-xs font-bold uppercase tracking-wider shadow-lg">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-white/5 bg-slate-900/50 shrink-0">
                    {['General', 'Media', 'Quiz'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase() as any)}
                            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all
                                ${activeTab === tab.toLowerCase()
                                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
                                    : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Site Name</label>
                                <input
                                    value={editedSite.name}
                                    onChange={e => setEditedSite({ ...editedSite, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Icon (Emoji)</label>
                                <input
                                    value={editedSite.icon}
                                    onChange={e => setEditedSite({ ...editedSite, icon: e.target.value })}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div className="col-span-2 space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea
                                    value={editedSite.description}
                                    onChange={e => setEditedSite({ ...editedSite, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none resize-none"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Theme Gradient (Tailwind)</label>
                                <input
                                    value={editedSite.color}
                                    onChange={e => setEditedSite({ ...editedSite, color: e.target.value })}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Path Color (Hex)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={editedSite.pathColor || '#ffffff'}
                                        onChange={e => setEditedSite({ ...editedSite, pathColor: e.target.value })}
                                        className="h-12 w-12 rounded-xl bg-transparent border-0 cursor-pointer"
                                    />
                                    <input
                                        value={editedSite.pathColor || ''}
                                        onChange={e => setEditedSite({ ...editedSite, pathColor: e.target.value })}
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Badge Image URL</label>
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-slate-950 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {editedSite.badge ? (
                                            <img src={editedSite.badge} alt="Badge" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl">🏅</span>
                                        )}
                                    </div>
                                    <input
                                        value={editedSite.badge}
                                        onChange={e => setEditedSite({ ...editedSite, badge: e.target.value })}
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none h-12"
                                        placeholder="/assets/badges/..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="grid grid-cols-5 gap-8 h-full">
                            {/* LIST (Left Sidebar) */}
                            <div className="col-span-2 border-r border-white/5 pr-6 flex flex-col gap-4 overflow-y-auto max-h-[600px] custom-scrollbar">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Existing Questions ({editedSite.quiz_data?.length})</h3>
                                {editedSite.quiz_data?.map((q, i) => (
                                    <div key={q.id} className="p-4 bg-slate-950/50 rounded-xl border border-white/5 hover:border-purple-500/50 group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">Q{i + 1}</span>
                                                <span className="text-[10px] font-bold bg-blue-900/50 px-2 py-1 rounded text-blue-300 uppercase">{q.type.replace('_', ' ')}</span>
                                            </div>
                                            <button onClick={() => removeQuestion(q.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                        </div>
                                        <p className="text-sm font-medium text-white line-clamp-2">{q.question}</p>
                                    </div>
                                ))}
                            </div>

                            {/* EDITOR (Main Area) */}
                            <div className="col-span-3 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                                <h3 className="text-xs font-bold text-purple-400 uppercase mb-2">Add New Question</h3>

                                {/* Common Fields */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Question Type</label>
                                        <select
                                            value={currentQuestion.type}
                                            onChange={e => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none appearance-none"
                                        >
                                            <option value="multiple_choice">Multiple Choice (Single)</option>
                                            <option value="multiple_response">Multiple Response (Checkbox)</option>
                                            <option value="true_false">True / False</option>
                                            <option value="matching">Matching Pairs</option>
                                            <option value="sequencing">Sequencing (Order)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Points</label>
                                        <input
                                            type="number"
                                            value={currentQuestion.points}
                                            onChange={e => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Question Text</label>
                                    <textarea
                                        rows={3}
                                        value={currentQuestion.question}
                                        onChange={e => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none resize-none"
                                        placeholder="Enter your question here..."
                                    />
                                </div>

                                {/* DYNAMIC CONTENT BASED ON TYPE */}
                                <div className="p-6 bg-slate-800/30 rounded-2xl border border-white/5 space-y-4">

                                    {/* MC & MR */}
                                    {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'multiple_response') && (
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                                Options {currentQuestion.type === 'multiple_response' ? '(Select all correct)' : '(Select one correct)'}
                                            </label>
                                            {currentQuestion.options?.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <div
                                                        onClick={() => {
                                                            if (currentQuestion.type === 'multiple_choice') {
                                                                setCurrentQuestion({ ...currentQuestion, correct_answer: opt });
                                                            } else {
                                                                const current = currentQuestion.correct_answers || [];
                                                                if (current.includes(opt)) {
                                                                    setCurrentQuestion({ ...currentQuestion, correct_answers: current.filter(a => a !== opt) });
                                                                } else {
                                                                    setCurrentQuestion({ ...currentQuestion, correct_answers: [...current, opt] });
                                                                }
                                                            }
                                                        }}
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer border transition-all
                                                            ${(currentQuestion.type === 'multiple_choice' ? currentQuestion.correct_answer === opt : currentQuestion.correct_answers?.includes(opt))
                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                : 'bg-slate-900 border-white/10 text-slate-500'}`}
                                                    >
                                                        {['A', 'B', 'C', 'D'][i]}
                                                    </div>
                                                    <input
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOpts = [...(currentQuestion.options || [])];
                                                            newOpts[i] = e.target.value;
                                                            // Auto-update correct answer if strictly matching based on old val (simplified)
                                                            setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                                        }}
                                                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 text-sm text-white focus:border-purple-500 outline-none"
                                                        placeholder={`Option ${i + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* TRUE / FALSE */}
                                    {currentQuestion.type === 'true_false' && (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setCurrentQuestion({ ...currentQuestion, correct_answer: 'Đúng' })}
                                                className={`flex-1 py-4 rounded-xl border-2 font-black uppercase ${currentQuestion.correct_answer === 'Đúng' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/10 text-slate-500'}`}
                                            >
                                                Đúng
                                            </button>
                                            <button
                                                onClick={() => setCurrentQuestion({ ...currentQuestion, correct_answer: 'Sai' })}
                                                className={`flex-1 py-4 rounded-xl border-2 font-black uppercase ${currentQuestion.correct_answer === 'Sai' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'border-white/10 text-slate-500'}`}
                                            >
                                                Sai
                                            </button>
                                        </div>
                                    )}

                                    {/* SEQUENCING */}
                                    {currentQuestion.type === 'sequencing' && (
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Correct Sequence Order (Top to Bottom)</label>
                                            {currentQuestion.items?.map((item, i) => (
                                                <div key={i} className="flex gap-2 items-center">
                                                    <span className="text-slate-500 font-mono text-xs w-4">{i + 1}</span>
                                                    <input
                                                        value={item}
                                                        onChange={e => {
                                                            const newItems = [...(currentQuestion.items || [])];
                                                            newItems[i] = e.target.value;
                                                            setCurrentQuestion({ ...currentQuestion, items: newItems, correct_order: newItems });
                                                        }}
                                                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                                        placeholder={`Step ${i + 1}`}
                                                    />
                                                </div>
                                            ))}
                                            <p className="text-[10px] text-slate-500 italic">* Items will be shuffled automatically for players.</p>
                                        </div>
                                    )}

                                    {/* MATCHING */}
                                    {currentQuestion.type === 'matching' && (
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Matching Pairs</label>
                                            {currentQuestion.pairs?.map((pair, i) => (
                                                <div key={i} className="grid grid-cols-2 gap-4">
                                                    <input
                                                        value={pair.left}
                                                        onChange={e => {
                                                            const newPairs = [...(currentQuestion.pairs || [])];
                                                            newPairs[i] = { ...newPairs[i], left: e.target.value };
                                                            setCurrentQuestion({ ...currentQuestion, pairs: newPairs });
                                                        }}
                                                        className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                                        placeholder={`Left Side ${i + 1}`}
                                                    />
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-slate-500">➔</span>
                                                        <input
                                                            value={pair.right}
                                                            onChange={e => {
                                                                const newPairs = [...(currentQuestion.pairs || [])];
                                                                newPairs[i] = { ...newPairs[i], right: e.target.value };
                                                                setCurrentQuestion({ ...currentQuestion, pairs: newPairs });
                                                            }}
                                                            className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                                                            placeholder={`Right Side ${i + 1}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={() => setCurrentQuestion({
                                                        ...currentQuestion,
                                                        pairs: [...(currentQuestion.pairs || []), { left: '', right: '' }]
                                                    })}
                                                    className="px-3 py-1 bg-white/5 rounded-lg text-xs hover:bg-white/10"
                                                >
                                                    + Add Pair
                                                </button>
                                                {currentQuestion.pairs && currentQuestion.pairs.length > 2 && (
                                                    <button
                                                        onClick={() => setCurrentQuestion({
                                                            ...currentQuestion,
                                                            pairs: currentQuestion.pairs?.slice(0, -1)
                                                        })}
                                                        className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs hover:bg-rose-500/20"
                                                    >
                                                        - Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* EXPLANATION */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Explanation (After Answer)</label>
                                    <textarea
                                        rows={2}
                                        value={currentQuestion.explanation}
                                        onChange={e => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none resize-none"
                                        placeholder="Explain the correct answer..."
                                    />
                                </div>

                                <button
                                    onClick={addQuestion}
                                    className="w-full py-4 rounded-xl bg-purple-600/20 border border-purple-500/50 text-purple-300 font-bold uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    disabled={!currentQuestion.question}
                                >
                                    + Add to Quiz
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
