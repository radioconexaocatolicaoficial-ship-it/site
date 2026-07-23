import camiseta from "@/assets/Camiseta-fundo-branco.png";
import garrafaCaminhada from "@/assets/Garrafa-Caminhada-da-Ressurreição.png";
import exerciciosEspirituais from "@/assets/Exercícios-Espirituais.png";
import squeezeAluminio from "@/assets/Squeeze-em-Alumínio.png";
import santaRita from "@/assets/SANTA-RITA-DE-CASSIA.png";
import sacola from "@/assets/sacola.png";
import tercoSaoMiguel from "@/assets/Terço-de-São-Miguel-Arcanjo.png";
import tercoCores from "@/assets/Terços-Diversas-cores.png";
import rosarioCampacto from "@/assets/rosario-campcto.png";

export const WHATSAPP_LOJA = "5511961605164";

export interface LojaProduto {
  id: number;
  nome: string;
  desc: string;
  preco: string;
  img: string;
  /** PNG com fundo transparente — usado no carrossel do banner */
  imgPng?: string;
  categoria: string;
  /** Foto com fundo claro — miniatura e modal usam painel branco */
  imgLightBg?: boolean;
}

export const lojaProdutos: LojaProduto[] = [
  {
    id: 1,
    nome: "Squeeze Caminhada da Ressurreição",
    desc: "Squeeze oficial da Caminhada da Ressurreição com arte exclusiva. Entre em contato para mais informações.",
    preco: "Orçamento",
    img: garrafaCaminhada,
    imgPng: garrafaCaminhada,
    categoria: "Acessórios",
  },
  {
    id: 2,
    nome: "Livro Exercícios Espirituais — Santo Inácio de Loyola",
    desc: "Edição especial do clássico Exercícios Espirituais de Santo Inácio de Loyola. Capa dura com acabamento premium.",
    preco: "R$ 59,90",
    img: exerciciosEspirituais,
    imgPng: exerciciosEspirituais,
    categoria: "Livros",
  },
  {
    id: 3,
    nome: "Squeeze Conexão Católica — Há 11 Anos",
    desc: "Squeeze comemorativo de 11 anos da Rádio Conexão Católica. Entre em contato para mais informações.",
    preco: "Orçamento",
    img: squeezeAluminio,
    imgPng: squeezeAluminio,
    categoria: "Acessórios",
  },
  {
    id: 4,
    nome: "Livro Santa Rita de Cássia — Padre PH",
    desc: "Livro 'Santa Rita de Cássia — Advogada das Causas Impossíveis' pelo Padre PH. Edição especial Dei Gloriam.",
    preco: "R$ 59,90",
    img: santaRita,
    imgPng: santaRita,
    categoria: "Livros",
  },
  {
    id: 5,
    nome: "Mochila Saco Conexão Católica — Há 11 Anos",
    desc: "Mochila saco oficial da Rádio Conexão Católica comemorativa de 11 anos. Entre em contato para mais informações.",
    preco: "Orçamento",
    img: sacola,
    imgPng: sacola,
    categoria: "Acessórios",
  },
  {
    id: 6,
    nome: "Terço Aeternum — Olho de Tigre com Espada",
    desc: "Terço artesanal Aeternum com pedras olho de tigre e pingente espada de São Miguel Arcanjo. Peça única.",
    preco: "R$ 50,00",
    img: tercoSaoMiguel,
    imgPng: tercoSaoMiguel,
    categoria: "Religioso",
  },
  {
    id: 7,
    nome: "Terço Nossa Senhora Aparecida — Cristal Azul",
    desc: "Terço de cristal azul com medalha e crucifixo dourado de Nossa Senhora Aparecida. Embalagem para presente.",
    preco: "R$ 30,00",
    img: tercoCores,
    imgPng: tercoCores,
    categoria: "Religioso",
  },
  {
    id: 8,
    nome: "Terço Aeternum Premium — Olho de Tigre",
    desc: "Terço premium Aeternum com pedras olho de tigre naturais e pingente espada de São Miguel Arcanjo. Edição especial.",
    preco: "R$ 100,00",
    img: rosarioCampacto,
    imgPng: rosarioCampacto,
    categoria: "Religioso",
  },
  {
    id: 9,
    nome: "Camiseta Conexão Católica — Há 11 Anos",
    desc: "Camiseta oficial da Rádio Conexão Católica comemorativa de 11 anos. Entre em contato para tamanhos e cores disponíveis.",
    preco: "Orçamento",
    img: camiseta,
    imgPng: camiseta,
    categoria: "Vestuário",
    imgLightBg: true,
  },
];

/** Produtos com PNG transparente — carrossel do banner */
export const lojaBannerProdutos = lojaProdutos.filter((p): p is LojaProduto & { imgPng: string } => Boolean(p.imgPng));

export const lojaCategorias = ["Todos", ...Array.from(new Set(lojaProdutos.map((p) => p.categoria)))];

export const whatsappLojaLink = (nome: string, preco: string) =>
  `https://wa.me/${WHATSAPP_LOJA}?text=${encodeURIComponent(`Olá! Tenho interesse em comprar: *${nome}* - ${preco}`)}`;
