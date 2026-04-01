import { useState, useEffect, useCallback } from "react";
import caminhadaPoster from "@/assets/caminhada-ressurreicao-2026-poster.png";
import "./NewsFeedStrict.css";

const RSS2JSON = "https://api.rss2json.com/v1/api.json";

const FEED_CANCAO_NOVA = "https://saopaulo.cancaonova.com/noticias/feed/";
const NOTICIAS_ARCHIVE_URL = "https://saopaulo.cancaonova.com/noticias/";
const FEED_CAMINHADA = "https://www.caminhadadaressurreicao.com/blog-feed.xml";
/** Canal: youtube.com/@RADIOCONEXAOCATOLICA-p1l */
const RADIO_CONEXAO_CHANNEL_URL = "https://www.youtube.com/@RADIOCONEXAOCATOLICA-p1l";
const FEED_RADIO_CONEXAO_YT =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCi33qNAezaFd0-TIC211CHA";
const FEED_YOUTUBE_PADRE_PH =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UC1F-NuywrrTYVUq370yR9WQ";

const CAMINHADA_SITE = "https://www.caminhadadaressurreicao.com/";
/** Data e horário do evento (cartaz oficial 2026) */
const CAMINHADA_CARD_EVENT_DATETIME =
  "4 de abril de 2026 · 22h00 — Basílica N. S. da Penha · Rua Santo Afonso, 199, Penha";
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

function isLowValueImageUrl(u: string): boolean {
  return !u || /favicon|pfavico|parastorage\.com\/client\/pfavico|1x1\.|pixel\.gif|blank\.(gif|png)/i.test(u);
}

function pickOfficialImageFromDoc(doc: Document, pageUrl: string): string {
  const norm = (raw: string) => {
    const n = normalizePageImageUrl(raw.replace(/\s+/g, "").trim(), pageUrl);
    return isLowValueImageUrl(n) ? "" : n;
  };
  const meta = (sel: string, attr: string) => {
    const v = doc.querySelector(sel)?.getAttribute(attr)?.trim();
    return v ? norm(v) : "";
  };
  let u = meta('meta[property="og:image"]', "content");
  if (u) return u;
  u = meta('meta[property="og:image:secure_url"]', "content");
  if (u) return u;
  u = meta('meta[name="twitter:image"]', "content") || meta('meta[property="twitter:image"]', "content");
  if (u) return u;
  u = doc.querySelector('link[rel="image_src"]')?.getAttribute("href")?.trim() ?? "";
  u = u ? norm(u) : "";
  if (u) return u;

  const wp = doc.querySelector(
    "img.wp-post-image, img[class*='wp-image'], .entry-content img, .post-content img, article img[src*='.jpg'], article img[src*='.png'], article img[src*='.webp']",
  ) as HTMLImageElement | null;
  const src = wp?.getAttribute("src") || wp?.getAttribute("data-src") || wp?.currentSrc;
  if (src) {
    u = norm(src);
    if (u) return u;
  }

  const block = doc.querySelector(".entry-content, .post-content, article, main")?.innerHTML ?? "";
  const ex = extractImgFromHtml(block);
  return ex ? norm(ex) : "";
}

function extractPublishedIsoFromDoc(doc: Document): string {
  const getMeta = (sel: string) => doc.querySelector(sel)?.getAttribute("content")?.trim() ?? "";
  let iso =
    getMeta('meta[property="article:published_time"]') ||
    getMeta('meta[name="article:published_time"]') ||
    getMeta('meta[property="og:updated_time"]') ||
    getMeta('meta[name="pubdate"]') ||
    getMeta('meta[name="date"]');
  if (iso) return iso;

  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    if (iso) return;
    try {
      const j = JSON.parse(s.textContent || "{}");
      const flat = (node: unknown): void => {
        if (!node || iso) return;
        if (Array.isArray(node)) {
          node.forEach(flat);
          return;
        }
        if (typeof node === "object" && node !== null) {
          const o = node as Record<string, unknown>;
          if (o["@graph"]) flat(o["@graph"]);
          const dp = o.datePublished ?? o.dateModified;
          if (typeof dp === "string" && dp) iso = dp;
          else if (typeof o.uploadDate === "string" && o.uploadDate) iso = o.uploadDate;
        }
      };
      flat(j);
    } catch {
      /* ignore */
    }
  });

  if (!iso) {
    iso = doc.querySelector("time[datetime]")?.getAttribute("datetime")?.trim() ?? "";
  }
  return iso;
}

async function fetchPageArticleMeta(pageUrl: string): Promise<{ image: string; publishedIso: string }> {
  if (!pageUrl.startsWith("http")) return { image: "", publishedIso: "" };
  const yt = youtubeThumbFromUrl(pageUrl);
  if (yt) return { image: yt, publishedIso: "" };
  try {
    const res = await fetch(PROXY(pageUrl), { signal: AbortSignal.timeout(12000) });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const image = pickOfficialImageFromDoc(doc, pageUrl);
    const publishedIso = extractPublishedIsoFromDoc(doc);
    return { image, publishedIso };
  } catch {
    return { image: "", publishedIso: "" };
  }
}

/** Imagem de apoio alinhada ao site quando feed/página não entregam mídia */
function fallbackCardImage(siteLabel: string): string {
  if (siteLabel.includes("Caminhada"))
    return "https://static.wixstatic.com/media/e11735_e5149fc5e4d743c6a4f7613eb6017eb7~mv2.jpg/v1/crop/x_156,y_0,w_1728,h_1148/fill/w_800,h_450,al_c,q_80/cristo%20na%20cruz%203.jpg";
  return "";
}

const LAST_RESORT_CARD_IMAGE =
  "https://static.wixstatic.com/media/e11735_e5149fc5e4d743c6a4f7613eb6017eb7~mv2.jpg/v1/crop/x_156,y_0,w_1728,h_1148/fill/w_800,h_450,al_c,q_80/cristo%20na%20cruz%203.jpg";

function parseFlexibleDate(raw: string): Date | null {
  if (!raw) return null;
  const d1 = new Date(raw);
  if (!Number.isNaN(d1.getTime())) return d1;
  const norm = raw.trim().replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/, "$1T$2");
  const d2 = new Date(norm);
  if (!Number.isNaN(d2.getTime())) return d2;
  return null;
}

function formatDatePt(pubDate: string): string {
  if (!pubDate) return "";
  const d = parseFlexibleDate(pubDate);
  if (!d) return pubDate.trim();
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSyncDateLabel(): string {
  return `Sincronizado em ${formatDatePt(new Date().toISOString())}`;
}

async function enrichCardsFromPages(cards: FeedCardData[]): Promise<FeedCardData[]> {
  return Promise.all(
    cards.map(async (c) => {
      const meta = await fetchPageArticleMeta(c.link);
      let imageUrl = "";
      if (meta.image && !isLowValueImageUrl(meta.image)) imageUrl = meta.image;
      if (!imageUrl && c.imageUrl && !isLowValueImageUrl(c.imageUrl)) imageUrl = c.imageUrl;
      if (!imageUrl) imageUrl = fallbackCardImage(c.siteLabel);
      if (!imageUrl) imageUrl = LAST_RESORT_CARD_IMAGE;

      let dateLabel = (c.dateLabel ?? "").trim();
      if (!dateLabel && meta.publishedIso) dateLabel = formatDatePt(meta.publishedIso);
      if (!dateLabel) dateLabel = formatSyncDateLabel();

      return { ...c, imageUrl, dateLabel };
    }),
  );
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

/** Miniaturas oficiais listadas em saopaulo.cancaonova.com/noticias/ (article.type-noticias) */
function parseCancaoNovaNoticiasArchive(html: string): { byLink: Map<string, string>; firstThumb: string } {
  const byLink = new Map<string, string>();
  let firstThumb = "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("article.type-noticias").forEach((article) => {
    const linkEl = article.querySelector("a.entry-link");
    const href = (linkEl?.getAttribute("href") ?? "").replace(/\s+/g, "").trim();
    if (!href.includes("saopaulo.cancaonova.com/noticias/")) return;
    try {
      const u = new URL(href);
      const parts = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
      if (parts.length < 2 || parts[0] !== "noticias") return;
      if (parts[1] === "page") return;
    } catch {
      return;
    }
    const raw = (article.querySelector("img.wp-post-image")?.getAttribute("src") ?? "").replace(/\s+/g, "").trim();
    if (!raw) return;
    const full = raw.startsWith("http") ? raw : new URL(raw, "https://saopaulo.cancaonova.com").href;
    if (!firstThumb) firstThumb = full;
    const noSlash = href.replace(/\/$/, "");
    const withSlash = href.endsWith("/") ? href : `${href}/`;
    byLink.set(noSlash, full);
    byLink.set(withSlash, full);
  });
  return { byLink, firstThumb };
}

async function fetchCancaoNovaArchiveImages(): Promise<{ byLink: Map<string, string>; firstThumb: string }> {
  try {
    const res = await fetch(PROXY(NOTICIAS_ARCHIVE_URL), { signal: AbortSignal.timeout(14000) });
    const html = await res.text();
    return parseCancaoNovaNoticiasArchive(html);
  } catch {
    return { byLink: new Map(), firstThumb: "" };
  }
}

function thumbFromCnNoticiasArchive(
  link: string,
  archive: { byLink: Map<string, string>; firstThumb: string },
): string {
  if (!link) return archive.firstThumb || "";
  const noSlash = link.replace(/\/$/, "");
  const withSlash = link.endsWith("/") ? link : `${link}/`;
  const hit =
    archive.byLink.get(link) ||
    archive.byLink.get(noSlash) ||
    archive.byLink.get(withSlash) ||
    Array.from(archive.byLink.entries()).find(([k]) => k.replace(/\/$/, "") === noSlash)?.[1];
  if (hit) return hit;
  try {
    const path = new URL(link).pathname.replace(/\/$/, "") || "/";
    if (path === "/noticias") return archive.firstThumb;
  } catch {
    /* ignore */
  }
  return "";
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
  { label: "Rádio Conexão Católica — YouTube", link: RADIO_CONEXAO_CHANNEL_URL },
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
  const [cnItems, cam, radioCx, yt, cnArchive] = await Promise.all([
    fetchRssItems(FEED_CANCAO_NOVA, 14),
    fetchRssFirstItem(FEED_CAMINHADA),
    fetchRssFirstItem(FEED_RADIO_CONEXAO_YT),
    fetchRssFirstItem(FEED_YOUTUBE_PADRE_PH),
    fetchCancaoNovaArchiveImages(),
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
    let img = "";
    if (siteLabel === "Canção Nova SP") {
      const l = item?.link || fallbackLink;
      img = thumbFromCnNoticiasArchive(l, cnArchive);
      if (!img) img = item ? pickItemImage(item) : "";
    } else if (siteLabel === "Caminhada da Ressurreição") {
      img = caminhadaPoster;
    } else {
      img = item ? pickItemImage(item) : "";
    }
    const dateLabel =
      siteLabel === "Caminhada da Ressurreição"
        ? CAMINHADA_CARD_EVENT_DATETIME
        : formatDatePt(item?.pubDate || "");
    cards.push({
      siteLabel,
      title: shortTitle(item?.title?.trim() || fallbackTitle),
      link: item?.link || fallbackLink,
      imageUrl: img,
      dateLabel,
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
    "Rádio Conexão Católica",
    radioCx,
    RADIO_CONEXAO_CHANNEL_URL,
    "Rádio Conexão Católica — ao vivo e conteúdos",
  );
  pushCard(
    "YouTube · Padre PH",
    yt,
    "https://www.youtube.com/c/PadrePH",
    "Canal Padre PH no YouTube",
  );

  const cardsWithImages = await enrichCardsFromPages(cards);
  const cardsFinal = cardsWithImages.map((c) => {
    if (c.siteLabel === "Caminhada da Ressurreição") {
      return { ...c, imageUrl: caminhadaPoster, dateLabel: CAMINHADA_CARD_EVENT_DATETIME };
    }
    if (!c.siteLabel.includes("Canção Nova SP")) return c;
    const fromArchive = thumbFromCnNoticiasArchive(c.link, cnArchive);
    return fromArchive ? { ...c, imageUrl: fromArchive } : c;
  });

  const final = { highlight, cards: cardsFinal };
  try {
    localStorage.setItem("nfs_cards_cache", JSON.stringify(cardsFinal));
    localStorage.setItem("nfs_highlight_cache", JSON.stringify(highlight));
  } catch (e) {
    /* ignore storage errors */
  }
  return final;
}

const DEFAULT_HIGHLIGHT: HighlightData = {
  badge: HIGHLIGHT_CAMINHADA_BADGE,
  title: HIGHLIGHT_CAMINHADA_TITLE,
  description: CAMINHADA_HIGHLIGHT_DESCRIPTION,
  link: CAMINHADA_SITE,
  topicLines: [
    { label: "Caminhada da Ressurreição — Site Oficial", link: "https://www.caminhadadaressurreicao.com/" },
    { label: "Rádio Conexão Católica — YouTube", link: "https://www.youtube.com/@RADIOCONEXAOCATOLICA-p1l" }
  ]
};

const NewsFeedStrict = () => {
  const [highlight, setHighlight] = useState<HighlightData>(() => {
    try {
      const cached = localStorage.getItem("nfs_highlight_cache");
      return cached ? JSON.parse(cached) : DEFAULT_HIGHLIGHT;
    } catch {
      return DEFAULT_HIGHLIGHT;
    }
  });

  const [cards, setCards] = useState<FeedCardData[]>(() => {
    try {
      const cached = localStorage.getItem("nfs_cards_cache");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const run = useCallback(async () => {
    setError(null);
    try {
      const { highlight: h, cards: c } = await loadEngine();
      setHighlight(h);
      setCards(c);
      setIsFirstLoad(false);
    } catch {
      if (cards.length === 0) {
        setError("Não foi possível carregar os feeds. Tente novamente mais tarde.");
      }
    }
  }, [cards.length]);

  useEffect(() => {
    run();
    const id = window.setInterval(run, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [run]);

  return (
    <section className="nfs-section">
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
                        title={t.label}
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
                  <div
                    className={
                      c.siteLabel === "Caminhada da Ressurreição"
                        ? "nfs-card__media nfs-card__media--poster"
                        : "nfs-card__media"
                    }
                  >
                    <img src={c.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  </div>
                  <div className="nfs-card__body">
                    <span className="nfs-card__badge">{c.siteLabel}</span>
                    <h3 className="nfs-card__title">{c.title}</h3>
                    <p className="nfs-card__date">{c.dateLabel}</p>
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
