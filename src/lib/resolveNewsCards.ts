/**
 * Resolve cards de Rádio Notícias no browser (produção / estático).
 * Não depende de /api/* do Vite — usa proxies CORS públicos + weserv para imagens.
 */

export type ResolvedNewsCard = {
  badge: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

type FeedDef = {
  badge: string;
  feeds: string[];
  hrefOverride?: string;
  trafficFilter?: boolean;
};

const FEEDS: FeedDef[] = [
  { badge: "Música Católica", feeds: ["https://musica.cancaonova.com/feed/"] },
  { badge: "Canção Nova", feeds: ["https://noticias.cancaonova.com/feed/"] },
  {
    badge: "Trânsito em tempo real SP",
    feeds: [
      "https://feeds.folha.uol.com.br/cotidiano/rss091.xml",
      "https://news.google.com/rss/search?q=tr%C3%A1nsito+S%C3%A3o+Paulo+when:2d&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    ],
    hrefOverride: "https://www.waze.com/pt-BR/live-map/",
    trafficFilter: true,
  },
  {
    badge: "Esportes",
    feeds: [
      "https://www.gazetaesportiva.com/feed/",
      "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=pt-BR&gl=BR&ceid=BR:pt-419",
    ],
  },
];

const SANTO_URL = "https://santo.cancaonova.com/";
const RSS2JSON = "https://api.rss2json.com/v1/api.json";
const FETCH_MS = 12000;

const TEXT_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripTags(html: string): string {
  return decodeXml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function upgradeImg(url: string): string {
  return url
    .replace(/&amp;/g, "&")
    .replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp|gif))/i, "")
    .trim();
}

function isJunk(url: string): boolean {
  return /logo|icon|spacer|pixel|1x1|favicon|avatar|badge|sprite|tracking|unsplash|gstatic\.com\/gnews|google_news_/i.test(
    url,
  );
}

function unwrapLink(url: string): string {
  const u = decodeXml(url).trim();
  const folha = u.match(/\*(https?:\/\/www1\.folha\.uol\.com\.br\/[^\s]+)/i);
  if (folha) return folha[1];
  const emb = u.match(/\*(https?:\/\/[^\s]+)/i);
  if (emb) return emb[1];
  return u;
}

function meta(html: string, prop: string): string {
  const re1 = new RegExp(`property=["']${prop}["']\\s+content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`content=["']([^"']+)["']\\s+property=["']${prop}["']`, "i");
  const re3 = new RegExp(`name=["']${prop}["']\\s+content=["']([^"']+)["']`, "i");
  return decodeXml(re1.exec(html)?.[1] || re2.exec(html)?.[1] || re3.exec(html)?.[1] || "");
}

/** URL de exibição estável em produção (sem /api/img). */
export function displayImageUrl(original: string): string {
  const clean = upgradeImg(original);
  if (!clean || !/^https?:\/\//i.test(clean)) return "";
  if (/images\.weserv\.nl|wsrv\.nl/i.test(clean)) return clean;
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=720&h=480&fit=cover&output=jpg`;
}

async function fetchText(url: string): Promise<string> {
  for (const make of TEXT_PROXIES) {
    try {
      const proxied = make(url);
      const res = await fetch(proxied, { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      let text = await res.text();
      if (proxied.includes("allorigins.win/get")) {
        try {
          const j = JSON.parse(text) as { contents?: string };
          if (j.contents) text = j.contents;
        } catch {
          /* raw */
        }
      } else {
        try {
          const j = JSON.parse(text) as { contents?: string };
          if (j.contents) text = j.contents;
        } catch {
          /* raw */
        }
      }
      if (text.length > 200) return text;
    } catch {
      /* next */
    }
  }
  throw new Error(`fetch failed: ${url}`);
}

type Item = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image: string;
};

function parseItems(xml: string): Item[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  const out: Item[] = [];

  for (const block of blocks) {
    const title = stripTags(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(block)?.[1] || "");
    let link =
      /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block)?.[1]?.trim() ||
      /<link[^>]+href=["']([^"']+)["']/i.exec(block)?.[1] ||
      "";
    link = unwrapLink(link);
    const description =
      /<description[^>]*>([\s\S]*?)<\/description>/i.exec(block)?.[1] ||
      /<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i.exec(block)?.[1] ||
      "";
    const pubDate = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i.exec(block)?.[1] || "";

    let image =
      /enclosure[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ||
      /media:content[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ||
      /media:thumbnail[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ||
      "";

    if (!image) {
      const imgTag = /<img[^>]+(?:src|data-src)=["'](https?:\/\/[^"']+)["']/i.exec(decodeXml(description));
      if (imgTag) image = imgTag[1];
    }

    image = image ? upgradeImg(decodeXml(image)) : "";
    if (image && isJunk(image)) image = "";
    if (!title || !link) continue;

    out.push({
      title: title.replace(/\s+-\s+[^-]+$/, "").trim(),
      link,
      description: stripTags(description).slice(0, 160),
      pubDate,
      image,
    });
  }
  return out;
}

async function fetchRss2JsonItems(rssUrl: string): Promise<Item[]> {
  try {
    const params = new URLSearchParams({ rss_url: rssUrl, count: "12" });
    const res = await fetch(`${RSS2JSON}?${params}`, { signal: AbortSignal.timeout(FETCH_MS) });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      status?: string;
      items?: {
        title?: string;
        link?: string;
        pubDate?: string;
        description?: string;
        thumbnail?: string;
        enclosure?: { link?: string };
      }[];
    };
    if (data.status !== "ok" || !data.items?.length) return [];
    return data.items.map((it) => {
      const image = upgradeImg(it.thumbnail || it.enclosure?.link || "");
      return {
        title: (it.title || "").replace(/\s+-\s+[^-]+$/, "").trim(),
        link: unwrapLink(it.link || ""),
        description: stripTags(it.description || "").slice(0, 160),
        pubDate: it.pubDate || "",
        image: image && !isJunk(image) ? image : "",
      };
    });
  } catch {
    return [];
  }
}

async function loadFeedItems(feedUrl: string): Promise<Item[]> {
  try {
    const xml = await fetchText(feedUrl);
    const items = parseItems(xml);
    if (items.length) return items;
  } catch {
    /* rss2json */
  }
  return fetchRss2JsonItems(feedUrl);
}

async function fetchOgImage(articleUrl: string): Promise<string> {
  if (!articleUrl || /news\.google\.com/i.test(articleUrl)) return "";
  try {
    const html = await fetchText(articleUrl);
    const og = meta(html, "og:image") || meta(html, "twitter:image") || meta(html, "og:image:secure_url");
    if (og && /^https?:\/\//i.test(og) && !isJunk(og)) return upgradeImg(og);
  } catch {
    /* ignore */
  }
  return "";
}

function isTraffic(title: string, desc: string): boolean {
  return /tr[áa]nsito|engarrafamento|marginal|rodovia|avenida|pista|sem[áa]foro|guinch|ciclista|ciclomotor|motot[áa]xi|acidente|interdit|cet-?sp|congestionamento|[oô]nibus|metr[oô]/i.test(
    `${title} ${desc}`,
  );
}

async function resolveFeedCard(def: FeedDef): Promise<ResolvedNewsCard | null> {
  for (const feedUrl of def.feeds) {
    try {
      let items = await loadFeedItems(feedUrl);
      if (!items.length) continue;

      items.sort((a, b) => (Date.parse(b.pubDate || "") || 0) - (Date.parse(a.pubDate || "") || 0));

      if (def.trafficFilter) {
        const filtered = items.filter((it) => isTraffic(it.title, it.description));
        if (filtered.length) items = filtered;
        else continue;
      }

      items = [...items].sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));

      for (const it of items.slice(0, 8)) {
        if (/youtube\.com|youtu\.be/i.test(it.link)) continue;
        if (
          def.trafficFilter &&
          /tempo seco|frente fria|previs[aã]o|chuva|calor|temperatur/i.test(it.title) &&
          !/tr[áa]nsito|engarrafamento|guinch|acidente|interdit/i.test(`${it.title} ${it.description}`)
        ) {
          continue;
        }

        let image = it.image;
        if (!image || /-\d{2,3}x\d{2,3}\./i.test(image)) {
          const og = await fetchOgImage(it.link);
          if (og) image = og;
        } else {
          const og = await fetchOgImage(it.link);
          if (og) {
            try {
              const ha = new URL(image).hostname.split(".").slice(-2).join(".");
              const hb = new URL(og).hostname.split(".").slice(-2).join(".");
              if (ha === hb) image = og;
            } catch {
              image = og;
            }
          }
        }

        if (!image || isJunk(image)) continue;

        return {
          badge: def.badge,
          title: it.title.slice(0, 120),
          subtitle: (it.description || it.title).slice(0, 120),
          href: def.hrefOverride || it.link,
          image,
        };
      }
    } catch {
      /* next feed */
    }
  }
  return null;
}

async function resolveSanto(): Promise<ResolvedNewsCard | null> {
  try {
    const home = await fetchText(SANTO_URL);
    const now = new Date();
    const dia = now.getDate();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const ano = now.getFullYear();
    const dayRe = new RegExp(
      `href=["'](https:\\/\\/santo\\.cancaonova\\.com\\/santo\\/[^"']*sDia=${dia}&sMes=${mes}&sAno=${ano}[^"']*)["']`,
      "i",
    );
    const dayLink = dayRe.exec(home)?.[1] || SANTO_URL;

    let html = home;
    if (dayLink !== SANTO_URL) {
      try {
        html = await fetchText(dayLink);
      } catch {
        /* home */
      }
    }

    let title = meta(html, "og:title");
    if (!title || /^canção nova/i.test(title)) {
      title = stripTags(
        /<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] || "",
      );
    }
    const image = meta(html, "og:image") || meta(html, "twitter:image");
    if (!title || !image || isJunk(image)) return null;

    return {
      badge: "Santo do Dia",
      title: title.slice(0, 120),
      subtitle: (meta(html, "og:description") || "Santo celebrado hoje").slice(0, 120),
      href: dayLink,
      image: upgradeImg(image),
    };
  } catch {
    return null;
  }
}

/** Resolve todos os cards de notícia no browser (produção). */
export async function resolveNewsCardsInBrowser(): Promise<ResolvedNewsCard[]> {
  const [musica, noticias, transito, santo, esportes] = await Promise.all([
    resolveFeedCard(FEEDS[0]),
    resolveFeedCard(FEEDS[1]),
    resolveFeedCard(FEEDS[2]),
    resolveSanto(),
    resolveFeedCard(FEEDS[3]),
  ]);

  return [musica, noticias, transito, santo, esportes].filter(
    (c): c is ResolvedNewsCard => !!c && !!c.image && !!c.title,
  );
}
