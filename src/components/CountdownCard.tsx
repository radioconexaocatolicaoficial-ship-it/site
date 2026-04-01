import { useState, useEffect, useRef } from "react";
import { Cross, Headphones } from "lucide-react";

const TARGET = new Date("2026-04-04T22:00:00-03:00").getTime();
const STREAM_URL = "https://hts04.brascast.com:11160/live";

const CountdownCard = () => {
  const [now, setNow] = useState(Date.now());
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleRadio = () => {
    if (!audioRef.current) audioRef.current = new Audio(STREAM_URL);
    if (playing) {
      audioRef.current.pause();
      audioRef.current.src = "";
    } else {
      audioRef.current.src = STREAM_URL;
      audioRef.current.play().catch(console.error);
    }
    setPlaying(!playing);
  };

  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const units = [
    { value: days, label: "Dias" },
    { value: hours, label: "Horas" },
    { value: minutes, label: "Min" },
    { value: seconds, label: "Seg" },
  ];

  return (
    <div className="h-full rounded-xl overflow-hidden gradient-primary text-primary-foreground p-4 md:p-6 flex flex-col justify-between relative">
      <div className="absolute top-4 right-4 opacity-10">
        <Cross className="h-24 w-24" />
      </div>
      <div className="relative z-10">
        <p className="text-xs font-medium tracking-widest uppercase opacity-80">Vem aí a 42ª</p>
        <h2 className="text-xl md:text-2xl font-extrabold mt-1 leading-tight">CAMINHADA DA<br />RESSURREIÇÃO</h2>
        <p className="text-sm mt-2 italic opacity-90">"Eu vi o Senhor" (Jo 20, 18)</p>
      </div>

      <div className="relative z-10 flex gap-2 md:gap-3 my-4 md:my-6">
        {units.map((u) => (
          <div key={u.label} className="flex-1 bg-primary-foreground/10 backdrop-blur rounded-lg py-3 text-center">
            <span className="block text-2xl font-bold">{String(u.value).padStart(2, "0")}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">{u.label}</span>
          </div>
        ))}
      </div>

      <div className="relative z-10 text-xs space-y-1.5 opacity-90">
        <p className="font-semibold">04 de Abril de 2026</p>
        <p>22h00 — Palco Esquenta (Basílica da Penha)</p>
        <p>00h00 — Início rumo a São Miguel Paulista</p>
        <a href="https://www.caminhadadaressurreicao.com/" target="_blank" rel="noopener noreferrer"
          className="inline-block mt-3 px-4 py-2 rounded-full bg-accent text-accent-foreground font-semibold text-xs hover:brightness-110 transition-all">
          Saiba Mais
        </a>
      </div>

      {/* Botões Rádio + App */}
      <div className="relative z-10 flex flex-col gap-2 mt-4">
        <button
          onClick={toggleRadio}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/30 border border-primary-foreground/30 text-primary-foreground text-xs font-bold transition-colors"
        >
          <Headphones className="w-4 h-4" />
          {playing ? "⏸ Pausar Rádio" : "🎧 Ouvir a Rádio ao Vivo"}
        </button>
        <a href="https://play.google.com/store/apps/details?id=br.webofus.rdioconexocatlica&hl=pt_BR" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all">
          📱 Baixar no Google Play
        </a>
      </div>
    </div>
  );
};

export default CountdownCard;
