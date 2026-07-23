import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Instagram, Youtube, Newspaper } from "lucide-react";
import CaminhadaSection from "@/components/CaminhadaSection";

interface NewsItem {
  title: string;
  img: string;
  /** URL original (CDN Instagram) para fallback se o proxy falhar */
  imgOriginal?: string;
  link: string;
  desc: string;
  badge: string;
  position?: string;
}

const IG_PROFILE = "https://www.instagram.com/radio_santaritadecassia/";
const IG_USERNAME = "radio_santaritadecassia";
const IG_EMBED = "https://www.instagram.com/radio_santaritadecassia/embed/";
const YT_CHANNEL = "https://www.youtube.com/@PadrePH";
/** Canal oficial @PadrePH (resolvido via YouTube InnerTube). */
const YT_CHANNEL_ID = "UC1F-NuywrrTYVUq370yR9WQ";
const YT_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

/** Proxies para HTML (Instagram). Jina funciona bem com embed. */
const HTML_PROXIES = [
  (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`,
  (url: string) => `https://r.jina.ai/${url}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

/** Proxies para XML/RSS do YouTube — SEM jina (ele transforma o feed e quebra o parse). */
const XML_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

const RSS2JSON = "https://api.rss2json.com/v1/api.json";
const FETCH_MS = 14000;
const REFRESH_MS = 5 * 60 * 1000;
const CACHE_KEY = "rcc_santarita_ig_yt_v8";

function proxyImg(url: string): string {
  const clean = decodeIgUrl(url);
  if (!clean || !/^https?:\/\//i.test(clean)) return clean || "";
  if (/i\.ytimg\.com/i.test(clean)) return clean;
  // images.weserv.nl — mais estável no browser para CDN do Instagram
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=720&h=480&fit=cover&output=jpg`;
}

/** Recupera URL original a partir de weserv/wsrv ou CDN. */
function resolveOriginalImg(item: NewsItem): string {
  if (item.imgOriginal) return decodeIgUrl(item.imgOriginal);
  const fromProxy = item.img || "";
  const m = fromProxy.match(/[?&]url=([^&]+)/i);
  if (m) {
    try {
      const decoded = decodeURIComponent(m[1]);
      if (/^https?:\/\//i.test(decoded)) return decodeIgUrl(decoded);
    } catch {
      /* ignore */
    }
  }
  if (/cdninstagram|fbcdn|scontent/i.test(fromProxy)) return decodeIgUrl(fromProxy);
  return "";
}

function igImageSources(item: NewsItem): string[] {
  const original = resolveOriginalImg(item);
  const fromProxy = item.img || "";
  const sources: string[] = [];

  const add = (u: string) => {
    if (u && !sources.includes(u)) sources.push(u);
  };

  if (original) {
    // weserv primeiro: converte webp/heic → jpg e funciona em produção
    add(`https://images.weserv.nl/?url=${encodeURIComponent(original)}&w=720&h=480&fit=cover&output=jpg`);
    add(`https://wsrv.nl/?url=${encodeURIComponent(original)}&w=720&h=480&fit=cover&output=jpg`);
    // proxy local só no Vite (dev)
    if (import.meta.env.DEV) {
      add(`/api/ig-img?u=${encodeURIComponent(original)}`);
    }
    add(original);
  }
  if (fromProxy) add(fromProxy);

  return sources;
}

function decodeIgUrl(u: string): string {
  return u
    .replace(/&amp;/g, "&")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\u002F/g, "/");
}

async function fetchText(url: string, proxies: ((u: string) => string)[] = HTML_PROXIES): Promise<string> {
  for (const make of proxies) {
    try {
      const proxied = make(url);
      const res = await fetch(proxied, { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      let text = await res.text();
      try {
        const j = JSON.parse(text) as { contents?: string };
        if (j.contents) text = j.contents;
      } catch {
        /* texto puro */
      }
      if (text.length > 300) return text;
    } catch {
      /* próximo */
    }
  }
  throw new Error(`fetch failed: ${url}`);
}

async function fetchYoutubeXml(feedUrl: string): Promise<string> {
  // 0) Proxy local do Vite (dev) — mais confiável
  try {
    const res = await fetch("/api/yt-padreph", { signal: AbortSignal.timeout(FETCH_MS) });
    if (res.ok) {
      const text = await res.text();
      if (/<entry[\s>]/i.test(text)) return text;
    }
  } catch {
    /* produção / fora do vite */
  }

  // 1) rss2json (CORS ok no browser)
  try {
    const params = new URLSearchParams({ rss_url: feedUrl, count: "8" });
    const res = await fetch(`${RSS2JSON}?${params}`, { signal: AbortSignal.timeout(FETCH_MS) });
    if (res.ok) {
      const data = (await res.json()) as {
        status?: string;
        items?: {
          title?: string;
          link?: string;
          pubDate?: string;
          thumbnail?: string;
          enclosure?: { link?: string };
        }[];
      };
      if (data.status === "ok" && data.items?.length) {
        const entries = data.items
          .map((it) => {
            const link = it.link || "";
            const id = link.match(/[?&]v=([^&]+)/)?.[1] || "";
            const thumb =
              it.thumbnail ||
              it.enclosure?.link ||
              (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");
            return `<entry><title>${escapeXml(it.title || "")}</title><link href="${link}"/><published>${it.pubDate || ""}</published><yt:videoId>${id}</yt:videoId><media:thumbnail url="${thumb}"/></entry>`;
          })
          .join("");
        return `<?xml version="1.0"?><feed>${entries}</feed>`;
      }
    }
  } catch {
    /* segue */
  }

  // 2) Proxies que preservam XML (sem jina)
  const xml = await fetchText(feedUrl, XML_PROXIES);
  if (!/<entry[\s>]/i.test(xml) && !/<item[\s>]/i.test(xml)) {
    throw new Error("youtube feed sem entradas");
  }
  return xml;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Remove nomes de arquivo/markdown de imagem; devolve só o texto da postagem. */
function isPlaceholderCaption(text: string): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return true;
  if (/^!\[/i.test(t)) return true;
  if (/^(Image|Imagem|Img)\s*\d*\s*:?\s*$/i.test(t)) return true;
  if (/profile picture|foto do perfil/i.test(t)) return true;
  return false;
}

function stripImageLabel(raw: string): string {
  return (raw || "")
    .replace(/!\[/g, "")
    .replace(/\]\([^)]*\)/g, "")
    .replace(/^(Image|Imagem|Img)\s*\d*\s*:\s*/i, "")
    .replace(/^(Image|Imagem|Img)\s*\d+\s*/i, "")
    .replace(/\b(Image|Imagem)\s*\d+\b:?\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanCaption(alt: string): string {
  const t = stripImageLabel(alt);
  if (isPlaceholderCaption(t) || isPlaceholderCaption(alt)) return "";
  // remove emojis excessivos no fim / markdown residual
  return t.replace(/^[:\-–—]\s*/, "").slice(0, 220);
}

/** Título curto + descrição de 1 linha a partir da legenda do post. */
function formatPostCopy(caption: string): { title: string; desc: string } {
  const text = cleanCaption(caption);
  if (!text) {
    return {
      title: "Publicação da Rádio Santa Rita",
      desc: "Veja no Instagram @radio_santaritadecassia",
    };
  }

  // Quebra em frase (primeiro ponto / exclamação / interrogação)
  const sentenceMatch = text.match(/^(.{20,110}?[.!?])(\s+|$)/);
  let title: string;
  let rest: string;

  if (sentenceMatch) {
    title = sentenceMatch[1].trim();
    rest = text.slice(sentenceMatch[0].length).trim();
  } else if (text.length <= 70) {
    title = text;
    rest = "";
  } else {
    // Corta no último espaço antes de ~70 chars
    const cut = text.lastIndexOf(" ", 70);
    const at = cut > 40 ? cut : 70;
    title = `${text.slice(0, at).trim()}…`;
    rest = text.slice(at).trim();
  }

  // Descrição: 1 linha breve
  let desc = rest || text;
  if (desc === title) {
    desc = "Confira a publicação completa no Instagram";
  } else {
    const descCut = desc.length > 90 ? `${desc.slice(0, desc.lastIndexOf(" ", 90) > 40 ? desc.lastIndexOf(" ", 90) : 90).trim()}…` : desc;
    desc = descCut;
  }

  return {
    title: title.slice(0, 90),
    desc: desc.slice(0, 100),
  };
}

function parseInstagramEmbed(raw: string): NewsItem[] {
  /** Ordem do embed = mais recente primeiro (após o avatar). */
  type Cand = { caption: string; img: string; imgOriginal: string; link: string };
  const ordered: Cand[] = [];
  const seenImg = new Set<string>();

  const push = (captionRaw: string, image: string, link?: string) => {
    const img = decodeIgUrl(image);
    if (!img || !/cdninstagram|fbcdn|scontent/i.test(img)) return;
    // ignora avatar do perfil
    if (/t51\.82787-19\/|s100x100|s150x150|profile_pic/i.test(img)) return;
    if (/profile picture|foto do perfil/i.test(captionRaw || "")) return;

    const key = img.split("?")[0];
    if (seenImg.has(key)) return;
    seenImg.add(key);

    ordered.push({
      caption: cleanCaption(captionRaw),
      img: proxyImg(img),
      imgOriginal: img,
      link: link || IG_PROFILE,
    });
  };

  // Markdown jina — ordem preservada (post mais novo primeiro)
  const mdImgs = raw.matchAll(
    /!\[([^\]]*)\]\((https:\/\/scontent[^)\s]+)\)/gi,
  );
  for (const m of mdImgs) {
    push(m[1] || "", m[2]);
  }

  // HTML / JSON (fallback se markdown não trouxe posts)
  if (ordered.length < 2) {
    const codes = [...raw.matchAll(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/gi)].map((m) => m[1]);
    const imgs = [...raw.matchAll(/https:\/\/scontent[^"'\\\s>]+/gi)].map((m) => decodeIgUrl(m[0]));
    const captions = [...raw.matchAll(/alt=["']([^"']*)["']/gi)].map((m) => m[1]);
    const postImgs = imgs.filter((u) => !/t51\.82787-19\/|_s100x100|_s150x150/i.test(u));
    postImgs.forEach((img, i) => {
      push(captions[i] || "", img, codes[i] ? `https://www.instagram.com/p/${codes[i]}/` : IG_PROFILE);
    });
  }

  if (ordered.length < 2) {
    const edges = raw.matchAll(
      /"shortcode"\s*:\s*"([A-Za-z0-9_-]+)"[\s\S]{0,900}?"display_url"\s*:\s*"(https:[^"]+)"[\s\S]{0,600}?"text"\s*:\s*"((?:\\.|[^"\\])*)"/g,
    );
    for (const m of edges) {
      const caption = m[3].replace(/\\n/g, " ").replace(/\\"/g, '"');
      push(caption, m[2], `https://www.instagram.com/p/${m[1]}/`);
    }
  }

  // Sempre os 2 posts MAIS RECENTES (índices 0 e 1 do embed)
  return ordered.slice(0, 2).map((c, index) => {
    if (c.caption) {
      const copy = formatPostCopy(c.caption);
      return {
        title: copy.title,
        desc: copy.desc,
        img: c.img,
        imgOriginal: c.imgOriginal,
        link: c.link,
        badge: "Instagram",
      };
    }
    return {
      title: index === 0 ? "Publicação mais recente" : "Nova publicação",
      desc: "Confira a postagem completa no Instagram",
      img: c.img,
      imgOriginal: c.imgOriginal,
      link: c.link,
      badge: "Instagram",
    };
  });
}

async function fetchInstagramCards(): Promise<NewsItem[]> {
  // 1) Tenta API/JSON do perfil (ordem cronológica + legendas)
  try {
    const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${IG_USERNAME}`;
    const raw = await fetchText(apiUrl);
    const fromApi = parseInstagramEmbed(raw);
    // Se o JSON trouxe posts com legenda, usa (já vem do mais recente)
    if (fromApi.length >= 1 && fromApi.some((p) => !/Publicação mais recente|Nova publicação/i.test(p.title))) {
      return fromApi.slice(0, 2);
    }
    if (fromApi.length >= 2) return fromApi.slice(0, 2);
  } catch {
    /* segue para embed */
  }

  // 2) Embed oficial — posts na ordem (mais recente primeiro)
  const sources = [IG_EMBED, IG_PROFILE];
  for (const url of sources) {
    try {
      const raw = await fetchText(url);
      const posts = parseInstagramEmbed(raw).filter((p) => p.img && !/unsplash/i.test(p.img));
      if (posts.length >= 1) return posts.slice(0, 2);
    } catch {
      /* próxima fonte */
    }
  }

  const profilePic = proxyImg(`https://unavatar.io/instagram/${IG_USERNAME}`);
  return [
    {
      title: "Rádio Santa Rita de Cássia no Instagram",
      desc: "Abra o perfil para ver as publicações mais recentes",
      img: profilePic,
      link: IG_PROFILE,
      badge: "Instagram",
    },
    {
      title: "@radio_santaritadecassia",
      desc: "Novidades e programação no Instagram",
      img: profilePic,
      link: IG_PROFILE,
      badge: "Instagram",
    },
  ];
}

function parseYoutubeAtom(xml: string): NewsItem | null {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return null;

  const entries = Array.from(doc.querySelectorAll("entry"));
  if (!entries.length) return null;

  type Parsed = { id: string; title: string; thumb: string; published: string; ts: number };
  const parsed: Parsed[] = [];

  for (const entry of entries) {
    let id =
      entry.getElementsByTagName("yt:videoId")[0]?.textContent ||
      entry.querySelector("videoId")?.textContent ||
      "";
    if (!id) {
      const href =
        entry.querySelector("link")?.getAttribute("href") ||
        entry.querySelector("link")?.textContent ||
        "";
      const m = href.match(/[?&]v=([^&]+)/) || href.match(/youtu\.be\/([^?&/]+)/);
      if (m) id = m[1];
    }
    if (!id) continue;

    const title = entry.querySelector("title")?.textContent?.trim() || "Vídeo do Padre PH";
    const media =
      entry.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url") ||
      entry.querySelector("thumbnail")?.getAttribute("url") ||
      "";
    const published = entry.querySelector("published")?.textContent || "";
    const ts = published ? Date.parse(published) || 0 : 0;

    parsed.push({
      id,
      title,
      thumb: media || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      published,
      ts,
    });
  }

  if (!parsed.length) return null;

  // Sempre o vídeo mais recente por data de publicação
  parsed.sort((a, b) => b.ts - a.ts);
  const latest = parsed[0];
  const dateLabel = latest.published
    ? new Date(latest.published).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "YouTube";

  return {
    title: latest.title,
    desc: `Padre PH · ${dateLabel}`,
    img: latest.thumb.startsWith("http")
      ? latest.thumb
      : `https://i.ytimg.com/vi/${latest.id}/hqdefault.jpg`,
    link: `https://www.youtube.com/watch?v=${latest.id}`,
    badge: "YouTube",
  };
}

async function fetchPadrePhCard(): Promise<NewsItem | null> {
  // 1) Feed Atom oficial do @PadrePH (sem jina — ele corrompe XML)
  try {
    const xml = await fetchYoutubeXml(YT_FEED);
    const item = parseYoutubeAtom(xml);
    if (item?.img && item.link.includes("watch?v=")) return item;
  } catch {
    /* segue */
  }

  // 2) Fetch direto do Atom
  try {
    const res = await fetch(YT_FEED, { signal: AbortSignal.timeout(FETCH_MS) });
    if (res.ok) {
      const item = parseYoutubeAtom(await res.text());
      if (item?.img) return item;
    }
  } catch {
    /* segue */
  }

  // 3) InnerTube (aba Vídeos) + proxy CORS
  try {
    const body = {
      context: {
        client: { clientName: "WEB", clientVersion: "2.20240101.00.00", hl: "pt", gl: "BR" },
      },
      browseId: YT_CHANNEL_ID,
      params: "EgZ2aWRlb3PyBgQKAjoA",
    };
    const ytBrowse =
      "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false&key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
    const endpoints = [ytBrowse, `https://corsproxy.io/?${encodeURIComponent(ytBrowse)}`];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(FETCH_MS),
        });
        if (!res.ok) continue;
        const text = await res.text();
        const ids = [...text.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]);
        const id = ids[0];
        if (!id) continue;
        const titleMatch =
          text.match(new RegExp(`"videoId":"${id}"[\\s\\S]{0,500}?"text":"([^"]{3,120})"`)) ||
          text.match(new RegExp(`"text":"([^"]{3,120})"[\\s\\S]{0,200}?"videoId":"${id}"`));
        const title = (titleMatch?.[1] || "Vídeo recente — Padre PH").replace(/\\u0026/g, "&");
        return {
          title,
          desc: "Último vídeo do canal Padre PH",
          img: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          link: `https://www.youtube.com/watch?v=${id}`,
          badge: "YouTube",
        };
      } catch {
        /* próximo */
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

function CardMedia({ item }: { item: NewsItem }) {
  const sources =
    item.badge === "Instagram"
      ? igImageSources(item)
      : item.badge === "YouTube"
        ? [
            item.img,
            ...(item.link.includes("v=")
              ? [`https://i.ytimg.com/vi/${item.link.match(/v=([^&]+)/)?.[1]}/hqdefault.jpg`]
              : []),
          ].filter(Boolean) as string[]
        : ([item.img].filter(Boolean) as string[]);

  const [srcIndex, setSrcIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const sourceKey = `${item.badge}|${item.img}|${item.imgOriginal || ""}|${item.link}`;

  useEffect(() => {
    setSrcIndex(0);
    setExhausted(false);
  }, [sourceKey]);

  const src = sources[srcIndex];

  if (exhausted || !src) {
    return <Newspaper className="h-10 w-10 text-primary/35" />;
  }

  return (
    <img
      key={src}
      src={src}
      alt={item.title}
      className={`w-full h-full object-cover ${item.position || "object-center"} group-hover:scale-105 transition-transform duration-500`}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (srcIndex + 1 < sources.length) setSrcIndex(srcIndex + 1);
        else setExhausted(true);
      }}
    />
  );
}

function readCache(): NewsItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as NewsItem[]) : [];
    // Descarta cache antigo com imagens genéricas (unsplash)
    if (parsed.some((p) => /unsplash\.com/i.test(p.img))) return [];
    return parsed.map((p) =>
      p.badge === "Instagram" && !p.imgOriginal
        ? { ...p, imgOriginal: resolveOriginalImg(p) || undefined }
        : p,
    );
  } catch {
    return [];
  }
}

const SantaRitaNewsSection = () => {
  const [srItems, setSrItems] = useState<NewsItem[]>(() => readCache());
  const [isLoading, setIsLoading] = useState(() => readCache().length === 0);

  const load = useCallback(async () => {
    try {
      const [igPosts, ytCard] = await Promise.all([fetchInstagramCards(), fetchPadrePhCard()]);

      const ig = igPosts.filter((p) => p.img && !/unsplash/i.test(p.img)).slice(0, 2);

      setSrItems((prev) => {
        const prevIg = prev.filter((p) => p.badge === "Instagram" && p.img);
        const prevYt = prev.find((p) => p.badge === "YouTube");

        // Sempre prefere posts frescos (URLs do CDN Instagram expiram)
        const nextIg = ig.length ? ig : prevIg.slice(0, 2);
        const nextYt = ytCard?.img ? ytCard : prevYt;

        const cards: NewsItem[] = [...nextIg.slice(0, 2)];
        if (nextYt) cards.push(nextYt);

        if (!cards.length) return prev;

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cards.slice(0, 3)));
        } catch {
          /* ignore */
        }
        return cards.slice(0, 3);
      });
    } catch {
      /* mantém cache */
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshYoutubeOnly = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    const ytCard = await fetchPadrePhCard();
    if (!ytCard?.img) return;

    setSrItems((prev) => {
      const withoutYt = prev.filter((p) => p.badge !== "YouTube");
      const next = [...withoutYt.slice(0, 2), ytCard].slice(0, 3);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_MS);
    const ytInterval = setInterval(refreshYoutubeOnly, 2 * 60 * 1000);
    const onVisible = () => {
      if (!document.hidden) {
        load();
        refreshYoutubeOnly();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      clearInterval(ytInterval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, refreshYoutubeOnly]);

  if (isLoading && srItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Rádio Santa Rita de Cássia</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden animate-pulse">
              <div className="h-3 w-20 m-2.5 rounded bg-muted" />
              <div className="aspect-[3/2] bg-muted" />
              <div className="h-10 m-2.5 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-foreground">Rádio Santa Rita de Cássia</h2>
          <div className="flex items-center gap-3">
            <a
              href={IG_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80 inline-flex items-center gap-1"
            >
              <Instagram className="h-3 w-3" /> Instagram
            </a>
            <a
              href={YT_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80 inline-flex items-center gap-1"
            >
              <Youtube className="h-3 w-3" /> Padre PH
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {srItems.slice(0, 3).map((item, i) => (
            <a
              key={`sr-${i}-${item.badge}-${item.link}-${item.title}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2.5 pt-2 pb-1 flex items-center gap-1">
                {item.badge === "YouTube" ? (
                  <Youtube className="h-3 w-3 text-red-500" />
                ) : (
                  <Instagram className="h-3 w-3 text-pink-500" />
                )}
                {item.badge}
              </p>

              <div className="aspect-[3/2] overflow-hidden bg-muted shrink-0 flex items-center justify-center relative">
                <CardMedia item={item} />
              </div>

              <div className="px-2.5 py-2 flex items-start justify-between gap-2 border-t border-border/60 flex-1 min-h-[3.25rem]">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
                    {item.desc || "Acesse para ver o conteúdo completo."}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden />
              </div>
            </a>
          ))}
        </div>
      </div>

      <CaminhadaSection />
    </div>
  );
};

export default SantaRitaNewsSection;
