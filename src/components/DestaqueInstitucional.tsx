import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import logo from "@/assets/logo.png";

const STREAM_URL = "https://hts04.brascast.com:11160/live";

const DestaqueInstitucional = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!isPlaying) {
      if (!audioRef.current) audioRef.current = new Audio(STREAM_URL);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current.src = STREAM_URL;
      }
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative w-full overflow-hidden">

      {/* Imagem de fundo */}
      {/* Imagem de fundo — parallax fixo */}
      <div className="absolute inset-0" style={{
        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/1280px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
      }}>
        {/* Overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(0,33,102,0.88) 0%, rgba(0,66,153,0.78) 100%)"
        }} />
      </div>

      {/* Conteúdo */}
      <div className="relative z-20 py-16 container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-10 max-w-3xl">

        {/* Logo */}
        <img
          src={logo}
          alt="Rádio Conexão Católica"
          className="h-28 md:h-32 w-auto flex-shrink-0"
          style={{ filter: "drop-shadow(0 4px 24px rgba(0,100,255,0.4))" }}
        />

        {/* Texto + botões */}
        <div className="text-center sm:text-left text-white">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-70 whitespace-nowrap">
            Web Rádio Católica
          </p>
          <h2 className="text-2xl md:text-3xl font-black mt-1 whitespace-nowrap">
            a sintonia de vida no ar
          </h2>
          <p className="text-sm mt-1 opacity-60 whitespace-nowrap">
            Levando a boa nova para todos os cantos.
          </p>

          <div className="flex flex-row gap-3 mt-5 items-center justify-center sm:justify-start" style={{ flexWrap: "nowrap" }}>
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.5)",
                color: "#fff",
                backdropFilter: "blur(6px)",
              }}
            >
              {isPlaying
                ? <><Pause className="w-4 h-4" />Pausar Rádio</>
                : <><Play className="w-4 h-4" />Ouvir ao Vivo</>}
            </button>

            <a
              href="https://play.google.com/store/apps/details?id=br.webofus.rdioconexocatlica&hl=pt_BR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg,#f5c518,#e8a800)",
                color: "#002266",
              }}
            >
              📱 Baixar no Google Play
            </a>
          </div>

          {isPlaying && (
            <p className="mt-3 text-xs opacity-50 animate-pulse whitespace-nowrap">
              🔴 Ao vivo agora
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DestaqueInstitucional;
