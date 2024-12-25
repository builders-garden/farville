import { createContext, useContext, useRef, useState } from "react";

interface AudioContextType {
  playSound: (soundName: string) => void;
  toggleMusic: () => void;
  isMusicPlaying: boolean;
  setVolume: (volume: number) => void;
  volume: number;
}

const AudioContext = createContext<AudioContextType | null>(null);

const SOUNDS = {
  plant: "/sounds/plant.mp3",
  harvest: "/sounds/harvest.mp3",
  coins: "/sounds/coins.mp3",
  levelUp: "/sounds/level-up.mp3",
  click: "/sounds/click.mp3",
  bgMusic: "/sounds/background-music.mp3",
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  const initAudio = () => {
    Object.entries(SOUNDS).forEach(([key, src]) => {
      if (key === "bgMusic") {
        if (!musicRef.current) {
          musicRef.current = new Audio(src);
          musicRef.current.loop = true;
        }
      } else {
        if (!audioRefs.current[key]) {
          audioRefs.current[key] = new Audio(src);
        }
      }
    });
  };

  const playSound = (soundName: string) => {
    if (!audioRefs.current[soundName]) {
      initAudio();
    }

    const audio = audioRefs.current[soundName];
    if (audio) {
      // Adjust volume based on sound type
      const soundVolumes = {
        coins: volume * 1.2, // 20% louder than base volume
        harvest: volume * 1.1, // 10% louder than base volume
        plant: volume,
        click: volume * 0.8, // 20% quieter than base volume
      };

      audio.volume =
        soundVolumes[soundName as keyof typeof soundVolumes] || volume;
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  };

  const toggleMusic = () => {
    if (!musicRef.current) {
      initAudio();
    }

    if (musicRef.current) {
      if (isMusicPlaying) {
        musicRef.current.pause();
      } else {
        musicRef.current.volume = volume;
        musicRef.current.play().catch(console.error);
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (musicRef.current) {
      musicRef.current.volume = newVolume;
    }
    Object.values(audioRefs.current).forEach((audio) => {
      audio.volume = newVolume;
    });
  };

  return (
    <AudioContext.Provider
      value={{
        playSound,
        toggleMusic,
        isMusicPlaying,
        setVolume: updateVolume,
        volume,
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
