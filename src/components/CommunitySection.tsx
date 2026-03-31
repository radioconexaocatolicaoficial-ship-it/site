import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const videos = [
  {
    title: "Caminhada da Ressurreição 2026 | Katia Falcão",
    thumb: "https://i.ytimg.com/vi/swoPlO17lV0/mqdefault.jpg",
    link: "https://www.youtube.com/watch?v=swoPlO17lV0",
    date: "25 de mar. de 2026",
  },
  {
    title: "Caminhada da Ressurreição 2026 | Mayara",
    thumb: "https://i.ytimg.com/vi/Kqp8jUiTwdI/mqdefault.jpg",
    link: "https://www.youtube.com/watch?v=Kqp8jUiTwdI",
    date: "17 de mar. de 2026",
  },
  {
    title: "Caminhada da Ressurreição 2026 | Jovens",
    thumb: "https://i.ytimg.com/vi/vocDxNLNQj0/mqdefault.jpg",
    link: "https://www.youtube.com/watch?v=vocDxNLNQj0",
    date: "17 de mar. de 2026",
  },
];

const CommunitySection = () => {
  return (
    <section id="comunidade" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-1 flex-1 bg-primary rounded" />
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary uppercase tracking-wide">
            Nossos Vídeos
          </h2>
          <div className="h-1 flex-1 bg-primary rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <Card key={i} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <a href={v.link} target="_blank" rel="noopener noreferrer" className="block">
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={v.thumb}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width={320}
                    height={180}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 group-hover:bg-foreground/30 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 fill-primary-foreground ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-foreground text-sm line-clamp-2">{v.title}</h3>
                  <p className="text-muted-foreground text-xs mt-1">{v.date}</p>
                </div>
              </a>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://www.youtube.com/@radioconexaocatolicaofical?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="default" size="lg">
              Inscrever-se no Canal
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
