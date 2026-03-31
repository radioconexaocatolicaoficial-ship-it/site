import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

const STREAM_URL = "https://hts04.brascast.com:11160/live";

const RadioPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL);
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <button onClick={toggle} aria-label={playing ? "Pausar rádio" : "Ouvir rádio"}
      className={`relative flex items-center justify-center w-12 h-12 rounded-full gradient-gold text-primary-foreground shadow-lg hover:scale-110 transition-transform ${playing ? "pulse-ring" : ""}`}>
      {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
    </button>
  );
};

export default RadioPlayer;
