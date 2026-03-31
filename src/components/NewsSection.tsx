import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const vatNews = [
  {
    title: "Papa: na Quaresma, abster-se de palavras que ferem o próximo",
    desc: "O Papa Leão XIV convida os fiéis a um 'jejum que também passe pela língua', evitando palavras duras.",
    img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/srv/2025/08/03/2025-08-03-giubileo-dei-giovani---santa-messa-a-tor-vergata/1754206266819.JPG/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
    link: "https://www.vaticannews.va/pt.html",
  },
  {
    title: "Amoris Laetitia: Papa convoca bispos para encontro sobre a família",
    desc: "No aniversário de 10 anos da Exortação Apostólica, Leão XIV convoca encontro sinodal.",
    img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/srv/2026/03/18/2026-03-18-udienza-generale/1773834369056.JPG/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
    link: "https://www.vaticannews.va/pt.html",
  },
  {
    title: "Cardeal Pizzaballa no Getsêmani: queremos a paz",
    desc: "No Domingo de Ramos, o Patriarca Latino de Jerusalém presidiu a oração no Getsêmani.",
    img: "https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/ansa/2026/03/29/16/1774794997310.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.500.281.jpeg",
    link: "https://www.vaticannews.va/pt.html",
  },
];

const NewsSection = () => {
  return (
    <section id="noticias" className="py-16 bg-section-alt">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-1 flex-1 bg-secondary rounded" />
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary uppercase tracking-wide">
            Vatican News — Notícias
          </h2>
          <div className="h-1 flex-1 bg-secondary rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vatNews.map((news, i) => (
            <Card key={i} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img
                  src={news.img}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  width={500}
                  height={281}
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-foreground text-lg mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{news.desc}</p>
                <a href={news.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="w-full">LER NOTÍCIA</Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
