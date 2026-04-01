import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { lojaProdutos, type LojaProduto } from "@/data/lojaProdutos";
import LojaProdutoDialog from "@/components/LojaProdutoDialog";

/**
 * Faixa horizontal: ~2 produtos visíveis por vez (largura da coluna), rolagem para os demais.
 */
const LojaProdutosScroller = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<LojaProduto | null>(null);

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-loja-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.52;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-foreground">Produtos da loja</h2>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Ver produtos anteriores"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Ver mais produtos"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex-1 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {lojaProdutos.map((p) => (
          <article
            key={p.id}
            data-loja-card
            role="button"
            tabIndex={0}
            onClick={() => setSelected(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(p);
              }
            }}
            className="flex-none w-[calc(50%-0.5rem)] min-w-[min(100%,240px)] snap-start bg-card rounded-xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
          >
            <div
              className={cn(
                "relative aspect-video overflow-hidden shrink-0",
                p.imgLightBg && "bg-white",
              )}
            >
              <img
                src={p.img}
                alt={p.nome}
                className={cn(
                  "w-full h-full",
                  p.imgLightBg ? "object-contain p-2" : "object-cover",
                )}
                loading="lazy"
              />
            </div>
            <div className="p-3 flex flex-col flex-1 min-h-0">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-2 mb-1">
                {p.nome}
              </h3>
              <p className="text-sm font-bold text-primary mb-1">{p.preco}</p>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-auto">
                <MousePointerClick className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
                <span>Toque para ver</span>
              </p>
            </div>
          </article>
        ))}
      </div>

      <LojaProdutoDialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        produto={selected}
      />
    </div>
  );
};

export default LojaProdutosScroller;
