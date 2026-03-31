import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRssFeed, RssItem } from "@/hooks/useRssFeed";

const FEED = "https://www.vaticannews.va/pt.rss.xml";

const fallback: RssItem[] = [
  { img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/srv/2026/03/18/2026-03-18-udienza-generale/1773834369056.JPG/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg", title: "Notícias do Vaticano", desc: "Acompanhe as últimas notícias do Vaticano e do Papa.", link: "https://www.vaticannews.va/pt.html" },
  { img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/ansa/2026/03/29/16/1774794997310.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg", title: "Vatican News em português", desc: "Notícias da Igreja Católica ao redor do mundo.", link: "https://www.vaticannews.va/pt.html" },
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

const VaticanNewsCarousel = () => {
  const { items, loading } = useRssFeed(FEED, fallback);
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const visible_count = isMobile ? 1 : 2;
  const max = Math.max(0, items.length - visible_count);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(max, i + 1));
  const visible = items.slice(index, index + visible_count);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Vatican News — Notícias</h2>
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

export default VaticanNewsCarousel;
