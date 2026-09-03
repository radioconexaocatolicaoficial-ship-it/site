import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ShoppingCart, Store } from "lucide-react";
import { lojaProdutos, type LojaProduto } from "@/data/lojaProdutos";
import LojaProdutoDialog from "@/components/LojaProdutoDialog";

const AUTO_MS = 4200;

const LojaCard = () => {
  const [selected, setSelected] = useState<LojaProduto | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 28,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || paused) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), AUTO_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, paused]);

  return (
    <div className="h-full min-h-[280px] lg:min-h-[380px] rounded-xl overflow-hidden gradient-primary text-primary-foreground p-4 md:p-5 flex flex-col relative">
      <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
        <Store className="h-24 w-24" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase opacity-80">Rádio Conexão Católica</p>
          <h2 className="text-xl md:text-2xl font-extrabold mt-1 leading-tight">Loja virtual</h2>
          <p className="text-xs mt-2 opacity-90 leading-relaxed">
            Camisetas, terços e acessórios oficiais.
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="p-1.5 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/30 transition-colors"
            aria-label="Produto anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="p-1.5 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/30 transition-colors"
            aria-label="Próximo produto"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="relative z-10 flex-1 min-h-0 mt-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {lojaProdutos.map((p) => (
              <article
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(p);
                  }
                }}
                className="flex-[0_0_100%] min-w-0 h-full px-0.5"
              >
                <div className="h-full rounded-xl bg-white text-foreground flex flex-col overflow-hidden shadow-md">
                  <div className="flex items-center justify-between px-3 pt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      {p.categoria}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">Toque para ver</span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-2">
                    <img
                      src={p.img}
                      alt={p.nome}
                      className="max-h-full max-w-full object-contain object-center"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-3 pb-3 text-center">
                    <h3 className="text-[13px] font-bold leading-snug line-clamp-2">{p.nome}</h3>
                    <p className="mt-1 text-base font-extrabold text-primary">{p.preco}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center gap-1.5 mt-2.5">
        {lojaProdutos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-accent" : "w-1.5 bg-primary-foreground/35 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Ver ${p.nome}`}
          />
        ))}
      </div>

      <Link
        to="/loja"
        className="relative z-10 mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all"
      >
        <ShoppingCart className="h-4 w-4 shrink-0" />
        Ver loja completa
      </Link>

      <LojaProdutoDialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        produto={selected}
      />
    </div>
  );
};

export default LojaCard;
