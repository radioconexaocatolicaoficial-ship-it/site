import { useState, useEffect, useCallback } from "react";
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  img: string;
  link: string;
  desc: string;
  badge: string;
}

const BASE_SANTA_RITA = "https://www.radiosantaritadecassia.com.br";
const LINK_CAMINHADA = "https://www.caminhadadaressurreicao.com/";

const CAMINHADA_ITEMS: NewsItem[] = [
  {
    img: "https://static.wixstatic.com/media/e11735_e5149fc5e4d743c6a4f7613eb6017eb7~mv2.jpg/v1/crop/x_156,y_0,w_1728,h_1148/fill/w_600,h_338,al_c,q_80/cristo%20na%20cruz%203.jpg",
    title: "42ª Caminhada da Ressurreição — \"Eu vi o Senhor\"",
    desc: "O maior evento pascal da Zona Leste de São Paulo acontece na madrugada do Sábado de Aleluia.",
    link: LINK_CAMINHADA,
    badge: "Caminhada"
  },
  {
    img: "https://static.wixstatic.com/media/e11735_3de17851fd0a486e8ba63b6b3e8a46e5~mv2.jpeg",
    title: "Conheça a história da Caminhada da Ressurreição",
    desc: "Realizada anualmente desde 1984 pela Diocese de São Miguel Paulista.",
    link: LINK_CAMINHADA,
    badge: "Caminhada"
  },
  {
    img: "https://static.wixstatic.com/media/e11735_5771cbef74334ec79d9f01c90e567276~mv2.jpg/v1/crop/x_0,y_82,w_519,h_555/fill/w_600,h_338,al_c,q_80/Imagem1.jpg",
    title: "13 km de fé: o percurso da Caminhada",
    desc: "Saindo da Basílica Nossa Senhora da Penha à meia-noite percorrendo 13 quilômetros.",
    link: LINK_CAMINHADA,
    badge: "Caminhada"
  },
];

const FALLBACK_SR: NewsItem[] = [
  { img: "https://websitenoar.net/contents/384/slider/user_2478937.jpg", title: "Bem-vindo à Rádio Santa Rita de Cássia", desc: "A Rádio Santa Rita de Cássia é a voz católica da Zona Leste.", link: BASE_SANTA_RITA, badge: "Santa Rita" },
  { img: "https://websitenoar.net/contents/384/slider/user_2125955352.jpg", title: "Confira a programação completa da rádio", desc: "Nossa grade de programação é repleta de momentos especiais.", link: `${BASE_SANTA_RITA}/programacao`, badge: "Santa Rita" },
  { img: "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Santa_Rita_de_Cassia.jpg/640px-Santa_Rita_de_Cassia.jpg&w=600&h=338&fit=cover&output=jpg", title: "Festa de Santa Rita de Cássia", desc: "Celebrada com alegria e fé por toda a comunidade.", link: BASE_SANTA_RITA, badge: "Santa Rita" },
];

function parseRadio(html: string): NewsItem[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items: NewsItem[] = [];

  doc.querySelectorAll(".post-item, .card, article, .splide__slide").forEach((el) => {
    const titleEl = el.querySelector("h2, h3, .name, .title, .card-title");
    const imgEl = el.querySelector("img");
    const linkEl = el.querySelector("a[href]");
    const descEl = el.querySelector("p, .desc, .card-text");

    const title = titleEl?.textContent?.trim() ?? "";
    const rawImg = imgEl?.getAttribute("src") ?? imgEl?.getAttribute("data-src") ?? "";
    const img = rawImg.startsWith("http") ? rawImg : rawImg ? BASE_SANTA_RITA + rawImg : "";
    const href = linkEl?.getAttribute("href") ?? "";
    const link = href.startsWith("http") ? href : href ? BASE_SANTA_RITA + href : BASE_SANTA_RITA;
    const desc = descEl?.textContent?.replace(/<[^>]+>/g, "").trim() ?? "";

    if (title && img) items.push({ title, img, link, desc, badge: "Santa Rita" });
  });

  return items;
}

const SantaRitaNewsSection = () => {
  const [srItems, setSrItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(BASE_SANTA_RITA + "/posts")}`);
      if (!res.ok) throw new Error();
      const html = await res.text();
      const parsed = parseRadio(html);
      if (parsed.length > 0) {
        setSrItems(parsed.slice(0, 3));
      } else {
        setSrItems(FALLBACK_SR);
      }
    } catch {
      setSrItems(FALLBACK_SR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const allItems = [...srItems, ...CAMINHADA_ITEMS].slice(0, 6);

  if (isLoading && srItems.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[3/2] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Bloco 1: Santa Rita */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Rádio Santa Rita de Cássia</h2>
          <a href={BASE_SANTA_RITA} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80">
            Ver Site Rádio
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {srItems.map((item, i) => (
            <a
              key={`sr-${i}-${item.link}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2.5 pt-2 pb-1">
                Notícias
              </p>
              
              <div className="aspect-[3/2] overflow-hidden bg-muted shrink-0 flex items-center justify-center relative">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <Newspaper className="h-10 w-10 text-primary/35" />
                )}
              </div>

              <div className="px-2.5 py-2 flex items-start justify-between gap-2 border-t border-border/60 flex-1 min-h-[3.25rem]">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
                    {item.desc || "Acesse para ler a notícia completa."}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Bloco 2: Caminhada */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Caminhada da Ressurreição</h2>
          <a href={LINK_CAMINHADA} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80">
            Saiba Mais
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAMINHADA_ITEMS.map((item, i) => (
            <a
              key={`cm-${i}-${item.link}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2.5 pt-2 pb-1">
                Evento
              </p>
              
              <div className="aspect-[3/2] overflow-hidden bg-muted shrink-0 flex items-center justify-center relative">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <Newspaper className="h-10 w-10 text-primary/35" />
                )}
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
    </div>
  );
};

export default SantaRitaNewsSection;
