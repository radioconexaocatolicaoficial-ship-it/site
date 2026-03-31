import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const dioceseNews = [
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/jubileu_5.jpg&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "Bispos celebram 25 anos de ordenação episcopal em São Miguel Paulista",
    desc: "Dom Manuel Parrado Carral e Dom Pedro Luís Stringhini celebram jubileu com missa presidida pelo Cardeal Dom Odilo Scherer.",
    link: "https://www.diocesesaomiguel.org.br/",
  },
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/jubileu_dom_manuel.jpg&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "Dom Manuel Parrado Carral: 25 anos de Ordenação Episcopal",
    desc: "Bispo emérito de São Miguel Paulista é homenageado pela família diocesana em celebração de gratidão e fé.",
    link: "https://www.diocesesaomiguel.org.br/",
  },
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/Abertura_Camapanha_da_Fraternidade_2026_Daniel_Reis-3.JPG&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "Diocese abre a Campanha da Fraternidade 2026",
    desc: "Dom Algacir Munhak preside abertura com o tema \"Fraternidade e Moradia\" e convoca a comunidade ao compromisso social.",
    link: "https://www.diocesesaomiguel.org.br/",
  },
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/Abertura_Camapanha_da_Fraternidade_2026_Daniel_Reis-45.JPG&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "CF 2026: \"Ele veio morar entre nós\" — chamado à moradia digna",
    desc: "Celebração reuniu fiéis, autoridades e pastorais em torno do tema da dignidade habitacional na Zona Leste de São Paulo.",
    link: "https://www.diocesesaomiguel.org.br/",
  },
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/cartaz_Caminhada.jpg&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "42ª Caminhada da Ressurreição: tema \"Eu vi o Senhor\"",
    desc: "Evento acontece na madrugada de 4 de abril, da Basílica da Penha até São Miguel Paulista. Novo site oficial no ar.",
    link: "https://www.caminhadadaressurreicao.com/",
  },
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/vila_esperan%C3%A7a_2.jpg&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "Oficina Bíblica reúne fiéis do Setor Pastoral Vila Esperança",
    desc: "Prof. Dr. Matthias Grenzer conduz reflexão sobre o Salmo 72 com representantes das sete paróquias do setor.",
    link: "https://www.diocesesaomiguel.org.br/",
  },
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/vila_esperan%C3%A7a.jpg&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "Formação permanente fortalece lideranças pastorais da Diocese",
    desc: "Encontro na Paróquia Santo Antônio de Vila Talarico reforça comunhão entre paróquias e aprofundamento nas Escrituras.",
    link: "https://www.diocesesaomiguel.org.br/",
  },
  {
    img: "https://wsrv.nl/?url=www.diocesesaomiguel.org.br/images/jubileu_3.jpg&w=600&h=338&fit=cover&a=attention&output=jpg",
    title: "12 bispos reunidos na celebração do jubileu episcopal diocesano",
    desc: "Missa solene na Paróquia do Divino Espírito Santo reuniu bispos, padres, diáconos, religiosos e fiéis da Diocese.",
    link: "https://www.diocesesaomiguel.org.br/",
  },
];

const VISIBLE = 2;

const DioceseCarousel = () => {
  const [index, setIndex] = useState(0);
  const max = dioceseNews.length - VISIBLE;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(max, i + 1));

  const visible = dioceseNews.slice(index, index + VISIBLE);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
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

      {/* Cards */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((item, i) => (
          <a key={index + i} href={item.link} target="_blank" rel="noopener noreferrer"
            className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="aspect-video overflow-hidden">
              <img src={item.img} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-3">{item.title}</h3>
              <p className="text-xs text-muted-foreground flex-1 line-clamp-3">{item.desc}</p>
              <span className="mt-3 text-xs font-semibold text-primary">LER NOTÍCIA →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DioceseCarousel;
