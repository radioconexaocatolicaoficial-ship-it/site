import camiseta from "@/assets/camiseta.jpg";
import garrafaCaminhada from "@/assets/Garrafa-Caminhada-da-Ressurreição.jpg";
import exerciciosEspirituais from "@/assets/Exercícios-Espirituais.jpg";
import squeezeAluminio from "@/assets/Squeeze-em-Alumínio.jpg";
import santaRita from "@/assets/SANTA-RITA-DE-CASSIA.jpg";
import sacola from "@/assets/sacola.jpg";
import tercoSaoMiguel from "@/assets/Terço-de-São-Miguel-Arcanjo.jpg";
import tercoCores from "@/assets/Terços-Diversas-cores.jpg";
import rosarioCampacto from "@/assets/rosario-campcto.jpg";

export const WHATSAPP_LOJA = "5511961605164";

export interface LojaProduto {
  id: number;
  nome: string;
  preco: string;
  img: string;
  /** Foto com fundo claro — miniatura e modal usam painel branco */
  imgLightBg?: boolean;
}

export const lojaProdutos: LojaProduto[] = [
  { id: 1, nome: "Squeeze Caminhada da Ressurreição", preco: "Orçamento", img: garrafaCaminhada },
  { id: 2, nome: "Livro Exercícios Espirituais", preco: "R$ 59,90", img: exerciciosEspirituais },
  { id: 3, nome: "Squeeze Conexão Católica", preco: "Orçamento", img: squeezeAluminio },
  { id: 4, nome: "Livro Santa Rita de Cássia — Padre PH", preco: "R$ 59,90", img: santaRita },
  { id: 5, nome: "Mochila Saco Conexão Católica", preco: "Orçamento", img: sacola },
  { id: 6, nome: "Terço Aeternum — Olho de Tigre", preco: "R$ 50,00", img: tercoSaoMiguel },
  { id: 7, nome: "Terço Nossa Senhora Aparecida", preco: "R$ 30,00", img: tercoCores },
  { id: 8, nome: "Terço Aeternum Premium", preco: "R$ 100,00", img: rosarioCampacto },
  {
    id: 9,
    nome: "Camiseta Conexão Católica — Há 11 Anos",
    preco: "Orçamento",
    img: camiseta,
    imgLightBg: true,
  },
];

export const whatsappLojaLink = (nome: string, preco: string) =>
  `https://wa.me/${WHATSAPP_LOJA}?text=${encodeURIComponent(`Olá! Tenho interesse em comprar: *${nome}* - ${preco}`)}`;
