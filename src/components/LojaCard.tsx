import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, MessageCircle, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import camiseta from "@/assets/camiseta.jpg";
import garrafaCaminhada from "@/assets/Garrafa-Caminhada-da-Ressurreição.jpg";
import exerciciosEspirituais from "@/assets/Exercícios-Espirituais.jpg";
import squeezeAluminio from "@/assets/Squeeze-em-Alumínio.jpg";
import santaRita from "@/assets/SANTA-RITA-DE-CASSIA.jpg";
import sacola from "@/assets/sacola.jpg";
import tercoSaoMiguel from "@/assets/Terço-de-São-Miguel-Arcanjo.jpg";
import tercoCores from "@/assets/Terços-Diversas-cores.jpg";
import rosarioCampacto from "@/assets/rosario-campcto.jpg";

const WHATSAPP = "5511961605164";

const produtos = [
  { id: 1, nome: "Camiseta Conexão Católica — Há 11 Anos", preco: "Orçamento", img: camiseta },
  { id: 2, nome: "Squeeze Caminhada da Ressurreição", preco: "Orçamento", img: garrafaCaminhada },
  { id: 3, nome: "Livro Exercícios Espirituais", preco: "R$ 59,90", img: exerciciosEspirituais },
  { id: 4, nome: "Squeeze Conexão Católica", preco: "Orçamento", img: squeezeAluminio },
  { id: 5, nome: "Livro Santa Rita de Cássia — Padre PH", preco: "R$ 59,90", img: santaRita },
  { id: 6, nome: "Mochila Saco Conexão Católica", preco: "Orçamento", img: sacola },
  { id: 7, nome: "Terço Aeternum — Olho de Tigre", preco: "R$ 50,00", img: tercoSaoMiguel },
  { id: 8, nome: "Terço Nossa Senhora Aparecida", preco: "R$ 30,00", img: tercoCores },
  { id: 9, nome: "Terço Aeternum Premium", preco: "R$ 100,00", img: rosarioCampacto },
];

const whatsappLink = (nome: string, preco: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho interesse em comprar: *${nome}* - ${preco}`)}`;

const LojaCard = () => {
  const [index, setIndex] = useState(0);
  const p = produtos[index];

  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Loja Oficial
        </h2>
      </div>

      {/* Card único com carrossel */}
      <div className="flex-1 group bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        {/* Imagem */}
        <div className="relative overflow-hidden aspect-video">
          <img
            src={p.img}
            alt={p.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Tag className="h-2.5 w-2.5" /> Loja Oficial
          </span>
          {/* Navegação sobre a imagem */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <button
              onClick={() => setIndex(i => Math.max(0, i - 1))}
              disabled={index === 0}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIndex(i => Math.min(produtos.length - 1, i + 1))}
              disabled={index === produtos.length - 1}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/* Indicador */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {produtos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm text-foreground leading-snug mb-1">{p.nome}</h3>
          <p className="text-base font-bold text-primary flex-1">{p.preco}</p>
          <a
            href={whatsappLink(p.nome, p.preco)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Comprar pelo WhatsApp
          </a>
        </div>
      </div>

      {/* Rodapé */}
      <Link
        to="/loja"
        className="mt-4 w-full py-2.5 rounded-xl border border-primary text-primary text-sm font-semibold text-center hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        Ver loja completa
      </Link>
    </div>
  );
};

export default LojaCard;
