import { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  thumbnail: string;
  category: string;
  /** Data de publicação (ms), para ordenar e filtrar recência */
  pubDate: number;
}

const NOTICIAS_ARCHIVE = "https://saopaulo.cancaonova.com/noticias/";
const NOTICIAS_FEED = "https://saopaulo.cancaonova.com/noticias/feed/";

const PROXY = (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

/** Só notícias publicadas neste intervalo (além do filtro de datas de evento) */
const MAX_PUBLICATION_AGE_MS = 120 * 24 * 60 * 60 * 1000;
/** Atualização automática no site */
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

/** Texto abaixo do título principal — um pouco mais curto */
const LEAD_EXCERPT_MAX = 118;

const MONTHS_PT: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

function normMonthToken(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function parseDayMonthYear(day: number, monthRaw: string, year: number): Date | null {
  const m = MONTHS_PT[normMonthToken(monthRaw)];
  if (m === undefined) return null;
  const d = new Date(Date.UTC(year, m, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

function calendarYearSaoPaulo(ts: number): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(ts),
    10,
  );
}

/** Data publicada no rodapé do card (ex.: "24 de março de 2026") */
function parsePtBrMetaDate(el: Element | null): number {
  if (!el) return 0;
  const raw = (el.textContent ?? "").replace(/\s+/g, " ");
  const m = raw.match(/(\d{1,2})\s+de\s+([a-zçãéíóúâêôõ]+)\s+de\s+(\d{4})/i);
  if (!m) return 0;
  const d = parseDayMonthYear(parseInt(m[1], 10), m[2], parseInt(m[3], 10));
  return d ? d.getTime() : 0;
}

const MONTH_ABBREV: Record<string, number> = {
  jan: 0,
  fev: 1,
  mar: 2,
  abr: 3,
  mai: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  set: 8,
  out: 9,
  nov: 10,
  dez: 11,
};

function monthFromAbbrev(token: string): number | undefined {
  const t = normMonthToken(token).slice(0, 3);
  return MONTH_ABBREV[t];
}

/** Ex.: título "Agenda Oficial 2026" → ano para datas sem ano no texto */
function inferExplicitListingYear(blob: string): number | null {
  const m = blob.match(/\b(20[2-3]\d)\b/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Extrai datas de evento do texto (resumos costumam omitir o ano: "26 de março, das 19h").
 * Usa 20xx no próprio texto, senão o ano civil da publicação em SP.
 */
function extractEventDatesFromBlob(text: string, pubTs: number, now: number): Date[] {
  const t = ` ${text.replace(/\s+/g, " ")} `;
  const found: Date[] = [];
  const push = (d: Date | null) => {
    if (d && !Number.isNaN(d.getTime())) found.push(d);
  };

  const yearHint = calendarYearSaoPaulo(pubTs > 0 ? pubTs : now);
  const listingYear = inferExplicitListingYear(text);

  const resolveYearless = (day: number, monthIndex: number): Date | null => {
    const y = listingYear ?? yearHint;
    return new Date(Date.UTC(y, monthIndex, day));
  };

  // "26 de março de 2026" / "9 de fevereiro de 2026"
  const reFull = /(\d{1,2})\s+de\s+([a-zçãéíóúâêôõ]+)\s+de\s+(\d{4})/gi;
  let m: RegExpExecArray | null;
  while ((m = reFull.exec(t)) !== null) {
    push(parseDayMonthYear(parseInt(m[1], 10), m[2], parseInt(m[3], 10)));
  }

  // "26 e 27 de março de 2026" / "26 e 27 de março"
  const rePair = /(\d{1,2})\s+e\s+(\d{1,2})\s+de\s+([a-zçãéíóúâêôõ]+)(?:\s+de\s+(\d{4}))?/gi;
  while ((m = rePair.exec(t)) !== null) {
    const mo = MONTHS_PT[normMonthToken(m[3])];
    if (mo === undefined) continue;
    const y = m[4] ? parseInt(m[4], 10) : null;
    const d1 = y !== null ? parseDayMonthYear(parseInt(m[1], 10), m[3], y) : resolveYearless(parseInt(m[1], 10), mo);
    const d2 = y !== null ? parseDayMonthYear(parseInt(m[2], 10), m[3], y) : resolveYearless(parseInt(m[2], 10), mo);
    push(d1);
    push(d2);
  }

  // "26 de março, das" (sem ano) — não casa "26 de março de 2026"
  const reNoYear = /(\d{1,2})\s+de\s+([a-zçãéíóúâêôõ]+)(?!\s+de\s+\d{4})/gi;
  while ((m = reNoYear.exec(t)) !== null) {
    const mo = MONTHS_PT[normMonthToken(m[2])];
    if (mo === undefined) continue;
    push(resolveYearless(parseInt(m[1], 10), mo));
  }

  // "26/03/2026" ou "26/03"
  const reNum = /\b(\d{1,2})[/\\.](\d{1,2})(?:[/\\.](\d{2,4}))?\b/g;
  while ((m = reNum.exec(t)) !== null) {
    const day = parseInt(m[1], 10);
    const mon = parseInt(m[2], 10);
    if (mon < 1 || mon > 12 || day < 1 || day > 31) continue;
    const yStr = m[3];
    const y = yStr
      ? parseInt(yStr.length === 2 ? `20${yStr}` : yStr, 10)
      : listingYear ?? yearHint;
    push(new Date(Date.UTC(y, mon - 1, day)));
  }

  // "28.FEV" / "26.03" com mês por extenso abreviado (3 letras)
  const reAbb = /\b(\d{1,2})[.\s/]+([A-Za-zÀ-ÿ]{3})\b/gi;
  while ((m = reAbb.exec(t)) !== null) {
    const mo = monthFromAbbrev(m[2]);
    if (mo === undefined) continue;
    push(resolveYearless(parseInt(m[1], 10), mo));
  }

  return found;
}

function calendarDayKeySaoPaulo(ts: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ts);
}

/**
 * A data do evento citada no título/resumo já passou (comparando em São Paulo)?
 * Sem datas identificáveis: mantém (ex.: notícias institucionais).
 */
function isEventStale(item: NewsItem, now = Date.now()): boolean {
  const dates = extractEventDatesFromBlob(`${item.title} ${item.description}`, item.pubDate, now);
  if (dates.length === 0) return false;
  const todayKey = calendarDayKeySaoPaulo(now);
  const latestKey = dates
    .map((d) => calendarDayKeySaoPaulo(d.getTime()))
    .sort()
    .pop()!;
  return latestKey < todayKey;
}

function mergePubDate(a: number, b: number): number {
  return Math.max(a, b);
}

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

function shortenLead(text: string): string {
  const t = decodeHtml(text).replace(/\s+/g, " ").replace(/\.{3,}\s*$/u, "").trim();
  if (t.length <= LEAD_EXCERPT_MAX) return t;
  const cut = t.slice(0, LEAD_EXCERPT_MAX).trim();
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 48 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[,;\s]+$/u, "")}…`;
}

function extractImg(html: string): string {
  const flat = html.replace(/\s+/g, " ");
  const match = flat.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/i);
  return match ? match[1].split("?")[0] : "";
}

function normalizeUrlAttr(raw: string): string {
  return raw.replace(/\s+/g, "").trim();
}

/** Lista da página de arquivo — título, link, resumo e miniatura oficial do site */
function parseNoticiasArchive(html: string): NewsItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const articles = doc.querySelectorAll("article.type-noticias");
  const out: NewsItem[] = [];
  const seen = new Set<string>();

  articles.forEach((article) => {
    const linkEl = article.querySelector("a.entry-link");
    const href = normalizeUrlAttr(linkEl?.getAttribute("href") ?? "");
    if (!href.includes("saopaulo.cancaonova.com/noticias/")) return;
    try {
      const u = new URL(href);
      const parts = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
      if (parts.length < 2 || parts[0] !== "noticias") return;
      if (parts[1] === "page") return;
    } catch {
      return;
    }
    if (seen.has(href)) return;
    seen.add(href);

    const title = decodeHtml(article.querySelector("h2.entry-title")?.textContent ?? "").trim();
    const imgEl = article.querySelector("img.wp-post-image");
    const thumbnail = normalizeUrlAttr(imgEl?.getAttribute("src") ?? "");
    const summary = decodeHtml(article.querySelector(".entry-summary")?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim();
    const pubDate = parsePtBrMetaDate(article.querySelector(".entry-meta"));

    if (title.length < 5) return;
    out.push({
      title,
      link: href,
      thumbnail,
      description: summary,
      category: "Notícias",
      pubDate,
    });
  });

  return out;
}

async function fetchFromNoticiasFeed(): Promise<NewsItem[]> {
  const rssRes = await fetch(PROXY(NOTICIAS_FEED), { signal: AbortSignal.timeout(8000) });
  const rssText = await rssRes.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(rssText, "text/xml");
  const out: NewsItem[] = [];

  xml.querySelectorAll("item").forEach((item) => {
    const title = decodeHtml(item.querySelector("title")?.textContent ?? "").trim();
    const link = item.querySelector("link")?.textContent?.trim() ?? "";
    const descHtml = item.querySelector("description")?.textContent ?? "";
    const encoded = item.getElementsByTagNameNS("*", "encoded")[0]?.textContent ?? "";
    const description = decodeHtml(descHtml.replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim();
    const thumbnail = extractImg(encoded) || extractImg(descHtml);
    const pubRaw = item.querySelector("pubDate")?.textContent?.trim() ?? "";
    const pubDate = pubRaw ? Date.parse(pubRaw) : 0;
    if (title.length > 5 && link.includes("/noticias/") && !link.includes("/noticias/page/")) {
      out.push({ title, link, description, thumbnail, category: "Notícias", pubDate: Number.isNaN(pubDate) ? 0 : pubDate });
    }
  });

  return out;
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
    const description = decodeHtml(ogDesc || pDesc).slice(0, 160);

    return { thumbnail, description };
  } catch {
    return { thumbnail: "", description: "" };
  }
}

function dedupeAndMergeDates(items: NewsItem[]): NewsItem[] {
  const map = new Map<string, NewsItem>();
  for (const it of items) {
    const prev = map.get(it.link);
    if (!prev) {
      map.set(it.link, { ...it });
    } else {
      map.set(it.link, {
        ...prev,
        pubDate: mergePubDate(prev.pubDate, it.pubDate),
        thumbnail: prev.thumbnail || it.thumbnail,
        description: prev.description || it.description,
      });
    }
  }
  return Array.from(map.values());
}

/** Mais recentes primeiro; remove antigas por publicação e eventos com datas já passadas */
function filterRecentNews(items: NewsItem[], now = Date.now()): NewsItem[] {
  const merged = dedupeAndMergeDates(items);
  const withDate = merged.map((it) => (it.pubDate > 0 ? it : { ...it, pubDate: now }));

  const byRecency = (maxAge: number) => withDate.filter((it) => now - it.pubDate <= maxAge);
  const freshEvents = (arr: NewsItem[]) => arr.filter((it) => !isEventStale(it, now));

  let pool = freshEvents(byRecency(MAX_PUBLICATION_AGE_MS));
  if (pool.length < 5) {
    pool = freshEvents(byRecency(MAX_PUBLICATION_AGE_MS * 4));
  }
  if (pool.length < 5) {
    pool = freshEvents(withDate);
  }

  return pool.sort((a, b) => b.pubDate - a.pubDate);
}

async function fetchNews(): Promise<NewsItem[]> {
  let list: NewsItem[] = [];

  try {
    const res = await fetch(PROXY(NOTICIAS_ARCHIVE), { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    list = parseNoticiasArchive(html);
  } catch {
    list = [];
  }

  try {
    const fromFeed = await fetchFromNoticiasFeed();
    list = [...list, ...fromFeed];
  } catch {
    /* ignora */
  }

  const sorted = filterRecentNews(list);
  /** Busca miniaturas para mais itens do que o necessário, depois corta pelos 8 primeiros já ordenados */
  const top = sorted.slice(0, 16);
  const filled = await Promise.all(
    top.map(async (item) => {
      if (item.thumbnail) return item;
      const d = await fetchArticle(item.link);
      return {
        ...item,
        thumbnail: d.thumbnail || item.thumbnail,
        description: item.description || d.description,
      };
    }),
  );

  const byRecency = [...filled].sort((a, b) => b.pubDate - a.pubDate);
  return byRecency.slice(0, 8);
}

const HeroNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchNews()
        .then((data) => {
          if (!cancelled) setNews(data);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Ordem: mais recente primeiro (reforço no cliente após cada fetch)
  const ranked = [...news].sort((a, b) => b.pubDate - a.pubDate);
  /** Destaque à esquerda: notícia #1 mais recente */
  const featured = ranked[0];
  /** Grid à direita: sempre as 4 seguintes (#2 a #5), atualizadas no mesmo intervalo do feed */
  const GRID_RECENT_COUNT = 4;
  const gridRecentNews = ranked.slice(1, 1 + GRID_RECENT_COUNT);
  /** Lista “Principais destaques”: #6 a #8 */
  const topics = ranked.slice(1 + GRID_RECENT_COUNT, 1 + GRID_RECENT_COUNT + 3);

  return (
    <div className="w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 py-8">
        {/* Linha 1: destaque (mais estreito) + 4 cards (mais largos), mesma altura em md+ */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8 gap-8 items-stretch">

          <div className="md:col-span-5 flex flex-col md:justify-center md:pr-6 md:border-r border-border/60 min-h-0">
            {loading || !featured ? (
              <div className="animate-pulse space-y-3 md:py-2">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-24 bg-muted rounded w-full" />
                <div className="h-14 bg-muted rounded w-full" />
              </div>
            ) : (
              <a
                href={featured.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 md:gap-3 md:max-w-xl"
              >
                {featured.category && (
                  <span className="inline-block w-fit px-2 py-0.5 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {featured.category}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-[1.65rem] lg:text-4xl font-black text-primary leading-[1.15] tracking-tight group-hover:translate-x-0.5 transition-transform duration-300 line-clamp-4 md:line-clamp-5">
                  {featured.title}
                </h1>
                {featured.description && (
                  <p className="text-sm md:text-[0.95rem] text-muted-foreground leading-snug font-medium line-clamp-3 md:line-clamp-4">
                    {shortenLead(featured.description)}
                  </p>
                )}
              </a>
            )}
          </div>

          <div
            className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
            aria-label="Quatro notícias mais recentes"
          >
            {loading || gridRecentNews.length === 0
              ? [0, 1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex flex-col gap-2">
                    <div className="aspect-video bg-muted rounded-xl" />
                    <div className="h-3.5 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-4/5" />
                  </div>
                ))
              : gridRecentNews.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2 min-w-0"
                  >
                    <div className="aspect-video overflow-hidden rounded-xl bg-muted shadow-sm border border-border/50">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-contain object-center group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 min-h-[120px]">
                          <span className="text-primary text-xl font-black opacity-20 capitalize">
                            {item.category?.[0] || "CN"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      {item.category && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 mb-0.5 block">
                          {item.category}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-primary/90 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </a>
                ))}
          </div>
        </div>

        {!loading && topics.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border/80">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 block">
              Principais Destaques
            </span>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topics.map((n, i) => (
                <li key={n.link} className="group/item min-w-0">
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all border border-transparent hover:border-border/50"
                  >
                    <span className="flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-primary/80 group-hover/item:text-primary transition-colors line-clamp-2">
                      {n.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 pt-4 border-t border-border/60 flex items-center justify-between">
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
