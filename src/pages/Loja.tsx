import Layout from "@/components/Layout";
import { ShoppingCart, MessageCircle } from "lucide-react";

const WHATSAPP = "5511961605164";

const produtos = [
  {
    id: 1,
    nome: "Camiseta Conexão Católica",
    desc: "Camiseta 100% algodão com logo bordada. Disponível nos tamanhos P, M, G e GG.",
    preco: "R$ 59,90",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    categoria: "Vestuário",
  },
  {
    id: 2,
    nome: "Caneca Rádio Conexão Católica",
    desc: "Caneca de porcelana 325ml com arte exclusiva da rádio. Ideal para o café da manhã.",
    preco: "R$ 39,90",
    img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    categoria: "Acessórios",
  },
  {
    id: 3,
    nome: "Boné Conexão Católica",
    desc: "Boné aba curva com bordado da logo. Regulagem traseira. Cor: preto e dourado.",
    preco: "R$ 49,90",
    img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
    categoria: "Vestuário",
  },
  {
    id: 4,
    nome: "Ecobag Rádio Conexão Católica",
    desc: "Sacola ecológica em algodão cru com estampa exclusiva. Sustentável e estilosa.",
    preco: "R$ 29,90",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    categoria: "Acessórios",
  },
  {
    id: 5,
    nome: "Terço Exclusivo da Rádio",
    desc: "Terço artesanal com medalha de Nossa Senhora. Embalagem especial para presente.",
    preco: "R$ 34,90",
    img: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&h=400&fit=crop",
    categoria: "Religioso",
  },
  {
    id: 6,
    nome: "Adesivo Pack Conexão Católica",
    desc: "Kit com 5 adesivos vinil com logos e frases da rádio. Resistente à água.",
    preco: "R$ 19,90",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    categoria: "Acessórios",
  },
  {
    id: 7,
    nome: "Camiseta Caminhada da Ressurreição",
    desc: "Camiseta oficial da Caminhada da Ressurreição 2025. Edição limitada.",
    preco: "R$ 64,90",
    img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop",
    categoria: "Vestuário",
  },
  {
    id: 8,
    nome: "Almofada Conexão Católica",
    desc: "Almofada 40x40cm com capa removível e estampa exclusiva da rádio.",
    preco: "R$ 54,90",
    img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
    categoria: "Casa",
  },
];

const categorias = ["Todos", ...Array.from(new Set(produtos.map(p => p.categoria)))];

const whatsappLink = (produto: typeof produtos[0]) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho interesse em comprar: *${produto.nome}* - ${produto.preco}`)}`;

import { useState } from "react";

const Loja = () => {
  const [cat, setCat] = useState("Todos");
  const filtrados = cat === "Todos" ? produtos : produtos.filter(p => p.categoria === cat);

  return (
    <Layout>
      {/* Hero */}
      <div className="gradient-primary text-primary-foreground py-12 px-4 text-center">
        <div className="container mx-auto">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl font-bold mb-2">Loja Oficial</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Produtos exclusivos da Rádio Conexão Católica. Compre pelo WhatsApp com facilidade.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categorias.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                cat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtrados.map(produto => (
            <div key={produto.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src={produto.img}
                  alt={produto.nome}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary opacity-70 mb-1">{produto.categoria}</span>
                <h3 className="font-semibold text-sm text-foreground leading-snug mb-1">{produto.nome}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{produto.desc}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <span className="text-base font-bold text-primary">{produto.preco}</span>
                  <a
                    href={whatsappLink(produto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Comprar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Loja;
