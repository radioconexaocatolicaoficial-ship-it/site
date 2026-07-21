import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RadioItem {
  title: string;
  img: string;
  link: string;
  desc: string;
  category?: string;
}

const BASE = "https://www.radiosantaritadecassia.com.br";
const SPORTS_FEED = "https://www.espn.com.br/rss/";

const FALLBACK: RadioItem[] = [
  { 
    img: "https://websitenoar.net/contents/384/slider/user_2478937.jpg", 
    title: "Bem-vindo à Rádio Santa Rita de Cássia", 
    desc: "A Rádio Santa Rita de Cássia é a voz católica da Zona Leste de São Paulo, transmitindo fé, esperança e amor 24 horas por dia.", 
    link: BASE,
    category: "Rádio"
  },
  { 
    img: "https://websitenoar.net/contents/384/slider/user_2125955352.jpg", 
    title: "Confira a programação completa da rádio", 
    desc: "Nossa grade de programação é repleta de momentos especiais: Santa Missa pelas Almas com Padre PH, terço diário, programas de evangelização.", 
    link: `${BASE}/programacao`,
    category: "Rádio"
  },
  { 
    img: "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Santa_Rita_de_Cassia.jpg/640px-Santa_Rita_de_Cassia.jpg&w=600&h=338&fit=cover&output=jpg", 
    title: "Festa de Santa Rita de Cássia — Padroeira da Rádio", 
    desc: "Santa Rita de Cássia, conhecida como a santa dos impossíveis, é a padroeira da nossa rádio e fonte de inspiração para toda a equipe.", 
    link: BASE,
    category: "Rádio"
  },
  { 
    img: "https://websitenoar.net/contents/384/avatar/xm83746a1b5356b37fc8f94fbdda2e5e33_384_1760103291.png", 
    title: "Ouça ao vivo e participe da nossa comunidade", 
    desc: "Você pode ouvir a Rádio Santa Rita de Cássia pelo site, pelo aplicativo no Android ou pelo seu tocador de áudio favorito.", 
    link: BASE,
    category: "Rádio"
  },
  {
    img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop",
    title: "Esportes: Acompanhe as principais notícias",
    desc: "Fique por dentro dos principais acontecimentos do mundo esportivo: futebol, basquete, vôlei e muito mais.",
    link: "https://www.espn.com.br/",
    category: "Esportes"
  },
  {
    img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop",
    title: "Futebol: Resultados e classificação",
    desc: "Confira os últimos jogos do Campeonato Brasileiro, Libertadores e principais competições nacionais e internacionais.",
    link: "https://www.espn.com.br/futebol/",
    category: "Esportes"
  },
];

function parseRadio(html: string): RadioItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items: RadioItem[] = [];

  doc.querySelectorAll(".post-item, .card, article, .splide__slide").forEach((el) => {
    const titleEl = el.querySelector("h2, h3, .name, .title, .card-title");
    const imgEl = el.querySelector("img");
    const linkEl = el.querySelector("a[href]");
    const descEl = el.querySelector("p, .desc, .card-text");

    const title = titleEl?.textContent?.trim() ?? "";
    const rawImg = imgEl?.getAttribute("src") ?? imgEl?.getAttribute("data-src") ?? "";
    const img = rawImg.startsWith("http") ? rawImg : rawImg ? BASE + rawImg : "";
    const href = linkEl?.getAttribute("href") ?? "";
    const link = href.startsWith("http") ? href : href ? BASE + href : BASE;
    const desc = descEl?.textContent?.replace(/<[^>]+>/g, "").trim().slice(0, 280) ?? "";

    if (title && img) items.push({ title, img, link, desc, category: "Rádio" });
  });

  return items.slice(0, 4); // Limita a 4 para deixar espaço para esportes
}

async function fetchSportsNews(): Promise<RadioItem[]> {
  try {
    const RSS2JSON = "https://api.rss2json.com/v1/api.json";
    const res = await fetch(`${RSS2JSON}?rss_url=${encodeURIComponent(SPORTS_FEED)}`, {
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json();
    
    if (data.status === "ok" && data.items?.length > 0) {
      return data.items.slice(0, 2).map((item: any) => ({
        title: item.title?.trim() || "Notícia de Esportes",
        img: item.thumbnail || item.enclosure?.link || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop",
        link: item.link || "https://www.espn.com.br/",
        desc: item.description?.replace(/<[^>]+>/g, "").trim().slice(0, 280) || "Confira as últimas notícias do mundo esportivo.",
        category: "Esportes"
      }));
    }
  } catch (error) {
    console.warn("Erro ao buscar notícias de esportes:", error);
  }
  
  // Fallback de esportes
  return [
    {
      img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop",
      title: "Esportes: Acompanhe as principais notícias",
      desc: "Fique por dentro dos principais acontecimentos do mundo esportivo: futebol, basquete, vôlei e muito mais.",
      link: "https://www.espn.com.br/",
      category: "Esportes"
    },
    {
      img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop",
      title: "Futebol: Resultados e classificação",
      desc: "Confira os últimos jogos do Campeonato Brasileiro, Libertadores e principais competições nacionais e internacionais.",
      link: "https://www.espn.com.br/futebol/",
      category: "Esportes"
    }
  ];
}

const VISIBLE = 6; // 3 colunas x 2 linhas = 6 cards
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos

const RadioSantaRitaCarousel = () => {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<RadioItem[]>(() => {
    try {
      const cached = localStorage.getItem("radio_news_cache");
      return cached ? JSON.parse(cached) : FALLBACK;
    } catch {
      return FALLBACK;
    }
  });

  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      try {
        // Busca notícias da rádio
        const radioRes = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(BASE + "/posts")}`, {
          signal: AbortSignal.timeout(15000)
        });
        const radioHtml = await radioRes.text();
        const radioParsed = parseRadio(radioHtml);
        
        // Busca notícias de esportes
        const sportsNews = await fetchSportsNews();
        
        // Combina: 4 da rádio + 2 de esportes
        const combined = [...radioParsed, ...sportsNews];
        
        if (!cancelled && combined.length > 0) {
          setItems(combined);
          try {
            localStorage.setItem("radio_news_cache", JSON.stringify(combined));
          } catch { /* ignora erro de storage */ }
        }
      } catch (error) {
        console.warn("Erro ao carregar notícias:", error);
        // Mantém fallback ou cache
      }
    };
    
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const max = Math.max(0, items.length - VISIBLE);
  const prev = () => setIndex((i) => Math.max(0, i - VISIBLE));
  const next = () => setIndex((i) => Math.min(max, i + VISIBLE));
  const visible = items.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Rádio Santa Rita & Esportes</h2>
        <div className="flex gap-2">
          <button onClick={prev} disabled={index === 0}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} disabled={index >= max}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Próxima página">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((item, i) => (
          <a key={`${index}-${i}-${item.category}`} href={item.link} target="_blank" rel="noopener noreferrer"
            className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="aspect-video overflow-hidden bg-muted relative">
              {item.category && (
                <span className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-[10px] font-bold ${
                  item.category === "Esportes" 
                    ? "bg-green-500 text-white" 
                    : "bg-blue-500 text-white"
                }`}>
                  {item.category}
                </span>
              )}
              <img src={item.img} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => { 
                  const img = e.target as HTMLImageElement;
                  img.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop";
                }} />
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
