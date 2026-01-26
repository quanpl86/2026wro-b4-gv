'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
    const [textInput, setTextInput] = useState('');

    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const current = event.results[event.results.length - 1][0].transcript;
                setTranscript(current);
                if (event.results[0].isFinal) {
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
                console.error("Speech Error:", event.error);
                setIsListening(false);
            };
        }
    }, [activeLanguage, onCommand]);

    // Initialize TTS Voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const filtered = voices.filter(v => v.lang.startsWith('vi') || v.lang.startsWith('en'));
            setAvailableVoices(filtered);

            // Set default voice based on language
            if (filtered.length > 0) {
                const preferred = filtered.find(v => v.lang === activeLanguage && (v.name.includes('Google') || v.name.includes('Natural')));
                if (preferred) setSelectedVoiceName(preferred.name);
                else setSelectedVoiceName(filtered[0].name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [activeLanguage]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            recognitionRef.current.lang = activeLanguage;
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            onCommand(textInput, activeLanguage);
            setTextInput('');
        }
    };

    const speakResponse = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = availableVoices.find(v => v.name === selectedVoiceName);
        if (voice) utterance.voice = voice;
        utterance.lang = activeLanguage;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    // Expose TTS to parent via global event
    useEffect(() => {
        const handleSpeak = (e: any) => {
            if (e.detail?.text) speakResponse(e.detail.text);
        };
        window.addEventListener('ai-speak', handleSpeak);
        return () => window.removeEventListener('ai-speak', handleSpeak);
    }, [availableVoices, selectedVoiceName, activeLanguage]);

    return (
        <div className="relative flex flex-col items-center gap-6 w-full max-w-sm">
            {/* Listening State UI (Waveform Overlay) */}
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

            {/* Transitioning Input Area */}
            <div className="w-full flex flex-col gap-4">
                <AnimatePresence mode="wait">
                    {inputMode === 'text' ? (
                        <motion.form
                            key="text-input"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleTextSubmit}
                            className="w-full relative"
                        >
                            <input
                                type="text"
                                autoFocus
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={activeLanguage === 'vi-VN' ? "Nhập câu hỏi tại đây..." : "Type your question..."}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all shadow-inner"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-2 w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-500 active:scale-95 transition-all shadow-lg shadow-purple-600/20"
                            >
                                <span className="text-xs">↵</span>
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="voice-mode"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center"
                        >
                            {/* Speech bubble or status could go here if needed */}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Interaction Controls */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${showSettings ? 'bg-white text-black border-white' : 'bg-slate-900 border-white/10 text-white/40 hover:text-white'}`}
                    >
                        <span className="text-xl">⚙️</span>
                    </button>

                    <button
                        onClick={inputMode === 'voice' ? toggleListening : () => setInputMode('voice')}
                        className={`group relative w-20 h-20 rounded-[32px] flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95'}`}
                    >
                        {isListening ? (
                            <span className="text-3xl text-white">⏹️</span>
                        ) : (
                            <span className="text-4xl text-white group-hover:scale-110 transition-transform">🎙️</span>
                        )}

                        {!isListening && inputMode === 'voice' && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -inset-2 bg-purple-500/20 rounded-[40px] -z-10"
                            />
                        )}
                    </button>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setInputMode(inputMode === 'text' ? 'voice' : 'text')}
                            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${inputMode === 'text' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 border-white/10 text-white/40 hover:text-white'}`}
                        >
                            <span className="text-xl">{inputMode === 'text' ? '🎙️' : '⌨️'}</span>
                        </button>
                        <button
                            onClick={() => onLangChange(activeLanguage === 'vi-VN' ? 'en-US' : 'vi-VN')}
                            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex flex-col items-center justify-center hover:border-purple-500/40 transition-all font-black text-[10px]"
                        >
                            <span className="text-lg opacity-80">{activeLanguage === 'vi-VN' ? '🇻🇳' : '🇺🇸'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Voice Settings Dropdown */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-28 bg-slate-900 border border-white/10 rounded-3xl p-4 w-64 shadow-2xl z-50 backdrop-blur-xl"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2">AI Voice Config</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {availableVoices.map((voice) => (
                                <button
                                    key={voice.name}
                                    onClick={() => {
                                        setSelectedVoiceName(voice.name);
                                        setShowSettings(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedVoiceName === voice.name ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                                >
                                    <span className="truncate max-w-[140px]">{voice.name}</span>
                                    <span className="opacity-40 text-[9px] uppercase">{voice.lang}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
