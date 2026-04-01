import { useState } from "react";
import Layout from "@/components/Layout";
import LojaProdutoDialog from "@/components/LojaProdutoDialog";
import { ShoppingCart } from "lucide-react";

import camiseta from "@/assets/camiseta.jpg";
import garrafaCaminhada from "@/assets/Garrafa-Caminhada-da-Ressurreição.jpg";
import exerciciosEspirituais from "@/assets/Exercícios-Espirituais.jpg";
import squeezeAluminio from "@/assets/Squeeze-em-Alumínio.jpg";
import santaRita from "@/assets/SANTA-RITA-DE-CASSIA.jpg";
import sacola from "@/assets/sacola.jpg";
import tercoSaoMiguel from "@/assets/Terço-de-São-Miguel-Arcanjo.jpg";
import tercoCores from "@/assets/Terços-Diversas-cores.jpg";
import rosarioCampacto from "@/assets/rosario-campcto.jpg";

const produtos = [
  {
    id: 1,
    nome: "Camiseta Conexão Católica — Há 11 Anos",
    desc: "Camiseta oficial da Rádio Conexão Católica comemorativa de 11 anos. Entre em contato para tamanhos e cores disponíveis.",
    preco: "Orçamento",
    img: camiseta,
    categoria: "Vestuário",
  },
  {
    id: 2,
    nome: "Squeeze Caminhada da Ressurreição",
    desc: "Squeeze oficial da Caminhada da Ressurreição com arte exclusiva. Entre em contato para mais informações.",
    preco: "Orçamento",
    img: garrafaCaminhada,
    categoria: "Acessórios",
  },
  {
    id: 3,
    nome: "Livro Exercícios Espirituais — Santo Inácio de Loyola",
    desc: "Edição especial do clássico Exercícios Espirituais de Santo Inácio de Loyola. Capa dura com acabamento premium.",
    preco: "R$ 59,90",
    img: exerciciosEspirituais,
    categoria: "Livros",
  },
  {
    id: 4,
    nome: "Squeeze Conexão Católica — Há 11 Anos",
    desc: "Squeeze comemorativo de 11 anos da Rádio Conexão Católica. Entre em contato para mais informações.",
    preco: "Orçamento",
    img: squeezeAluminio,
    categoria: "Acessórios",
  },
  {
    id: 5,
    nome: "Livro Santa Rita de Cássia — Padre PH",
    desc: "Livro 'Santa Rita de Cássia — Advogada das Causas Impossíveis' pelo Padre PH. Edição especial Dei Gloriam.",
    preco: "R$ 59,90",
    img: santaRita,
    categoria: "Livros",
  },
  {
    id: 6,
    nome: "Mochila Saco Conexão Católica — Há 11 Anos",
    desc: "Mochila saco oficial da Rádio Conexão Católica comemorativa de 11 anos. Entre em contato para mais informações.",
    preco: "Orçamento",
    img: sacola,
    categoria: "Acessórios",
  },
  {
    id: 7,
    nome: "Terço Aeternum — Olho de Tigre com Espada",
    desc: "Terço artesanal Aeternum com pedras olho de tigre e pingente espada de São Miguel Arcanjo. Peça única.",
    preco: "R$ 50,00",
    img: tercoSaoMiguel,
    categoria: "Religioso",
  },
  {
    id: 8,
    nome: "Terço Nossa Senhora Aparecida — Cristal Azul",
    desc: "Terço de cristal azul com medalha e crucifixo dourado de Nossa Senhora Aparecida. Embalagem para presente.",
    preco: "R$ 30,00",
    img: tercoCores,
    categoria: "Religioso",
  },
  {
    id: 9,
    nome: "Terço Aeternum Premium — Olho de Tigre",
    desc: "Terço premium Aeternum com pedras olho de tigre naturais e pingente espada de São Miguel Arcanjo. Edição especial.",
    preco: "R$ 100,00",
    img: rosarioCampacto,
    categoria: "Religioso",
  },
];

const categorias = ["Todos", ...Array.from(new Set(produtos.map(p => p.categoria)))];

const Loja = () => {
  const [cat, setCat] = useState("Todos");
  const [modalProduto, setModalProduto] = useState<(typeof produtos)[0] | null>(null);
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
            <div
              key={produto.id}
              role="button"
              tabIndex={0}
              onClick={() => setModalProduto(produto)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setModalProduto(produto);
                }
              }}
              className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
            >
              <div className={`aspect-square overflow-hidden ${produto.id === 1 ? "bg-white" : ""}`}>
                <img
                  src={produto.img}
                  alt={produto.nome}
                  className={`w-full h-full hover:scale-105 transition-transform duration-500 ${
                    produto.id === 1 ? "object-contain p-3" : "object-cover"
                  }`}
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary opacity-70 mb-1">{produto.categoria}</span>
                <h3 className="font-semibold text-sm text-foreground leading-snug mb-1">{produto.nome}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{produto.desc}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <span className={`text-base font-bold ${produto.preco === "Orçamento" ? "text-muted-foreground text-sm" : "text-primary"}`}>
                    {produto.preco === "Orçamento" ? "Sob orçamento" : produto.preco}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Ver detalhes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LojaProdutoDialog
        open={modalProduto !== null}
        onOpenChange={(open) => !open && setModalProduto(null)}
        produto={
          modalProduto
            ? {
                id: modalProduto.id,
                nome: modalProduto.nome,
                preco: modalProduto.preco,
                img: modalProduto.img,
                desc: modalProduto.desc,
                ...(modalProduto.id === 1 ? { imgLightBg: true as const } : {}),
              }
            : null
        }
      />
    </Layout>
  );
};

export default Loja;
