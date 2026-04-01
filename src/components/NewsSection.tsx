import { useState, useEffect, useCallback } from "react";
import { CloudSun, ExternalLink, Newspaper, TrainFront, Car } from "lucide-react";

const RSS2JSON = "https://api.rss2json.com/v1/api.json";
const REFRESH_MS = 20 * 60 * 1000;

/** Fallback se o utilizador negar GPS ou o browser não suportar geolocalização */
const SP_LAT = -23.5505;
const SP_LON = -46.6333;
const FALLBACK_PLACE = "São Paulo";

const PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

/**
 * Cartões 2–6: um feed por cartão (fácil de trocar depois, um a um).
 * Se algum RSS falhar, usamos a capa do G1 como reserva.
 */
const NEWS_CARD_FEEDS: { badge: string; rss: string; fallbackRss?: string }[] = [
  { badge: "Música Católica", rss: "https://musica.cancaonova.com/feed/" },
  { badge: "Canção Nova", rss: "https://noticias.cancaonova.com/feed/" },
  { badge: "Trânsito em tempo real SP", rss: "https://g1.globo.com/rss/g1/sao-paulo/transito/" },
  { badge: "Santo do Dia", rss: "https://santo.cancaonova.com/feed/" },
];

interface Rss2JsonItem {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  description?: string;
  content?: string;
  enclosure?: { link?: string; thumbnail?: string };
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
      /** Fundo opcional (gráfico wttr.in). */
      bgImage: string;
      /** Ícone grande — sempre carrega (OpenWeather). */
      iconImage: string;
    }
  | {
      kind: "news";
      href: string;
      badge: string;
      title: string;
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

function extractImgFromHtml(html: string): string {
  if (!html) return "";
  const flat = html.replace(/\s+/g, " ").replace(/&amp;/g, "&");
  const imgRe = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(flat)) !== null) {
    const u = m[1].replace(/\s+/g, "");
    if (/logo|icon|spacer|pixel|1x1|favicon|avatar|badge|btn|selo/i.test(u)) continue;
    if (/\.(jpg|jpeg|png|webp|gif)(\?|$|&)/i.test(u)) return u;
    if (/gstatic|ggpht|googleusercontent|s2\.glbimg|ge.globo|assets|img\.cancaonova/i.test(u)) return u;
  }
  const og = flat.match(/property=["']og:image["']\s+content=["'](https?:\/\/[^"']+)["']/i);
  if (og?.[1]) return og[1];
  return "";
}

function isYoutubeLink(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

function pickItemImage(item: Rss2JsonItem): string {
  const enc = item.enclosure;
  if (enc?.thumbnail?.trim() && /^https?:\/\//i.test(enc.thumbnail)) return enc.thumbnail.trim();
  const encLink = enc?.link?.trim() ?? "";
  if (encLink && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(encLink)) return encLink;
  if (item.thumbnail?.trim()) return item.thumbnail.trim();
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

function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocalização indisponível"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => reject(new Error("Permissão negada ou posição indisponível")),
      {
        enableHighAccuracy: true,
        timeout: 16000,
        maximumAge: 120000,
      },
    );
  });
}

/** Nome da cidade/região a partir das coordenadas (CORS ok no browser). */
async function reverseGeocodePlaceName(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return "";
    const j = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    const city = j.city || j.locality || "";
    const region = j.principalSubdivision || "";
    if (city && region && city.trim().toLowerCase() !== region.trim().toLowerCase()) {
      return `${city}, ${region}`;
    }
    if (city) return city;
    if (region) return region;
    return j.countryName || "";
  } catch {
    return "";
  }
}

async function resolveLocationForWeather(): Promise<{ lat: number; lon: number; placeLabel: string }> {
  try {
    const { lat, lon } = await getCurrentPosition();
    const name = await reverseGeocodePlaceName(lat, lon);
    return {
      lat,
      lon,
      placeLabel: name.trim() || "Sua região",
    };
  } catch {
    return { lat: SP_LAT, lon: SP_LON, placeLabel: FALLBACK_PLACE };
  }
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
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
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
    /* mantém defaults */
  }

  const icon = wmoToOwmIcon(code, isDay);
  const owmImg = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  const wttrImg = `https://wttr.in/${lat},${lon}.png`;
  const q = encodeURIComponent(`previsão do tempo ${placeLabel}`);

  return {
    kind: "weather",
    href: `https://www.google.com/search?q=${q}`,
    badge: "Previsão do tempo",
    title: placeLabel,
    subtitle: `${Math.round(temp)}°C · ${weatherLabelPt(code)}${wind ? ` · vento ${wind} km/h` : ""}`,
    bgImage: wttrImg,
    iconImage: owmImg,
  };
}

async function fetchMetroStatus(): Promise<RadioCard | null> {
  try {
    const url = "https://ccm.artesp.sp.gov.br/metroferroviario/api/status/";
    // Usamos o proxy para evitar CORS se for chamado via browser puro
    const res = await fetch(PROXIES[1](url), { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    
    // O AllOrigins retorna { contents: "..." }
    const jsonStr = ((await res.json()) as { contents?: string }).contents ?? "";
    const data = JSON.parse(jsonStr) as {
      empresas: {
        nome: string;
        linhas: {
          nome: string;
          status: { situacao: string; operacao_normal: boolean };
        }[];
      }[];
    };

    const allLines: { name: string; status: string; isNormal: boolean }[] = [];
    data.empresas.forEach((emp) => {
      emp.linhas.forEach((lin) => {
        allLines.push({
          name: lin.nome,
          status: lin.status.situacao,
          isNormal: lin.status.operacao_normal,
        });
      });
    });

    if (allLines.length === 0) return null;

    // Filtramos apenas as que NÃO estão em operação normal (para destaque no título se houver)
    const issues = allLines.filter((l) => !l.isNormal);
    const title = issues.length === 0 
      ? "Todas as linhas operando normalmente" 
      : `${issues.length} ${issues.length === 1 ? "linha" : "linhas"} com ocorrência`;

    return {
      kind: "transit",
      href: "https://www.diretodostrens.com.br/",
      badge: "Trens e Metrô — SP",
      title,
      lines: allLines,
    };
  } catch {
    return null;
  }
}

function normalizeTitle(raw: string): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > 200 ? `${t.slice(0, 197)}…` : t;
}

async function fetchRss2Json(rssUrl: string, max: number): Promise<Rss2JsonItem[]> {
  const params = new URLSearchParams({ rss_url: rssUrl });
  const apiKey = (import.meta.env.VITE_RSS2JSON_API_KEY ?? "").trim();
  if (apiKey) params.set("api_key", apiKey);
  try {
    const res = await fetch(`${RSS2JSON}?${params.toString()}`, {
      signal: AbortSignal.timeout(22000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Rss2JsonResponse;
    if (data.status !== "ok" || !data.items?.length) return [];
    return data.items.slice(0, max);
  } catch {
    return [];
  }
}

function parseFeedXml(xml: string): Rss2JsonItem[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return [];
  const out: Rss2JsonItem[] = [];
  doc.querySelectorAll("rss channel item, channel item, item").forEach((el) => {
    const title = el.querySelector("title")?.textContent?.trim() || "";
    let link = el.querySelector("link")?.textContent?.trim() || "";
    if (!link) link = el.querySelector("link")?.getAttribute("href")?.trim() || "";
    const pubDate = el.querySelector("pubDate")?.textContent?.trim() || "";
    const description = el.querySelector("description")?.textContent || "";
    out.push({ title, link, pubDate, description, content: description });
  });
  return out;
}

async function fetchFeedViaProxy(rssUrl: string, max: number): Promise<Rss2JsonItem[]> {
  for (const proxy of PROXIES) {
    try {
      const url = proxy(rssUrl);
      const res = await fetch(url, { signal: AbortSignal.timeout(18000) });
      if (!res.ok) continue;
      const text = url.includes("allorigins")
        ? String(((await res.json()) as { contents?: string }).contents ?? "")
        : await res.text();
      if (text.length < 80) continue;
      const items = parseFeedXml(text);
      if (items.length) return items.slice(0, max);
    } catch {
      /* próximo */
    }
  }
  return [];
}

async function loadRssItems(rssUrl: string, max: number): Promise<Rss2JsonItem[]> {
  const a = await fetchRss2Json(rssUrl, max);
  if (a.length) return a;
  return fetchFeedViaProxy(rssUrl, max);
}

function firstStoryWithImage(
  items: Rss2JsonItem[],
  badge: string,
  excludeLinks: Set<string>,
): RadioCard | null {
  let fallback: RadioCard | null = null;

  for (const it of items) {
    const link = (it.link || "").trim();
    if (!link || isYoutubeLink(link)) continue;
    const k = link.replace(/\/$/, "").toLowerCase();
    if (excludeLinks.has(k)) continue;

    const titleRaw = (it.title || "").trim() || stripHtml(it.description || "");
    const title = normalizeTitle(titleRaw);
    if (!title) continue;

    const img = pickItemImage(it);
    if (img) {
      excludeLinks.add(k);
      return {
        kind: "news",
        href: link,
        badge,
        title,
        image: img,
        imageFallback: img,
      };
    }

    // Se não tinha imagem, guardamos como reserva (o primeiro que aparecer)
    if (!fallback) {
      fallback = {
        kind: "news",
        href: link,
        badge,
        title,
        image: "",
        imageFallback: "",
      };
    }
  }

  if (fallback) {
    const k = fallback.href.replace(/\/$/, "").toLowerCase();
    excludeLinks.add(k);
  }
  return fallback;
}

async function loadNewsCard(
  def: (typeof NEWS_CARD_FEEDS)[number],
  excludeLinks: Set<string>,
): Promise<RadioCard | null> {
  let items = await loadRssItems(def.rss, 40);
  let story = firstStoryWithImage(items, def.badge, excludeLinks);
  if (!story && def.fallbackRss) {
    items = await loadRssItems(def.fallbackRss, 40);
    story = firstStoryWithImage(items, def.badge, excludeLinks);
  }
  return story;
}

const NewsSection = () => {
  const [cards, setCards] = useState<RadioCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const loc = await resolveLocationForWeather();
      const weatherPromise = fetchWeatherCard(loc.lat, loc.lon, loc.placeLabel);
      const metroPromise = fetchMetroStatus();
      
      // Carregamos cada feed separadamente para garantir a ordem exata depois
      const exclude = new Set<string>();
      const feedPromises = NEWS_CARD_FEEDS.map(f => loadNewsCard(f, exclude));
      
      const [weather, metro, musica, cancao, transito, santo] = await Promise.all([
        weatherPromise,
        metroPromise,
        ...feedPromises
      ]);

      const finalCards: RadioCard[] = [];
      if (weather) finalCards.push(weather);                  // 1. Clima
      if (musica) finalCards.push(musica);                    // 2. Música Católica
      if (cancao) finalCards.push(cancao);                    // 3. Canção Nova

      // 4. Metrô/Trens (Link ARTESP)
      if (metro) {
        metro.href = "https://ccm.artesp.sp.gov.br/metroferroviario/status-linhas/";
        finalCards.push(metro);
      }

      // 5. Trânsito em tempo real (Link Waze)
      if (transito) {
        transito.href = "https://www.waze.com/pt-BR/live-map/";
        finalCards.push(transito);
      }

      // 6. Santo do Dia (Link Vaticano)
      if (santo) {
        santo.href = "https://www.vaticannews.va/pt/santo-do-dia.html";
        finalCards.push(santo);
      }

      // Garantimos exatamente 6 cards na grade
      setCards(finalCards.slice(0, 6));
    } catch {
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const skeletonKeys = ["w", "n1", "n2", "n3", "n4", "n5"];

  return (
    <section className="h-full flex flex-col min-h-0" aria-labelledby="radio-noticias-heading">
      <div className="mb-3">
        <h2 id="radio-noticias-heading" className="text-xl font-bold text-foreground leading-tight">
          Rádio Notícias
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading
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
                  key={`${card.kind}-${i}-${card.href}`}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2.5 pt-2 pb-1">
                    {card.badge}
                  </p>
                  
                  {/* Área de mídia/visual */}
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
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">Status das Linhas</span>
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
                          if (el.dataset.fallback === "1" || !card.imageFallback) return;
                          el.dataset.fallback = "1";
                          el.src = card.imageFallback;
                        }}
                      />
                    ) : (
                      <Newspaper className="h-10 w-10 text-primary/35" />
                    )}
                  </div>

                  {/* Área de texto e status */}
                  <div className="px-2.5 py-2 flex items-start justify-between gap-2 border-t border-border/60 flex-1 min-h-[3.25rem]">
                    <div className="min-w-0 flex-1">
                      {card.kind === "weather" ? (
                        <>
                          <h3 className="font-semibold text-sm text-foreground leading-snug">
                            Previsão do tempo — {card.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{card.subtitle}</p>
                        </>
                      ) : card.kind === "transit" ? (
                        <div className="space-y-1">
                          <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-tight line-clamp-2">
                            {card.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1.5 grayscale opacity-80 overflow-hidden max-h-[2.5rem]">
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
                        <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-2">
                          {card.title}
                        </h3>
                      )}
                    </div>
                    {card.kind === "weather" ? (
                      <CloudSun className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" aria-hidden />
                    ) : card.kind === "transit" ? (
                      <TrainFront className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                    ) : card.badge.toLowerCase().includes("trânsito") ? (
                      <Car className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" aria-hidden />
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
