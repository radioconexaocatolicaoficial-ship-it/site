import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DiocItem {
  title: string;
  img: string;
  link: string;
  desc: string;
}

const BASE = "https://www.diocesesaomiguel.org.br";
const PROXY = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(BASE + "/index.php/noticias-2")}`;
const FALLBACK: DiocItem[] = [
  { img: `${BASE}/images/jubileu_5.jpg`, title: "Bispos celebram 25 anos de ordenação episcopal", desc: "Dom Manuel Parrado Carral e Dom Pedro Luís Stringhini celebram jubileu com missa presidida pelo Cardeal Dom Odilo Scherer na Paróquia do Divino Espírito Santo.", link: BASE },
  { img: `${BASE}/images/Abertura_Camapanha_da_Fraternidade_2026_Daniel_Reis-3.JPG`, title: "Diocese abre a Campanha da Fraternidade 2026", desc: "Dom Algacir Munhak preside abertura com o tema \"Fraternidade e Moradia\", convocando a comunidade ao compromisso social e à dignidade habitacional na Zona Leste.", link: BASE },
  { img: `${BASE}/images/cartaz_Caminhada.jpg`, title: "42ª Caminhada da Ressurreição: tema \"Eu vi o Senhor\"", desc: "Evento acontece na madrugada de 4 de abril, da Basílica da Penha até São Miguel Paulista. Inspirado no testemunho de Maria Madalena ao encontrar o Cristo vivo.", link: "https://www.caminhadadaressurreicao.com/" },
  { img: `${BASE}/images/vila_esperanca_2.jpg`, title: "Oficina Bíblica reúne fiéis do Setor Pastoral Vila Esperança", desc: "Prof. Dr. Matthias Grenzer conduz reflexão sobre o Salmo 72 com representantes das sete paróquias, reforçando a comunhão pastoral e a formação permanente.", link: BASE },
];

function parseDiocese(html: string): DiocItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items: DiocItem[] = [];

  doc.querySelectorAll(".blog-item, .item-article").forEach((el) => {
    const titleEl = el.querySelector("h2");
    const imgEl = el.querySelector("img");
    const linkEl = el.querySelector("a[href]");
    const descEl = el.querySelector(".item-intro p, .article-introtext p");

    const title = titleEl?.textContent?.trim() ?? "";
    const rawImg = imgEl?.getAttribute("src") ?? "";
    const img = rawImg.startsWith("http") ? rawImg : BASE + rawImg;
    const href = linkEl?.getAttribute("href") ?? "";
    const link = href.startsWith("http") ? href : BASE + href;
    const desc = descEl?.textContent?.replace(/<[^>]+>/g, "").trim().slice(0, 300) ?? "";

    if (title && img) items.push({ title, img, link, desc });
  });

  return items.slice(0, 8);
}

const VISIBLE = 2;

const DioceseCarousel = () => {
  const [index, setIndex] = useState(0);
  const [news, setNews] = useState<DiocItem[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(PROXY);
        const html = await res.text();
        const parsed = parseDiocese(html);
        if (!cancelled && parsed.length > 0) setNews(parsed);
      } catch { /* mantém fallback */ }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const max = news.length - VISIBLE;
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(max, i + 1));
  const visible = news.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Diocese de São Miguel Paulista</h2>
        <div className="flex gap-2">
          <button onClick={prev} disabled={index === 0}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} disabled={index >= max}
            className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-default transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((item, i) => (
          <a key={index + i} href={item.link} target="_blank" rel="noopener noreferrer"
            className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="aspect-video overflow-hidden bg-muted">
              <img src={item.img} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-3">{item.title}</h3>
              <p className="text-xs text-muted-foreground flex-1 line-clamp-6">{item.desc}</p>
              <span className="mt-3 text-xs font-semibold text-primary">LER NOTÍCIA →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DioceseCarousel;
