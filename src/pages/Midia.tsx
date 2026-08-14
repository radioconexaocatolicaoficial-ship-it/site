import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Play } from "lucide-react";
import Layout from "@/components/Layout";
import LojaCard from "@/components/LojaCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import midiaBanner from "@/assets/midia-banner.jpg";

import ig1 from "@/assets/midia/fotos/ig-1.jpg";
import ig2 from "@/assets/midia/fotos/ig-2.jpg";
import ig3 from "@/assets/midia/fotos/ig-3.jpg";
import ig4 from "@/assets/midia/fotos/ig-4.jpg";
import ig5 from "@/assets/midia/fotos/ig-5.jpg";
import ig6 from "@/assets/midia/fotos/ig-6.jpg";
import ig7 from "@/assets/midia/fotos/ig-7.jpg";
import ig8 from "@/assets/midia/fotos/ig-8.jpg";

import yt1 from "@/assets/midia/videos/yt-1.jpg";
import yt2 from "@/assets/midia/videos/yt-2.jpg";
import yt3 from "@/assets/midia/videos/yt-3.jpg";
import yt4 from "@/assets/midia/videos/yt-4.jpg";
import yt5 from "@/assets/midia/videos/yt-5.jpg";
import yt6 from "@/assets/midia/videos/yt-6.jpg";
import yt7 from "@/assets/midia/videos/yt-7.jpg";
import yt8 from "@/assets/midia/videos/yt-8.jpg";
import yt9 from "@/assets/midia/videos/yt-9.jpg";
import yt10 from "@/assets/midia/videos/yt-10.jpg";

import tt1 from "@/assets/midia/videos/tt-1.jpg";
import tt2 from "@/assets/midia/videos/tt-2.jpg";

import fb1 from "@/assets/midia/facebook/fb-1.jpg";
import fb2 from "@/assets/midia/facebook/fb-2.jpg";

type Network = "instagram" | "facebook" | "youtube" | "tiktok";

type Post = {
  id: string;
  network: Network;
  title: string;
  excerpt: string;
  image: string;
  href: string;
  kind: "foto" | "video";
};

const SOCIALS: {
  id: Network;
  label: string;
  handle: string;
  url: string;
  accent: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@radioconexaocatolicaoficial",
    url: "https://www.instagram.com/radioconexaocatolicaoficial/",
    accent: "#E1306C",
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: "@radioconexaocatolicaofical",
    url: "https://www.youtube.com/@radioconexaocatolicaofical",
    accent: "#FF0000",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@radioconexaocatolica",
    url: "https://www.tiktok.com/@radioconexaocatolica",
    accent: "#111111",
  },
  {
    id: "facebook",
    label: "Facebook",
    handle: "radioconexaocatolicaofical",
    url: "https://www.facebook.com/radioconexaocatolicaofical",
    accent: "#1877F2",
  },
];

function youtubeEmbedUrl(href: string): string | null {
  const m = href.match(/(?:youtu\.be\/|v=|\/shorts\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : null;
}

function tiktokEmbedUrl(href: string): string | null {
  const m = href.match(/\/video\/(\d+)/);
  return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
}

/** Fotos oficiais do Instagram (imagem + post correspondentes). */
const LOCAL_PHOTOS: Post[] = [
  { id: "ig1", network: "instagram", title: "Dia de Nossa Senhora de Fátima — 13 de Maio", excerpt: "Instagram oficial da rádio", image: ig1, href: "https://www.instagram.com/p/DYSMn7fuD0u/", kind: "foto" },
  { id: "ig2", network: "instagram", title: "Corpus Christi", excerpt: "Instagram oficial da rádio", image: ig2, href: "https://www.instagram.com/p/DZLWsWXEQh7/", kind: "foto" },
  { id: "ig3", network: "instagram", title: "Gratidão aos jovens da Diocese", excerpt: "Tapete de Corpus Christi — Instagram oficial", image: ig3, href: "https://www.instagram.com/p/DZJ1-qggIYf/", kind: "foto" },
  { id: "ig4", network: "instagram", title: "Gratidão aos jovens da Diocese", excerpt: "Tapete de Corpus Christi — Instagram oficial", image: ig4, href: "https://www.instagram.com/p/DZKua4rxuTl/", kind: "foto" },
  { id: "ig5", network: "instagram", title: "Publicação no Instagram", excerpt: "Instagram oficial da rádio", image: ig5, href: "https://www.instagram.com/p/DZLHkgMEbBW/", kind: "foto" },
  { id: "ig6", network: "instagram", title: "Feliz Dia das Mães", excerpt: "Instagram oficial da rádio", image: ig6, href: "https://www.instagram.com/p/DYKUKgPjdFh/", kind: "foto" },
  { id: "ig7", network: "instagram", title: "Corpus Christi na Diocese de São Miguel", excerpt: "Instagram oficial da rádio", image: ig7, href: "https://www.instagram.com/p/DZNVCE0xPGd/", kind: "foto" },
  { id: "ig8", network: "instagram", title: "1º Cenáculo da Imaculada", excerpt: "Instagram oficial da rádio", image: ig8, href: "https://www.instagram.com/p/DX2ndvCtGUo/", kind: "foto" },
];

/** Vídeos baixados localmente (capas YouTube). */
const LOCAL_VIDEOS: Post[] = [
  { id: "yt1", network: "youtube", title: "Dia de Nossa Senhora de Fátima | 13 de Maio", excerpt: "YouTube", image: yt1, href: "https://www.youtube.com/watch?v=YTeH5WtTEjY", kind: "video" },
  { id: "yt2", network: "youtube", title: "Caminhada da Ressurreição 2026", excerpt: "YouTube", image: yt2, href: "https://www.youtube.com/watch?v=euw51CcF2WY", kind: "video" },
  { id: "yt3", network: "youtube", title: "Caminhada da Ressurreição 2026 | Zé", excerpt: "YouTube", image: yt3, href: "https://www.youtube.com/watch?v=XvjylzffQ_M", kind: "video" },
  { id: "yt4", network: "youtube", title: "Caminhada | Paulo do City Penha", excerpt: "YouTube", image: yt4, href: "https://www.youtube.com/watch?v=NpYXaTJSybU", kind: "video" },
  { id: "yt5", network: "youtube", title: "Caminhada | José Neto", excerpt: "YouTube", image: yt5, href: "https://www.youtube.com/watch?v=tHTNTBkdTFs", kind: "video" },
  { id: "yt6", network: "youtube", title: "Caminhada | Inspetores", excerpt: "YouTube", image: yt6, href: "https://www.youtube.com/watch?v=W--jsyRl_x4", kind: "video" },
  { id: "yt7", network: "youtube", title: "Caminhada | Enfermeira HSM", excerpt: "YouTube", image: yt7, href: "https://www.youtube.com/watch?v=ARn8LCJLVG4", kind: "video" },
  { id: "yt8", network: "youtube", title: "Caminhada | Comunicação", excerpt: "YouTube", image: yt8, href: "https://www.youtube.com/watch?v=isbQUK_nv6o", kind: "video" },
  { id: "yt9", network: "youtube", title: "Caminhada | Catarina e André", excerpt: "YouTube", image: yt9, href: "https://www.youtube.com/watch?v=JhB4lCfPasY", kind: "video" },
  { id: "yt10", network: "youtube", title: "Caminhada | Capitão Diccico", excerpt: "YouTube", image: yt10, href: "https://www.youtube.com/watch?v=JmRdx2D6Esg", kind: "video" },
];

/** Capas locais TikTok (últimos vídeos). */
const LOCAL_TIKTOKS: Post[] = [
  {
    id: "tt1",
    network: "tiktok",
    title: "Dia de Nossa Senhora de Fátima — 13 de Maio",
    excerpt: "TikTok oficial da rádio",
    image: tt1,
    href: "https://www.tiktok.com/@radioconexaocatolica/video/7639405290055830791",
    kind: "video",
  },
  {
    id: "tt2",
    network: "tiktok",
    title: "Feliz Dia das Mães",
    excerpt: "TikTok oficial da rádio",
    image: tt2,
    href: "https://www.tiktok.com/@radioconexaocatolica/video/7638267712128535816",
    kind: "video",
  },
];

/** Posts Facebook — imagens oficiais de https://www.facebook.com/radioconexaocatolicaofical */
const LOCAL_FACEBOOK: Post[] = [
  {
    id: "fb1",
    network: "facebook",
    title: "Feliz Aniversário, Carol!",
    excerpt: "Publicação oficial no Facebook da Rádio Conexão Católica.",
    image: fb1,
    href: "https://www.facebook.com/radioconexaocatolicaofical",
    kind: "foto",
  },
  {
    id: "fb2",
    network: "facebook",
    title: "Dia das Mães",
    excerpt: "Publicação oficial no Facebook da Rádio Conexão Católica.",
    image: fb2,
    href: "https://www.facebook.com/radioconexaocatolicaofical",
    kind: "foto",
  },
];

const PHOTOS_LIMIT = 8;
const VIDEOS_LIMIT = 10;
const IG_USER = "radioconexaocatolicaoficial";
const FB_PAGE = "radioconexaocatolicaofical";
const YT_CHANNEL_ID = "UCi33qNAezaFd0-TIC211CHA";
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;
const TIKTOK_USER = "radioconexaocatolica";
const FETCH_MS = 14000;
const REFRESH_MS = 5 * 60 * 1000;
const CACHE_KEY = "rcc_midia_layout_v10";

const HTML_PROXIES = [
  (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`,
  (url: string) => `https://r.jina.ai/${url}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

const XML_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

function decodeUrl(u: string) {
  return u.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\\//g, "/");
}

/** Só devolve imagem da mesma rede e do mesmo post — nunca misturar. */
function resolveImage(post: Partial<Post>): string {
  const href = post.href || "";
  const network = post.network;

  if (network === "instagram") {
    const shortcode = href.match(/\/p\/([A-Za-z0-9_-]+)/)?.[1];
    if (shortcode) {
      const byCode = LOCAL_PHOTOS.find((lp) => lp.href.includes(`/p/${shortcode}`));
      if (byCode) return byCode.image;
    }
    // Sem correspondência exata: não inventar outra foto
    return "";
  }

  if (network === "youtube") {
    const ym = href.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/);
    if (ym) {
      const local = LOCAL_VIDEOS.find((lp) => lp.href.includes(ym[1]));
      if (local) return local.image;
      // Capa oficial do YouTube para este vídeo
      return `https://i.ytimg.com/vi/${ym[1]}/hqdefault.jpg`;
    }
    return "";
  }

  if (network === "tiktok") {
    const tm = href.match(/\/video\/(\d+)/);
    if (tm) {
      const local = LOCAL_TIKTOKS.find((lp) => lp.href.includes(tm[1]));
      if (local) return local.image;
    }
    // Sem capa local deste vídeo: não usar imagem de outra rede
    return "";
  }

  if (network === "facebook") {
    const byId = LOCAL_FACEBOOK.find((lp) => lp.id === post.id);
    if (byId) return byId.image;
    if (post.image) return post.image;
    return "";
  }

  return "";
}

function withSafeImage(post: Post): Post {
  const image = resolveImage(post);
  return image ? { ...post, image } : post;
}

function cleanCaption(raw: string) {
  return raw.replace(/^Image\s+\d+:\s*/i, "").replace(/\s+by\s+@[\w._]+$/i, "").replace(/\s+/g, " ").trim();
}

function formatCopy(caption: string, fallback: string) {
  const text = cleanCaption(caption);
  if (!text || text.length < 8 || /^by @/i.test(text)) {
    return { title: fallback, excerpt: "Confira a publicação completa." };
  }
  if (text.length <= 70) return { title: text, excerpt: "Confira a publicação completa." };
  const cut = text.lastIndexOf(" ", 64);
  const at = cut > 28 ? cut : 64;
  return { title: `${text.slice(0, at).trim()}…`, excerpt: `${text.slice(at).trim().slice(0, 100)}` };
}

function ageHours(label: string): number {
  const m = label.match(/(\d+)\s+(hour|hours|day|days|week|weeks|month|months)\s+ago/i);
  if (!m) return Number.POSITIVE_INFINITY;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  if (u.startsWith("hour")) return n;
  if (u.startsWith("day")) return n * 24;
  if (u.startsWith("week")) return n * 24 * 7;
  if (u.startsWith("month")) return n * 24 * 30;
  return Number.POSITIVE_INFINITY;
}

async function fetchText(url: string, proxies = HTML_PROXIES) {
  for (const make of proxies) {
    try {
      const res = await fetch(make(url), { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      let text = await res.text();
      try {
        const j = JSON.parse(text) as { contents?: string };
        if (j.contents) text = j.contents;
      } catch {
        /* puro */
      }
      if (text.length > 300) return text;
    } catch {
      /* next */
    }
  }
  throw new Error("fetch fail");
}

async function fetchInstagramPosts(): Promise<Post[]> {
  const raw = await fetchText(`http://www.imginn.com/${IG_USER}/`);
  type Cand = { code: string; caption: string; img: string; hours: number };
  const byCode = new Map<string, Cand>();

  const paired = raw.matchAll(
    /!\[([^\]]*)\]\((https:\/\/[^)]+)\)\]\((?:https?:)?\/\/(?:www\.)?imginn\.com\/p\/([A-Za-z0-9_-]+)\/\)[\s\S]{0,400}?(\d+\s+(?:hour|hours|day|days|week|weeks|month|months)\s+ago)[\s\S]{0,500}?\[Download\]\((https:\/\/scontent[^)]+)\)/gi,
  );
  for (const m of paired) {
    const code = m[3];
    if (!code || byCode.has(code)) continue;
    const preview = decodeUrl(m[2]);
    if (/t51\.82787-19|s150x150|profile/i.test(preview)) continue;
    byCode.set(code, {
      code,
      caption: cleanCaption(m[1] || ""),
      img: decodeUrl(m[5]) || preview,
      hours: ageHours(m[4]),
    });
  }

  if (byCode.size < 2) {
    for (const m of raw.matchAll(
      /imginn\.com\/p\/([A-Za-z0-9_-]+)\/\)[\s\S]{0,500}?\[Download\]\((https:\/\/scontent[^)]+)\)/gi,
    )) {
      if (byCode.has(m[1])) continue;
      byCode.set(m[1], { code: m[1], caption: "", img: decodeUrl(m[2]), hours: Number.POSITIVE_INFINITY });
    }
  }

  const ranked = [...byCode.values()].sort((a, b) => a.hours - b.hours);
  // Só posts cuja imagem local existe (mesmo código) — sem misturar legenda/foto
  const matched = ranked
    .map((p) => {
      const local = LOCAL_PHOTOS.find((lp) => lp.href.includes(`/p/${p.code}`));
      if (!local) return null;
      const copy = formatCopy(p.caption, local.title);
      return {
        id: `ig-${p.code}`,
        network: "instagram" as const,
        title: copy.title,
        excerpt: copy.excerpt,
        image: local.image,
        href: `https://www.instagram.com/p/${p.code}/`,
        kind: "foto" as const,
      };
    })
    .filter(Boolean) as Post[];

  if (matched.length >= 2) return matched.slice(0, 2);
  return LOCAL_PHOTOS.slice(0, 2);
}

async function fetchFacebookPosts(): Promise<Post[]> {
  return LOCAL_FACEBOOK.slice(0, 2);
}

async function fetchYouTubePosts(limit = 2): Promise<Post[]> {
  const xml = await fetchText(YT_RSS, XML_PROXIES);
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const posts = Array.from(doc.querySelectorAll("entry"))
    .map((e) => {
      let id = e.querySelector("videoId")?.textContent || "";
      if (!id) {
        const href = e.querySelector("link")?.getAttribute("href") || "";
        const m = href.match(/[?&]v=([^&]+)/);
        if (m) id = m[1];
      }
      if (!id) return null;
      const local = LOCAL_VIDEOS.find((lp) => lp.href.includes(id));
      return {
        id: `yt-${id}`,
        network: "youtube" as const,
        title: e.querySelector("title")?.textContent || local?.title || "Vídeo no YouTube",
        excerpt: "YouTube oficial da rádio",
        image: local?.image || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        href: `https://www.youtube.com/watch?v=${id}`,
        kind: "video" as const,
      };
    })
    .filter(Boolean)
    .slice(0, limit) as Post[];
  return posts.length ? posts : LOCAL_VIDEOS.slice(0, limit);
}

async function fetchTikTokPosts(): Promise<Post[]> {
  try {
    const raw = await fetchText(`https://www.tiktok.com/embed/@${TIKTOK_USER}`);
    const ids = [
      ...new Set(
        [...raw.matchAll(/\/@[\w._]+\/video\/(\d{15,})|"id":"(\d{17,})"/g)].map(
          (m) => m[1] || m[2],
        ),
      ),
    ]
      .filter(Boolean)
      .slice(0, 4) as string[];

    const matched = ids
      .map((id) => LOCAL_TIKTOKS.find((lp) => lp.href.includes(id)))
      .filter(Boolean) as Post[];
    if (matched.length >= 2) return matched.slice(0, 2);
    if (ids.length >= 2 && matched.length === 0) {
      // IDs novos sem capa local: manter só os LOCAL_TIKTOKS (imagem = vídeo certo)
      return LOCAL_TIKTOKS.slice(0, 2);
    }
    if (matched.length) return [...matched, ...LOCAL_TIKTOKS].slice(0, 2);
  } catch {
    /* fallback */
  }
  return LOCAL_TIKTOKS.slice(0, 2);
}

function networkMeta(n: Network) {
  return SOCIALS.find((s) => s.id === n)!;
}

const SafeImg = ({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <div className={`bg-muted ${className || ""}`} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const PostCard = ({ post, onOpen }: { post: Post; onOpen: (p: Post) => void }) => {
  const meta = networkMeta(post.network);
  const image = resolveImage(post) || post.image;
  if (!image) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen({ ...post, image })}
      className="group flex flex-col text-left rounded-xl bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all h-full w-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <SafeImg
          src={image}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {post.kind === "video" && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </span>
          </span>
        )}
        <span
          className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
          style={{ background: meta.accent }}
        >
          {meta.label}
        </span>
      </div>
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary">
          {post.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1.5">{post.excerpt}</p>
        <span
          className="mt-auto pt-2 text-xs font-semibold inline-flex items-center gap-1"
          style={{ color: meta.accent }}
        >
          Ver publicação
        </span>
      </div>
    </button>
  );
};

const MediaTile = ({ post, onOpen }: { post: Post; onOpen: (p: Post) => void }) => {
  const image = resolveImage(post) || post.image;
  if (!image) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen({ ...post, image, kind: post.kind })}
      className="group relative aspect-square overflow-hidden rounded-lg bg-muted w-full"
    >
      <SafeImg
        src={image}
        alt={post.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {post.kind === "video" && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-90 group-hover:opacity-100">
          <span className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </span>
        </span>
      )}
    </button>
  );
};

const MediaPreview = ({
  post,
  open,
  onOpenChange,
}: {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!post) return null;
  const meta = networkMeta(post.network);
  const yt = post.network === "youtube" ? youtubeEmbedUrl(post.href) : null;
  const tt = post.network === "tiktok" ? tiktokEmbedUrl(post.href) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 pr-12">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: meta.accent }}>
            {meta.label}
          </p>
          <DialogTitle className="text-base sm:text-lg leading-snug">{post.title}</DialogTitle>
          {post.excerpt ? (
            <DialogDescription className="text-sm">{post.excerpt}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">Pré-visualização do conteúdo</DialogDescription>
          )}
        </DialogHeader>

        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          {yt ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                title={post.title}
                src={yt}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : tt ? (
            <div className="relative w-full mx-auto max-w-[325px] aspect-[9/16] rounded-lg overflow-hidden bg-black">
              <iframe
                title={post.title}
                src={tt}
                className="absolute inset-0 w-full h-full border-0"
                allow="encrypted-media"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative w-full max-h-[70vh] rounded-lg overflow-hidden bg-muted">
              <SafeImg
                src={resolveImage(post) || post.image}
                alt={post.title}
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

type CacheShape = {
  byNetwork: Record<Network, Post[]>;
  photos: Post[];
  videos: Post[];
};

const Midia = () => {
  const [byNetwork, setByNetwork] = useState<Record<Network, Post[]>>({
    instagram: LOCAL_PHOTOS.slice(0, 2),
    facebook: LOCAL_FACEBOOK.slice(0, 2),
    youtube: LOCAL_VIDEOS.slice(0, 2),
    tiktok: LOCAL_TIKTOKS.slice(0, 2),
  });
  const [photos, setPhotos] = useState<Post[]>(LOCAL_PHOTOS.slice(0, PHOTOS_LIMIT));
  const [videos, setVideos] = useState<Post[]>(
    [...LOCAL_VIDEOS.slice(0, 8), ...LOCAL_TIKTOKS.slice(0, 2)].slice(0, VIDEOS_LIMIT),
  );
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Post | null>(null);

  useEffect(() => {
    let alive = true;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as CacheShape;
        if (cached?.byNetwork) {
          const safe: Record<Network, Post[]> = {
            instagram: (cached.byNetwork.instagram || [])
              .map(withSafeImage)
              .filter((p) => !!resolveImage(p) || !!p.image),
            facebook: LOCAL_FACEBOOK.slice(0, 2),
            youtube: (cached.byNetwork.youtube || []).map(withSafeImage),
            tiktok: (cached.byNetwork.tiktok || [])
              .map(withSafeImage)
              .filter((p) => !!resolveImage(p) || LOCAL_TIKTOKS.some((t) => t.href === p.href)),
          };
          if (!safe.instagram.length) safe.instagram = LOCAL_PHOTOS.slice(0, 2);
          if (!safe.tiktok.length) safe.tiktok = LOCAL_TIKTOKS.slice(0, 2);
          if (!safe.youtube.length) safe.youtube = LOCAL_VIDEOS.slice(0, 2);
          setByNetwork(safe);
        }
        setPhotos(LOCAL_PHOTOS.slice(0, PHOTOS_LIMIT));
        setVideos([...LOCAL_VIDEOS.slice(0, 8), ...LOCAL_TIKTOKS.slice(0, 2)].slice(0, VIDEOS_LIMIT));
        setLoading(false);
      }
    } catch {
      /* ignore */
    }

    const load = async () => {
      try {
        const [ig, fb, yt, tt] = await Promise.all([
          fetchInstagramPosts().catch(() => LOCAL_PHOTOS.slice(0, 2)),
          fetchFacebookPosts().catch(() => LOCAL_FACEBOOK.slice(0, 2)),
          fetchYouTubePosts(VIDEOS_LIMIT).catch(() => LOCAL_VIDEOS.slice(0, VIDEOS_LIMIT)),
          fetchTikTokPosts().catch(() => LOCAL_TIKTOKS.slice(0, 2)),
        ]);
        if (!alive) return;

        const nextBy: Record<Network, Post[]> = {
          instagram: ig.slice(0, 2),
          facebook: fb.slice(0, 2),
          youtube: yt.slice(0, 2),
          tiktok: tt.slice(0, 2),
        };
        setByNetwork(nextBy);

        const nextPhotos = LOCAL_PHOTOS.slice(0, PHOTOS_LIMIT);
        setPhotos(nextPhotos);

        const nextVideos = [...LOCAL_VIDEOS.slice(0, 8), ...LOCAL_TIKTOKS.slice(0, 2)].slice(0, VIDEOS_LIMIT);
        setVideos(nextVideos);

        try {
          const cachePayload: CacheShape = {
            byNetwork: {
              instagram: nextBy.instagram.map(({ image: _i, ...rest }) => ({ ...rest, image: "" })),
              facebook: nextBy.facebook.map(({ image: _i, ...rest }) => ({ ...rest, image: "" })),
              youtube: nextBy.youtube.map(({ image: _i, ...rest }) => ({ ...rest, image: "" })),
              tiktok: nextBy.tiktok.map(({ image: _i, ...rest }) => ({ ...rest, image: "" })),
            },
            photos: nextPhotos.map(({ image: _i, ...rest }) => ({ ...rest, image: "" })),
            videos: nextVideos.map(({ image: _i, ...rest }) => ({ ...rest, image: "" })),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
        } catch {
          /* ignore */
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    const t = window.setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <section className="relative overflow-hidden h-[300px] sm:h-[340px] md:h-[380px] bg-[#051230]">
        <img
          src={midiaBanner}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,18,48,0.55) 0%, rgba(10,32,96,0.72) 45%, rgba(5,18,48,0.88) 100%)",
          }}
        />
        <div className="relative z-10 h-full container mx-auto px-4 flex flex-col items-center justify-center text-center text-white">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-yellow-400/90 mb-3">
            Conteúdo
          </p>
          <h1 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            Mídia
          </h1>
          <p className="mt-3 text-white/85 max-w-xl mx-auto text-sm sm:text-base drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            Fotos, vídeos e posts da Rádio Conexão Católica nas redes sociais.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
            >
              Fale conosco
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=hoostcomv2.ogvopund"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-white/40 text-white hover:bg-white/10 transition backdrop-blur-sm"
            >
              Baixar o app
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-start">
          {/* Coluna esquerda — maior, 2 posts por rede */}
          <div className="md:col-span-1 lg:col-span-7 space-y-6">
            {SOCIALS.map((s) => (
              <div key={s.id} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 pb-3 mb-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Últimas 2
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">{s.label}</h2>
                  </div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Ver perfil
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div>
                  {loading && !(byNetwork[s.id]?.length) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[0, 1].map((i) => (
                        <div key={i} className="h-[200px] rounded-xl bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(byNetwork[s.id] ?? []).map((post) => (
                        <PostCard key={post.id} post={post} onOpen={setPreview} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Coluna direita — menor, grid 2 fotos */}
          <div className="md:col-span-1 lg:col-span-3 space-y-6">
            <div className="overflow-hidden">
              <div className="pb-3 mb-3">
                <h2 className="text-lg font-bold text-foreground">Fotos</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {photos.slice(0, PHOTOS_LIMIT).map((p) => (
                  <MediaTile key={p.id} post={p} onOpen={setPreview} />
                ))}
              </div>
            </div>

            <LojaCard />

            <div className="overflow-hidden">
              <div className="pb-3 mb-3">
                <h2 className="text-lg font-bold text-foreground">Vídeos</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {videos.slice(0, VIDEOS_LIMIT).map((p) => (
                  <MediaTile key={p.id} post={{ ...p, kind: "video" }} onOpen={setPreview} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <MediaPreview
        post={preview}
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      />
    </Layout>
  );
};

export default Midia;
