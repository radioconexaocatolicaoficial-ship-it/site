import { useCallback, useEffect, useState } from "react";
import "./NewsFeedStrict.css";

const RSS2JSON = "https://api.rss2json.com/v1/api.json";
const REFRESH_MS = 90 * 1000;
const BREAKING_MAX_AGE_MS = 3 * 60 * 60 * 1000;

const FEEDS = {
  cnn: "https://www.cnnbrasil.com.br/feed/",
  mundo: "https://g1.globo.com/dynamo/mundo/rss2.xml",
  esportes: "https://www.gazetaesportiva.com/feed/",
  vaticano: "https://www.vaticannews.va/pt.rss.xml",
  rcc: "https://rccbrasil.org.br/feed/",
  igreja: "https://noticias.cancaonova.com/feed/",
  receitas: "https://www.receiteria.com.br/feed/",
  teatro:
    "https://news.google.com/rss/search?q=teatro+pe%C3%A7a+S%C3%A3o+Paulo+when:7d&hl=pt-BR&gl=BR&ceid=BR:pt-419",
  cinema: "https://pipocamoderna.com.br/feed/",
};

type NewsItem = {
  title: string;
  link: string;
  date: string;
  image: string;
  excerpt: string;
  badge: string;
  categories?: string[];
  breaking?: boolean;
};

type Row = { label: string; items: NewsItem[] };

function decode(raw: string): string {
  const t = raw.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = t;
  return (d.textContent || "").replace(/\s+/g, " ").trim();
}

function stripHtml(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " "));
}

function firstImg(html: string): string {
  const m = html.match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
  return m?.[1] || "";
}

function textOf(el: Element, ...tags: string[]): string {
  for (const tag of tags) {
    const n = el.getElementsByTagName(tag)[0] || el.querySelector(tag);
    const t = n?.textContent?.trim();
    if (t) return decode(t);
  }
  return "";
}

function parseRss(xml: string): NewsItem[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return [];
  const out: NewsItem[] = [];
  doc.querySelectorAll("item, entry").forEach((el) => {
    const title = textOf(el, "title");
    const link =
      el.querySelector("link")?.getAttribute("href")?.trim() ||
      textOf(el, "link", "guid", "id");
    const pubDate = textOf(el, "pubDate", "published", "updated");
    const description = el.getElementsByTagName("description")[0]?.textContent || "";
    const content =
      el.getElementsByTagName("content:encoded")[0]?.textContent ||
      el.getElementsByTagNameNS("*", "encoded")[0]?.textContent ||
      "";
    let image = "";
    const media = el.getElementsByTagNameNS("*", "content");
    for (let i = 0; i < media.length; i++) {
      const url = media[i].getAttribute("url") || "";
      if (url && /\.(jpg|jpeg|png|webp|gif)/i.test(url)) {
        image = url;
        break;
      }
    }
    if (!image) {
      const thumb = el.getElementsByTagNameNS("*", "thumbnail")[0];
      image = thumb?.getAttribute("url") || "";
    }
    if (!image) {
      const enc = el.querySelector("enclosure")?.getAttribute("url") || "";
      if (/\.(jpg|jpeg|png|webp|gif)/i.test(enc)) image = enc;
    }
    if (!image) image = firstImg(content || description);
    if (!title || !link) return;
    const categories = Array.from(el.getElementsByTagName("category"))
      .map((n) => decode(n.textContent || ""))
      .filter(Boolean);
    out.push({
      title,
      link,
      date: pubDate,
      image,
      excerpt: stripHtml(description || content).slice(0, 480),
      badge: "",
      categories,
    });
  });
  return out;
}

async function fetchFeed(url: string, max: number): Promise<NewsItem[]> {
  try {
    const res = await fetch(`/api/rss?u=${encodeURIComponent(url)}&t=${Date.now()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const items = parseRss(await res.text());
      if (items.length) return items.slice(0, max);
    }
  } catch {
    /* fallback */
  }
  try {
    const res = await fetch(
      `${RSS2JSON}?rss_url=${encodeURIComponent(url)}&count=${max}&t=${Date.now()}`,
      { cache: "no-store", signal: AbortSignal.timeout(12000) },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      status?: string;
      items?: { title?: string; link?: string; pubDate?: string; thumbnail?: string; description?: string; enclosure?: { link?: string } }[];
    };
    if (data.status !== "ok" || !data.items?.length) return [];
    return data.items.slice(0, max).map((it) => ({
      title: decode(it.title || ""),
      link: it.link || "",
      date: it.pubDate || "",
      image: it.thumbnail || it.enclosure?.link || firstImg(it.description || ""),
      excerpt: stripHtml(it.description || "").slice(0, 480),
      badge: "",
      categories: [],
    }));
  } catch {
    return [];
  }
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function itemAgeMs(item: NewsItem): number {
  const t = Date.parse(item.date);
  if (!Number.isFinite(t)) return Number.POSITIVE_INFINITY;
  return Date.now() - t;
}

/** Só CNN Brasil, e só se o título ou a categoria marcarem plantão. */
function isCnnBreaking(item: NewsItem): boolean {
  if (!/cnnbrasil\.com\.br/i.test(item.link)) return false;
  if (itemAgeMs(item) > BREAKING_MAX_AGE_MS) return false;
  const title = item.title.toLowerCase();
  const cats = (item.categories || []).join(" ").toLowerCase();
  const marked =
    /^\s*urgente\b/.test(title) ||
    /\burgente\s*[:\-—|]/.test(title) ||
    /\bbreaking\s*news\b/.test(title) ||
    /\bplant[aã]o\b/.test(title) ||
    /\b[uú]ltima hora\b/.test(title) ||
    /\burgente\b|\bbreaking\b|\bplant[aã]o\b/.test(cats);
  return marked;
}

function findCnnBreaking(cnn: NewsItem[]): NewsItem | null {
  const all = cnn.filter(isCnnBreaking);
  if (!all.length) return null;
  all.sort((a, b) => itemAgeMs(a) - itemAgeMs(b));
  return { ...all[0], badge: "CNN Brasil", breaking: true };
}

function takeUnique(items: NewsItem[], n: number, skip = new Set<string>()): NewsItem[] {
  const out: NewsItem[] = [];
  const seen = new Set(skip);
  for (const it of items) {
    const key = it.link.replace(/\/$/, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
    if (out.length >= n) break;
  }
  return out;
}

function withBadge(items: NewsItem[], badge: string): NewsItem[] {
  return items.map((it) => ({ ...it, badge }));
}

function proxiedImage(url: string): string {
  if (!url) return "";
  if (/cnnbrasil|glbimg|wp-content|vaticannews/i.test(url)) {
    return `/api/img?u=${encodeURIComponent(url)}`;
  }
  return url;
}

async function enrichImage(item: NewsItem): Promise<NewsItem> {
  if (item.image) return { ...item, image: proxiedImage(item.image) };
  try {
    const res = await fetch(`/api/html?u=${encodeURIComponent(item.link)}`, {
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return item;
    const html = await res.text();
    const og =
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (og?.[1]) return { ...item, image: proxiedImage(og[1]) };
  } catch {
    /* keep */
  }
  return item;
}

async function loadNews(): Promise<{ highlight: NewsItem | null; rows: Row[] }> {
  const [cnn, mundo, esportes, vaticano, rcc, igreja, receitas, teatro, cinema] = await Promise.all([
    fetchFeed(FEEDS.cnn, 10),
    fetchFeed(FEEDS.mundo, 6),
    fetchFeed(FEEDS.esportes, 6),
    fetchFeed(FEEDS.vaticano, 6),
    fetchFeed(FEEDS.rcc, 4),
    fetchFeed(FEEDS.igreja, 4),
    fetchFeed(FEEDS.receitas, 4),
    fetchFeed(FEEDS.teatro, 6),
    fetchFeed(FEEDS.cinema, 6),
  ]);

  const breaking = findCnnBreaking(cnn);

  const catholicPick = vaticano[0] || igreja[0] || null;
  const highlight = breaking
    ? breaking
    : catholicPick
      ? { ...catholicPick, badge: vaticano[0] ? "Vatican News" : "Igreja Católica" }
      : null;
  const skip = new Set(highlight ? [highlight.link.replace(/\/$/, "")] : []);

  const one = (list: NewsItem[], badge: string) =>
    withBadge(takeUnique(list, 1, skip), badge)[0] ?? null;

  const unique = [
    one(cnn, "Brasil"),
    one(mundo, "Mundo"),
    one(esportes, "Esportes"),
    one(vaticano, "Vaticano"),
    one(igreja, "Igreja"),
    one(rcc, "RCC Brasil"),
    one(receitas, "Receitas"),
    one(
      teatro.filter((it) => !/google not[ií]cias|when:/i.test(it.title)),
      "Teatro",
    ),
    one(cinema, "Cinema"),
  ].filter((it): it is NewsItem => Boolean(it));

  unique.forEach((it) => skip.add(it.link.replace(/\/$/, "")));

  const cards = await Promise.all(unique.map(enrichImage));

  return {
    highlight,
    rows: [
      { label: "", items: cards.slice(0, 3) },
      { label: "", items: cards.slice(3, 6) },
      { label: "", items: cards.slice(6, 9) },
    ],
  };
}

function Card({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/15 to-primary/5" />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-primary">{item.badge}</span>
        <h3 className="mt-0.5 line-clamp-2 text-[12.5px] font-semibold leading-snug text-foreground">
          {item.title}
        </h3>
      </div>
    </a>
  );
}

const NewsHomeGrid = () => {
  const [highlight, setHighlight] = useState<NewsItem | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    try {
      const data = await loadNews();
      setHighlight(data.highlight);
      setRows(data.rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
    const id = window.setInterval(run, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [run]);

  return (
    <section className="container mx-auto px-4 pb-[30px] pt-2" aria-label="Notícias">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <article className="nfs-highlight">
          {loading && !highlight ? (
            <div className="nfs-loading">Carregando destaque…</div>
          ) : highlight ? (
            <div className="nfs-highlight__stack">
              <div className="nfs-highlight__link-wrapper">
                <span
                  className={
                    highlight.breaking
                      ? "inline-block animate-pulse self-start rounded-md bg-red-600 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow"
                      : "nfs-highlight__badge"
                  }
                >
                  {highlight.breaking ? "Breaking news" : "Catolicismo Romano"}
                </span>
                <h2 className="nfs-highlight__title">{highlight.title}</h2>
                {highlight.excerpt && (
                  <p className="nfs-highlight__intro">{highlight.excerpt}</p>
                )}
                <div className="nfs-highlight__info-list">
                  <div className="nfs-highlight__info-item">
                    <span className="nfs-highlight__info-dot">●</span>
                    <span className="nfs-highlight__info-text">
                      <strong>Fonte:</strong> {highlight.badge}
                    </span>
                  </div>
                  {highlight.date && (
                    <div className="nfs-highlight__info-item">
                      <span className="nfs-highlight__info-dot">●</span>
                      <span className="nfs-highlight__info-text">
                        <strong>Publicada:</strong> {formatDate(highlight.date)}
                      </span>
                    </div>
                  )}
                  <div className="nfs-highlight__info-item">
                    <span className="nfs-highlight__info-dot">●</span>
                    <span className="nfs-highlight__info-text">
                      <strong>{highlight.breaking ? "Plantão:" : "Destaque:"}</strong>{" "}
                      {highlight.breaking
                        ? "urgente da CNN Brasil — atualização automática"
                        : "principal notícia da Igreja Católica agora"}
                    </span>
                  </div>
                </div>
                <a
                  href={highlight.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nfs-highlight__button"
                >
                  Ler matéria
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Não foi possível carregar a notícia da Igreja.</p>
          )}
        </article>

        <div className="flex min-w-0 flex-col gap-3.5">
          {loading && rows.length === 0
            ? [0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="aspect-[4/3] animate-pulse rounded-lg bg-muted/40" />
                  ))}
                </div>
              ))
            : rows.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-2.5">
                  {row.items.map((item) => (
                    <Card key={`${item.badge}-${item.link}`} item={item} />
                  ))}
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default NewsHomeGrid;
