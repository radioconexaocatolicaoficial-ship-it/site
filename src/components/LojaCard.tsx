import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, MessageCircle, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const WHATSAPP = "5511961605164";

const produtos = [
  { id: 1, nome: "Camiseta Conexão Católica", preco: "R$ 59,90", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
  { id: 2, nome: "Caneca Rádio Conexão Católica", preco: "R$ 39,90", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop" },
  { id: 3, nome: "Boné Conexão Católica", preco: "R$ 49,90", img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop" },
  { id: 4, nome: "Ecobag Rádio Conexão Católica", preco: "R$ 29,90", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop" },
  { id: 5, nome: "Terço Exclusivo da Rádio", preco: "R$ 34,90", img: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&h=400&fit=crop" },
  { id: 6, nome: "Adesivo Pack Conexão Católica", preco: "R$ 19,90", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { id: 7, nome: "Camiseta Caminhada da Ressurreição", preco: "R$ 64,90", img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop" },
  { id: 8, nome: "Almofada Conexão Católica", preco: "R$ 54,90", img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop" },
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
