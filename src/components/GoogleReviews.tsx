import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const reviews = [
  {
    name: "Maria Aparecida S.",
    avatar: "M",
    rating: 5,
    date: "há 2 semanas",
    text: "Rádio maravilhosa! Sempre que ligo o carro coloco a Conexão Católica. A programação é excelente, os locutores são muito atenciosos e a música católica é de qualidade. Deus abençoe toda a equipe!",
  },
  {
    name: "José Carlos Lima",
    avatar: "J",
    rating: 5,
    date: "há 1 mês",
    text: "Uma rádio que realmente evangeliza. Ouço todos os dias no trabalho e me sinto mais próximo de Deus. Parabéns pela dedicação e pelo conteúdo de qualidade. Que Deus continue abençoando esse ministério!",
  },
  {
    name: "Ana Paula Ferreira",
    avatar: "A",
    rating: 5,
    date: "há 3 semanas",
    text: "Descobri a Rádio Conexão Católica há 2 anos e desde então não paro de ouvir. A Caminhada da Ressurreição que transmitem ao vivo é emocionante demais. Muito obrigada por esse trabalho lindo!",
  },
  {
    name: "Roberto Mendes",
    avatar: "R",
    rating: 5,
    date: "há 2 meses",
    text: "Excelente rádio católica! Programação variada, missas ao vivo, terço, músicas lindas. Recomendo para todos que querem fortalecer a fé no dia a dia. Nota 10 para toda a equipe!",
  },
  {
    name: "Francisca Oliveira",
    avatar: "F",
    rating: 5,
    date: "há 1 semana",
    text: "Que bênção ter uma rádio assim! Ouço desde o início e só tenho a agradecer. Os programas são muito edificantes e os locutores transmitem muita paz e fé. Continuem com esse trabalho abençoado!",
  },
  {
    name: "Paulo Henrique T.",
    avatar: "P",
    rating: 5,
    date: "há 3 meses",
    text: "A melhor rádio católica que já ouvi. Conteúdo de qualidade, locutores preparados e uma programação que realmente fortalece a fé. Indico para toda a família. Deus abençoe a Rádio Conexão Católica!",
  },
];

const VISIBLE = 3;

const GoogleReviews = () => {
  const [index, setIndex] = useState(0);
  const max = reviews.length - VISIBLE;
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(max, i + 1));
  const visible = reviews.slice(index, index + VISIBLE);

  return (
    <section className="container mx-auto px-4 pt-6 pb-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Logo Google */}
          <svg className="h-7 w-7" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <div>
            <h2 className="text-xl font-bold text-foreground">Avaliações no Google</h2>
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm font-semibold text-foreground ml-1">5,0</span>
              <span className="text-xs text-muted-foreground ml-1">· {reviews.length} avaliações</span>
            </div>
          </div>
        </div>
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

      {/* Cards de avaliação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visible.map((r, i) => (
          <div key={index + i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            {/* Topo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                {r.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>

            {/* Estrelas */}
            <div className="flex gap-0.5">
              {[...Array(r.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Texto */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{r.text}</p>
          </div>
        ))}
      </div>

      {/* Link para Google */}
      <div className="text-center mt-6">
        <a
          href="https://www.google.com/search?q=Radio+Conexao+Catolica"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          Ver todas as avaliações no Google →
        </a>
      </div>
    </section>
  );
};

export default GoogleReviews;
