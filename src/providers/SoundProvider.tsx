"use client";

import { createContext, type ReactNode, useContext, useEffect, useRef, useCallback } from "react";

export const SoundContext = createContext<{ playSound: () => Promise<void>; stopSound: () => Promise<void> } | null>(null);
export const useSound = () => {
    const sound = useContext(SoundContext);

    return sound;
}

interface SoundProviderProps {
    children: ReactNode;
}

const SoundProvider = ({ children }: SoundProviderProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const playSound = useCallback(async () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1;
        await audioRef.current.play().catch((err) => {
            console.log("Audio play error:", err);
        });
    }, []);

    const stopSound = useCallback(async () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
    }, []);

    const humanEvents = ["keydown", "touchstart", "mousedown", "pointerdown"];

    useEffect(() => {
        const handleInteraction = () => {
            stopSound();
        };

        humanEvents.forEach((event) => {
            window.addEventListener(event, handleInteraction);
        });

        return () => {
            humanEvents.forEach((event) => {
                window.removeEventListener(event, handleInteraction);
            });
        };
    }, [stopSound]);

    return (
        <SoundContext.Provider value={{ playSound, stopSound }}>
            <audio ref={audioRef} autoPlay={false} loop={true} controls={false} >
                <source src="/sounds/sound.mp3" />
            </audio>

            {children}
        </SoundContext.Provider>
    );
};

export default SoundProvider;
