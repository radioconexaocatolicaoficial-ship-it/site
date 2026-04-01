import { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  thumbnail: string;
  category: string;
}

const PROXY = (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

function decodeHtml(text: string): string {
  return text
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '...').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .replace(/<[^>]+>/g, '').trim();
}

function extractImg(html: string): string {
  const match = html.match(/src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
  return match ? match[1].split('?')[0] : "";
}

async function fetchArticle(url: string): Promise<{ thumbnail: string; description: string }> {
  try {
    const res = await fetch(PROXY(url), { signal: AbortSignal.timeout(6000) });
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Imagem: og:image ou primeira imagem do conteúdo
    const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";
    const contentImg = extractImg(doc.querySelector(".entry-content, .post-content, article")?.innerHTML ?? "");
    const thumbnail = ogImg || contentImg;

    // Descrição: og:description ou primeiro parágrafo
    const ogDesc = doc.querySelector('meta[property="og:description"], meta[name="description"]')?.getAttribute("content") ?? "";
    const pDesc = doc.querySelector(".entry-content p, .post-content p")?.textContent ?? "";
    const description = decodeHtml(ogDesc || pDesc).slice(0, 200);

    return { thumbnail, description };
  } catch {
    return { thumbnail: "", description: "" };
  }
}

async function fetchNews(): Promise<NewsItem[]> {
  // Busca a pagina principal para pegar os links das noticias
  const res = await fetch(PROXY("https://saopaulo.cancaonova.com"), { signal: AbortSignal.timeout(8000) });
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const links: { title: string; link: string; category: string }[] = [];

  // Pega links da secao Mais Lidas
  doc.querySelectorAll("#siteorigin-panels-postloop-2 li a").forEach(el => {
    const title = decodeHtml(el.textContent ?? "");
    const href = (el as HTMLAnchorElement).getAttribute("href") ?? "";
    if (title.length > 10 && href.includes("cancaonova.com")) {
      links.push({ title, link: href, category: "Mais Lidas" });
    }
  });

  // Tambem pega do RSS para ter mais opcoes
  try {
    const rssRes = await fetch(PROXY("https://saopaulo.cancaonova.com/feed"), { signal: AbortSignal.timeout(6000) });
    const rssText = await rssRes.text();
    const xml = parser.parseFromString(rssText, "text/xml");
    xml.querySelectorAll("item").forEach(item => {
      const title = decodeHtml(item.querySelector("title")?.textContent ?? "");
      const link = item.querySelector("link")?.textContent?.trim() ?? "";
      const category = item.querySelector("category")?.textContent?.trim() ?? "Notícia";
      const encoded = item.getElementsByTagNameNS("*", "encoded")[0]?.textContent ?? "";
      if (title.length > 10 && encoded.length > 50 && !links.find(l => l.link === link)) {
        links.push({ title, link, category });
      }
    });
  } catch { /* ignora */ }

  // Busca imagem e descricao de cada artigo em paralelo (max 8)
  const top = links.slice(0, 8);
  const details = await Promise.allSettled(top.map(l => fetchArticle(l.link)));

  return top.map((l, i) => {
    const detail = details[i].status === "fulfilled" ? details[i].value : { thumbnail: "", description: "" };
    return { ...l, ...detail };
  });
}

const HeroNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews().then(setNews).catch(() => {}).finally(() => setLoading(false));
    const interval = setInterval(() => fetchNews().then(setNews).catch(() => {}), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // news[0] -> Destaque Direita
  // news[1..4] -> Cards Esquerda
  // news[5..7] -> Tópicos Direita
  const featured = news[0];
  const cards = news.slice(1, 5);
  const topics = news.slice(5, 8);

  return (
    <div className="w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

          {/* Coluna esquerda — Notícia Principal + 3 Tópicos */}
          <div className="md:col-span-7 flex flex-col gap-8 md:pr-10 md:border-r border-border/60">
            {loading || !featured ? (
              <div className="animate-pulse space-y-5">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-16 bg-muted rounded w-full" />
                <div className="h-6 bg-muted rounded w-4/5" />
                <div className="h-6 bg-muted rounded w-full mt-4" />
                <div className="h-20 bg-muted rounded w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <a href={featured.link} target="_blank" rel="noopener noreferrer" className="group block space-y-4">
                  {featured.category && (
                    <span className="inline-block px-2 py-1 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {featured.category}
                    </span>
                  )}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-[1.1] group-hover:translate-x-1 transition-transform duration-300">
                    {featured.title}
                  </h1>
                  {featured.description && (
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                      {featured.description}...
                    </p>
                  )}
                </a>

                {topics.length > 0 && (
                  <div className="pt-8 border-t border-border/80">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-6 block">
                      Principais Destaques
                    </span>
                    <ul className="grid grid-cols-1 gap-4">
                      {topics.map((n, i) => (
                        <li key={i} className="group/item">
                          <a href={n.link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                              {i + 1}
                            </span>
                            <span className="text-sm font-semibold text-primary/80 group-hover/item:text-primary transition-colors line-clamp-1">
                              {n.title}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna direita — 4 cards de notícias */}
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading || cards.length === 0
              ? [0, 1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="aspect-[4/3] bg-muted rounded-xl" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))
              : cards.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col gap-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-sm border border-border/50">
                      {item.thumbnail
                        ? <img src={item.thumbnail} alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        : <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <span className="text-primary text-xl font-black opacity-20 capitalize">{item.category?.[0] || 'CN'}</span>
                          </div>
                      }
                    </div>
                    <div>
                      {item.category && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 mb-1 block">
                          {item.category}
                        </span>
                      )}
                      <h3 className="text-xs md:text-sm font-bold text-primary/90 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </a>
                ))
            }
          </div>

        </div>

        <div className="mt-12 pt-4 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Fonte: Canção Nova São Paulo
            </span>
          </div>
          <a href="https://saopaulo.cancaonova.com/noticias/" target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-2 text-[10px] text-primary hover:text-primary/80 font-black uppercase tracking-widest transition-all">
            Ver todas as notícias
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroNews;
