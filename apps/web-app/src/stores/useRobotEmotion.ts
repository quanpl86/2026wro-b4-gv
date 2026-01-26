import { create } from 'zustand';

export type Emotion = 'neutral' | 'happy' | 'sleepy' | 'curious' | 'blink_left' | 'blink_right' | 'talking' | 'love' | 'angry' | 'think' | 'sad' | 'shy' | 'celebrate';

interface RobotEmotionState {
    currentEmotion: Emotion;
    isIdle: boolean;

    // Actions
    setEmotion: (emotion: Emotion) => void;
    setIdle: (idle: boolean) => void;
    resetEmotion: () => void;
}

export const useRobotEmotion = create<RobotEmotionState>((set) => ({
    currentEmotion: 'neutral',
    isIdle: false,

    setEmotion: (emotion) => set({ currentEmotion: emotion, isIdle: false }),
    setIdle: (idle) => set({ isIdle: idle }),
    resetEmotion: () => set({ currentEmotion: 'neutral' }),
}));
