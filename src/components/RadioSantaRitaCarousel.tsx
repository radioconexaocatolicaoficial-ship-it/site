import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RadioItem {
  title: string;
  img: string;
  link: string;
  desc: string;
}

const BASE = "https://www.radiosantaritadecassia.com.br";
const PROXY = `https://api.allorigins.win/get?url=${encodeURIComponent(BASE + "/posts")}`;

const FALLBACK: RadioItem[] = [
  { img: "https://websitenoar.net/contents/384/slider/user_2478937.jpg", title: "Bem-vindo à Rádio Santa Rita de Cássia", desc: "A Rádio Santa Rita de Cássia é a voz católica da Zona Leste de São Paulo, transmitindo fé, esperança e amor 24 horas por dia. Com uma programação rica em missas ao vivo, terços, programas de formação espiritual e as melhores músicas católicas, a rádio é a companhia diária de milhares de ouvintes que buscam se aproximar de Deus.", link: BASE },
  { img: "https://websitenoar.net/contents/384/slider/user_2125955352.jpg", title: "Confira a programação completa da rádio", desc: "Nossa grade de programação é repleta de momentos especiais: Santa Missa pelas Almas com Padre PH, terço diário, programas de evangelização, entrevistas com sacerdotes e muito mais. Acesse o site e confira todos os horários para não perder nenhum programa da sua rádio católica favorita.", link: `${BASE}/programacao` },
  { img: "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Santa_Rita_de_Cassia.jpg/640px-Santa_Rita_de_Cassia.jpg&w=600&h=338&fit=cover&output=jpg", title: "Festa de Santa Rita de Cássia — Padroeira da Rádio", desc: "Santa Rita de Cássia, conhecida como a santa dos impossíveis, é a padroeira da nossa rádio e fonte de inspiração para toda a equipe. Sua vida de fé, sofrimento e perseverança nos motiva a levar a Palavra de Deus a cada ouvinte. Celebramos com alegria sua festa e pedimos sua intercessão por todos.", link: BASE },
  { img: "https://websitenoar.net/contents/384/avatar/xm83746a1b5356b37fc8f94fbdda2e5e33_384_1760103291.png", title: "Ouça ao vivo e participe da nossa comunidade", desc: "Você pode ouvir a Rádio Santa Rita de Cássia pelo site, pelo aplicativo no Android ou pelo seu tocador de áudio favorito. Participe enviando recados, pedidos de música e orações. Faça parte dessa grande família católica que cresce a cada dia na fé e na comunhão.", link: BASE },
];

function parseRadio(html: string): RadioItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items: RadioItem[] = [];

  // Tenta pegar posts/cards do site
  doc.querySelectorAll(".post-item, .card, article, .splide__slide").forEach((el) => {
    const titleEl = el.querySelector("h2, h3, .name, .title, .card-title");
    const imgEl = el.querySelector("img");
    const linkEl = el.querySelector("a[href]");
    const descEl = el.querySelector("p, .desc, .card-text");

    const title = titleEl?.textContent?.trim() ?? "";
    const rawImg = imgEl?.getAttribute("src") ?? imgEl?.getAttribute("data-src") ?? "";
    const img = rawImg.startsWith("http") ? rawImg : rawImg ? BASE + rawImg : "";
    const href = linkEl?.getAttribute("href") ?? "";
    const link = href.startsWith("http") ? href : href ? BASE + href : BASE;
    const desc = descEl?.textContent?.replace(/<[^>]+>/g, "").trim().slice(0, 300) ?? "";

    if (title && img) items.push({ title, img, link, desc });
  });

  return items.slice(0, 8);
}

const VISIBLE = 2;

const RadioSantaRitaCarousel = () => {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<RadioItem[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(PROXY);
        const data = await res.json();
        const parsed = parseRadio(data.contents);
        if (!cancelled && parsed.length > 0) setItems(parsed);
      } catch { /* mantém fallback */ }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const max = items.length - VISIBLE;
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(max, i + 1));
  const visible = items.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Rádio Santa Rita de Cássia</h2>
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
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground flex-1">{item.desc}</p>
              <span className="mt-3 text-xs font-semibold text-primary">LER NOTÍCIA →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RadioSantaRitaCarousel;
