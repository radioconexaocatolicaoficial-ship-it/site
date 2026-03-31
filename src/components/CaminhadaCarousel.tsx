import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  {
    img: "https://static.wixstatic.com/media/e11735_e5149fc5e4d743c6a4f7613eb6017eb7~mv2.jpg/v1/crop/x_156,y_0,w_1728,h_1148/fill/w_600,h_338,al_c,q_80/cristo%20na%20cruz%203.jpg",
    title: "42ª Caminhada da Ressurreição — \"Eu vi o Senhor\"",
    desc: "O maior evento pascal da Zona Leste de São Paulo acontece na madrugada do Sábado de Aleluia, da Basílica da Penha até São Miguel Paulista, com 13 km de fé e oração.",
    link: "https://www.caminhadadaressurreicao.com/",
    btn: "SAIBA MAIS",
  },
  {
    img: "https://static.wixstatic.com/media/e11735_3de17851fd0a486e8ba63b6b3e8a46e5~mv2.jpeg/v1/crop/x_0,y_73,w_1600,h_1453/fill/w_600,h_338,al_c,q_80/WhatsApp%20Image%202025-02-12%20at%2022_17_07.jpeg",
    title: "Conheça a história da Caminhada da Ressurreição",
    desc: "Realizada anualmente desde 1984 pela Diocese de São Miguel Paulista, a Caminhada reúne milhares de fiéis para celebrar a Ressurreição de Jesus Cristo nas ruas da Zona Leste.",
    link: "https://www.caminhadadaressurreicao.com/",
    btn: "NOSSA HISTÓRIA",
  },
  {
    img: "https://static.wixstatic.com/media/e11735_5771cbef74334ec79d9f01c90e567276~mv2.jpg/v1/crop/x_0,y_82,w_519,h_555/fill/w_600,h_338,al_c,q_80/Imagem1.jpg",
    title: "13 km de fé: o percurso da Caminhada",
    desc: "Saindo da Basílica Nossa Senhora da Penha à meia-noite, os peregrinos percorrem 13 quilômetros até a Praça Padre Aleixo Monteiro Mafra, em São Miguel Paulista, chegando ao amanhecer.",
    link: "https://www.caminhadadaressurreicao.com/",
    btn: "VER PERCURSO",
  },
  {
    img: "https://static.wixstatic.com/media/e11735_c662420e062a4a6aa55d5b8d4da7eebf~mv2.jpg/v1/crop/x_0,y_18,w_200,h_214/fill/w_600,h_338,al_c,q_80/Design%20sem%20nome_edited_edited.jpg",
    title: "Seja voluntário na Caminhada da Ressurreição",
    desc: "\"A messe é grande, mas os operários são poucos.\" Faça parte da organização deste grande evento nos setores operacional, técnico, comunicação ou logística.",
    link: "https://www.caminhadadaressurreicao.com/",
    btn: "QUERO SER VOLUNTÁRIO",
  },
  {
    img: "https://static.wixstatic.com/media/e11735_5dadfa16897e4c39b98f1a4a802396e6~mv2.png/v1/crop/x_31,y_0,w_993,h_888/fill/w_600,h_338,al_c,q_85/Logo%20New-Photoroom.png",
    title: "Patrocine a Caminhada da Ressurreição 2026",
    desc: "Sua empresa pode aumentar a visibilidade da marca, engajar diretamente com o público e ter reconhecimento especial durante o maior evento pascal da Zona Leste de São Paulo.",
    link: "https://www.caminhadadaressurreicao.com/",
    btn: "SEJA PATROCINADOR",
  },
  {
    img: "https://static.wixstatic.com/media/e11735_342535daf22a4e068a9b6c80374f5031~mv2.jpg/v1/fill/w_600,h_338,al_c,q_80/images_jfif.jpg",
    title: "Apoio institucional: parceiros que tornam tudo possível",
    desc: "O evento conta com o apoio das Subprefeituras, CET, Sabesp, SPTrans, Polícia Militar e Civil, GCM, Defesa Civil e hospitais da região para garantir a segurança de todos os peregrinos.",
    link: "https://www.caminhadadaressurreicao.com/",
    btn: "CONHEÇA OS APOIADORES",
  },
];

const VISIBLE = 2;

const CaminhadaCarousel = () => {
  const [index, setIndex] = useState(0);
  const max = items.length - VISIBLE;
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(max, i + 1));
  const visible = items.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Caminhada da Ressurreição</h2>
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

export default CaminhadaCarousel;
