import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRssFeed, RssItem } from "@/hooks/useRssFeed";

const FEED = "https://www.radiosantaritadecassia.com.br/feed";

const fallback: RssItem[] = [
  { img: "https://websitenoar.net/contents/384/avatar/xm83746a1b5356b37fc8f94fbdda2e5e33_384_1760103291.png", title: "Bem-vindo à Rádio Santa Rita de Cássia", desc: "A rádio católica que transmite fé, esperança e amor 24 horas por dia.", link: "https://www.radiosantaritadecassia.com.br/" },
  { img: "https://websitenoar.net/contents/384/slider/user_2125955352.jpg", title: "Confira a programação completa da rádio", desc: "Missas, terços, programas de evangelização e muito mais.", link: "https://www.radiosantaritadecassia.com.br/programacao" },
];

const SkeletonCard = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
    <div className="aspect-video bg-muted animate-pulse" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-muted rounded animate-pulse" />
      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
    </div>
  </div>
);

const RadioSantaRitaCarousel = () => {
  const { items, loading } = useRssFeed(FEED, fallback);
  const [index, setIndex] = useState(0);
  const VISIBLE = 2;
  const max = Math.max(0, items.length - VISIBLE);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(max, i + 1));
  const visible = items.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Rádio Santa Rita de Cássia</h2>
        <div className="flex gap-2">
          <button onClick={prev} disabled={index === 0} className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} disabled={index >= max} className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading
          ? [0, 1].map(i => <SkeletonCard key={i} />)
          : visible.map((item, i) => (
            <a key={index + i} href={item.link} target="_blank" rel="noopener noreferrer"
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="aspect-video overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground flex-1 line-clamp-3">{item.desc}</p>
                <span className="mt-3 text-xs font-semibold text-primary">LER NOTÍCIA →</span>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
};

export default RadioSantaRitaCarousel;
