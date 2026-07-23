import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { lojaProdutos, type LojaProduto } from "@/data/lojaProdutos";
import LojaProdutoDialog from "@/components/LojaProdutoDialog";

const VISIBLE = 3;

/**
 * Carrossel compacto: 3 produtos visíveis, preenche o espaço restante
 * abaixo do card da loja sem estourar a altura da coluna.
 */
const SobreProdutosCarousel = () => {
  const [start, setStart] = useState(0);
  const [selected, setSelected] = useState<LojaProduto | null>(null);
  const total = lojaProdutos.length;
  const maxStart = Math.max(0, total - VISIBLE);

  const prev = () => setStart((s) => (s <= 0 ? maxStart : s - 1));
  const next = () => setStart((s) => (s >= maxStart ? 0 : s + 1));

  const visible = lojaProdutos.slice(start, start + VISIBLE);

  return (
    <div className="flex-1 min-h-[140px] md:min-h-0 flex flex-col overflow-hidden rounded-xl bg-muted/40">
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
          Produtos
        </p>
        <div className="flex gap-0.5 shrink-0">
          <button
            type="button"
            onClick={prev}
            className="p-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Produtos anteriores"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="p-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Próximos produtos"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-1.5 p-1.5">
        {visible.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p)}
            className="min-w-0 h-full min-h-0 flex flex-col rounded-lg overflow-hidden bg-background hover:shadow-sm transition-shadow text-left"
          >
            <div
              className={cn(
                "relative flex-1 min-h-0 overflow-hidden",
                p.imgLightBg && "bg-white",
              )}
            >
              <img
                src={p.img}
                alt={p.nome}
                className={cn(
                  "absolute inset-0 w-full h-full",
                  p.imgLightBg ? "object-contain p-1" : "object-cover",
                )}
                loading="lazy"
              />
            </div>
            <div className="px-1 py-1 shrink-0 border-t border-border/60">
              <p className="text-[9px] font-semibold text-foreground leading-tight line-clamp-2">
                {p.nome}
              </p>
              <p className="text-[9px] font-bold text-primary mt-0.5 truncate">{p.preco}</p>
            </div>
          </button>
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

export default SobreProdutosCarousel;
