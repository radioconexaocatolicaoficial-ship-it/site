import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Users } from "lucide-react";
import { STREAM_URL, STATION_NAME, fetchNowPlaying } from "@/lib/radioStream";

const FixedPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [nowPlaying, setNowPlaying] = useState({ title: "Clique para ouvir ao vivo", listeners: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchNowPlaying().then((np) => setNowPlaying({ title: np.title, listeners: np.listeners }));
    const interval = setInterval(() => {
      fetchNowPlaying().then((np) => setNowPlaying({ title: np.title, listeners: np.listeners }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "none";
      audioRef.current.volume = volume;
    }
    if (playing) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    } else {
      audioRef.current.src = STREAM_URL;
      audioRef.current.play().catch(console.error);
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
      style={{
        background: "linear-gradient(90deg, #051230 0%, #0a2060 50%, #051230 100%)",
        borderTop: "2px solid #c8a84b",
      }}
    >
      <div className="container mx-auto px-3 md:px-4 py-2 flex items-center gap-2 md:gap-6">
        {/* Botão play */}
        <button
          onClick={toggle}
          aria-label={playing ? "Pausar" : "Ouvir ao vivo"}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)" }}
        >
          {playing ? (
            <Pause className="w-4 h-4 text-[#002266]" />
          ) : (
            <Play className="w-4 h-4 text-[#002266] ml-0.5" />
          )}
        </button>

        {/* Ao vivo + título */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {playing && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 flex-shrink-0">
              {playing ? "Ao Vivo" : STATION_NAME}
            </span>
          </div>
          <p className="text-white text-xs font-medium truncate flex items-center gap-1">
            <Music className="w-3 h-3 flex-shrink-0 opacity-60" />
            {nowPlaying.title}
          </p>
        </div>

        {/* Ouvintes */}
        {nowPlaying.listeners > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-white/60 text-xs flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>{nowPlaying.listeners} ouvindo</span>
          </div>
        )}

        {/* Volume */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleMute}
            aria-label={muted ? "Ativar som" : "Desativar som"}
            className="text-white/60 hover:text-white transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="hidden md:block w-20 accent-yellow-400"
          />
        </div>

        {/* App */}
        <a
          href="https://play.google.com/store/apps/details?id=hoostcomv2.ogvopund"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
        >
          📱 App
        </a>
      </div>
    </div>
  );
};

export default FixedPlayer;
