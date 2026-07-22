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
  (url: string) => `/api/rss?u=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

/** Jina por último — transforma RSS em markdown e perde enclosure/thumbnail. */
const JINA_PROXY = (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`;

const SANTO_DIA_URL = "https://santo.cancaonova.com/";

function fallbackNewsCard(
  badge: string,
  title: string,
  subtitle: string,
  href: string,
): RadioCard {
  return {
    kind: "news",
    href,
    badge,
    title,
    subtitle,
    image: "",
    imageFallback: "",
  };
}

/** Sempre 6 slots — preenchidos com dados ao vivo quando o feed responde. */
function defaultCards(): RadioCard[] {
  return [
    {
      kind: "weather",
      href: `https://www.google.com/search?q=${encodeURIComponent(`previsão do tempo ${FALLBACK_PLACE}`)}`,
      badge: "Previsão do tempo",
      title: FALLBACK_PLACE,
      subtitle: "Atualizando…",
      bgImage: `https://wttr.in/${SP_LAT},${SP_LON}_0pq_transparency=ffffff.png`,
      iconImage: "https://openweathermap.org/img/wn/02d@4x.png",
    },
    fallbackNewsCard(
      "Música Católica",
      "Música católica e louvor",
      "Confira as novidades no portal da Canção Nova",
      "https://musica.cancaonova.com/",
    ),
    fallbackNewsCard(
      "Canção Nova",
      "Notícias da Canção Nova",
      "Acompanhe as últimas publicações",
      "https://noticias.cancaonova.com/",
    ),
    fallbackNewsCard(
      "Trânsito em tempo real SP",
      "Trânsito em São Paulo",
      "Veja o mapa ao vivo no Waze",
      "https://www.waze.com/pt-BR/live-map/",
    ),
    fallbackNewsCard(
      "Santo do Dia",
      "Santo do Dia",
      "Confira o santo celebrado hoje",
      SANTO_DIA_URL,
    ),
    fallbackNewsCard(
      "Esportes",
      "Últimas do esporte",
      "Acompanhe os destaques esportivos",
      "https://ge.globo.com/",
    ),
  ];
}

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
    rss: "https://feeds.folha.uol.com.br/cotidiano/rss091.xml",
    fallbackRss: [
      "https://news.google.com/rss/search?q=tr%C3%A1nsito+S%C3%A3o+Paulo+when:2d&hl=pt-BR&gl=BR&ceid=BR:pt-419",
      "https://g1.globo.com/dynamo/sao-paulo/transito/rss2.xml",
    ],
  },
  {
    badge: "Esportes",
    rss: "https://www.gazetaesportiva.com/feed/",
    fallbackRss: [
      "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=pt-BR&gl=BR&ceid=BR:pt-419",
      "https://g1.globo.com/dynamo/esporte/rss2.xml",
      "https://www.cnnbrasil.com.br/esportes/feed/",
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
      /** URL original da foto da matéria (para fallback de proxy) */
      imageOriginal?: string;
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
  return /logo|icon|spacer|pixel|1x1|favicon|avatar|badge|btn|selo|sprite|tracking|ads?|placeholder|gravatar|emoji|gstatic\.com\/gnews|google_news_\d+|J6_coFbogxhRI9iM864NL_liGXvsQp2AupsKei7z0cNNfDvGUmWUy20nuUhkREQyrp/i.test(
    url,
  );
}

/** WordPress e CDNs costumam servir -200x200; troca pela versão maior. */
function upgradeImageUrl(url: string): string {
  if (!url) return "";
  return url
    .replace(/&amp;/g, "&")
    .replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp|gif))/i, "")
    .replace(/\/thumbnails?\//i, "/")
    .trim();
}

function extractImgFromHtml(html: string): string {
  if (!html) return "";
  const flat = html.replace(/\s+/g, " ").replace(/&amp;/g, "&");

  const candidates: string[] = [];
  const patterns = [
    /<img[^>]+(?:src|data-src|data-lazy-src|data-original)=["'](https?:\/\/[^"']+)["']/gi,
    /<img[^>]+(?:src|data-src)=["'](\/\/[^"']+)["']/gi,
    /(?:srcset|data-srcset)=["'](https?:\/\/[^"'*\s,]+)/gi,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(flat)) !== null) {
      let u = m[1].replace(/\s+/g, "");
      if (u.startsWith("//")) u = `https:${u}`;
      if (isJunkImage(u)) continue;
      candidates.push(upgradeImageUrl(u));
    }
  }

  const og = flat.match(/property=["']og:image["']\s+content=["'](https?:\/\/[^"']+)["']/i)
    || flat.match(/content=["'](https?:\/\/[^"']+)["']\s+property=["']og:image["']/i);
  if (og?.[1] && !isJunkImage(og[1])) candidates.unshift(upgradeImageUrl(og[1]));

  const glb = flat.match(/(https?:\/\/(?:s\d+-)?(?:g1|ge)\.glbimg\.com\/[^\s"'<>]+)/i);
  if (glb?.[1]) candidates.push(upgradeImageUrl(glb[1].replace(/[),.;]+$/, "")));

  // Prefere URLs sem sufixo de miniatura / com resolução maior
  candidates.sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));
  return candidates[0] || "";
}

function scoreImageUrl(url: string): number {
  let s = 0;
  if (/og|1200|1080|720|640|large|full|original|uploads/i.test(url)) s += 5;
  if (/-\d{2,3}x\d{2,3}\./i.test(url)) s -= 8;
  if (/wp-content|glbimg|cancaonova|gazeta|cnn|static\./i.test(url)) s += 3;
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(url)) s += 2;
  return s;
}

function isYoutubeLink(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

/** Proxy de imagem — weserv primeiro (funciona no browser); /api/img como reserva no dev. */
function proxyImage(url: string): string {
  if (!url || !/^https?:\/\//i.test(url)) return url;
  if (/wsrv\.nl|images\.weserv\.nl|openweathermap|wttr\.in|\/api\/img/i.test(url)) {
    return url;
  }
  const clean = upgradeImageUrl(url);
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=720&h=480&fit=cover&output=jpg`;
}

function imageSources(primary: string, original?: string): string[] {
  const srcs: string[] = [];
  const add = (u: string) => {
    if (u && !srcs.includes(u) && !/unsplash\.com/i.test(u)) srcs.push(u);
  };
  const orig = upgradeImageUrl(original || "");
  add(primary);
  if (orig) {
    add(`https://images.weserv.nl/?url=${encodeURIComponent(orig)}&w=720&h=480&fit=cover&output=jpg`);
    add(`https://wsrv.nl/?url=${encodeURIComponent(orig)}&w=720&h=480&fit=cover&output=jpg`);
    if (import.meta.env.DEV) add(`/api/img?u=${encodeURIComponent(orig)}`);
    add(orig);
  }
  return srcs;
}

function pickItemImage(item: Rss2JsonItem): string {
  const enc = item.enclosure;
  if (enc?.thumbnail?.trim() && /^https?:\/\//i.test(enc.thumbnail) && !isJunkImage(enc.thumbnail)) {
    return upgradeImageUrl(enc.thumbnail.trim());
  }
  const encLink = enc?.link?.trim() ?? "";
  if (
    encLink &&
    /^https?:\/\//i.test(encLink) &&
    !isJunkImage(encLink) &&
    (/image|\.(jpg|jpeg|png|webp|gif)/i.test(encLink) || enc?.type?.startsWith("image"))
  ) {
    return upgradeImageUrl(encLink);
  }
  if (item.thumbnail?.trim() && /^https?:\/\//i.test(item.thumbnail) && !isJunkImage(item.thumbnail)) {
    return upgradeImageUrl(item.thumbnail.trim());
  }
  // Não varre o HTML do corpo (muitas imagens laterais/erradas).
  // A foto correta vem de media/enclosure ou og:image da matéria.
  return "";
}

/** Busca a foto oficial (og:image) da matéria — garante imagem correspondente à notícia. */
async function fetchOgImage(articleUrl: string): Promise<string> {
  if (!articleUrl || !/^https?:\/\//i.test(articleUrl)) return "";
  if (/news\.google\.com\/rss/i.test(articleUrl)) return "";
  try {
    const html = await fetchPageHtml(articleUrl);
    const og =
      metaContent(html, "og:image") ||
      metaContent(html, "twitter:image") ||
      extractImgFromHtml(html);
    if (og && /^https?:\/\//i.test(og) && !isJunkImage(og)) return upgradeImageUrl(og);
  } catch {
    /* ignore */
  }
  return "";
}

function unwrapArticleUrl(url: string): string {
  if (!url) return "";
  let u = url.replace(/&amp;/g, "&").trim();
  // Folha RSS: https://redir.folha.../*https://www1.folha...
  const folha = u.match(/\*(https?:\/\/www1\.folha\.uol\.com\.br\/[^\s]+)/i);
  if (folha) return folha[1];
  const embedded = u.match(/\*(https?:\/\/[^\s]+)/i);
  if (embedded) return embedded[1];
  return u;
}

function isTrafficRelated(title: string, description = ""): boolean {
  return /tr[áa]nsito|engarrafamento|marginal|rodovia|avenida|pista|sem[áa]foro|guinch|ciclista|ciclomotor|motot[áa]xi|acidente|interdit|cet-?sp|congestionamento|lento|trens|metr[oô]|[oô]nibus|faixa|cruzamento|reboque/i.test(
    `${title} ${description}`,
  );
}

function itemTimestamp(item: Rss2JsonItem): number {
  const t = Date.parse(item.pubDate || "");
  return Number.isFinite(t) ? t : 0;
}

function sortItemsNewest(items: Rss2JsonItem[]): Rss2JsonItem[] {
  return [...items].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
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
  // /api/rss só existe no Vite (dev)
  if (url.startsWith("/api/rss") && !import.meta.env.DEV) {
    throw new Error("local rss proxy unavailable");
  }

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

  let items = parseFeedXml(text);
  if (items.length) return items.slice(0, max);

  items = parseFeedMarkdown(text);
  if (!items.length) throw new Error("parse empty");
  return items.slice(0, max);
}

/** Extrai itens a partir do markdown do r.jina.ai. */
function parseFeedMarkdown(md: string): Rss2JsonItem[] {
  const out: Rss2JsonItem[] = [];
  const seen = new Set<string>();

  for (const m of md.matchAll(/\[([^\]]{8,180})\]\((https?:\/\/[^)\s]+)\)/g)) {
    const title = normalizeTitle(m[1]);
    const link = m[2].replace(/&amp;/g, "&");
    if (!title || !link) continue;
    if (/jina\.ai|corsproxy|allorigins|rss2json/i.test(link)) continue;
    if (isYoutubeLink(link)) continue;
    if (/\/feed\/?$/i.test(link) || /#(comments|respond)/i.test(link)) continue;
    const key = link.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ title, link, description: title });
    if (out.length >= 12) break;
  }

  return out;
}

/** Proxies em ordem: local XML primeiro (com fotos). Jina só se nada mais funcionar. */
async function loadRssItems(rssUrl: string, max: number): Promise<Rss2JsonItem[]> {
  const ordered = [...PROXIES, JINA_PROXY];

  for (const make of ordered) {
    try {
      const items = await fetchFeedViaOneProxy(make, rssUrl, max);
      if (!items.length) continue;
      // Prefere respostas que já trazem imagem da matéria
      const withImg = items.filter((it) => !!pickItemImage(it));
      if (withImg.length) return items;
      // Sem imagem no XML: ainda serve (vamos buscar og:image depois)
      if (!make(rssUrl).includes("jina.ai")) return items;
      // Jina sem imagem: só usa se for a única opção
    } catch {
      /* próximo */
    }
  }

  try {
    return await fetchRss2Json(rssUrl, max);
  } catch {
    return [];
  }
}

/**
 * Monta o card com a foto DA MATÉRIA (enclosure/media → og:image).
 * Nunca usa Unsplash/foto genérica de categoria.
 */
async function buildNewsCard(
  items: Rss2JsonItem[],
  badge: string,
): Promise<RadioCard | null> {
  const ordered = sortItemsNewest(items);
  const maxAgeMs = 1000 * 60 * 60 * 24 * 45;
  const now = Date.now();
  const isTransit = badge.toLowerCase().includes("trânsito");

  const fresh = ordered.filter((it) => {
    const ts = itemTimestamp(it);
    return !ts || now - ts < maxAgeMs;
  });
  let pool = fresh.length ? fresh : ordered;

  if (isTransit) {
    const trafficOnly = pool.filter((it) =>
      isTrafficRelated(it.title || "", stripHtml(it.description || it.content || "")),
    );
    if (trafficOnly.length) pool = trafficOnly;
  }

  // Prioriza itens que já têm imagem no feed
  pool = [...pool].sort((a, b) => {
    const ai = pickItemImage(a) ? 1 : 0;
    const bi = pickItemImage(b) ? 1 : 0;
    return bi - ai;
  });

  for (const it of pool.slice(0, 12)) {
    const link = unwrapArticleUrl((it.link || "").trim());
    if (!link || isYoutubeLink(link)) continue;

    const titleRaw = (it.title || "").trim() || stripHtml(it.description || "");
    const title = normalizeTitle(titleRaw.replace(/\s+-\s+[^-]+$/, ""));
    if (!title) continue;

    let articleUrl = link;
    if (/news\.google\.com/i.test(link)) {
      const fromHtml =
        (it.description || "").match(/href=["'](https?:\/\/(?!news\.google)[^"']+)["']/i)?.[1] ||
        (it.content || "").match(/href=["'](https?:\/\/(?!news\.google)[^"']+)["']/i)?.[1] ||
        "";
      if (fromHtml) articleUrl = unwrapArticleUrl(fromHtml);
    }

    // 1) Foto do próprio item RSS (já corresponde à notícia)
    let rawImg = pickItemImage(it);

    // 2) Completa/atualiza com og:image da página da matéria
    const needsOg = !rawImg || /-\d{2,3}x\d{2,3}\./i.test(rawImg);
    const og = await fetchOgImage(articleUrl);
    if (og) {
      if (needsOg) {
        rawImg = og;
      } else {
        try {
          const a = new URL(rawImg).hostname.replace(/^www\./, "");
          const b = new URL(og).hostname.replace(/^www\./, "");
          const domain = (h: string) => h.split(".").slice(-2).join(".");
          if (a === b || domain(a) === domain(b)) rawImg = og;
        } catch {
          rawImg = og;
        }
      }
    }

    if (!rawImg || /unsplash\.com/i.test(rawImg)) continue;

    const image = proxyImage(rawImg);
    const subtitle = normalizeTitle(stripHtml(it.description || it.content || "")) || title;

    return {
      kind: "news",
      href: isTransit ? "https://www.waze.com/pt-BR/live-map/" : articleUrl || link,
      badge,
      title,
      subtitle: subtitle === title ? `Fonte: ${badge}` : subtitle,
      image,
      imageFallback: proxyImage(rawImg),
      imageOriginal: rawImg,
    };
  }

  return null;
}

async function loadNewsCard(
  def: (typeof NEWS_CARD_FEEDS)[number],
): Promise<RadioCard | null> {
  const urls = [def.rss, ...(def.fallbackRss ?? [])];

  for (const url of urls) {
    try {
      const items = await loadRssItems(url, 16);
      const story = await buildNewsCard(items, def.badge);
      if (story) return story;
    } catch {
      /* próxima URL */
    }
  }
  return null;
}

async function fetchPageHtml(pageUrl: string): Promise<string> {
  // HTML: proxy local (dev) + CORS proxies — evita jina (vira markdown e quebra og:tags)
  const htmlProxies = [
    (url: string) => `/api/rss?u=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  ];

  for (const makeProxy of htmlProxies) {
    try {
      const proxied = makeProxy(pageUrl);
      if (proxied.startsWith("/api/") && !import.meta.env.DEV) continue;
      const res = await fetch(proxied, { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      let text = await res.text();
      try {
        const j = JSON.parse(text) as { contents?: string };
        if (j.contents) text = j.contents;
      } catch {
        /* HTML puro */
      }
      if (text.length > 500 && /<html|<head|og:title|entry-title/i.test(text)) return text;
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

    // Página do santo do dia (foto correta) — senão usa a home
    let pageHtml = html;
    let pageUrl = SANTO_DIA_URL;
    if (dayLink) {
      try {
        pageHtml = await fetchPageHtml(dayLink);
        pageUrl = dayLink;
      } catch {
        /* mantém home */
      }
    }

    let title = normalizeTitle(metaContent(pageHtml, "og:title"));
    if (!title || /^canção nova/i.test(title)) {
      const entry =
        /<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i.exec(pageHtml)?.[1] ||
        /class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\//i.exec(pageHtml)?.[1] ||
        "";
      title = normalizeTitle(entry.replace(/<[^>]+>/g, " "));
    }
    if (!title) return null;

    const rawImg =
      metaContent(pageHtml, "og:image") ||
      metaContent(pageHtml, "twitter:image") ||
      extractImgFromHtml(pageHtml);
    if (!rawImg || /unsplash/i.test(rawImg)) return null;

    const desc =
      normalizeTitle(
        stripHtml(metaContent(pageHtml, "og:description") || metaContent(pageHtml, "description")),
      ) || "Confira a vida e a oração do santo celebrado hoje.";

    return {
      kind: "news",
      href: pageUrl || metaContent(pageHtml, "og:url") || SANTO_DIA_URL,
      badge: "Santo do Dia",
      title,
      subtitle: desc,
      image: proxyImage(rawImg),
      imageFallback: proxyImage(rawImg),
      imageOriginal: upgradeImageUrl(rawImg),
    };
  } catch {
    return null;
  }
}

const CACHE_KEY = "rcc_rnoticias_cache_v8";

function isStockPhotoCard(card: RadioCard): boolean {
  if (card.kind !== "news") return false;
  const img = `${card.image || ""} ${card.imageOriginal || ""}`;
  return /unsplash\.com/i.test(img) || !card.image;
}

function readCache(): RadioCard[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const parsed = cached ? (JSON.parse(cached) as RadioCard[]) : [];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultCards();
    const base = defaultCards();
    for (let i = 0; i < 6; i++) {
      const c = parsed[i];
      if (c && !isStockPhotoCard(c)) base[i] = c;
    }
    return base;
  } catch {
    return defaultCards();
  }
}

function NewsCardImage({
  card,
}: {
  card: Extract<RadioCard, { kind: "news" }>;
}) {
  const sources = imageSources(card.image, card.imageOriginal || card.image);
  const [idx, setIdx] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const sourceKey = `${card.image}|${card.imageOriginal || ""}`;

  useEffect(() => {
    setIdx(0);
    setExhausted(false);
  }, [sourceKey]);

  const src = sources[idx];

  if (exhausted || !src) {
    return <Newspaper className="h-10 w-10 text-primary/35" />;
  }

  return (
    <img
      key={src}
      src={src}
      alt={card.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (idx + 1 < sources.length) setIdx(idx + 1);
        else setExhausted(true);
      }}
    />
  );
}

/** Carrega cards já resolvidos no servidor Vite (/api/news-cards). */
async function loadResolvedNewsCardsFromApi(): Promise<RadioCard[] | null> {
  try {
    const res = await fetch("/api/news-cards", { signal: AbortSignal.timeout(45000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok?: boolean;
      cards?: { badge: string; title: string; subtitle: string; href: string; image: string }[];
    };
    if (!data.ok || !data.cards?.length) return null;

    return data.cards
      .filter((c) => c.image && c.title && !/unsplash/i.test(c.image))
      .map((c) => ({
        kind: "news" as const,
        badge: c.badge,
        title: c.title,
        subtitle: c.subtitle || c.title,
        href: c.href,
        image: proxyImage(c.image),
        imageFallback: proxyImage(c.image),
        imageOriginal: c.image,
      }));
  } catch {
    return null;
  }
}

const NewsSection = () => {
  const [cards, setCards] = useState<RadioCard[]>(() => readCache());
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    const slots: (RadioCard | null)[] = [null, null, null, null, null, null];

    const publish = () => {
      setCards((prev) => {
        const base = defaultCards();
        const out: RadioCard[] = [];
        for (let i = 0; i < 6; i++) {
          const next = slots[i];
          const old = prev[i];
          if (next && !(next.kind === "news" && !next.image)) out.push(next);
          else if (old && !isStockPhotoCard(old)) out.push(old);
          else out.push(base[i]);
        }
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(out));
        } catch {
          /* ignore */
        }
        return out;
      });
      setIsLoading(false);
    };

    // Clima (client)
    const weatherTask = fetchWeatherCard(SP_LAT, SP_LON, FALLBACK_PLACE).then((c) => {
      slots[0] = c;
      publish();
    });

    // Caminho principal: API local resolve título + foto real no servidor
    const apiCards = await loadResolvedNewsCardsFromApi();
    if (apiCards?.length) {
      const byBadge = (b: string) =>
        apiCards.find((c) => c.badge.toLowerCase() === b.toLowerCase()) || null;

      slots[1] = byBadge("Música Católica");
      slots[2] = byBadge("Canção Nova");
      slots[3] = byBadge("Trânsito em tempo real SP");
      slots[4] = byBadge("Santo do Dia");
      slots[5] = byBadge("Esportes");
      publish();
    } else {
      // Fallback: feeds no browser (se a API local não existir / produção)
      const tasks: Promise<void>[] = [
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
    }

    await weatherTask;
    publish();
    setIsLoading(false);
  }, []);

  const refreshSportsCard = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;

    // Tenta API local primeiro
    try {
      const apiCards = await loadResolvedNewsCardsFromApi();
      const sports = apiCards?.find((c) => c.badge === "Esportes");
      if (sports?.image) {
        setCards((prev) => {
          const next = [...(prev.length === 6 ? prev : defaultCards())];
          while (next.length < 6) next.push(defaultCards()[next.length]);
          next[5] = sports;
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(next.slice(0, 6)));
          } catch {
            /* ignore */
          }
          return next.slice(0, 6);
        });
        return;
      }
    } catch {
      /* fallback abaixo */
    }

    const sports = await loadNewsCard(SPORTS_FEED);
    if (!sports?.image) return;

    setCards((prev) => {
      const next = [...(prev.length === 6 ? prev : defaultCards())];
      while (next.length < 6) next.push(defaultCards()[next.length]);
      next[5] = sports;
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
    <section className="w-full" aria-labelledby="radio-noticias-heading">
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
                      <NewsCardImage card={card} />
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
