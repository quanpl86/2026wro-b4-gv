'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRobotEmotion } from '@/stores/useRobotEmotion';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mic, Volume2, Square, Keyboard, Globe, Send } from 'lucide-react';

interface VoiceAssistantProps {
    onCommand: (text: string, lang: string) => void;
    lang: 'vi-VN' | 'en-US';
    onLangChange: (lang: 'vi-VN' | 'en-US') => void;
    isListening?: boolean;
    isTalking?: boolean;
}

export default function VoiceAssistant({ onCommand, lang: activeLanguage, onLangChange, isListening: propIsListening, isTalking }: VoiceAssistantProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
    const [showSettings, setShowSettings] = useState(false);
    const [responseMode, setResponseMode] = useState<'speech' | 'text'>('speech');
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
    const [textInput, setTextInput] = useState('');

    const recognitionRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { setEmotion } = useRobotEmotion();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setEmotion('curious');
            };

            recognitionRef.current.onresult = (event: any) => {
                const current = event.results[event.results.length - 1][0].transcript;
                setTranscript(current);
                if (event.results[0].isFinal) {
                    setEmotion('think');
                    onCommand(current, activeLanguage);
                    setTimeout(() => {
                        setIsListening(false);
                        setTranscript('');
                    }, 1000);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                if (event.error !== 'no-speech') {
                    console.error("Speech Error:", event.error);
                }
                setIsListening(false);
                setEmotion('neutral');
            };
        }
    }, [activeLanguage, onCommand, setEmotion]);

    // Initialize TTS Voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const filtered = voices.filter(v => v.lang.startsWith('vi') || v.lang.startsWith('en'));
            setAvailableVoices(filtered);

            if (filtered.length > 0) {
                const preferred = filtered.find(v => v.lang === activeLanguage && (v.name.includes('Google') || v.name.includes('Natural')));
                if (preferred) setSelectedVoiceName(preferred.name);
                else setSelectedVoiceName(filtered[0].name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [activeLanguage]);

    const speakResponse = useCallback((text: string) => {
        if (!window.speechSynthesis || responseMode === 'text') return;

        // Force stop previous to avoid overlapping
        window.speechSynthesis.cancel();
        setEmotion('neutral');
        utteranceRef.current = null;

        // Small timeout to let cancel finish and NOT trigger event handlers for new one early
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            const voice = availableVoices.find(v => v.name === selectedVoiceName) ||
                availableVoices.find(v => v.lang.startsWith(activeLanguage.split('-')[0]));

            if (voice) utterance.voice = voice;
            utterance.lang = activeLanguage;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => {
                setEmotion('talking');
            };

            utterance.onend = (e) => {
                // IMPORTANT: Only dispatch 'ai-speak-end' if the speech was NOT interrupted or canceled.
                // In most browsers, an interrupted speak will either NOT fire onend or fire it with 0 duration/charIndex.
                // However, the most reliable way is to check if this utterance is still the current one.
                if (utteranceRef.current === utterance) {
                    setEmotion('neutral');
                    utteranceRef.current = null;
                    console.log("✅ Speech finished naturally:", text);
                    window.dispatchEvent(new CustomEvent('ai-speak-end', { detail: { text } }));
                }
            };

            utterance.onerror = (e) => {
                if (e.error === 'interrupted' || e.error === 'canceled') {
                    console.log("🛑 Speech interrupted/canceled:", text);
                } else {
                    console.error("Speech Error:", e.error);
                }
                if (utteranceRef.current === utterance) {
                    setEmotion('neutral');
                    utteranceRef.current = null;
                }
            };

            window.speechSynthesis.speak(utterance);
        }, 100);
    }, [availableVoices, selectedVoiceName, activeLanguage, responseMode, setEmotion]);

    const toggleListening = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.resume();
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            if (recognitionRef.current) {
                recognitionRef.current.lang = activeLanguage;
                recognitionRef.current.start();
            }
            setIsListening(true);
            setEmotion('curious');
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.resume();
        }

        if (textInput.trim()) {
            inputRef.current?.blur();
            setTimeout(() => setEmotion('think'), 50);
            onCommand(textInput, activeLanguage);
            setTextInput('');
        }
    };

    const testSpeak = () => speakResponse(activeLanguage === 'vi-VN' ? "Hệ thống âm thanh đã sẵn sàng." : "Audio system is ready.");

    useEffect(() => {
        const handleAiSpeak = (e: any) => {
            const { text, action } = e.detail;
            if (action === 'stop') {
                window.speechSynthesis.cancel();
                setEmotion('neutral');
                return;
            }
            if (text) speakResponse(text);
        };

        window.addEventListener('ai-speak', handleAiSpeak);
        return () => window.removeEventListener('ai-speak', handleAiSpeak);
    }, [speakResponse, setEmotion]);

    return (
        <div className="relative w-full h-full flex flex-col gap-6">
            {/* Listening State UI */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-24 bg-purple-600/90 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-4 min-w-[200px] z-[60]"
                    >
                        <div className="flex gap-1 items-end h-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [4, 16, 4] }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                    className="w-1 bg-white rounded-full"
                                />
                            ))}
                        </div>
                        <span className="text-white text-sm font-black italic tracking-tight uppercase">
                            {transcript || (activeLanguage === 'vi-VN' ? "Đang lắng nghe..." : "Listening...")}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full flex flex-col gap-4">
                <AnimatePresence mode="wait">
                    {inputMode === 'text' && (
                        <motion.form
                            key="text-input"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleTextSubmit}
                            className="w-full relative"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                autoFocus
                                value={textInput}
                                onFocus={() => setEmotion('curious')}
                                onBlur={() => setEmotion('neutral')}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={activeLanguage === 'vi-VN' ? "Nhập câu hỏi tại đây..." : "Type your question..."}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all shadow-inner"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-2 w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-500 active:scale-95 transition-all shadow-lg shadow-purple-600/20"
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* CONSOLIDATED INTERACTION CLUSTER */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`w-14 h-14 rounded-[22px] border flex items-center justify-center transition-all ${showSettings ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-slate-900 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                        title="AI Settings"
                    >
                        <Settings className={`w-6 h-6 ${showSettings ? 'animate-spin-slow' : ''}`} />
                    </button>

                    <button
                        onClick={inputMode === 'voice' ? toggleListening : () => setInputMode('voice')}
                        className={`group relative w-24 h-24 rounded-[36px] flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-red-500 scale-110 shadow-[0_0_60px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95'}`}
                    >
                        {isListening ? (
                            <Square className="w-10 h-10 text-white fill-white" />
                        ) : (
                            <Mic className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                        )}
                        {!isListening && inputMode === 'voice' && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -inset-3 bg-purple-500/20 rounded-[44px] -z-10"
                            />
                        )}
                    </button>

                    <button
                        onClick={() => setInputMode(inputMode === 'text' ? 'voice' : 'text')}
                        className={`w-14 h-14 rounded-[22px] border flex items-center justify-center transition-all ${inputMode === 'text' ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-slate-900 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                        title={inputMode === 'text' ? "Switch to Voice" : "Switch to Keyboard"}
                    >
                        {inputMode === 'text' ? <Mic className="w-6 h-6" /> : <Keyboard className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* COMPREHENSIVE SETTINGS POPOVER */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-32 bg-slate-900/95 border border-white/10 rounded-[32px] p-5 w-80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 backdrop-blur-2xl"
                    >
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">AI Assistant Config</h4>
                            <button onClick={testSpeak} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-400 transition-all" title="Test Voice">
                                <Volume2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">Language</label>
                                    <button
                                        onClick={() => onLangChange(activeLanguage === 'vi-VN' ? 'en-US' : 'vi-VN')}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 flex items-center gap-3 hover:bg-white/10 transition-all group"
                                    >
                                        <Globe className="w-4 h-4 text-purple-500 group-hover:rotate-12 transition-transform" />
                                        <span className="text-xs font-black text-white">{activeLanguage === 'vi-VN' ? 'TIẾNG VIỆT' : 'ENGLISH'}</span>
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">Response</label>
                                    <button
                                        onClick={() => setResponseMode(responseMode === 'speech' ? 'text' : 'speech')}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 flex items-center gap-3 hover:bg-white/10 transition-all group"
                                    >
                                        {responseMode === 'speech' ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <Square className="w-3 h-3 text-amber-500" />}
                                        <span className="text-xs font-black text-white uppercase">{responseMode}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">Available Voices</label>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1 bg-black/20 rounded-2xl p-2 border border-white/5">
                                    {availableVoices.map((voice) => (
                                        <button
                                            key={voice.name}
                                            onClick={() => setSelectedVoiceName(voice.name)}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between group ${selectedVoiceName === voice.name ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="truncate max-w-[150px]">{voice.name}</span>
                                            <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-md ${selectedVoiceName === voice.name ? 'bg-white/20' : 'bg-white/5 text-slate-600'}`}>
                                                {voice.lang.split('-')[0]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-center gap-1.5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-1 h-1 bg-white/10 rounded-full" />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
