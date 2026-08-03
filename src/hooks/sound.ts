import { useEffect, useRef } from "react";

export const useSound = (soundPath: string = "/sounds/sound.mp3") => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(soundPath);
    audio.loop = true;
    audioRef.current = audio;
    audio.play().catch((err) => {
      console.log("Audio play blocked by browser autoplay policy:", err);
    });
  };

  const playSoundRef = useRef(playSound);
  playSoundRef.current = playSound;

  useEffect(() => {
    const handleSilence = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };

    window.addEventListener("click", handleSilence);
    window.addEventListener("touchstart", handleSilence);
    window.addEventListener("keydown", handleSilence);

    return () => {
      window.removeEventListener("click", handleSilence);
      window.removeEventListener("touchstart", handleSilence);
      window.removeEventListener("keydown", handleSilence);
    };
  }, []);

  return playSoundRef;
};
