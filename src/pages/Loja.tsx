import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Layout from "@/components/Layout";
import LojaProdutoDialog from "@/components/LojaProdutoDialog";
import CountdownCard from "@/components/CountdownCard";
import LiturgiaWidget from "@/components/LiturgiaWidget";
import PedidoMusica from "@/components/PedidoMusica";
import {
  lojaBannerProdutos,
  lojaCategorias,
  lojaProdutos,
  whatsappLojaLink,
  type LojaProduto,
} from "@/data/lojaProdutos";
import lojaBanner from "@/assets/loja-artigos-catolicos.jpg";

const AUTO_MS = 5000;

const Loja = () => {
  const [cat, setCat] = useState("Todos");
  const [modalProduto, setModalProduto] = useState<LojaProduto | null>(null);
  const [slide, setSlide] = useState(0);

  const filtrados = cat === "Todos" ? lojaProdutos : lojaProdutos.filter((p) => p.categoria === cat);
  const total = lojaBannerProdutos.length;
  const atual = lojaBannerProdutos[slide] ?? lojaBannerProdutos[0];

  useEffect(() => {
    if (total < 2) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % total), AUTO_MS);
    return () => window.clearInterval(id);
  }, [total]);

  const prev = () => setSlide((s) => (s - 1 + total) % total);
  const next = () => setSlide((s) => (s + 1) % total);

  return (
    <Layout>
      {/* Banner: loja religiosa + carrossel PNG (produto | descrição/preço) */}
      <section className="relative overflow-hidden h-[300px] sm:h-[340px] md:h-[380px] bg-[#051230]">
        <img
          src={lojaBanner}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,18,48,0.55) 0%, rgba(10,32,96,0.72) 45%, rgba(5,18,48,0.88) 100%)",
          }}
        />

        {atual ? (
          <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <button
              type="button"
              onClick={prev}
              aria-label="Produto anterior"
              className="absolute left-2 sm:left-4 z-20 h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-sm hover:bg-black/40 transition flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo produto"
              className="absolute right-2 sm:right-4 z-20 h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-sm hover:bg-black/40 transition flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              key={atual.id}
              className="w-full grid grid-cols-2 gap-2 sm:gap-6 md:gap-8 items-center px-8 sm:px-12 animate-in fade-in duration-500"
            >
              <div className="flex items-center justify-center md:justify-end h-[180px] sm:h-[220px] md:h-[280px]">
                <img
                  src={atual.imgPng}
                  alt={atual.nome}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
                />
              </div>

              <div className="text-left text-white">
                <p className="text-[9px] sm:text-[11px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] uppercase text-yellow-400/90 mb-1 sm:mb-2">
                  Loja Oficial · {atual.categoria}
                </p>
                <h1 className="text-base sm:text-2xl md:text-3xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] line-clamp-2">
                  {atual.nome}
                </h1>
                <p className="mt-1.5 sm:mt-2 text-white/80 text-[11px] sm:text-sm md:text-base max-w-md line-clamp-2 sm:line-clamp-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  {atual.desc}
                </p>
                <div className="mt-2.5 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span
                    className={`text-base sm:text-xl md:text-2xl font-black ${
                      atual.preco === "Orçamento" ? "text-white/90" : "text-yellow-400"
                    }`}
                  >
                    {atual.preco === "Orçamento" ? "Sob orçamento" : atual.preco}
                  </span>
                  <a
                    href={whatsappLojaLink(atual.nome, atual.preco)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-bold transition hover:brightness-110"
                    style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Comprar
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {total > 1 ? (
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
            {lojaBannerProdutos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Ir para ${p.nome}`}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? "w-6 bg-yellow-400" : "w-1.5 bg-white/45 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* Duas colunas: produtos | cards laterais */}
      <section
        id="produtos-loja"
        className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,29.3%)] gap-6 lg:gap-8 items-start">
          {/* Esquerda — 3 produtos por linha */}
          <div>
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              {lojaCategorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    cat === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {filtrados.map((produto) => (
                <div
                  key={produto.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setModalProduto(produto)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setModalProduto(produto);
                    }
                  }}
                  className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
                >
                  <div className="aspect-square overflow-hidden bg-transparent flex items-center justify-center p-3">
                    <img
                      src={produto.imgPng ?? produto.img}
                      alt={produto.nome}
                      className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary opacity-70 mb-1">
                      {produto.categoria}
                    </span>
                    <h3 className="font-semibold text-sm text-foreground leading-snug mb-1">
                      {produto.nome}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{produto.desc}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                      <span
                        className={`text-base font-bold ${
                          produto.preco === "Orçamento"
                            ? "text-muted-foreground text-sm"
                            : "text-primary"
                        }`}
                      >
                        {produto.preco === "Orçamento" ? "Sob orçamento" : produto.preco}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direita — Abraça São Paulo, Liturgia, Pedido de Música (−4% da largura) */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <CountdownCard />
            <LiturgiaWidget />
            <PedidoMusica />
          </aside>
        </div>
      </section>

      <LojaProdutoDialog
        open={modalProduto !== null}
        onOpenChange={(open) => !open && setModalProduto(null)}
        produto={modalProduto}
      />
    </Layout>
  );
};

export default Loja;
