import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";

/** Perfil — dados lidos do HTML público (via proxy CORS). */
export const RADIO_INSTAGRAM_PROFILE = "https://www.instagram.com/radioconexaocatolicaoficial/";

const PROXY = (url: string) =>
  `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

const VISIBLE = 2;

export interface IgFeedItem {
  shortcode: string;
  link: string;
  image: string;
  caption: string;
}

function unescapeJsonUrl(s: string): string {
  return s.replace(/\\u0026/g, "&").replace(/\\\//g, "/");
}

export function parseInstagramProfileHtml(html: string): IgFeedItem[] {
  const out: IgFeedItem[] = [];
  const seen = new Set<string>();

  const re = /"shortcode":"([A-Za-z0-9_-]+)"[\s\S]{0,12000}?"display_url":"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && out.length < 12) {
    const shortcode = m[1];
    if (seen.has(shortcode)) continue;
    seen.add(shortcode);
    const image = unescapeJsonUrl(m[2]);
    if (!image.startsWith("http")) continue;
    out.push({
      shortcode,
      link: `https://www.instagram.com/p/${shortcode}/`,
      image,
      caption: "Publicação no Instagram da Rádio Conexão Católica — abra para ver o conteúdo completo.",
    });
  }

  return out;
}

const FALLBACK: IgFeedItem[] = [
  {
    shortcode: "profile",
    link: RADIO_INSTAGRAM_PROFILE,
    image: "",
    caption:
      "Acompanhe novidades, vídeos e avisos da Rádio Conexão Católica no Instagram. Abra o perfil para ver todas as publicações.",
  },
  {
    shortcode: "profile-2",
    link: RADIO_INSTAGRAM_PROFILE,
    image: "",
    caption:
      "Siga @radioconexaocatolicaoficial e fique por dentro do que acontece na maior rádio católica da Zona Leste.",
  },
];

const RadioInstagramNews = () => {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<IgFeedItem[]>(FALLBACK);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(PROXY(RADIO_INSTAGRAM_PROFILE));
      const html = await res.text();
      if (html.length < 8000 || /accounts\/login/i.test(html.slice(0, 4000))) {
        setItems(FALLBACK);
        return;
      }
      const parsed = parseInstagramProfileHtml(html);
      if (parsed.length > 0) setItems(parsed);
      else setItems(FALLBACK);
    } catch {
      setItems(FALLBACK);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const max = Math.max(0, items.length - VISIBLE);
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(max, i + 1));
  const visible = items.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col min-h-[320px]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground leading-tight">Notícias da Rádio</h2>
          <a
            href={RADIO_INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
          >
            <Instagram className="h-3.5 w-3.5" />
            @radioconexaocatolicaoficial
          </a>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index >= max}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((k) => (
            <div key={k} className="rounded-xl border border-border bg-muted/40 animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((item, i) => (
            <a
              key={`${item.shortcode}-${index + i}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-violet-950/30 via-pink-950/20 to-amber-950/25 flex items-center justify-center relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Instagram className="h-16 w-16 text-primary/35 group-hover:text-primary/55 transition-colors" />
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-2">
                  Rádio Conexão Católica
                </h3>
                <p className="text-xs text-muted-foreground flex-1 line-clamp-4">{item.caption}</p>
                <span className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1">
                  <Instagram className="h-3.5 w-3.5" />
                  Ver no Instagram
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default RadioInstagramNews;
