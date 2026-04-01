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

  // Busca imagem e descricao de cada artigo em paralelo (max 4)
  const top = links.slice(0, 4);
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

  const main = news[0];
  const secondary = news.slice(1, 3);
  const bullets = news.slice(3, 5);

  return (
    <div className="w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* Coluna esquerda — título grande */}
          <div className="md:col-span-5 md:border-r border-border md:pr-6">
            {loading || !main ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-10 bg-muted rounded w-full" />
                <div className="h-10 bg-muted rounded w-4/5" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ) : (
              <a href={main.link} target="_blank" rel="noopener noreferrer" className="group block">
                {main.category && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                    {main.category}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-primary leading-tight group-hover:opacity-80 transition-opacity mb-3">
                  {main.title}
                </h1>
                {main.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 mb-4">
                    {main.description}
                  </p>
                )}
                {bullets.length > 0 && (
                  <ul className="space-y-2 border-t border-border pt-3">
                    {bullets.map((n, i) => (
                      <li key={i}>
                        <a href={n.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <span className="text-primary mt-0.5 flex-shrink-0 font-bold">•</span>
                          <span className="line-clamp-2">{n.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </a>
            )}
          </div>

          {/* Coluna direita — 2 cards com imagem */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading
              ? [0, 1].map(i => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="aspect-video bg-muted rounded-lg" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))
              : secondary.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col gap-2">
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                      {item.thumbnail
                        ? <img src={item.thumbnail} alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="eager"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        : <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-primary text-2xl font-black opacity-30">CN</span>
                          </div>
                      }
                    </div>
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.category}</span>
                    )}
                    <h3 className="text-sm font-bold text-primary leading-snug group-hover:underline line-clamp-3">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
                    )}
                  </a>
                ))
            }
          </div>

        </div>

        <div className="mt-4 pt-2 border-t border-border flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Fonte: Canção Nova São Paulo
          </span>
          <a href="https://saopaulo.cancaonova.com/" target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline font-semibold uppercase tracking-widest">
            Ver todas as notícias →
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroNews;
