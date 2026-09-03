import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Headphones, Instagram, MapPin, Waves } from "lucide-react";
import { STREAM_URL } from "@/lib/radioStream";
import logoLitoral from "@/assets/logo-litoral.png";
import litoralBanner from "@/assets/litoral-banner.jpg";

const IG_URL = "https://www.instagram.com/radioconexaocatolicalitoral/";

const highlights = [
  { value: "Santos", label: "Cidade" },
  { value: "24h", label: "No ar" },
  { value: "Fé", label: "Missão" },
  { value: "Praia", label: "Litoral" },
];

const LitoralCard = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleRadio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "none";
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

  return (
    <div className="h-full rounded-xl overflow-hidden gradient-primary text-primary-foreground p-4 md:p-6 flex flex-col justify-between relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${litoralBanner})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/40 via-transparent to-primary-dark/55" aria-hidden />
      <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
        <Waves className="h-24 w-24" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase opacity-80">Afiliada oficial</p>
            <h2 className="text-xl md:text-2xl font-extrabold mt-1 leading-tight">
              RÁDIO CONEXÃO
              <br />
              CATÓLICA LITORAL
            </h2>
            <p className="text-sm mt-2 italic opacity-90">"Evangelizando a Baixada Santista"</p>
          </div>
          <img
            src={logoLitoral}
            alt="Rádio Conexão Católica No Litoral"
            className="h-14 w-14 shrink-0 rounded-lg bg-white object-contain p-1 shadow-md"
          />
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-accent-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
          No ar no litoral
        </span>
      </div>

      <div className="relative z-10 flex gap-2 md:gap-3 my-4 md:my-6">
        {highlights.map((u) => (
          <div key={u.label} className="flex-1 bg-primary-foreground/10 backdrop-blur rounded-lg py-3 text-center">
            <span className="block text-[13px] md:text-sm font-bold leading-tight">{u.value}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">{u.label}</span>
          </div>
        ))}
      </div>

      <div className="relative z-10 text-xs space-y-1.5 opacity-90">
        <p className="font-semibold flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Baixada Santista — São Paulo
        </p>
        <p>Música católica, oração e Palavra de Deus no litoral paulista.</p>
        <p className="flex items-center gap-1.5">
          <Instagram className="h-3.5 w-3.5 shrink-0" />
          @radioconexaocatolicalitoral
        </p>
        <Link
          to="/litoral"
          className="inline-block mt-3 px-4 py-2 rounded-full bg-accent text-accent-foreground font-semibold text-xs hover:brightness-110 transition-all"
        >
          Conheça a rádio
        </Link>
      </div>

      <div className="relative z-10 flex flex-col gap-2 mt-4">
        <button
          type="button"
          onClick={toggleRadio}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/30 border border-primary-foreground/30 text-primary-foreground text-xs font-bold transition-colors"
        >
          <Headphones className="w-4 h-4" />
          {playing ? "Pausar Rádio" : "Ouvir a Rádio ao Vivo"}
        </button>
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all"
        >
          <Instagram className="w-4 h-4" />
          Seguir no Instagram
        </a>
      </div>
    </div>
  );
};

export default LitoralCard;
