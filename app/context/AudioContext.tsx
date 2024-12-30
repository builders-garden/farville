"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";

interface AudioContextType {
  playSound: (soundName: string) => void;
  toggleMusic: () => void;
  isMusicPlaying: boolean;
  setVolume: (volume: number) => void;
  volume: number;
  setMusicVolume: (volume: number) => void;
  musicVolume: number;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.05);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio("/sounds/background-music.mp3");
      musicRef.current.loop = true;
      musicRef.current.volume = 0.05;
    }
  }, []);

  const initAudio = () => {
    audioRefs.current = {
      plant: new Audio("/sounds/plant.mp3"),
      harvest: new Audio("/sounds/harvest.mp3"),
      coins: new Audio("/sounds/coins.mp3"),
      levelUp: new Audio("/sounds/level-up.mp3"),
      click: new Audio("/sounds/click.mp3"),
    };
  };

  const playSound = (soundName: string) => {
    if (!isSoundEnabled) return;

    if (!audioRefs.current[soundName]) {
      initAudio();
    }

    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  };

  const toggleMusic = () => {
    if (!musicRef.current) {
      musicRef.current = new Audio("/sounds/background-music.mp3");
      musicRef.current.loop = true;
    }

    if (isMusicPlaying) {
      musicRef.current.pause();
    } else {
      musicRef.current.volume = musicVolume;
      musicRef.current.play().catch(console.error);
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    Object.values(audioRefs.current).forEach((audio) => {
      audio.volume = newVolume;
    });
  };

  const updateMusicVolume = (newVolume: number) => {
    setMusicVolume(newVolume);
    if (musicRef.current) {
      musicRef.current.volume = newVolume;
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const startBackgroundMusic = () => {
    if (musicRef.current && !isMusicPlaying) {
      musicRef.current
        .play()
        .then(() => {
          setIsMusicPlaying(true);
        })
        .catch(console.error);
    }
  };

  const stopBackgroundMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        playSound,
        toggleMusic,
        isMusicPlaying,
        setVolume: updateVolume,
        volume,
        setMusicVolume: updateMusicVolume,
        musicVolume,
        isSoundEnabled,
        toggleSound,
        startBackgroundMusic,
        stopBackgroundMusic,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
