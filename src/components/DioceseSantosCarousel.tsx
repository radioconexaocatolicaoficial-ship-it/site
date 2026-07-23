import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import imgQuaseParoquias from "@/assets/diocese-santos/quase-paroquias.jpg";
import imgSemanaIgreja from "@/assets/diocese-santos/semana-igreja.jpg";
import imgIdentidade from "@/assets/diocese-santos/identidade.jpg";
import imgParoquiaGracas from "@/assets/diocese-santos/paroquia-gracas.jpg";
import imgCampanha from "@/assets/diocese-santos/campanha-fraternidade.jpg";
import imgAssembleia from "@/assets/diocese-santos/assembleia-cnbb.png";
import imgPentecostes from "@/assets/diocese-santos/pentecostes.jpg";
import imgSocorros from "@/assets/diocese-santos/primeiros-socorros.jpg";
import imgBrasao from "@/assets/diocese-santos/brasao.png";

interface DiocItem {
  title: string;
  img: string;
  link: string;
  desc: string;
  date?: string;
  /** URL original no site da diocese (para atualização automática) */
  remoteImg?: string;
}

const BASE = "https://www.diocesedesantos.org.br";
const HOME_PAGE = `${BASE}/`;
const NEWS_PAGE = `${BASE}/noticias/presenca-diocesana/noticias`;
const CACHE_KEY = "diocese_santos_news_v4";
/** Atualiza automaticamente a cada 5 minutos */
const REFRESH_MS = 5 * 60 * 1000;
const FETCH_MS = 16000;

const PLACEHOLDER_IMG = imgBrasao;

const HTML_PROXIES = [
  (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`,
  (url: string) => `https://r.jina.ai/${url}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/** Notícias + fotos oficiais (backup local) */
const FALLBACK: DiocItem[] = [
  {
    title: "Diocese de Santos anuncia criação de novas Quase Paróquias em Cubatão e Praia Grande",
    desc: "Dom Joaquim Giovani Mol Guimarães oficializou a criação das Quase Paróquias Santa Dulce dos Pobres (Cubatão), Santa Teresa de Calcutá e São João XXIII (Praia Grande).",
    link: `${BASE}/noticias/presenca-diocesana/noticias/diocese-de-santos-anuncia-criacao-de-novas-quase-paroquias-em-cubatao-e-praia-grande`,
    img: imgQuaseParoquias,
    date: "08-07-2026",
  },
  {
    title: "Semana da Igreja Diocesana inspira nova etapa da missão à luz das Diretrizes da CNBB",
    desc: "Semana ocorreu entre 1º e 4 de julho, reunindo representantes das paróquias da Baixada Santista em comunhão e participação.",
    link: `${BASE}/noticias/presenca-diocesana/noticias/semana-da-igreja-diocesana-inspira-nova-etapa-da-missao-a-luz-das-diretrizes-da-cnbb`,
    img: imgSemanaIgreja,
    date: "08-07-2026",
  },
  {
    title: "Diocese de Santos apresenta nova identidade visual",
    desc: "O lançamento aconteceu em sintonia com a Semana da Igreja Diocesana, momento privilegiado de comunhão entre as paróquias da diocese.",
    link: `${BASE}/noticias/presenca-diocesana/noticias/diocese-de-santos-apresenta-nova-identidade-visual`,
    img: imgIdentidade,
    date: "30-06-2026",
  },
  {
    title: "Paróquia Nossa Senhora das Graças passa a integrar o calendário oficial de eventos de Praia Grande",
    desc: "Presença diocesana reforçada na cidade — acompanhe as notícias oficiais da Diocese de Santos.",
    link: `${BASE}/noticias/presenca-diocesana/noticias/paroquia-nossa-senhora-das-gracas-passa-a-integrar-o-calendario-oficial-de-eventos-de-praia-grande`,
    img: imgParoquiaGracas,
    date: "16-07-2026",
  },
  {
    title: "Campanha da Fraternidade: energia solar em casa de acolhimento em Santos",
    desc: "Projeto financiado pela CF viabiliza instalação de energia solar em casa de acolhimento na Diocese de Santos.",
    link: `${BASE}/noticias/presenca-diocesana/noticias/campanha-da-fraternidade-projeto-financiado-pela-cf-viabiliza-instalacao-de-energia-solar-em-casa-de-acolhimento-em-santos`,
    img: imgCampanha,
    date: "10-06-2026",
  },
  {
    title: "Diocese de Santos participa da 88ª Assembleia Regional Sul 1 da CNBB",
    desc: "Representação da diocese na assembleia regional — comunhão com a Igreja no Brasil.",
    link: `${BASE}/noticias/presenca-diocesana/noticias/diocese-de-santos-participa-da-88-assembleia-regional-sul-1-da-cnbb`,
    img: imgAssembleia,
    date: "18-06-2026",
  },
  {
    title: "Encontro Diocesano de Pentecostes reúne expressões carismáticas em Praia Grande",
    desc: "Expressões carismáticas da Baixada Santista celebram Pentecostes na Diocese de Santos.",
    link: `${BASE}/noticias/presenca-diocesana/noticias/encontro-diocesano-de-pentecostes-reune-expressoes-carismaticas-em-praia-grande`,
    img: imgPentecostes,
    date: "01-06-2026",
  },
  {
    title: "Capacitação em primeiros socorros reforça cuidado com a vida na Cúria Diocesana",
    desc: "Formação na Cúria Diocesana de Santos fortalece o cuidado com a vida e a missão pastoral.",
    link: `${BASE}/noticias/presenca-diocesana/noticias/capacitacao-em-primeiros-socorros-reforca-cuidado-com-a-vida-na-curia-diocesana`,
    img: imgSocorros,
    date: "11-06-2026",
  },
];

function normalizeUrl(url: string, base: string): string {
  if (!url) return base;
  const clean = url.split("#")[0].replace(/&amp;/g, "&");
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean.replace(/^http:\/\//i, "https://");
  }
  if (clean.startsWith("//")) return `https:${clean}`;
  if (clean.startsWith("/")) return base + clean;
  return `${base}/${clean}`;
}

/** Proxy para fotos oficiais novas do site (dev + produção) */
function proxyLiveImage(url: string): string {
  const clean = normalizeUrl(url, BASE);
  if (!clean || !/^https?:\/\//i.test(clean)) return PLACEHOLDER_IMG;
  if (import.meta.env.DEV) {
    return `/api/img?u=${encodeURIComponent(clean)}`;
  }
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean.replace(/^https?:\/\//i, ""))}&w=800&h=450&fit=cover&output=jpg`;
}

/** Foto local conhecida; senão usa a imagem oficial ao vivo do site */
function resolveImage(remoteImg: string, link: string, title: string): string {
  const hay = `${remoteImg} ${link} ${title}`.toLowerCase();
  if (/086c4f72|quase.?paroqu/i.test(hay)) return imgQuaseParoquias;
  if (/semana_da_igreja|semana.?da.?igreja.?diocesana/i.test(hay)) return imgSemanaIgreja;
  if (/21679289|identidade.?visual/i.test(hay)) return imgIdentidade;
  if (/ph_lei_municipal|nossa.?senhora.?das.?gracas/i.test(hay)) return imgParoquiaGracas;
  if (/f5239368|campanha.?da.?fraternidade|energia.?solar/i.test(hay)) return imgCampanha;
  if (/aafb5fef|88.?assembleia|assembleia.?regional.?sul/i.test(hay)) return imgAssembleia;
  if (/bf95444b|pentecostes/i.test(hay)) return imgPentecostes;
  if (/5205ba8d|primeiros.?socorros/i.test(hay)) return imgSocorros;

  // Notícia nova: imagem oficial do site da diocese
  if (remoteImg && /diocesedesantos\.org\.br|administrator\/cache|\/images\//i.test(remoteImg)) {
    return proxyLiveImage(remoteImg);
  }
  return PLACEHOLDER_IMG;
}

function parseSantosHome(html: string): DiocItem[] {
  const items: DiocItem[] = [];
  const seen = new Set<string>();

  const push = (title: string, link: string, date: string, desc: string, remoteImg: string) => {
    const t = title.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (t.length < 16) return;
    const key = t.slice(0, 44).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const remote = remoteImg ? normalizeUrl(remoteImg, BASE) : "";
    items.push({
      title: t,
      link: normalizeUrl(link, BASE),
      date,
      desc: (desc || "Notícia oficial da Diocese de Santos — Baixada Santista.").slice(0, 280),
      remoteImg: remote || undefined,
      img: resolveImage(remote, link, t),
    });
  };

  // Home: imagem + data + link da notícia
  const re =
    /<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]{0,1400}?(?:(\d{2}-\d{2}-\d{4})[\s\S]{0,500})?<a[^>]+href=["']([^"']*\/noticias\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const rawImg = m[1];
    if (/brasao|h-missas|logo|site\/|100-anos|Papa-|Igreja-no-mundo|Bispo-Diocesano|Dom_Joaquim/i.test(rawImg)) {
      continue;
    }
    push(m[4], m[3], m[2] || "", "", rawImg);
    if (items.length >= 10) break;
  }

  // Markdown (jina.ai): ![img](url) ... ### [title](link)
  if (items.length < 3) {
    const md =
      /!\[([^\]]*)\]\((https?:\/\/[^)\s#]+(?:diocesedesantos|administrator\/cache|\/images\/)[^)\s#]*)\)[\s\S]{0,800}?(?:(\d{2}-\d{2}-\d{4})[\s\S]{0,200})?#{2,3}\s*\[([^\]]+)\]\((https?:\/\/[^)]+\/noticias\/[^)]+)\)/gi;
    while ((m = md.exec(html)) !== null) {
      push(m[4], m[5], m[3] || "", m[1] || "", m[2]);
      if (items.length >= 10) break;
    }
  }

  return items.slice(0, 8);
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
        /* html puro */
      }
      if (text.length > 800) return text;
    } catch {
      /* next */
    }
  }
  throw new Error("fetch fail");
}

async function fetchDioceseSantosNews(): Promise<DiocItem[]> {
  for (const page of [HOME_PAGE, NEWS_PAGE]) {
    try {
      const html = await fetchText(page);
      const parsed = parseSantosHome(html);
      if (parsed.length >= 2) return parsed;
    } catch {
      /* tenta próxima */
    }
  }
  return [];
}

const VISIBLE = 2;

const DioceseSantosCarousel = () => {
  const [index, setIndex] = useState(0);
  const [news, setNews] = useState<DiocItem[]>(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.removeItem("diocese_santos_news_v1");
      localStorage.removeItem("diocese_santos_news_v2");
      localStorage.removeItem("diocese_santos_news_v3");
    } catch {
      /* ignore */
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const parsed = await fetchDioceseSantosNews();
        if (cancelled) return;
        if (parsed.length >= 2) {
          setNews(parsed);
          setSyncedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                at: Date.now(),
                items: parsed.map(({ title, link, desc, date, remoteImg }) => ({
                  title,
                  link,
                  desc,
                  date,
                  remoteImg,
                })),
              }),
            );
          } catch {
            /* ignore */
          }
        }
      } catch (error) {
        console.warn("Sincronização Diocese de Santos:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Reaproveita sync recente da sessão e re-resolve imagens
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as {
          at: number;
          items: Array<Omit<DiocItem, "img"> & { remoteImg?: string }>;
        };
        if (Array.isArray(cached.items) && cached.items.length >= 2 && Date.now() - cached.at < REFRESH_MS) {
          setNews(
            cached.items.map((it) => ({
              ...it,
              img: resolveImage(it.remoteImg || "", it.link, it.title),
            })),
          );
        }
      }
    } catch {
      /* ignore */
    }

    load();
    const interval = window.setInterval(load, REFRESH_MS);

    // Atualiza ao voltar para a aba
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const max = Math.max(0, news.length - VISIBLE);
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(max, i + 1));
  const visible = news.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Diocese de Santos</h2>
          <a
            href={BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80"
          >
            diocesedesantos.org.br
          </a>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Notícia anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index >= max}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Próxima notícia"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((item, i) => (
          <a
            key={`${index}-${i}-${item.title.slice(0, 24)}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="aspect-video overflow-hidden bg-muted relative">
              <img
                src={item.img || PLACEHOLDER_IMG}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  // Tenta proxy da imagem remota; depois brasão local
                  if (item.remoteImg && !el.dataset.triedRemote) {
                    el.dataset.triedRemote = "1";
                    el.src = proxyLiveImage(item.remoteImg);
                    return;
                  }
                  if (el.src !== PLACEHOLDER_IMG) el.src = PLACEHOLDER_IMG;
                }}
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-3">
                {item.title}
              </h3>
              {item.desc ? (
                <p className="text-xs text-muted-foreground flex-1 line-clamp-4 mb-2">{item.desc}</p>
              ) : null}
              {item.date ? (
                <p className="text-[10px] text-muted-foreground/70 mb-2">{item.date}</p>
              ) : null}
              <span className="mt-auto text-xs font-semibold text-primary">LER NOTÍCIA →</span>
            </div>
          </a>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground mt-2 text-center opacity-70">
        {loading
          ? "Sincronizando com o site da Diocese…"
          : syncedAt
            ? `Atualizado automaticamente às ${syncedAt}`
            : "Sincroniza automaticamente com diocesedesantos.org.br"}
      </div>
    </div>
  );
};

export default DioceseSantosCarousel;
