import { useState, useEffect, useCallback } from "react";
import "./NewsFeedStrict.css";

const RSS2JSON = "https://api.rss2json.com/v1/api.json";

const FEED_CANCAO_NOVA = "https://saopaulo.cancaonova.com/noticias/feed/";
const FEED_CAMINHADA = "https://www.caminhadadaressurreicao.com/blog-feed.xml";
const FEED_SANTA_RITA = "https://www.radiosantaritadecassia.com.br/feed";
const FEED_YOUTUBE_PADRE_PH =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UC1F-NuywrrTYVUq370yR9WQ";

const CAMINHADA_SITE = "https://www.caminhadadaressurreicao.com/";
const HIGHLIGHT_CAMINHADA_TITLE =
  'Vem aí a Caminhada da Ressurreição 2026 "Eu vi o Senhor"';
const HIGHLIGHT_CAMINHADA_BADGE = "CAMINHADA DA RESSURREIÇÃO";

/** Texto integral no DOM; o CSS limita linhas visíveis */
const CAMINHADA_HIGHLIGHT_DESCRIPTION =
  'Com o tema "Eu vi o Senhor", em 2026 teremos a 42ª Caminhada da Ressurreição. A Caminhada da Ressurreição é um evento tradicional e de grande significado para a cidade de São Paulo, realizado anualmente desde 1984, sempre no Sábado de Aleluia, véspera do Domingo de Páscoa, pela Diocese de São Miguel Paulista. O evento tem início à noite, por volta das 23h, com milhares de fiéis reunidos na Basílica e Santuário Eucarístico Nossa Senhora da Penha, na Rua Santo Afonso, 199, Penha. ' +
  "Após a bênção de Dom Algacir Munhak, Bispo Diocesano, o percurso tem início, já na madrugada, por volta da meia-noite. São 13 quilômetros de caminhada pelas ruas dos bairros da zona leste de São Paulo, que duram aproximadamente seis horas. A caminhada é marcada pela oração, pela fé, e pelo entusiasmo dos participantes, acompanhados pelo som animado das bandas católicas. O objetivo de todos é único: celebrar a Ressurreição de Jesus Cristo.";

const REFRESH_MS = 15 * 60 * 1000;

const PROXY = (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

interface Rss2JsonItem {
  title: string;
  link: string;
  pubDate: string;
  thumbnail?: string;
  enclosure?: { link?: string; type?: string; thumbnail?: string };
  content?: string;
  description?: string;
  categories?: string[];
}

interface Rss2JsonResponse {
  status: string;
  items?: Rss2JsonItem[];
}

export interface FeedCardData {
  siteLabel: string;
  title: string;
  link: string;
  imageUrl: string;
  dateLabel: string;
}

export interface HighlightData {
  badge: string;
  title: string;
  description: string;
  link: string;
  /** Dois tópicos (outras notícias / referências), cada um com • na UI */
  topicLines: { label: string; link: string }[];
}

function stripHtml(html: string): string {
  if (!html) return "";
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = t;
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
}

function extractImgFromHtml(html: string): string {
  if (!html) return "";
  const flat = html.replace(/\s+/g, " ");
  const re =
    /(?:src|data-src)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(flat)) !== null) {
    const u = m[1].replace(/\s+/g, "");
    if (!/gravatar|1x1|spacer|pixel|blank/i.test(u)) return u;
  }
  return "";
}

function extractImageFromContent(html: string): string {
  return extractImgFromHtml(html);
}

function youtubeThumbFromUrl(url: string): string {
  const m = url.match(/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : "";
}

function pickItemImage(item: Rss2JsonItem): string {
  const enc = item.enclosure;
  const encThumb = enc?.thumbnail?.trim();
  if (encThumb && /^https?:\/\//i.test(encThumb)) return encThumb;
  const encLink = enc?.link?.trim() ?? "";
  if (encLink && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(encLink)) return encLink;
  if (item.thumbnail?.trim()) return item.thumbnail.trim();
  const fromContent = extractImageFromContent(item.content || item.description || "");
  if (fromContent) return fromContent;
  const yt = youtubeThumbFromUrl(item.link || "");
  return yt || "";
}

function normalizePageImageUrl(raw: string, pageUrl: string): string {
  const u = raw.replace(/\s+/g, "").trim();
  if (!u) return "";
  if (u.startsWith("//")) return `https:${u}`;
  if (/^https?:\/\//i.test(u)) return u;
  try {
    return new URL(u, pageUrl).href;
  } catch {
    return u;
  }
}

function pickOfficialImageFromDoc(doc: Document, pageUrl: string): string {
  const meta = (sel: string, attr: string) => {
    const v = doc.querySelector(sel)?.getAttribute(attr)?.trim();
    return v ? normalizePageImageUrl(v, pageUrl) : "";
  };
  let u = meta('meta[property="og:image"]', "content");
  if (u) return u;
  u = meta('meta[property="og:image:secure_url"]', "content");
  if (u) return u;
  u = meta('meta[name="twitter:image"]', "content") || meta('meta[property="twitter:image"]', "content");
  if (u) return u;
  u = doc.querySelector('link[rel="image_src"]')?.getAttribute("href")?.trim() ?? "";
  if (u) return normalizePageImageUrl(u, pageUrl);

  const wp = doc.querySelector(
    "img.wp-post-image, img[class*='wp-image'], .entry-content img, .post-content img, article img[src*='.jpg'], article img[src*='.png'], article img[src*='.webp']",
  ) as HTMLImageElement | null;
  const src = wp?.getAttribute("src") || wp?.getAttribute("data-src") || wp?.currentSrc;
  if (src) return normalizePageImageUrl(src, pageUrl);

  const block = doc.querySelector(".entry-content, .post-content, article, main")?.innerHTML ?? "";
  const ex = extractImgFromHtml(block);
  return ex ? normalizePageImageUrl(ex, pageUrl) : "";
}

async function fetchOgImageForPage(pageUrl: string): Promise<string> {
  if (!pageUrl.startsWith("http")) return "";
  const yt = youtubeThumbFromUrl(pageUrl);
  if (yt) return yt;
  try {
    const res = await fetch(PROXY(pageUrl), { signal: AbortSignal.timeout(12000) });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return pickOfficialImageFromDoc(doc, pageUrl);
  } catch {
    return "";
  }
}

async function enrichCardsWithArticleImages(cards: FeedCardData[]): Promise<FeedCardData[]> {
  return Promise.all(
    cards.map(async (c) => {
      if (c.imageUrl) return c;
      const img = await fetchOgImageForPage(c.link);
      return img ? { ...c, imageUrl: img } : c;
    }),
  );
}

function formatDatePt(pubDate: string): string {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortTitle(title: string, max = 72): string {
  const t = title.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

async function fetchRssFirstItem(rssUrl: string): Promise<Rss2JsonItem | null> {
  const items = await fetchRssItems(rssUrl, 1);
  return items[0] ?? null;
}

async function fetchRssItems(rssUrl: string, max: number): Promise<Rss2JsonItem[]> {
  const url = `${RSS2JSON}?rss_url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) return [];
  const data: Rss2JsonResponse = await res.json();
  if (data.status !== "ok" || !data.items?.length) return [];
  return data.items.slice(0, max);
}

const REF_FALLBACK_TOPICS: { label: string; link: string }[] = [
  { label: "Caminhada da Ressurreição", link: "https://www.caminhadadaressurreicao.com/" },
  { label: "Rádio Santa Rita de Cássia", link: "https://www.radiosantaritadecassia.com.br/" },
  { label: "Canal Padre PH — YouTube", link: "https://www.youtube.com/c/PadrePH" },
  { label: "Todas as notícias — Frente de Missão SP", link: "https://saopaulo.cancaonova.com/noticias/" },
  { label: "Site Canção Nova São Paulo", link: "https://saopaulo.cancaonova.com/" },
];

function pickHighlightTopicLines(cnItems: Rss2JsonItem[], mainLink: string, count = 2): { label: string; link: string }[] {
  const main = mainLink.replace(/\/$/, "").trim();
  const seen = new Set<string>(main ? [main, `${main}/`] : []);
  const out: { label: string; link: string }[] = [];

  for (const it of cnItems) {
    if (out.length >= count) break;
    const link = it.link?.trim() ?? "";
    const linkNorm = link.replace(/\/$/, "");
    if (!link || seen.has(link) || seen.has(linkNorm)) continue;
    seen.add(link);
    seen.add(linkNorm);
    out.push({ label: shortTitle(it.title?.trim() || "Notícia", 92), link });
  }

  for (const fb of REF_FALLBACK_TOPICS) {
    if (out.length >= count) break;
    if (seen.has(fb.link)) continue;
    seen.add(fb.link);
    out.push(fb);
  }

  let pad = 0;
  while (out.length < count && pad < 24) {
    const fb = REF_FALLBACK_TOPICS[pad % REF_FALLBACK_TOPICS.length];
    pad += 1;
    if (seen.has(fb.link)) continue;
    seen.add(fb.link);
    out.push(fb);
  }

  for (let i = out.length; i < count; i += 1) {
    out.push(REF_FALLBACK_TOPICS[i % REF_FALLBACK_TOPICS.length]);
  }

  return out.slice(0, count);
}

async function loadEngine(): Promise<{ highlight: HighlightData; cards: FeedCardData[] }> {
  const [cnItems, cam, rita, yt] = await Promise.all([
    fetchRssItems(FEED_CANCAO_NOVA, 14),
    fetchRssFirstItem(FEED_CAMINHADA),
    fetchRssFirstItem(FEED_SANTA_RITA),
    fetchRssFirstItem(FEED_YOUTUBE_PADRE_PH),
  ]);

  const cn = cnItems[0] ?? null;

  const highlight: HighlightData = {
    badge: HIGHLIGHT_CAMINHADA_BADGE,
    title: HIGHLIGHT_CAMINHADA_TITLE,
    description: CAMINHADA_HIGHLIGHT_DESCRIPTION,
    link: CAMINHADA_SITE,
    topicLines: pickHighlightTopicLines(cnItems, CAMINHADA_SITE, 2),
  };

  const cards: FeedCardData[] = [];

  const pushCard = (
    siteLabel: string,
    item: Rss2JsonItem | null,
    fallbackLink: string,
    fallbackTitle: string,
  ) => {
    const img = item ? pickItemImage(item) : "";
    cards.push({
      siteLabel,
      title: shortTitle(item?.title?.trim() || fallbackTitle),
      link: item?.link || fallbackLink,
      imageUrl: img,
      dateLabel: formatDatePt(item?.pubDate || ""),
    });
  };

  pushCard(
    "Canção Nova SP",
    cn,
    "https://saopaulo.cancaonova.com/noticias/",
    "Últimas notícias — São Paulo",
  );
  pushCard(
    "Caminhada da Ressurreição",
    cam,
    "https://www.caminhadadaressurreicao.com/",
    "Caminhada da Ressurreição",
  );
  pushCard(
    "Rádio Santa Rita de Cássia",
    rita,
    "https://www.radiosantaritadecassia.com.br/",
    "Rádio Santa Rita de Cássia",
  );
  pushCard(
    "YouTube · Padre PH",
    yt,
    "https://www.youtube.com/c/PadrePH",
    "Canal Padre PH no YouTube",
  );

  const cardsWithImages = await enrichCardsWithArticleImages(cards);

  return { highlight, cards: cardsWithImages };
}

const NewsFeedStrict = () => {
  const [highlight, setHighlight] = useState<HighlightData | null>(null);
  const [cards, setCards] = useState<FeedCardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setError(null);
    try {
      const { highlight: h, cards: c } = await loadEngine();
      setHighlight(h);
      setCards(c);
    } catch {
      setError("Não foi possível carregar os feeds. Tente novamente mais tarde.");
    }
  }, []);

  useEffect(() => {
    run();
    const id = window.setInterval(run, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [run]);

  return (
    <section className="nfs-section border-b border-border">
      <div className="container mx-auto px-4">
        <div className="nfs-grid">
        <div className="nfs-highlight">
          {!highlight ? (
            <div className="nfs-loading">Carregando destaque…</div>
          ) : (
            <div className="nfs-highlight__stack">
              <a
                href={highlight.link}
                target="_blank"
                rel="noopener noreferrer"
                className="nfs-highlight__link"
              >
                <span className="nfs-highlight__badge">{highlight.badge}</span>
                <h2 className="nfs-highlight__title">{highlight.title}</h2>
                <p className="nfs-highlight__desc" title={highlight.description}>
                  {highlight.description}
                </p>
              </a>
              <div className="nfs-highlight__topics">
                {highlight.topicLines.map((t, i) => (
                  <p key={`${t.link}-${i}`} className="nfs-highlight__topic">
                    <span className="nfs-highlight__topic-dot" aria-hidden="true">
                      &#8226;
                    </span>
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nfs-highlight__topic-link"
                    >
                      {t.label}
                    </a>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="nfs-feed">
          {error && <div className="nfs-error">{error}</div>}
          {cards.length === 0 && !error ? (
            <div className="nfs-loading">Carregando feed…</div>
          ) : (
            cards.map((c) => (
              <a
                key={`${c.siteLabel}-${c.link}`}
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="nfs-card"
              >
                <div className="nfs-card__media">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ) : null}
                </div>
                <div className="nfs-card__body">
                  <span className="nfs-card__badge">{c.siteLabel}</span>
                  <h3 className="nfs-card__title">{c.title}</h3>
                  {c.dateLabel ? <p className="nfs-card__date">{c.dateLabel}</p> : null}
                </div>
              </a>
            ))
          )}
        </div>
        </div>
      </div>
    </section>
  );
};

export default NewsFeedStrict;
