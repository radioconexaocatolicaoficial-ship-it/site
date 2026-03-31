import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerPousada from "@/assets/banner-empresa-pousada.jpg";

const BannerAnuncieAqui = () => (
  <a href="https://wa.me/5511961605164" target="_blank" rel="noopener noreferrer"
    className="relative flex w-full h-full overflow-hidden hover:brightness-105 transition-all rounded-xl">
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#051230 0%,#0a2060 40%,#0d3090 65%,#0a2060 100%)" }} />
    <div className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg,transparent,#c8a84b,transparent)" }} />
    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg,transparent,#c8a84b,transparent)" }} />
    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center w-full gap-4 sm:gap-10 px-4 sm:px-10 py-5 overflow-hidden">
      <div className="text-center sm:text-left w-full sm:w-auto">
        <p className="font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: "#c8a84b", fontSize: "clamp(.6rem,1vw,.75rem)" }}>
          Espaco Publicitario
        </p>
        <h3 className="font-black text-white leading-tight mb-2"
          style={{ fontSize: "clamp(1.1rem,3.2vw,2.2rem)", fontFamily: "Georgia,serif", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
          Sua marca aqui,<br /><span style={{ color: "#d4af37" }}>vista por milhares.</span>
        </h3>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(.65rem,1.1vw,.82rem)", lineHeight: 1.6 }}>
          Alcance milhares de pessoas todos os dias na maior radio catolica da Zona Leste de SP.
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full font-bold"
          style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266", fontSize: "clamp(.7rem,1.1vw,.85rem)" }}>
          Fale Conosco: (11) 96160-5164
        </div>
      </div>
      <div className="flex gap-3 flex-shrink-0">
        {[{ num: "24h", label: "No ar todo dia" }, { num: "10k+", label: "Ouvintes/mes" }, { num: "100%", label: "Publico catolico" }].map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center px-3 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,168,75,0.3)", minWidth: "60px" }}>
            <span className="font-black" style={{ fontSize: "clamp(1rem,2vw,1.4rem)", color: "#d4af37" }}>{s.num}</span>
            <span className="text-white/50 mt-0.5" style={{ fontSize: "clamp(.48rem,.72vw,.62rem)" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </a>
);

const banners = [
  { id: 1, component: <BannerAnuncieAqui /> },
];

const PatrocinadoresCarousel = () => {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(c => (c + 1) % banners.length), []);
  const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);
  useEffect(() => {
    const t = setInterval(next, 12000);
    return () => clearInterval(t);
  }, [next]);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patrocinadores</p>
        <div className="flex gap-1.5">
          <button onClick={prev} className="p-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={next} className="p-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="w-full rounded-xl overflow-hidden" style={{ minHeight: "clamp(200px,30vw,350px)" }}>
        {banners[current].component}
      </div>
      <div className="flex justify-center gap-1.5 mt-2">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};

export default PatrocinadoresCarousel;
