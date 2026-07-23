import { useEffect, useState } from "react";
import { ExternalLink, Instagram } from "lucide-react";
import fz1 from "@/assets/freizeca/fz-1.jpg";
import fz2 from "@/assets/freizeca/fz-2.jpg";
import fz3 from "@/assets/freizeca/fz-3.jpg";
import fz4 from "@/assets/freizeca/fz-4.jpg";

const IG_USER = "freizecaoficial";
const IG_URL = `https://www.instagram.com/${IG_USER}/`;
const CACHE_KEY = "rcc_freizeca_ig_v9";
const FETCH_MS = 14000;

type Post = {
  id: string;
  title: string;
  desc: string;
  image: string;
  href: string;
  /** Foco no rosto (object-position) */
  focus?: string;
  /** Zoom para preencher o quadro sem cortar o rosto */
  zoom?: number;
};

/** Títulos/descrições alinhados às artes oficiais do Instagram */
const LOCAL_FALLBACK: Post[] = [
  {
    id: "DbFGACVNDzp",
    title: "Agenda Semanal — Frei Zeca",
    desc: "Evangelizando através da música católica. Confira a agenda de julho.",
    image: fz1,
    href: "https://www.instagram.com/p/DbFGACVNDzp/",
    focus: "72% 12%",
    zoom: 0.92,
  },
  {
    id: "DWbpCq_jbax",
    title: "Cruzeiro Católico Mariano",
    desc: "Presença confirmada a bordo do MSC Virtuosa — 2 a 9 de janeiro de 2027.",
    image: fz2,
    href: "https://www.instagram.com/p/DWbpCq_jbax/",
    focus: "50% 22%",
    zoom: 0.92,
  },
  {
    id: "DbGwAbVhD79",
    title: "Boa noite! — Frei Zeca",
    desc: "Sem pressa. O tempo de Deus é perfeito, e Ele nunca falha.",
    image: fz4,
    href: "https://www.instagram.com/p/DbGwAbVhD79/",
    focus: "22% 18%",
    zoom: 0.92,
  },
  {
    id: "DUbSanrEQuD",
    title: "Nota de falecimento",
    desc: "Maria Dejair Alves De Souza — orações pela família. Confira no Instagram.",
    image: fz3,
    href: "https://www.instagram.com/p/DUbSanrEQuD/",
    focus: "30% 20%",
    zoom: 0.92,
  },
];

const HTML_PROXIES = [
  (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`,
  (url: string) => `https://r.jina.ai/${url}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

function decodeUrl(u: string) {
  return u.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\\//g, "/");
}

function proxyImg(url: string): string {
  const clean = decodeUrl(url);
  if (!clean || !/^https?:\/\//i.test(clean)) return clean || "";
  if (import.meta.env.DEV) {
    return `/api/ig-img?u=${encodeURIComponent(clean)}`;
  }
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=720&h=900&fit=inside&output=jpg`;
}

function cleanCaption(raw: string) {
  return raw
    .replace(/^Image\s+\d+:\s*/i, "")
    .replace(/\s+by\s+@[\w._]+$/i, "")
    .replace(/#[\wÀ-ÿ_]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCopy(caption: string, index: number) {
  const text = cleanCaption(caption);
  if (!text || text.length < 8 || /^by @/i.test(text)) {
    const fb = LOCAL_FALLBACK[index] ?? LOCAL_FALLBACK[0];
    return { title: fb.title, desc: fb.desc };
  }
  const sentences = text.split(/(?<=[.!?…])\s+/).filter(Boolean);
  const title =
    sentences[0] && sentences[0].length <= 70
      ? sentences[0]
      : `${text.slice(0, text.lastIndexOf(" ", 64) > 28 ? text.lastIndexOf(" ", 64) : 64).trim()}…`;
  const rest = text.slice(title.replace(/…$/, "").length).replace(/^[\s.…]+/, "").trim();
  const desc =
    rest.slice(0, 110) ||
    sentences[1]?.slice(0, 110) ||
    "Confira a publicação completa no Instagram do Frei Zeca.";
  return { title, desc: rest.length > 110 ? `${desc.trim()}…` : desc };
}

async function fetchText(url: string) {
  for (const make of HTML_PROXIES) {
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

async function fetchFreiZecaPosts(): Promise<Post[]> {
  const raw = await fetchText(`http://www.imginn.com/${IG_USER}/`);
  type Cand = { code: string; caption: string; img: string };
  const byCode = new Map<string, Cand>();

  const paired = raw.matchAll(
    /!\[([^\]]*)\]\((https:\/\/[^)]+)\)\]\((?:https?:)?\/\/(?:www\.)?imginn\.com\/p\/([A-Za-z0-9_-]+)\/\)[\s\S]{0,600}?\[Download\]\((https:\/\/scontent[^)]+)\)/gi,
  );
  for (const m of paired) {
    const code = m[3];
    if (!code || byCode.has(code)) continue;
    const preview = decodeUrl(m[2]);
    if (/t51\.82787-19|s150x150|profile/i.test(preview)) continue;
    byCode.set(code, {
      code,
      caption: cleanCaption(m[1] || ""),
      img: decodeUrl(m[4]) || preview,
    });
  }

  if (byCode.size < 2) {
    for (const m of raw.matchAll(
      /imginn\.com\/p\/([A-Za-z0-9_-]+)\/\)[\s\S]{0,500}?\[Download\]\((https:\/\/scontent[^)]+)\)/gi,
    )) {
      if (byCode.has(m[1])) continue;
      byCode.set(m[1], { code: m[1], caption: "", img: decodeUrl(m[2]) });
    }
  }

  const posts = [...byCode.values()].slice(0, 6).map((p, i) => {
    const local = LOCAL_FALLBACK.find((lp) => lp.id === p.code);
    const copy = local
      ? { title: local.title, desc: local.desc }
      : formatCopy(p.caption, i);
    return {
      id: p.code,
      title: copy.title,
      desc: copy.desc,
      image: local?.image || proxyImg(p.img),
      href: `https://www.instagram.com/p/${p.code}/`,
      focus: local?.focus ?? "50% 18%",
      zoom: local?.zoom ?? 0.92,
    };
  });

  // Garante os 3 cards locais oficiais na ordem certa quando disponíveis
  const ordered: Post[] = [];
  for (const local of LOCAL_FALLBACK.slice(0, 3)) {
    const live = posts.find((p) => p.id === local.id);
    ordered.push(live ? { ...local, href: live.href } : local);
  }
  for (const p of posts) {
    if (ordered.length >= 3) break;
    if (!ordered.some((o) => o.id === p.id)) ordered.push(p);
  }

  return ordered.length >= 3 ? ordered.slice(0, 3) : LOCAL_FALLBACK.slice(0, 3);
}

/** Mesmo modelo visual da seção Santa Rita (home): título + 3 cards. */
const FreiZecaCarousel = () => {
  const [posts, setPosts] = useState<Post[]>(LOCAL_FALLBACK.slice(0, 3));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Post[];
        if (Array.isArray(parsed) && parsed.length >= 3) {
          setPosts(parsed.slice(0, 3));
          setLoading(false);
        }
      }
    } catch {
      /* ignore */
    }

    fetchFreiZecaPosts()
      .then((next) => {
        if (cancelled || next.length < 3) return;
        setPosts(next.slice(0, 3));
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(next.slice(0, 3)));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        if (!cancelled) setPosts(LOCAL_FALLBACK.slice(0, 3));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Frei Zeca</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-foreground">Frei Zeca</h2>
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80 inline-flex items-center gap-1"
        >
          <Instagram className="h-3 w-3" /> Instagram
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posts.map((item, i) => (
          <a
            key={`fz-${i}-${item.id}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2.5 pt-2 pb-1 flex items-center gap-1">
              <Instagram className="h-3 w-3 text-pink-500" />
              Instagram
            </p>

            {/* Mesmo aspect da Caminhada: preenche o quadro com zoom no rosto */}
            <div className="aspect-[3/2] overflow-hidden bg-muted shrink-0 relative">
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:brightness-[1.03]"
                style={{
                  objectPosition: item.focus ?? "50% 18%",
                  transform: `scale(${item.zoom ?? 0.92})`,
                  transformOrigin: item.focus ?? "50% 18%",
                }}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  const local = LOCAL_FALLBACK.find((lp) => lp.id === item.id);
                  if (local && el.src !== local.image) el.src = local.image;
                }}
              />
            </div>

            <div className="px-2.5 py-2 flex items-start justify-between gap-2 border-t border-border/60 flex-1 min-h-[3.25rem]">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
                  {item.desc}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FreiZecaCarousel;
