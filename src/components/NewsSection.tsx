import { useState, useEffect, useCallback } from "react";
import { CloudSun, ExternalLink, Newspaper, TrainFront, Car, Trophy, Cross } from "lucide-react";

const RSS2JSON = "https://api.rss2json.com/v1/api.json";
const REFRESH_MS = 10 * 60 * 1000;
/** Esportes em tempo quase real — polling agressivo do feed. */
const SPORTS_REFRESH_MS = 30 * 1000;
const FETCH_MS = 8000;

const SP_LAT = -23.5505;
const SP_LON = -46.6333;
const FALLBACK_PLACE = "São Paulo";

const PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

/** Imagens de reserva por categoria (só se o feed não trouxer mídia). */
const FALLBACK_IMAGES: Record<string, string> = {
  "Música Católica": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=520&fit=crop",
  "Canção Nova": "https://images.unsplash.com/photo-1438232992991-999b318256bc?w=800&h=520&fit=crop",
  "Trânsito em tempo real SP": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=520&fit=crop",
  "Santo do Dia": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=520&fit=crop",
  Esportes: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=520&fit=crop",
};

const SANTO_DIA_URL = "https://santo.cancaonova.com/";

/**
 * Cartões de notícia (feeds). Santo do Dia vem da página HTML, não do RSS.
 * Um único card de trânsito (G1/Waze) — sem duplicar com metrô.
 */
const NEWS_CARD_FEEDS: { badge: string; rss: string; fallbackRss?: string[] }[] = [
  {
    badge: "Música Católica",
    rss: "https://musica.cancaonova.com/feed/",
  },
  {
    badge: "Canção Nova",
    rss: "https://noticias.cancaonova.com/feed/",
  },
  {
    badge: "Trânsito em tempo real SP",
    rss: "https://g1.globo.com/dynamo/sao-paulo/transito/rss2.xml",
    fallbackRss: ["https://g1.globo.com/rss/g1/sao-paulo/transito/"],
  },
  {
    badge: "Esportes",
    rss: "https://www.cnnbrasil.com.br/esportes/feed/",
    fallbackRss: [
      "https://www.gazetaesportiva.com/feed/",
      "https://g1.globo.com/dynamo/esporte/rss2.xml",
      "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=pt-BR&gl=BR&ceid=BR:pt-419",
    ],
  },
];

const SPORTS_FEED = NEWS_CARD_FEEDS.find((f) => f.badge === "Esportes")!;

interface Rss2JsonItem {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  description?: string;
  content?: string;
  enclosure?: { link?: string; thumbnail?: string; type?: string };
}

interface Rss2JsonResponse {
  status: string;
  items?: Rss2JsonItem[];
}

export type RadioCard =
  | {
      kind: "weather";
      href: string;
      badge: string;
      title: string;
      subtitle: string;
      bgImage: string;
      iconImage: string;
    }
  | {
      kind: "news";
      href: string;
      badge: string;
      title: string;
      subtitle: string;
      image: string;
      imageFallback: string;
    }
  | {
      kind: "transit";
      href: string;
      badge: string;
      title: string;
      lines: { name: string; status: string; isNormal: boolean }[];
    };

function stripHtml(html: string): string {
  if (!html) return "";
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = t;
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
}

function isJunkImage(url: string): boolean {
  return /logo|icon|spacer|pixel|1x1|favicon|avatar|badge|btn|selo|sprite|tracking|ads?/i.test(url);
}

function extractImgFromHtml(html: string): string {
  if (!html) return "";
  const flat = html.replace(/\s+/g, " ").replace(/&amp;/g, "&");

  const patterns = [
    /<img[^>]+(?:src|data-src|data-lazy-src)=["'](https?:\/\/[^"']+)["']/gi,
    /<img[^>]+(?:src|data-src)=["'](\/\/[^"']+)["']/gi,
    /(?:srcset|data-srcset)=["'](https?:\/\/[^"'*\s,]+)/gi,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(flat)) !== null) {
      let u = m[1].replace(/\s+/g, "");
      if (u.startsWith("//")) u = `https:${u}`;
      if (isJunkImage(u)) continue;
      return u;
    }
  }

  const og = flat.match(/property=["']og:image["']\s+content=["'](https?:\/\/[^"']+)["']/i)
    || flat.match(/content=["'](https?:\/\/[^"']+)["']\s+property=["']og:image["']/i);
  if (og?.[1] && !isJunkImage(og[1])) return og[1];

  const glb = flat.match(/(https?:\/\/(?:s\d+-)?(?:g1|ge)\.glbimg\.com\/[^\s"'<>]+)/i);
  if (glb?.[1]) return glb[1].replace(/[),.;]+$/, "");

  return "";
}

function isYoutubeLink(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

/** Proxy de imagem — evita bloqueio de hotlink (Globo, etc.). */
function proxyImage(url: string): string {
  if (!url || !/^https?:\/\//i.test(url)) return url;
  if (/wsrv\.nl|images\.unsplash\.com|openweathermap|wttr\.in/i.test(url)) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//i, ""))}&w=640&h=420&fit=cover&output=jpg`;
}

function pickItemImage(item: Rss2JsonItem): string {
  const enc = item.enclosure;
  if (enc?.thumbnail?.trim() && /^https?:\/\//i.test(enc.thumbnail)) return enc.thumbnail.trim();
  const encLink = enc?.link?.trim() ?? "";
  if (encLink && (/^https?:\/\//i.test(encLink)) && (/image|\.(jpg|jpeg|png|webp|gif)/i.test(encLink) || enc?.type?.startsWith("image"))) {
    return encLink;
  }
  if (item.thumbnail?.trim() && /^https?:\/\//i.test(item.thumbnail) && !isJunkImage(item.thumbnail)) {
    return item.thumbnail.trim();
  }
  return extractImgFromHtml(item.content || item.description || "");
}

function wmoToOwmIcon(code: number, isDay: boolean): string {
  const s = isDay ? "d" : "n";
  if (code === 0) return `01${s}`;
  if (code <= 3) return `02${s}`;
  if (code <= 48) return `50${s}`;
  if (code <= 57) return `09${s}`;
  if (code <= 67) return `10${s}`;
  if (code <= 77) return `13${s}`;
  if (code <= 99) return `11${s}`;
  return `02${s}`;
}

function weatherLabelPt(code: number): string {
  if (code === 0) return "Céu limpo";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Neblina";
  if (code <= 57) return "Garoa";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Neve";
  if (code <= 99) return "Tempestade";
  return "Tempo variável";
}

async function fetchWeatherCard(
  lat: number,
  lon: number,
  placeLabel: string,
): Promise<RadioCard> {
  let temp = 24;
  let code = 1;
  let wind = 0;
  let isDay = true;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto&wind_speed_unit=kmh`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const j = (await res.json()) as {
        current?: {
          temperature_2m?: number;
          weather_code?: number;
          wind_speed_10m?: number;
          is_day?: number;
        };
      };
      if (j.current?.temperature_2m != null) temp = j.current.temperature_2m;
      if (j.current?.weather_code != null) code = j.current.weather_code;
      if (j.current?.wind_speed_10m != null) wind = Math.round(j.current.wind_speed_10m);
      if (j.current?.is_day != null) isDay = j.current.is_day === 1;
    }
  } catch {
    /* defaults */
  }

  const icon = wmoToOwmIcon(code, isDay);
  const q = encodeURIComponent(`previsão do tempo ${placeLabel}`);

  return {
    kind: "weather",
    href: `https://www.google.com/search?q=${q}`,
    badge: "Previsão do tempo",
    title: placeLabel,
    subtitle: `${Math.round(temp)}°C · ${weatherLabelPt(code)}${wind ? ` · vento ${wind} km/h` : ""}`,
    bgImage: `https://wttr.in/${lat},${lon}_0pq_transparency=ffffff.png`,
    iconImage: `https://openweathermap.org/img/wn/${icon}@4x.png`,
  };
}

function normalizeTitle(raw: string): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > 200 ? `${t.slice(0, 197)}…` : t;
}

async function fetchRss2Json(rssUrl: string, max: number): Promise<Rss2JsonItem[]> {
  const params = new URLSearchParams({ rss_url: rssUrl, count: String(Math.min(max, 20)) });
  const apiKey = (import.meta.env.VITE_RSS2JSON_API_KEY ?? "").trim();
  if (apiKey) params.set("api_key", apiKey);
  const res = await fetch(`${RSS2JSON}?${params.toString()}`, {
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`rss2json ${res.status}`);
  const data = (await res.json()) as Rss2JsonResponse;
  if (data.status !== "ok" || !data.items?.length) throw new Error("rss2json empty");
  return data.items.slice(0, max);
}

function textOf(el: Element | null, ...tags: string[]): string {
  if (!el) return "";
  for (const tag of tags) {
    const node = el.getElementsByTagName(tag)[0] || el.querySelector(tag);
    const t = node?.textContent?.trim();
    if (t) return t;
  }
  return "";
}

function parseFeedXml(xml: string): Rss2JsonItem[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return [];
  const out: Rss2JsonItem[] = [];

  doc.querySelectorAll("item, entry").forEach((el) => {
    const title = textOf(el, "title");
    let link =
      el.querySelector("link")?.getAttribute("href")?.trim() ||
      textOf(el, "link", "guid", "id");
    const pubDate = textOf(el, "pubDate", "published", "updated");
    const description = textOf(el, "description", "summary");
    const contentEncoded =
      el.getElementsByTagName("content:encoded")[0]?.textContent ||
      el.getElementsByTagNameNS("*", "encoded")[0]?.textContent ||
      el.getElementsByTagName("content")[0]?.textContent ||
      "";

    let thumbnail = "";
    const mediaContent = el.getElementsByTagNameNS("*", "content");
    for (let i = 0; i < mediaContent.length; i++) {
      const url = mediaContent[i].getAttribute("url") || "";
      const medium = mediaContent[i].getAttribute("medium") || "";
      const type = mediaContent[i].getAttribute("type") || "";
      if (url && (medium === "image" || type.startsWith("image") || /\.(jpg|jpeg|png|webp|gif)/i.test(url) || /glbimg|wp-content|uploads/i.test(url))) {
        thumbnail = url;
        break;
      }
    }
    if (!thumbnail) {
      const mediaThumb = el.getElementsByTagNameNS("*", "thumbnail")[0];
      thumbnail = mediaThumb?.getAttribute("url") || mediaThumb?.textContent?.trim() || "";
    }

    const enclosure = el.querySelector("enclosure");
    const encUrl = enclosure?.getAttribute("url") || "";
    const encType = enclosure?.getAttribute("type") || "";

    out.push({
      title,
      link,
      pubDate,
      description,
      content: contentEncoded || description,
      thumbnail: thumbnail || undefined,
      enclosure: encUrl
        ? { link: encUrl, type: encType, thumbnail: /image/i.test(encType) ? encUrl : undefined }
        : undefined,
    });
  });

  return out;
}

async function fetchFeedViaOneProxy(
  makeProxy: (url: string) => string,
  rssUrl: string,
  max: number,
): Promise<Rss2JsonItem[]> {
  const url = makeProxy(rssUrl);
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_MS) });
  if (!res.ok) throw new Error(`proxy ${res.status}`);

  let text = "";
  if (url.includes("allorigins.win/get")) {
    const j = (await res.json()) as { contents?: string };
    text = String(j.contents ?? "");
  } else {
    text = await res.text();
    try {
      const j = JSON.parse(text) as { contents?: string };
      if (j.contents) text = j.contents;
    } catch {
      /* XML puro */
    }
  }
  if (text.length < 80) throw new Error("proxy empty");
  const items = parseFeedXml(text);
  if (!items.length) throw new Error("parse empty");
  return items.slice(0, max);
}

/** Proxies em paralelo primeiro; rss2json só como reserva (evita 429). */
async function loadRssItems(rssUrl: string, max: number): Promise<Rss2JsonItem[]> {
  const proxyTasks = PROXIES.map((p) => fetchFeedViaOneProxy(p, rssUrl, max));

  const fromProxy = await new Promise<Rss2JsonItem[] | null>((resolve) => {
    let pending = proxyTasks.length;
    let done = false;
    proxyTasks.forEach((task) => {
      task
        .then((items) => {
          if (!done && items.length) {
            done = true;
            resolve(items);
          }
        })
        .catch(() => {})
        .finally(() => {
          pending -= 1;
          if (!done && pending === 0) resolve(null);
        });
    });
  });

  if (fromProxy?.length) return fromProxy;
  return fetchRss2Json(rssUrl, max);
}

function latestStory(
  items: Rss2JsonItem[],
  badge: string,
): RadioCard | null {
  for (const it of items) {
    const link = (it.link || "").trim();
    if (!link || isYoutubeLink(link)) continue;

    const titleRaw = (it.title || "").trim() || stripHtml(it.description || "");
    const title = normalizeTitle(titleRaw);
    if (!title) continue;

    const rawImg = pickItemImage(it);
    const fallback = FALLBACK_IMAGES[badge] || FALLBACK_IMAGES.Esportes;
    const image = proxyImage(rawImg || fallback);
    const imageFallback = proxyImage(fallback);
    const subtitle = normalizeTitle(stripHtml(it.description || it.content || ""));

    return {
      kind: "news",
      href: link,
      badge,
      title,
      subtitle,
      image,
      imageFallback,
    };
  }
  return null;
}

async function loadNewsCard(
  def: (typeof NEWS_CARD_FEEDS)[number],
): Promise<RadioCard | null> {
  const urls = [def.rss, ...(def.fallbackRss ?? [])];

  return new Promise((resolve) => {
    let pending = urls.length;
    let done = false;

    urls.forEach((url) => {
      loadRssItems(url, 12)
        .then((items) => {
          const story = latestStory(items, def.badge);
          if (!done && story) {
            done = true;
            resolve(story);
          }
        })
        .catch(() => {})
        .finally(() => {
          pending -= 1;
          if (!done && pending === 0) resolve(null);
        });
    });
  });
}

async function fetchPageHtml(pageUrl: string): Promise<string> {
  for (const makeProxy of PROXIES) {
    try {
      const proxied = makeProxy(pageUrl);
      const res = await fetch(proxied, { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      let text = await res.text();
      try {
        const j = JSON.parse(text) as { contents?: string };
        if (j.contents) text = j.contents;
      } catch {
        /* HTML puro */
      }
      if (text.length > 500) return text;
    } catch {
      /* próximo */
    }
  }
  throw new Error("santo page fetch failed");
}

function metaContent(html: string, property: string): string {
  const re1 = new RegExp(
    `property=["']${property}["']\\s+content=["']([^"']+)["']`,
    "i",
  );
  const re2 = new RegExp(
    `content=["']([^"']+)["']\\s+property=["']${property}["']`,
    "i",
  );
  const re3 = new RegExp(
    `name=["']${property}["']\\s+content=["']([^"']+)["']`,
    "i",
  );
  return re1.exec(html)?.[1] || re2.exec(html)?.[1] || re3.exec(html)?.[1] || "";
}

/** Santo do Dia — scrapa https://santo.cancaonova.com/ (atualiza com o site). */
async function fetchSantoDoDia(): Promise<RadioCard | null> {
  try {
    const html = await fetchPageHtml(SANTO_DIA_URL);

    const now = new Date();
    const dia = now.getDate();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const ano = now.getFullYear();
    const dayLinkRe = new RegExp(
      `href=["'](https:\\/\\/santo\\.cancaonova\\.com\\/santo\\/[^"']*sDia=${dia}&sMes=${mes}&sAno=${ano}[^"']*)["']`,
      "i",
    );
    const dayLink = dayLinkRe.exec(html)?.[1] || "";

    let title = normalizeTitle(metaContent(html, "og:title"));
    if (!title || /^canção nova/i.test(title)) {
      const entry =
        /<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ||
        /class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\//i.exec(html)?.[1] ||
        "";
      title = normalizeTitle(entry.replace(/<[^>]+>/g, " "));
    }
    if (!title) return null;

    const rawImg =
      metaContent(html, "og:image") ||
      extractImgFromHtml(html) ||
      FALLBACK_IMAGES["Santo do Dia"];
    const desc =
      normalizeTitle(stripHtml(metaContent(html, "og:description") || metaContent(html, "description"))) ||
      "Confira a vida e a oração do santo celebrado hoje.";

    return {
      kind: "news",
      href: dayLink || metaContent(html, "og:url") || SANTO_DIA_URL,
      badge: "Santo do Dia",
      title,
      subtitle: desc,
      image: proxyImage(rawImg),
      imageFallback: proxyImage(FALLBACK_IMAGES["Santo do Dia"]),
    };
  } catch {
    return null;
  }
}

const CACHE_KEY = "rcc_rnoticias_cache_v4";

function readCache(): RadioCard[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? (JSON.parse(cached) as RadioCard[]) : [];
  } catch {
    return [];
  }
}

const NewsSection = () => {
  const [cards, setCards] = useState<RadioCard[]>(() => readCache());
  const [isLoading, setIsLoading] = useState(() => readCache().length === 0);

  const load = useCallback(async () => {
    const slots: (RadioCard | null)[] = [null, null, null, null, null, null];

    const publish = () => {
      setCards((prev) => {
        const merged: RadioCard[] = [];
        for (let i = 0; i < 6; i++) {
          const card = slots[i] ?? prev[i];
          if (card) merged.push(card);
        }
        // Remove trânsito duplicado (ex.: cache antigo com metrô + trânsito)
        const deduped: RadioCard[] = [];
        let hasTransit = false;
        for (const card of merged) {
          const isTraffic =
            card.kind === "transit" ||
            card.badge.toLowerCase().includes("trânsito") ||
            card.badge.toLowerCase().includes("trens e metrô");
          if (isTraffic) {
            if (hasTransit) continue;
            hasTransit = true;
          }
          deduped.push(card);
        }
        const toSave = deduped.slice(0, 6);
        if (!toSave.length) return prev;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(toSave));
        } catch {
          /* ignore */
        }
        return toSave;
      });
      setIsLoading(false);
    };

    // 1 clima · 2 música · 3 canção nova · 4 trânsito (1x) · 5 santo do dia · 6 esportes
    const tasks: Promise<void>[] = [
      fetchWeatherCard(SP_LAT, SP_LON, FALLBACK_PLACE).then((c) => {
        slots[0] = c;
        publish();
      }),
      loadNewsCard(NEWS_CARD_FEEDS[0]).then((c) => {
        if (c) {
          slots[1] = c;
          publish();
        }
      }),
      loadNewsCard(NEWS_CARD_FEEDS[1]).then((c) => {
        if (c) {
          slots[2] = c;
          publish();
        }
      }),
      loadNewsCard(NEWS_CARD_FEEDS[2]).then((c) => {
        if (c) {
          slots[3] = { ...c, href: "https://www.waze.com/pt-BR/live-map/" };
          publish();
        }
      }),
      fetchSantoDoDia().then((c) => {
        if (c) {
          slots[4] = c;
          publish();
        }
      }),
      loadNewsCard(NEWS_CARD_FEEDS[3]).then((c) => {
        if (c) {
          slots[5] = c;
          publish();
        }
      }),
    ];

    await Promise.allSettled(tasks);
    publish();
    setIsLoading(false);
  }, []);

  const refreshSportsCard = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    const sports = await loadNewsCard(SPORTS_FEED);
    if (!sports) return;

    setCards((prev) => {
      const idx = prev.findIndex((c) => c.badge === "Esportes");
      if (idx >= 0) {
        const cur = prev[idx];
        if (cur.href === sports.href && cur.title === sports.title && cur.kind === "news" && sports.kind === "news" && cur.image === sports.image) {
          return prev;
        }
        const next = [...prev];
        next[idx] = sports;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      }

      // Slot 6 (índice 5) se ainda não existe
      const next = [...prev];
      if (next.length >= 6) next[5] = sports;
      else next.push(sports);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next.slice(0, 6)));
      } catch {
        /* ignore */
      }
      return next.slice(0, 6);
    });
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  // Esportes: atualização contínua enquanto a aba estiver visível
  useEffect(() => {
    refreshSportsCard();
    const t = setInterval(refreshSportsCard, SPORTS_REFRESH_MS);

    const onVisible = () => {
      if (!document.hidden) refreshSportsCard();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refreshSportsCard]);

  const skeletonKeys = ["w", "n1", "n2", "n3", "n4", "n5"];
  const showSkeleton = isLoading && cards.length === 0;

  return (
    <section className="h-full flex flex-col min-h-0" aria-labelledby="radio-noticias-heading">
      <div className="mb-3">
        <h2 id="radio-noticias-heading" className="text-xl font-bold text-foreground leading-tight">
          Rádio Notícias
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {showSkeleton
          ? skeletonKeys.map((k) => (
              <div
                key={k}
                className="rounded-lg border border-border bg-muted/40 animate-pulse overflow-hidden flex flex-col"
              >
                <div className="px-2.5 pt-2 pb-1">
                  <div className="h-3 w-28 rounded bg-muted/60" />
                </div>
                <div className="aspect-[3/2] bg-muted/60" />
                <div className="min-h-[3.25rem] px-2.5 py-2 border-t border-border/40 space-y-1">
                  <div className="h-3 flex-1 rounded bg-muted/60" />
                  <div className="h-3 w-4/5 rounded bg-muted/60" />
                </div>
              </div>
            ))
          : cards.length === 0
            ? (
                <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Não foi possível carregar os cartões. Atualize a página ou tente mais tarde.
                </div>
              )
            : cards.map((card, i) => (
                <a
                  key={`${card.kind}-${i}-${card.badge}-${card.href}-${"title" in card ? card.title : ""}`}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2.5 pt-2 pb-1">
                    {card.badge}
                  </p>

                  <div className="aspect-[3/2] overflow-hidden bg-gradient-to-br from-sky-950/40 via-violet-950/25 to-amber-950/20 shrink-0 flex items-center justify-center relative">
                    {card.kind === "weather" ? (
                      <>
                        <img
                          src={card.bgImage}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover object-top opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none pt-2">
                          <img
                            src={card.iconImage}
                            alt=""
                            className="w-[7.25rem] h-[7.25rem] object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                            width={116}
                            height={116}
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 rounded-md bg-background/90 backdrop-blur-sm px-2 py-1.5 text-center z-[2] pointer-events-none border border-border/40">
                          <p className="text-lg font-bold text-foreground leading-none">
                            {card.subtitle.split("·")[0]?.trim()}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                            {card.subtitle.split("·").slice(1).join("·").trim()}
                          </p>
                        </div>
                      </>
                    ) : card.kind === "transit" ? (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-muted/10">
                        <TrainFront className="h-14 w-14 text-primary/30 mb-2" />
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                          Status das Linhas
                        </span>
                      </div>
                    ) : card.kind === "news" && card.image ? (
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          if (el.dataset.fallback === "1") {
                            el.src = card.imageFallback;
                            return;
                          }
                          el.dataset.fallback = "1";
                          el.src = card.imageFallback || FALLBACK_IMAGES[card.badge] || FALLBACK_IMAGES.Esportes;
                        }}
                      />
                    ) : (
                      <Newspaper className="h-10 w-10 text-primary/35" />
                    )}
                  </div>

                  <div className="px-2.5 py-2 flex items-start justify-between gap-2 border-t border-border/60 flex-1 min-h-[3.25rem]">
                    <div className="min-w-0 flex-1">
                      {card.kind === "weather" ? (
                        <>
                          <h3 className="font-semibold text-sm text-foreground leading-snug truncate">
                            Previsão do tempo — {card.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 opacity-80 italic">
                            {card.subtitle.split("·")[0]?.trim()} · {card.subtitle.split("·")[1]?.trim()}
                          </p>
                        </>
                      ) : card.kind === "transit" ? (
                        <div className="space-y-1">
                          <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-tight line-clamp-1">
                            {card.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1.5 grayscale opacity-80 overflow-hidden max-h-[1.25rem]">
                            {card.lines.slice(0, 8).map((lin, idx) => (
                              <div
                                key={idx}
                                title={`${lin.name}: ${lin.status}`}
                                className={`w-3 h-3 rounded-full shrink-0 ${lin.isNormal ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-1">
                            {card.title}
                          </h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
                            {card.subtitle}
                          </p>
                        </>
                      )}
                    </div>
                    {card.kind === "weather" ? (
                      <CloudSun className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" aria-hidden />
                    ) : card.kind === "transit" ? (
                      <TrainFront className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                    ) : card.badge.toLowerCase().includes("trânsito") ? (
                      <Car className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" aria-hidden />
                    ) : card.badge.toLowerCase().includes("esporte") ? (
                      <Trophy className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden />
                    ) : card.badge.toLowerCase().includes("santo") ? (
                      <Cross className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden />
                    )}
                  </div>
                </a>
              ))}
      </div>
    </section>
  );
};

export default NewsSection;
