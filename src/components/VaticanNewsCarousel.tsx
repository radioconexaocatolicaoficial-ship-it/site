import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const news = [
  {
    img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/srv/2025/08/03/2025-08-03-giubileo-dei-giovani---santa-messa-a-tor-vergata/1754206266819.JPG/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
    title: "Papa: na Quaresma, abster-se de palavras que ferem o próximo",
    desc: "O Papa Leão XIV convida os fiéis a um jejum que também passe pela língua, evitando palavras duras e julgamentos precipitados.",
  },
  {
    img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/srv/2026/03/18/2026-03-18-udienza-generale/1773834369056.JPG/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
    title: "Amoris Laetitia: Papa convoca bispos do mundo para encontro sobre a família",
    desc: "Leão XIV convoca presidentes das Conferências Episcopais para um encontro sinodal sobre a família em Roma.",
  },
  {
    img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/ansa/2026/03/29/16/1774794997310.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
    title: "Cardeal Pizzaballa no Getsêmani: momento muito complicado; queremos a paz",
    desc: "No Domingo de Ramos, o Patriarca Latino de Jerusalém presidiu a oração no Getsêmani.",
  },
  {
    img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/srv/2025/11/27/viaggio-apostolico-in-tuerkiye-e-libano/1764227509730.JPG/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
    title: "Leão XIV fará Viagens Apostólicas à África, Espanha e Mônaco em 2026",
    desc: "O Vaticano anunciou três viagens apostólicas: Mônaco, África e Espanha.",
  },
];

const VaticanNewsCarousel = () => {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i === 0 ? news.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === news.length - 1 ? 0 : i + 1));

  // Show 2 cards on desktop
  const visible = [news[index], news[(index + 1) % news.length]];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Vatican News — Notícias</h2>
        <div className="flex gap-2">
          <button onClick={prev} className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((item, i) => (
          <a key={i} href="https://www.vaticannews.va/pt.html" target="_blank" rel="noopener noreferrer"
            className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="aspect-video overflow-hidden">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm text-foreground leading-snug mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground flex-1">{item.desc}</p>
              <span className="mt-3 text-xs font-semibold text-primary">LER NOTÍCIA →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default VaticanNewsCarousel;
