import { useState, useEffect } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Video { id: string; title: string; date: string; }

const CHANNEL_ID = "UCi33qNAezaFd0-TIC211CHA";
const CHANNEL_URL = "https://www.youtube.com/@radioconexaocatolicaofical";
const RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

function formatDate(str: string) {
  const d = new Date(str);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function parseXML(xml: string): Video[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(doc.querySelectorAll("entry")).map(e => {
    let id = e.querySelector("videoId")?.textContent || "";
    if (!id) { const m = (e.querySelector("link")?.getAttribute("href") || "").match(/v=([^&]+)/); if (m) id = m[1]; }
    return { id, title: e.querySelector("title")?.textContent || "", date: formatDate(e.querySelector("published")?.textContent || "") };
  }).filter(v => v.id);
}

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="aspect-video bg-muted animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-muted rounded animate-pulse" />
      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
    </div>
  </div>
);

const CACHE_KEY = "rcc_youtube_cache";

const YouTubeVideos = () => {
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try { return !localStorage.getItem(CACHE_KEY); }
    catch { return true; }
  });
  const [modal, setModal] = useState<Video | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(prev => prev);
      for (const proxy of PROXIES) {
        try {
          const res = await fetch(proxy(RSS), { signal: AbortSignal.timeout(10000) });
          if (!res.ok) continue;
          const text = res.url.includes("allorigins") ? (await res.json()).contents : await res.text();
          const parsed = parseXML(text);
          if (parsed.length && !cancelled) {
            setVideos(parsed);
            setLoading(false);
            try { localStorage.setItem(CACHE_KEY, JSON.stringify(parsed)); } catch {}
            return;
          }
        } catch { /* try next */ }
      }
      if (!cancelled) setLoading(false);
    };
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);


  const openModal = (v: Video) => { setModal(v); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setModal(null); document.body.style.overflow = ""; };

  const VISIBLE = 3;
  const max = Math.max(0, videos.length - VISIBLE);
  const visible = videos.slice(index, index + VISIBLE);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-foreground">Nossos Vídeos</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setIndex(i => Math.min(max, i + 1))} disabled={index >= max}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <a href={`${CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-85 ml-1 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#1a5fa8,#4a9fd4)" }}>
            <svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
            </svg>
            Ver Canal
          </a>
        </div>
      </div>

      {/* Grid — 3 por vez */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : visible.map((v, i) => (
            <button key={i} onClick={() => openModal(v)}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col"
              style={{ borderTop: "3px solid #f5c518" }}>
              <div className="relative aspect-video overflow-hidden bg-primary/10">
                <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)" }}>
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="text-sm font-bold text-primary line-clamp-2 leading-snug">{v.title}</p>
                <span className="text-xs mt-auto" style={{ color: "#4a9fd4", fontWeight: 600 }}>{v.date}</span>
              </div>
            </button>
          ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={closeModal}>
          <div className="relative bg-card rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl border border-border mx-2"
            onClick={e => e.stopPropagation()}>

            {/* Botão fechar */}
            <button onClick={closeModal}
              className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#e53935,#c62828)" }}>
              <X className="w-4 h-4" />
            </button>

            {/* Iframe */}
            <div className="bg-black rounded-t-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${modal.id}?autoplay=1&rel=0`}
                title={modal.title}
                className="w-full aspect-video block border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col gap-3">
              <h3 className="font-bold text-base text-primary leading-snug">{modal.title}</h3>
              <span className="text-xs font-semibold" style={{ color: "#4a9fd4" }}>{modal.date}</span>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <a href={`${CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#ff0000,#cc0000)", boxShadow: "0 4px 14px rgba(255,0,0,0.3)" }}>
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
                  </svg>
                  Inscrever-se no Canal
                </a>
                <a href={`https://www.youtube.com/watch?v=${modal.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#1a5fa8,#4a9fd4)", boxShadow: "0 4px 14px rgba(26,95,168,0.25)" }}>
                  Assistir no YouTube ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideos;
