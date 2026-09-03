import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRssFeed } from "@/hooks/useRssFeed";

const VATICAN_RSS = "https://www.vaticannews.va/pt.rss.xml";
const FALLBACK_IMG = "https://www.vaticannews.va/content/dam/vaticannews/multimedia/2022/03/07/Senza-titolo-12.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg";

const FALLBACK_ITEMS = [
  {
    title: "Papa Francisco: A oração nos ajuda a amar os outros",
    link: "https://www.vaticannews.va/pt.html",
    description:
      "Na Audiência Geral, o Santo Padre refletiu sobre a importância da oração contínua e como ela nos aproxima de Deus e do próximo na jornada diária.",
    thumbnail: FALLBACK_IMG,
  },
  {
    title: "Sínodo sobre a Sinodalidade: Novas diretrizes publicadas",
    link: "https://www.vaticannews.va/pt.html",
    description:
      "O documento de trabalho para a próxima fase do Sínodo foi liberado, enfatizando uma Igreja mais acolhedora, com maior escuta às bases da comunidade local.",
    thumbnail:
      "https://www.vaticannews.va/content/dam/vaticannews/multimedia/2023/10/04/Senza-titolo-12.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
  },
  {
    title: "Vaticano anuncia novo plano de sustentabilidade",
    link: "https://www.vaticannews.va/pt.html",
    description:
      "Alinhado à encíclica Laudato si', o Estado da Cidade do Vaticano estabelece metas ambiciosas para reduzir as emissões de carbono nos próximos cinco anos.",
    thumbnail:
      "https://www.vaticannews.va/content/dam/vaticannews/multimedia/2021/05/24/Senza-titolo-12.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
  },
  {
    title: "Papa: a esperança cristã é um caminho de paz",
    link: "https://www.vaticannews.va/pt.html",
    description:
      "Na oração do Ângelus, o Santo Padre convidou os fiéis a serem construtores de paz nas famílias e nas comunidades.",
    thumbnail: FALLBACK_IMG,
  },
];

type Props = {
  /** Quantidade de cards visíveis por vez (padrão: 4 — duas linhas de dois) */
  visibleCount?: number;
};

const VaticanNewsCarousel = ({ visibleCount = 4 }: Props) => {
  const [index, setIndex] = useState(0);
  const { items, loading } = useRssFeed(VATICAN_RSS, 12);

  const displayItems = items.length > 0 ? items : FALLBACK_ITEMS;
  const step = Math.max(1, visibleCount);
  const max = Math.max(0, displayItems.length - step);

  const prev = () => setIndex((i) => (i === 0 ? max : Math.max(0, i - step)));
  const next = () =>
    setIndex((i) => (i + step >= displayItems.length ? 0 : Math.min(max, i + step)));

  const visible = displayItems.slice(index, index + step);
  const gridClass = "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Vatican News — Notícias</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && items.length === 0 && (
        <div className={`flex-1 min-h-0 grid ${gridClass} gap-3 auto-rows-fr`}>
          {Array.from({ length: step }).map((_, i) => (
            <div
              key={i}
              className="h-full bg-card rounded-xl border border-border overflow-hidden flex flex-col animate-pulse"
            >
              <div className="aspect-[16/8] bg-muted shrink-0" />
              <div className="p-2.5 flex flex-col gap-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(!loading || items.length > 0) && (
        <div className={`flex-1 min-h-0 grid ${gridClass} gap-3 auto-rows-fr`}>
          {visible.map((item, i) => (
            <a
              key={`${index}-${i}-${item.link}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group h-full min-h-0 bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-[16/8] overflow-hidden bg-muted shrink-0">
                <img
                  src={item.thumbnail || FALLBACK_IMG}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
              </div>
              <div className="p-2.5 flex-1 flex flex-col min-h-0">
                <h3 className="font-semibold text-[13px] text-foreground leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 flex-1">
                  {item.description}
                </p>
                <span className="mt-1.5 text-[11px] font-semibold text-primary">LER NOTÍCIA →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaticanNewsCarousel;
