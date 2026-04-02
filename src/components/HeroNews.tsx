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
const CAMINHADA_URL = "https://www.caminhadadaressurreicao.com/";
const SANTA_RITA_BASE = "https://www.radiosantaritadecassia.com.br";
const AGENDA_CN_2026_URL = "https://saopaulo.cancaonova.com/noticias/agendacancaonovasp2026/";

const PROXY = (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

/** Só notícias publicadas neste intervalo (além do filtro de datas de evento) */
const MAX_PUBLICATION_AGE_MS = 120 * 24 * 60 * 60 * 1000;
/** Atualização automática no site */
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

/** Texto abaixo do título principal — mais linhas para preencher a coluna junto ao grid */
const LEAD_EXCERPT_MAX = 320;

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

/** Menor data de evento futura (dia SP) extraída do item, ou null */
function earliestFutureEventKey(item: NewsItem, now: number): string | null {
  const dates = extractEventDatesFromBlob(`${item.title} ${item.description}`, item.pubDate, now);
  if (dates.length === 0) return null;
  const todayKey = calendarDayKeySaoPaulo(now);
  const keys = [...new Set(dates.map((d) => calendarDayKeySaoPaulo(d.getTime())))]
    .filter((k) => k >= todayKey)
    .sort();
  return keys[0] ?? null;
}

/** Próximo evento entre notícias da Canção Nova SP (por data citada no texto) */
function pickNearestUpcomingCancaoNova(pool: NewsItem[], now: number): NewsItem | null {
  const fresh = pool.filter((it) => !isEventStale(it, now));
  const use = fresh.length > 0 ? fresh : pool;
  if (use.length === 0) return null;
  const scored = use.map((it) => ({ it, k: earliestFutureEventKey(it, now) }));
  const dated = scored.filter((x) => x.k !== null).sort((a, b) => (a.k! < b.k! ? -1 : a.k! > b.k! ? 1 : 0));
  if (dated.length > 0) return dated[0].it;
  return [...use].sort((a, b) => b.pubDate - a.pubDate)[0] ?? null;
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

/** Imagem “oficial” da página: Open Graph, Twitter, WordPress em destaque, etc. */
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
  const ex = extractImg(block);
  return ex ? normalizePageImageUrl(ex, pageUrl) : "";
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
    const res = await fetch(PROXY(url), { signal: AbortSignal.timeout(9000) });
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const thumbnail = pickOfficialImageFromDoc(doc, url);

    const ogDesc =
      doc.querySelector('meta[property="og:description"]')?.getAttribute("content") ??
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ??
      "";
    const pDesc = doc.querySelector(".entry-content p, .post-content p, article p")?.textContent ?? "";
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

async function fetchCancaoNovaPool(limit = 20): Promise<NewsItem[]> {
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
  const top = sorted.slice(0, Math.max(limit, 16));
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

  return [...filled].sort((a, b) => b.pubDate - a.pubDate).slice(0, limit);
}

async function fetchCaminhadaCard(): Promise<NewsItem> {
  return {
    title: "Caminhada da Ressurreição 2026 — novo site e tema: “Eu vi o Senhor”",
    link: CAMINHADA_URL,
    description:
      "Novo site da Caminhada da Ressurreição e o tema do encontro: “Eu vi o Senhor”. Diocese de São Miguel Paulista.",
    thumbnail: "",
    category: "Caminhada da Ressurreição",
    pubDate: Date.now(),
  };
}

async function fetchSantaRitaCard(): Promise<NewsItem> {
  const fallback: NewsItem = {
    title: "Rádio Santa Rita de Cássia",
    link: SANTA_RITA_BASE,
    description: "Programação ao vivo, postagens e comunidade da rádio católica da Zona Leste de São Paulo.",
    thumbnail: "https://websitenoar.net/contents/384/slider/user_2478937.jpg",
    category: "Santa Rita de Cássia",
    pubDate: Date.now(),
  };
  try {
    const res = await fetch(PROXY(`${SANTA_RITA_BASE}/posts`), { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const links = doc.querySelectorAll("a[href*='/post/']");
    for (const a of links) {
      const href = a.getAttribute("href")?.trim() ?? "";
      if (!href || href.includes("#")) continue;
      const link = href.startsWith("http") ? href : SANTA_RITA_BASE + href;
      const scope = a.closest(".splide__slide, .card, article, li, .post-item") ?? a.parentElement;
      const titleRaw =
        scope?.querySelector(".name, h2, h3, .card-title, .title")?.textContent?.trim() ||
        a.textContent?.trim() ||
        "";
      const title = decodeHtml(titleRaw).replace(/\s+/g, " ").trim();
      if (title.length < 8) continue;
      const imgEl = scope?.querySelector("img");
      let thumb = imgEl?.getAttribute("src") ?? imgEl?.getAttribute("data-src") ?? "";
      if (thumb && !thumb.startsWith("http")) thumb = SANTA_RITA_BASE + thumb;
      return {
        title: title.slice(0, 160),
        link,
        description: "",
        thumbnail: thumb,
        category: "Santa Rita de Cássia",
        pubDate: Date.now(),
      };
    }
  } catch {
    /* fallback */
  }
  return fallback;
}

async function fetchAgendaAbracoCard(): Promise<NewsItem> {
  return {
    title: "Canção Nova Abraça – São Paulo",
    link: AGENDA_CN_2026_URL,
    description:
      "Agosto — Abraço, gratidão e missão. Dia 16: Canção Nova Abraça em São Paulo. Veja a agenda oficial 2026 no site da Canção Nova SP.",
    thumbnail: "",
    category: "Agenda CN SP",
    pubDate: Date.now(),
  };
}

async function buildMixedGridCards(cnPool: NewsItem[], featuredLink: string): Promise<NewsItem[]> {
  const now = Date.now();
  const pool = cnPool.filter((it) => it.link !== featuredLink);
  let cn =
    pickNearestUpcomingCancaoNova(pool, now) ?? pool[0] ?? cnPool[0] ?? null;
  const [caminhada, santa, abraco] = await Promise.all([
    fetchCaminhadaCard(),
    fetchSantaRitaCard(),
    fetchAgendaAbracoCard(),
  ]);

  const slot1: NewsItem = cn
    ? { ...cn, category: "Canção Nova SP" }
    : {
        title: "Canção Nova São Paulo",
        link: "https://saopaulo.cancaonova.com/noticias/",
        description: "Eventos e notícias da Frente de Missão em São Paulo.",
        thumbnail: "",
        category: "Canção Nova SP",
        pubDate: now,
      };

  const raw = [slot1, caminhada, santa, abraco];
  /** Sempre reconsulta a URL do card para og:image / imagem oficial do post */
  return Promise.all(
    raw.map(async (it) => {
      const d = await fetchArticle(it.link);
      return {
        ...it,
        thumbnail: d.thumbnail || it.thumbnail,
        description: it.description || d.description,
      };
    }),
  );
}

async function fetchHeroNewsPayload(): Promise<{ pool: NewsItem[]; gridCards: NewsItem[] }> {
  const pool = await fetchCancaoNovaPool(20);
  const featuredLink = pool[0]?.link ?? "";
  const gridCards = await buildMixedGridCards(pool, featuredLink);
  return { pool, gridCards };
}

const HeroNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gridCards, setGridCards] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchHeroNewsPayload()
        .then(({ pool, gridCards: grid }) => {
          if (!cancelled) {
            setNews(pool);
            setGridCards(grid);
          }
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

  const ranked = [...news].sort((a, b) => b.pubDate - a.pubDate);
  const featured = ranked[0];
  const usedLinks = new Set<string>(
    [featured?.link, ...gridCards.map((c) => c.link)].filter((x): x is string => Boolean(x)),
  );
  const topics = ranked.filter((it) => !usedLinks.has(it.link)).slice(0, 3);
  
  const isVideoPeriod = new Date() < new Date('2026-04-06T00:00:00-03:00');

  return (
    <div className="w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 py-8">
        {/* Linha 1: 50% destaque / 50% grelha — mesma altura em desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 lg:gap-8 gap-8 md:items-stretch items-start">

          <div className="flex flex-col md:h-full md:min-h-0 md:pr-6 lg:pr-8 md:border-r md:border-border/70 min-w-0">
            {loading || !featured ? (
              <div className="animate-pulse space-y-6 pt-1 md:flex md:flex-col md:flex-1 md:min-h-[min(100%,22rem)]">
                <div className="h-7 bg-sky-100/80 dark:bg-primary/20 rounded-md w-32 shrink-0" />
                <div className="h-40 bg-muted rounded-lg w-full shrink-0" />
                <div className="flex-1 min-h-24 bg-muted/80 rounded-lg w-full" />
              </div>
            ) : (
              <a
                href={featured.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col h-full min-h-0 text-left gap-5 md:gap-7 w-full"
              >
                {featured.category && (
                  <span className="inline-block w-fit shrink-0 rounded-md bg-sky-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary shadow-none dark:bg-sky-950/40 dark:text-sky-100">
                    {featured.category}
                  </span>
                )}
                <h1 className="w-full shrink-0 text-3xl sm:text-4xl md:text-[2.35rem] lg:text-[2.75rem] xl:text-[3.1rem] font-black text-primary leading-[1.32] sm:leading-[1.36] md:leading-[1.4] lg:leading-[1.42] tracking-normal group-hover:opacity-90 transition-opacity duration-300 line-clamp-4 [text-wrap:balance]">
                  {featured.title}
                </h1>
                {featured.description && (
                  <div className="flex-1 flex flex-col justify-end min-h-0 pt-2 md:pt-3">
                    <p className="w-full text-justify text-xs sm:text-sm text-muted-foreground leading-[1.75] sm:leading-loose font-normal line-clamp-[12] md:line-clamp-none hyphens-auto [overflow-wrap:anywhere]">
                      {shortenLead(featured.description)}
                    </p>
                  </div>
                )}
              </a>
            )}
          </div>

          {isVideoPeriod ? (
            <div className="w-full flex flex-col justify-center min-w-0">
              <div className="w-full aspect-video rounded-lg overflow-hidden border border-border shadow-sm bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/euw51CcF2WY?autoplay=0"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 0 }}
                ></iframe>
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3 min-w-0 md:h-full md:min-h-0 content-start"
              aria-label="Destaques: Canção Nova SP, Caminhada, Santa Rita e Agenda"
            >
              {loading || gridCards.length === 0
              ? [0, 1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex flex-col gap-1.5">
                    <div className="aspect-video bg-muted rounded-lg" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-2.5 bg-muted rounded w-4/5" />
                  </div>
                ))
              : gridCards.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1.5 min-w-0"
                  >
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted shadow-sm border border-border/50">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full min-h-[100px] flex items-center justify-center bg-primary/5">
                          <span className="text-primary text-sm font-black opacity-25 capitalize text-center px-2">
                            {item.category || "…"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      {item.category && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary/70 mb-0 block leading-tight">
                          {item.category}
                        </span>
                      )}
                      <h3 className="text-xs font-bold text-primary/90 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </a>
                ))}
            </div>
          )}
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

        <div className="mt-10 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 shrink-0 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
              Fonte: Canção Nova São Paulo
            </span>
          </div>
          <a href="https://saopaulo.cancaonova.com/noticias/" target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-[0.2em] hover:text-primary/80 transition-colors">
            Ver todas as notícias
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroNews;
