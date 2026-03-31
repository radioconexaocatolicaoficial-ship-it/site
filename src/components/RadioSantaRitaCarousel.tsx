import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  {
    img: "https://websitenoar.net/contents/384/avatar/xm83746a1b5356b37fc8f94fbdda2e5e33_384_1760103291.png",
    title: "Bem-vindo à Rádio Santa Rita de Cássia",
    desc: "A rádio católica que transmite fé, esperança e amor 24 horas por dia. Ouça ao vivo e participe da nossa programação especial.",
    link: "https://www.radiosantaritadecassia.com.br/",
    btn: "ACESSAR SITE",
  },
  {
    img: "https://websitenoar.net/contents/384/slider/user_2125955352.jpg",
    title: "Confira a programação completa da rádio",
    desc: "Missas, terços, programas de evangelização e muito mais. Veja todos os horários e não perca nenhum programa especial.",
    link: "https://www.radiosantaritadecassia.com.br/programacao",
    btn: "VER PROGRAMAÇÃO",
  },
  {
    img: "https://websitenoar.net/contents/384/slider/user_2478937.jpg",
    title: "Santa Missa pelas Almas com Padre PH",
    desc: "Acompanhe a Santa Missa celebrada pelo Padre PH ao vivo pela Rádio Santa Rita de Cássia. Um momento de oração e comunhão.",
    link: "https://www.radiosantaritadecassia.com.br/",
    btn: "OUVIR AO VIVO",
  },
  {
    img: "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Santa_Rita_de_Cassia.jpg/640px-Santa_Rita_de_Cassia.jpg&w=600&h=338&fit=cover&output=jpg",
    title: "Festa de Santa Rita de Cássia — Padroeira da Rádio",
    desc: "Celebramos com alegria a festa da nossa padroeira. Santa Rita, a santa dos impossíveis, intercede por todos os ouvintes.",
    link: "https://www.radiosantaritadecassia.com.br/",
    btn: "SAIBA MAIS",
  },
  {
    img: "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Padre_Fabio_de_Melo.jpg/640px-Padre_Fabio_de_Melo.jpg&w=600&h=338&fit=cover&output=jpg",
    title: "As melhores músicas católicas no ar",
    desc: "Padre Fábio de Melo, Rosa de Saron, Padre Marcelo Rossi e muito mais. A trilha sonora da sua fé toca aqui o dia todo.",
    link: "https://www.radiosantaritadecassia.com.br/albuns",
    btn: "VER ÁLBUNS",
  },
  {
    img: "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG&w=600&h=338&fit=cover&output=jpg",
    title: "Conheça os locutores da Rádio Santa Rita",
    desc: "Nossa equipe de locutores dedicados leva a Palavra de Deus e a música católica para milhares de ouvintes todos os dias.",
    link: "https://www.radiosantaritadecassia.com.br/locutores",
    btn: "CONHECER EQUIPE",
  },
];

const VISIBLE = 2;

const RadioSantaRitaCarousel = () => {
  const [index, setIndex] = useState(0);
  const max = items.length - VISIBLE;
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(max, i + 1));
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
            <div className="aspect-video overflow-hidden">
              <img src={item.img} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground flex-1 line-clamp-3">{item.desc}</p>
              <span className="mt-3 text-xs font-semibold text-primary">LER NOTÍCIA →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RadioSantaRitaCarousel;
