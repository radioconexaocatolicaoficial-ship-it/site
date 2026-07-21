import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DiocItem {
  title: string;
  img: string;
  link: string;
  desc: string;
  date?: string;
}

const BASE = "https://www.diocesesaomiguel.org.br";
const NEWS_PAGE = `${BASE}/index.php/noticias-2`;
const PROXY = (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

const FALLBACK: DiocItem[] = [
  { 
    img: `${BASE}/images/jubileu_5.jpg`, 
    title: "Bispos celebram 25 anos de ordenação episcopal", 
    desc: "Dom Manuel Parrado Carral e Dom Pedro Luís Stringhini celebram jubileu com missa presidida pelo Cardeal Dom Odilo Scherer na Paróquia do Divino Espírito Santo.", 
    link: BASE,
    date: "2025"
  },
  { 
    img: `${BASE}/images/Abertura_Camapanha_da_Fraternidade_2026_Daniel_Reis-3.JPG`, 
    title: "Diocese abre a Campanha da Fraternidade 2026", 
    desc: "Dom Algacir Munhak preside abertura com o tema \"Fraternidade e Moradia\", convocando a comunidade ao compromisso social e à dignidade habitacional na Zona Leste.", 
    link: BASE,
    date: "2026"
  },
  { 
    img: `${BASE}/images/cartaz_Caminhada.jpg`, 
    title: "42ª Caminhada da Ressurreição: tema \"Eu vi o Senhor\"", 
    desc: "Evento acontece na madrugada de 4 de abril, da Basílica da Penha até São Miguel Paulista. Inspirado no testemunho de Maria Madalena ao encontrar o Cristo vivo.", 
    link: "https://www.caminhadadaressurreicao.com/",
    date: "Abril 2026"
  },
  { 
    img: `${BASE}/images/vila_esperanca_2.jpg`, 
    title: "Oficina Bíblica reúne fiéis do Setor Pastoral Vila Esperança", 
    desc: "Prof. Dr. Matthias Grenzer conduz reflexão sobre o Salmo 72 com representantes das sete paróquias, reforçando a comunhão pastoral e a formação permanente.", 
    link: BASE,
    date: "2026"
  },
];

function normalizeUrl(url: string, base: string): string {
  if (!url) return base;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return base + url;
  return base + "/" + url;
}

function parseDiocese(html: string): DiocItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items: DiocItem[] = [];

  // Tenta múltiplos seletores para capturar diferentes estruturas
  const articles = doc.querySelectorAll(".blog-item, .item-article, article.item, .blog .items .item");
  
  articles.forEach((el) => {
    const titleEl = el.querySelector("h2, h3, .item-title, .article-title");
    const imgEl = el.querySelector("img");
    const linkEl = el.querySelector("a[href]");
    const descEl = el.querySelector(".item-intro p, .article-introtext p, .item-description, p");
    const dateEl = el.querySelector(".published, .create-date, time, .item-date");

    const title = titleEl?.textContent?.trim() ?? "";
    if (!title || title.length < 10) return; // Ignora títulos muito curtos
    
    const rawImg = imgEl?.getAttribute("src") || imgEl?.getAttribute("data-src") || "";
    const img = normalizeUrl(rawImg, BASE);
    
    const href = linkEl?.getAttribute("href") ?? "";
    const link = normalizeUrl(href, BASE);
    
    let desc = descEl?.textContent?.replace(/<[^>]+>/g, "").trim() ?? "";
    desc = desc.slice(0, 280);
    
    const date = dateEl?.textContent?.trim() ?? "";

    if (title && img && link) {
      items.push({ title, img, link, desc, date });
    }
  });

  // Se não encontrou nada, tenta uma abordagem mais genérica
  if (items.length === 0) {
    const allImages = doc.querySelectorAll("img");
    allImages.forEach((imgEl) => {
      const parent = imgEl.closest("article, .item, .blog-item");
      if (!parent) return;
      
      const titleEl = parent.querySelector("h2, h3, .title");
      const linkEl = parent.querySelector("a[href]");
      const descEl = parent.querySelector("p");
      
      const title = titleEl?.textContent?.trim() ?? "";
      if (!title || title.length < 10) return;
      
      const rawImg = imgEl.getAttribute("src") || imgEl.getAttribute("data-src") || "";
      const img = normalizeUrl(rawImg, BASE);
      
      const href = linkEl?.getAttribute("href") ?? "";
      const link = normalizeUrl(href, BASE);
      
      const desc = descEl?.textContent?.trim().slice(0, 280) ?? "";
      
      if (title && img && link && items.length < 8) {
        items.push({ title, img, link, desc });
      }
    });
  }

  return items.slice(0, 8);
}

const VISIBLE = 2;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos

const DioceseCarousel = () => {
  const [index, setIndex] = useState(0);
  const [news, setNews] = useState<DiocItem[]>(() => {
    // Tenta carregar do cache local
    try {
      const cached = localStorage.getItem("diocese_news_cache");
      return cached ? JSON.parse(cached) : FALLBACK;
    } catch {
      return FALLBACK;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      if (loading) return;
      setLoading(true);
      
      try {
        const res = await fetch(PROXY(NEWS_PAGE), { 
          signal: AbortSignal.timeout(15000) 
        });
        const html = await res.text();
        const parsed = parseDiocese(html);
        
        if (!cancelled && parsed.length > 0) {
          setNews(parsed);
          // Salva no cache
          try {
            localStorage.setItem("diocese_news_cache", JSON.stringify(parsed));
          } catch { /* ignora erro de storage */ }
        }
      } catch (error) {
        console.warn("Erro ao carregar notícias da Diocese:", error);
        // Mantém o fallback ou cache
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    
    return () => { 
      cancelled = true; 
      clearInterval(interval); 
    };
  }, []);

  const max = Math.max(0, news.length - VISIBLE);
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(max, i + 1));
  const visible = news.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Diocese de São Miguel Paulista</h2>
        <div className="flex gap-2">
          <button onClick={prev} disabled={index === 0}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Notícia anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} disabled={index >= max}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Próxima notícia">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((item, i) => (
          <a key={`${index}-${i}-${item.title.slice(0, 20)}`} href={item.link} target="_blank" rel="noopener noreferrer"
            className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="aspect-video overflow-hidden bg-muted relative">
              <img src={item.img} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => { 
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const parent = img.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">Imagem indisponível</div>';
                  }
                }} />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-3">{item.title}</h3>
              {item.desc && (
                <p className="text-xs text-muted-foreground flex-1 line-clamp-4 mb-2">{item.desc}</p>
              )}
              {item.date && (
                <p className="text-[10px] text-muted-foreground/70 mb-2">{item.date}</p>
              )}
              <span className="mt-auto text-xs font-semibold text-primary">LER NOTÍCIA →</span>
            </div>
          </a>
        ))}
      </div>
      {loading && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Atualizando notícias...
        </div>
      )}
    </div>
  );
};

export default DioceseCarousel;
