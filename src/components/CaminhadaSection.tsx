import { ExternalLink } from "lucide-react";

const LINK_CAMINHADA = "https://www.caminhadadaressurreicao.com/";

const CAMINHADA_ITEMS = [
  {
    img: "https://static.wixstatic.com/media/e11735_e5149fc5e4d743c6a4f7613eb6017eb7~mv2.jpg/v1/crop/x_156,y_0,w_1728,h_1148/fill/w_600,h_338,al_c,q_80/cristo%20na%20cruz%203.jpg",
    title: '42ª Caminhada da Ressurreição — "Eu vi o Senhor"',
    desc: "O maior evento pascal da Zona Leste de São Paulo acontece na madrugada do Sábado de Aleluia.",
    link: LINK_CAMINHADA,
  },
  {
    img: "https://static.wixstatic.com/media/e11735_3de17851fd0a486e8ba63b6b3e8a46e5~mv2.jpeg",
    title: "Conheça a história da Caminhada da Ressurreição",
    desc: "Realizada anualmente desde 1984 pela Diocese de São Miguel Paulista.",
    link: LINK_CAMINHADA,
    position: "object-top",
  },
  {
    img: "https://static.wixstatic.com/media/e11735_5771cbef74334ec79d9f01c90e567276~mv2.jpg/v1/crop/x_0,y_82,w_519,h_555/fill/w_600,h_338,al_c,q_80/Imagem1.jpg",
    title: "13 km de fé: o percurso da Caminhada",
    desc: "Saindo da Basílica Nossa Senhora da Penha à meia-noite percorrendo 13 quilômetros.",
    link: LINK_CAMINHADA,
  },
] as const;

/** Mesma seção da Caminhada usada na página inicial (abaixo de Santa Rita). */
const CaminhadaSection = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-foreground">Caminhada da Ressurreição</h2>
      <a
        href={LINK_CAMINHADA}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80"
      >
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
            <img
              src={item.img}
              alt={item.title}
              className={`w-full h-full object-cover ${"position" in item ? item.position : "object-center"} group-hover:scale-105 transition-transform duration-500`}
              loading="lazy"
            />
          </div>

          <div className="px-2.5 py-2 flex items-start justify-between gap-2 border-t border-border/60 flex-1 min-h-[3.25rem]">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-1">
                {item.title}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">{item.desc}</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden />
          </div>
        </a>
      ))}
    </div>
  </div>
);

export default CaminhadaSection;
