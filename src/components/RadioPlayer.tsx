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
      audioRef.current.src = "";
    } else {
      audioRef.current.src = STREAM_URL;
      audioRef.current.play().catch(console.error);
    }
    setPlaying(!playing);
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Pausar rádio" : "Ouvir rádio ao vivo"}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg hover:scale-110 transition-transform ${playing ? "animate-pulse" : ""}`}
      style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)" }}
    >
      {playing
        ? <Pause className="h-4 w-4 text-[#002266]" />
        : <Play className="h-4 w-4 text-[#002266] ml-0.5" />}
    </button>
  );
};

export default RadioPlayer;
