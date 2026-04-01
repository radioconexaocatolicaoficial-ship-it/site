import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRssFeed } from "@/hooks/useRssFeed";

const VATICAN_RSS = "https://www.vaticannews.va/pt.rss.xml";
const FALLBACK_IMG = "https://www.vaticannews.va/content/dam/vaticannews/multimedia/2022/03/07/Senza-titolo-12.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg";

const FALLBACK_ITEMS = [
  { 
    title: "Papa Francisco: A oração nos ajuda a amar os outros", 
    link: "https://www.vaticannews.va/pt.html", 
    description: "Na Audiência Geral, o Santo Padre refletiu sobre a importância da oração contínua e como ela nos aproxima de Deus e do próximo na jornada diária.", 
    thumbnail: FALLBACK_IMG 
  },
  { 
    title: "Sínodo sobre a Sinodalidade: Novas diretrizes publicadas", 
    link: "https://www.vaticannews.va/pt.html", 
    description: "O documento de trabalho para a próxima fase do Sínodo foi liberado, enfatizando uma Igreja mais acolhedora, com maior escuta às bases da comunidade local.", 
    thumbnail: "https://www.vaticannews.va/content/dam/vaticannews/multimedia/2023/10/04/Senza-titolo-12.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg" 
  },
  { 
    title: "Vaticano anuncia novo plano de sustentabilidade", 
    link: "https://www.vaticannews.va/pt.html", 
    description: "Alinhado à encíclica Laudato si', o Estado da Cidade do Vaticano estabelece metas ambiciosas para reduzir as emissões de carbono nos próximos cinco anos.", 
    thumbnail: "https://www.vaticannews.va/content/dam/vaticannews/multimedia/2021/05/24/Senza-titolo-12.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg" 
  }
];

const VaticanNewsCarousel = () => {
  const [index, setIndex] = useState(0);
  const { items, loading, error } = useRssFeed(VATICAN_RSS, 8);

  const displayItems = items.length > 0 ? items : FALLBACK_ITEMS;
  const max = Math.max(0, displayItems.length - 2);

  const prev = () => setIndex((i) => (i === 0 ? max : i - 1));
  const next = () => setIndex((i) => (i + 2 >= displayItems.length ? 0 : i + 1));

  const visible = displayItems.slice(index, index + 2);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Vatican News — Notícias</h2>
        <div className="flex gap-2">
          <button onClick={prev} className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && items.length === 0 && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden flex flex-col animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(!loading || items.length > 0) && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((item, i) => (
            <a key={index + i} href={item.link} target="_blank" rel="noopener noreferrer"
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={item.thumbnail || FALLBACK_IMG}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-3">{item.title}</h3>
                <p className="text-xs text-muted-foreground flex-1 line-clamp-6">{item.description}</p>
                <span className="mt-3 text-xs font-semibold text-primary">LER NOTÍCIA →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};


export default VaticanNewsCarousel;
