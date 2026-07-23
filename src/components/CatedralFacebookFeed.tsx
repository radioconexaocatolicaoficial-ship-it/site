import { useEffect, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import thumbV1 from "@/assets/catedral-facebook/v1.jpg";
import thumbV2 from "@/assets/catedral-facebook/v2.jpg";
import ig1 from "@/assets/catedral-instagram/ig-1.jpg";
import ig2 from "@/assets/catedral-instagram/ig-2.jpg";

const FB_PAGE = "https://www.facebook.com/catedraldesaomiguelarcanjo/?locale=pt_BR";
const FB_VIDEOS = "https://www.facebook.com/catedraldesaomiguelarcanjo/videos";
const IG_PAGE = "https://www.instagram.com/catedral_sm/?hl=pt";
const IG_USERNAME = "catedral_sm";
const IG_EMBED = `https://www.instagram.com/${IG_USERNAME}/embed/`;
const IG_IMGINN = `http://www.imginn.com/${IG_USERNAME}/`;

const FB_ICON =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
const IG_ICON =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";

const FETCH_MS = 14000;
const REFRESH_MS = 5 * 60 * 1000;
const CACHE_KEY = "rcc_catedral_social_v1";

const HTML_PROXIES = [
  (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`,
  (url: string) => `https://r.jina.ai/${url}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

type Post = {
  href: string;
  title: string;
  excerpt: string;
  image: string;
  kind: "video" | "foto";
};

const FALLBACK_IG: Post[] = [
  {
    kind: "foto",
    href: "https://www.instagram.com/p/DbEm4NNGpJN/?hl=pt",
    title: "Feira Agroecológica",
    excerpt:
      "26 de julho, das 8h às 15h, no Salão Paroquial — sabores, cultura e sustentabilidade.",
    image: ig1,
  },
  {
    kind: "foto",
    href: "https://www.instagram.com/p/Da_mkW8kcah/?hl=pt",
    title: "Avisos da Catedral",
    excerpt: "Confira a publicação mais recente no Instagram oficial @catedral_sm.",
    image: ig2,
  },
];

const FALLBACK_FB: Post[] = [
  {
    kind: "video",
    href: "https://www.facebook.com/catedraldesaomiguelarcanjo/videos/1059068230347850/",
    title: "Festa Junina Legal",
    excerpt: "Nossa gratidão a todas as pastorais, movimentos e voluntários.",
    image: thumbV1,
  },
  {
    kind: "video",
    href: "https://www.facebook.com/catedraldesaomiguelarcanjo/videos/1320874909710196/",
    title: "Festa Julina",
    excerpt: "Esperamos por você neste sábado para celebrar conosco.",
    image: thumbV2,
  },
];

function decodeUrl(u: string): string {
  return u
    .replace(/&amp;/g, "&")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\u002F/g, "/");
}

function proxyImg(url: string): string {
  const clean = decodeUrl(url);
  if (!clean || !/^https?:\/\//i.test(clean)) return clean || "";
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=720&h=900&fit=cover&output=jpg`;
}

function cleanCaption(raw: string): string {
  return raw
    .replace(/^Image\s+\d+:\s*/i, "")
    .replace(/\s+by\s+@[\w._]+$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCopy(caption: string, network: "instagram" | "facebook"): { title: string; excerpt: string } {
  const text = cleanCaption(caption);
  if (!text || text.length < 8 || /^by @/i.test(text)) {
    return {
      title: network === "instagram" ? "Publicação no Instagram" : "Publicação no Facebook",
      excerpt:
        network === "instagram"
          ? "Confira no Instagram oficial @catedral_sm."
          : "Confira no Facebook da Catedral de São Miguel Arcanjo.",
    };
  }

  const sentence = text.match(/^(.{15,90}?[.!?…])(\s+|$)/);
  let title: string;
  let rest: string;
  if (sentence) {
    title = sentence[1].trim();
    rest = text.slice(sentence[0].length).trim();
  } else if (text.length <= 64) {
    title = text;
    rest = "";
  } else {
    const cut = text.lastIndexOf(" ", 64);
    const at = cut > 28 ? cut : 64;
    title = `${text.slice(0, at).trim()}…`;
    rest = text.slice(at).trim();
  }

  const excerpt =
    rest && rest !== title
      ? rest.length > 96
        ? `${rest.slice(0, rest.lastIndexOf(" ", 96) > 40 ? rest.lastIndexOf(" ", 96) : 96).trim()}…`
        : rest
      : network === "instagram"
        ? "Confira a publicação completa no Instagram."
        : "Confira a publicação completa no Facebook.";

  return { title: title.slice(0, 90), excerpt: excerpt.slice(0, 110) };
}

function ageHours(label: string): number {
  const m = label.match(/(\d+)\s+(hour|hours|day|days|week|weeks|month|months)\s+ago/i);
  if (!m) return Number.POSITIVE_INFINITY;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith("hour")) return n;
  if (unit.startsWith("day")) return n * 24;
  if (unit.startsWith("week")) return n * 24 * 7;
  if (unit.startsWith("month")) return n * 24 * 30;
  return Number.POSITIVE_INFINITY;
}

async function fetchText(url: string): Promise<string> {
  for (const make of HTML_PROXIES) {
    try {
      const res = await fetch(make(url), { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      let text = await res.text();
      try {
        const j = JSON.parse(text) as { contents?: string };
        if (j.contents) text = j.contents;
      } catch {
        /* texto puro */
      }
      if (text.length > 400) return text;
    } catch {
      /* próximo proxy */
    }
  }
  throw new Error(`Falha ao carregar ${url}`);
}

function parseInstagramImginn(raw: string): Post[] {
  type Cand = { code: string; caption: string; img: string; hours: number };
  const byCode = new Map<string, Cand>();

  const blocks = raw.matchAll(
    /\[!\[Image\s+\d+:\s*([^\]]*)\]\((https:\/\/s1\.imginn\.com\/[^)]+)\)\]\((?:https?:)?\/\/(?:www\.)?imginn\.com\/p\/([A-Za-z0-9_-]+)\/?\)/gi,
  );

  for (const m of blocks) {
    const caption = cleanCaption(m[1] || "");
    const img = decodeUrl(m[2]);
    const code = m[3];
    if (!code || !img) continue;
    byCode.set(code, { code, caption, img, hours: Number.POSITIVE_INFINITY });
  }

  for (const code of byCode.keys()) {
    const re = new RegExp(
      `imginn\\.com\\/p\\/${code}\\/[\\s\\S]{0,500}?(\\d+\\s+(?:hour|hours|day|days|week|weeks|month|months)\\s+ago)`,
      "i",
    );
    const age = raw.match(re);
    if (age) {
      const item = byCode.get(code)!;
      item.hours = ageHours(age[1]);
    }
  }

  const ranked = [...byCode.values()].sort((a, b) => a.hours - b.hours);
  return ranked.slice(0, 2).map((p) => {
    const copy = formatCopy(p.caption, "instagram");
    return {
      kind: "foto" as const,
      href: `https://www.instagram.com/p/${p.code}/?hl=pt`,
      title: copy.title,
      excerpt: copy.excerpt,
      image: proxyImg(p.img),
    };
  });
}

function parseInstagramEmbed(raw: string): Post[] {
  const posts: Post[] = [];
  const seen = new Set<string>();

  const md = raw.matchAll(/!\[([^\]]*)\]\((https:\/\/scontent[^)\s]+)\)/gi);
  for (const m of md) {
    const img = decodeUrl(m[2]);
    if (!img || /s150x150|s100x100|profile/i.test(img)) continue;
    const key = img.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    const copy = formatCopy(m[1] || "", "instagram");
    posts.push({
      kind: "foto",
      href: IG_PAGE,
      title: copy.title,
      excerpt: copy.excerpt,
      image: proxyImg(img),
    });
    if (posts.length >= 2) break;
  }

  if (posts.length < 2) {
    const codes = [...raw.matchAll(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/gi)].map((m) => m[1]);
    const imgs = [...raw.matchAll(/https:\/\/scontent[^"'\\\s>]+/gi)]
      .map((m) => decodeUrl(m[0]))
      .filter((u) => !/s150x150|s100x100|profile/i.test(u));
    for (let i = 0; i < imgs.length && posts.length < 2; i++) {
      const key = imgs[i].split("?")[0];
      if (seen.has(key)) continue;
      seen.add(key);
      const code = codes[i];
      posts.push({
        kind: "foto",
        href: code ? `https://www.instagram.com/p/${code}/?hl=pt` : IG_PAGE,
        title: posts.length === 0 ? "Publicação mais recente" : "Nova publicação",
        excerpt: "Confira no Instagram oficial @catedral_sm.",
        image: proxyImg(imgs[i]),
      });
    }
  }

  return posts.slice(0, 2);
}

async function fetchInstagramPosts(): Promise<Post[]> {
  try {
    const raw = await fetchText(IG_IMGINN);
    const fromImginn = parseInstagramImginn(raw);
    if (fromImginn.length >= 2) return fromImginn;
    if (fromImginn.length === 1) {
      const more = parseInstagramEmbed(raw);
      return [...fromImginn, ...more.filter((p) => p.href !== fromImginn[0].href)].slice(0, 2);
    }
  } catch {
    /* tenta embed */
  }

  try {
    const embed = await fetchText(IG_EMBED);
    const posts = parseInstagramEmbed(embed);
    if (posts.length >= 1) return posts.slice(0, 2);
  } catch {
    /* fallback */
  }

  return FALLBACK_IG;
}

function parseFacebookVideos(raw: string): Post[] {
  const posts: Post[] = [];
  const seen = new Set<string>();

  const linkRe =
    /(?:https?:\/\/(?:www\.)?facebook\.com)?\/catedraldesaomiguelarcanjo\/videos\/(?:[^/\s)"\]]+\/)?(\d{8,})\/?/gi;

  for (const m of raw.matchAll(linkRe)) {
    const id = m[1];
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const idx = m.index ?? raw.indexOf(id);
    const around = raw.slice(Math.max(0, idx - 500), idx + 900);

    let title = "";
    const titled =
      around.match(
        /(?:Video thumbnail|\]\([^)]*\))\s*\n+([^\n#\[]{18,160})/i,
      ) || around.match(/\n([^\n\[\]]{24,140}(?:!|\?|\.|…))\s*\n/);
    if (titled) title = cleanCaption(titled[1]);

    let image = "";
    const thumb =
      around.match(/!\[[^\]]*\]\((https:\/\/scontent[^)\s]+)\)/i) ||
      around.match(/(https:\/\/scontent[^"'\\\s\]]+\.jpg[^"'\\\s\]]*)/i);
    if (thumb) image = proxyImg(decodeUrl(thumb[1]));

    const copy = formatCopy(title, "facebook");
    posts.push({
      kind: "video",
      href: `https://www.facebook.com/catedraldesaomiguelarcanjo/videos/${id}/`,
      title: copy.title,
      excerpt: copy.excerpt,
      image: image || (posts.length === 0 ? thumbV1 : thumbV2),
    });

    if (posts.length >= 2) break;
  }

  return posts;
}

async function enrichFacebookThumb(post: Post): Promise<Post> {
  if (post.image && !post.image.includes("catedral-facebook") && /weserv|scontent|fbcdn/i.test(post.image)) {
    return post;
  }
  try {
    const raw = await fetchText(post.href);
    const og =
      raw.match(/og:image["']?\s+content=["']([^"']+)/i) ||
      raw.match(/property="og:image" content="([^"]+)"/i) ||
      raw.match(/https:\/\/scontent[^"'\\\s>]+\.jpg[^"'\\\s>]*/i);
    if (og) {
      const url = decodeUrl(og[1] || og[0]);
      if (/^https?:\/\//i.test(url)) return { ...post, image: proxyImg(url) };
    }
  } catch {
    /* mantém atual */
  }
  return post;
}

async function fetchFacebookPosts(): Promise<Post[]> {
  try {
    const raw = await fetchText(FB_VIDEOS);
    let posts = parseFacebookVideos(raw);
    if (posts.length >= 1) {
      posts = await Promise.all(posts.slice(0, 2).map(enrichFacebookThumb));
      while (posts.length < 2) posts.push(FALLBACK_FB[posts.length]);
      return posts.slice(0, 2);
    }
  } catch {
    /* fallback */
  }
  return FALLBACK_FB;
}

type CachePayload = { ig: Post[]; fb: Post[]; at: number };

function readCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CachePayload;
    if (!data?.ig?.length || !data?.fb?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(ig: Post[], fb: Post[]) {
  try {
    const payload: CachePayload = { ig, fb, at: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

type NetworkBlockProps = {
  network: "instagram" | "facebook";
  label: string;
  handle: string;
  pageUrl: string;
  posts: Post[];
  loading: boolean;
  accent: string;
  iconPath: string;
};

const PostSkeleton = () => (
  <div className="rounded-lg overflow-hidden bg-muted animate-pulse">
    <div className="aspect-[4/5] bg-muted" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  </div>
);

const NetworkBlock = ({
  network,
  label,
  handle,
  pageUrl,
  posts,
  loading,
  accent,
  iconPath,
}: NetworkBlockProps) => (
  <div className="rounded-xl overflow-hidden flex flex-col min-h-0">
    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white"
          style={
            network === "instagram"
              ? {
                  background:
                    "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                }
              : { background: accent }
          }
          aria-hidden
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d={iconPath} />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <h2 className="text-base sm:text-lg font-bold text-foreground truncate">{handle}</h2>
        </div>
      </div>
      <a
        href={pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline shrink-0"
      >
        Ver perfil
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>

    <div className="p-3 sm:p-4 flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 h-full">
        {loading
          ? [0, 1].map((i) => <PostSkeleton key={i} />)
          : posts.map((post) => (
              <a
                key={post.href + post.title}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg overflow-hidden bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                  <img
                    src={post.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el.dataset.fallback === "1") return;
                      el.dataset.fallback = "1";
                      el.src = network === "instagram" ? ig1 : thumbV1;
                    }}
                  />
                  {post.kind === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <span
                        className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg"
                        style={{ color: accent }}
                      >
                        <Play className="h-6 w-6 fill-current ml-0.5" />
                      </span>
                    </span>
                  )}
                  <span
                    className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ background: accent }}
                  >
                    {post.kind === "video" ? "Vídeo" : "Foto"}
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <span
                    className="mt-auto pt-2 text-[11px] font-semibold inline-flex items-center gap-1"
                    style={{ color: accent }}
                  >
                    Ver no {label}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
      </div>
    </div>
  </div>
);

/**
 * Redes da Catedral — Instagram e Facebook atualizados automaticamente.
 */
const CatedralFacebookFeed = () => {
  const [igPosts, setIgPosts] = useState<Post[]>(FALLBACK_IG);
  const [fbPosts, setFbPosts] = useState<Post[]>(FALLBACK_FB);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const cached = readCache();
    if (cached?.ig?.length && cached?.fb?.length) {
      setIgPosts(cached.ig);
      setFbPosts(cached.fb);
      setLoading(false);
    }

    const load = async () => {
      try {
        const [ig, fb] = await Promise.all([fetchInstagramPosts(), fetchFacebookPosts()]);
        if (!alive) return;
        setIgPosts(ig);
        setFbPosts(fb);
        writeCache(ig, fb);
      } catch {
        /* mantém fallback/cache */
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="container mx-auto px-4 pt-0 pb-[30px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px]">
        <div className="md:col-span-1 lg:col-span-5">
        <NetworkBlock
          network="instagram"
          label="Instagram"
          handle="@catedral_sm"
          pageUrl={IG_PAGE}
          posts={igPosts}
          loading={loading}
          accent="#E1306C"
          iconPath={IG_ICON}
        />
        </div>
        <div className="md:col-span-1 lg:col-span-5">
        <NetworkBlock
          network="facebook"
          label="Facebook"
          handle="Catedral São Miguel"
          pageUrl={FB_PAGE}
          posts={fbPosts}
          loading={loading}
          accent="#1877F2"
          iconPath={FB_ICON}
        />
        </div>
      </div>
    </section>
  );
};

export default CatedralFacebookFeed;
