import { useState, useEffect, useCallback } from 'react';

export interface UseSpeechReturn {
    voiceLang: string;
    setVoiceLang: (lang: string) => void;
    selectedVoiceURI: string;
    setSelectedVoiceURI: (uri: string) => void;
    isMuted: boolean;
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
    voices: SpeechSynthesisVoice[];
}

export const useSpeech = (gameState: string, currentNumber: number | null): UseSpeechReturn => {
    const [voiceLang, setVoiceLang] = useState<string>('vi');
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            let availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);

                // Try to auto-select a good Vietnamese voice if not yet selected
                if (!selectedVoiceURI) {
                    const viVoice = availableVoices.find(v => v.lang.includes('vi') || v.lang.includes('VN'));
                    if (viVoice) setSelectedVoiceURI(viVoice.voiceURI);
                }
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoiceURI]);

    // Speak function
    const speakNumber = useCallback((num: number) => {
        if (!isMuted && 'speechSynthesis' in window && voices.length > 0) {
            // Cancel any ongoing speech first
            window.speechSynthesis.cancel();

            const text = voiceLang === 'vi' ? `Số ${num}` : `Number ${num}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = voiceLang === 'vi' ? 'vi-VN' : 'en-US';

            let selectedVoice: SpeechSynthesisVoice | undefined;

            // 1. Try manually selected voice first
            if (selectedVoiceURI) {
                selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
            }

            // 2. Auto-select based on language if manual selection not valid for current lang or not set
            if (!selectedVoice || !selectedVoice.lang.includes(voiceLang === 'vi' ? 'vi' : 'en')) {
                if (voiceLang === 'vi') {
                    selectedVoice = voices.find(voice => voice.lang.includes('vi') || voice.lang.includes('VN'));
                    // Fallback
                    if (!selectedVoice) selectedVoice = voices.find(v => v.name.includes('Vietnamese') || v.name.includes('Tiếng Việt'));
                } else {
                    selectedVoice = voices.find(voice => voice.lang.includes('en-US') && !voice.name.includes('Zira'));
                }
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            window.speechSynthesis.speak(utterance);
        }
    }, [isMuted, voices, voiceLang, selectedVoiceURI]);

    // Effect to trigger speech
    useEffect(() => {
        if (currentNumber && gameState === 'PLAYING') {
            speakNumber(currentNumber);
        }
    }, [currentNumber, gameState, speakNumber]);

    // Cancel speech when game ends
    useEffect(() => {
        if (gameState === 'ENDED' || gameState === 'WAITING') {
            window.speechSynthesis.cancel();
        }
    }, [gameState]);

    return {
        voiceLang,
        setVoiceLang,
        selectedVoiceURI,
        setSelectedVoiceURI,
        isMuted,
        setIsMuted,
        voices
    };
};
