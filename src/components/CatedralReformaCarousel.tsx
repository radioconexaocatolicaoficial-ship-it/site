import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import reforma1 from "@/assets/catedral-reforma/reforma-1.jpg";
import reforma2 from "@/assets/catedral-reforma/reforma-2.jpg";
import reforma3 from "@/assets/catedral-reforma/reforma-3.jpg";

const POST_URL = "https://www.instagram.com/p/DXuihOskRt0/?hl=pt";

const IMAGES = [
  { src: reforma1, alt: "Reforma e pintura da Catedral — imagem 1" },
  { src: reforma2, alt: "Reforma e pintura da Catedral — imagem 2" },
  { src: reforma3, alt: "Reforma e pintura da Catedral — imagem 3" },
] as const;

type Props = {
  /** Preenche a altura do container pai (alinhar com a coluna da campanha). */
  fillHeight?: boolean;
};

/**
 * Carrossel das imagens do post Instagram da campanha de reforma.
 * https://www.instagram.com/p/DXuihOskRt0/
 */
const CatedralReformaCarousel = ({ fillHeight = false }: Props) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % IMAGES.length),
    [],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + IMAGES.length) % IMAGES.length),
    [],
  );

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div
      className={`rounded-xl border border-border bg-card overflow-hidden ${
        fillHeight ? "h-full flex flex-col" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
          Campanha da reforma
        </p>
        <a
          href={POST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline shrink-0"
        >
          Ver no Instagram
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div
        className={`relative bg-muted ${
          fillHeight ? "flex-1 min-h-[280px]" : "aspect-[4/5]"
        }`}
      >
        {IMAGES.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === current ? "opacity-100 z-[1]" : "opacity-0 z-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        <button
          type="button"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="h-7 w-7" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="h-7 w-7" strokeWidth={1.75} />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/45"
              }`}
              aria-label={`Ir para imagem ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatedralReformaCarousel;
