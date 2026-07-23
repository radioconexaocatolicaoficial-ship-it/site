/** Configuração SEO central — domínio oficial e metadados por rota. */

export const SITE_URL = "https://www.radioconexaocatolica.com.br";
export const SITE_NAME = "Rádio Conexão Católica";
export const SITE_TAGLINE = "A sintonia de vida no ar";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`;

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

const brandSuffix = ` | ${SITE_NAME}`;

export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    path: "/",
    title: `${SITE_NAME} — Web Rádio Católica 24h | ${SITE_TAGLINE}`,
    description:
      "Ouça a Rádio Conexão Católica ao vivo 24 horas: música católica, oração, liturgia, notícias da Igreja e evangelização na Diocese de São Miguel Paulista e no Litoral. Julho de 2026.",
    keywords:
      "rádio católica, web rádio católica, rádio conexão católica, ouvir rádio católica online, missa online, música católica, diocese são miguel paulista, baixada santista, julho 2026",
  },
  "/sobre": {
    path: "/sobre",
    title: `Sobre a Rádio${brandSuffix}`,
    description:
      "Conheça a história da Rádio Conexão Católica, fundada em 5 de dezembro de 2013. Missão, valores e evangelização digital na Zona Leste de São Paulo.",
    keywords: "história rádio conexão católica, web rádio católica são paulo, aurélio batista",
  },
  "/contato": {
    path: "/contato",
    title: `Contato e redes sociais${brandSuffix}`,
    description:
      "Fale com a Rádio Conexão Católica: WhatsApp, e-mail e redes oficiais. Peça oração, envie mensagem e acompanhe a programação.",
    keywords: "contato rádio conexão católica, whatsapp rádio católica",
  },
  "/loja": {
    path: "/loja",
    title: `Loja Católica${brandSuffix}`,
    description:
      "Produtos católicos da Rádio Conexão Católica: camisetas, squeezes e itens de evangelização. Apoie a missão da rádio.",
    keywords: "loja católica, produtos rádio conexão católica",
  },
  "/midia": {
    path: "/midia",
    title: `Mídia — fotos, vídeos e posts${brandSuffix}`,
    description:
      "Galeria de mídia da Rádio Conexão Católica: Instagram, YouTube, TikTok e Facebook com conteúdo evangelizador atualizado.",
    keywords: "vídeos católicos, youtube rádio conexão católica, instagram católico",
  },
  "/litoral": {
    path: "/litoral",
    title: `Rádio no Litoral — Baixada Santista${brandSuffix}`,
    description:
      "Rádio Conexão Católica no Litoral: evangelização na Baixada Santista, eventos da Diocese de Santos, festas paroquiais, tempo e notícias locais. Julho de 2026.",
    keywords:
      "rádio católica litoral, baixada santista, diocese de santos, rádio conexão católica litoral, eventos paroquiais santos",
  },
  "/comunidade/catedral": {
    path: "/comunidade/catedral",
    title: `Catedral São Miguel Arcanjo${brandSuffix}`,
    description:
      "Catedral Metropolitana São Miguel Arcanjo, sede da Diocese de São Miguel Paulista. História, missas e vida pastoral na Zona Leste de São Paulo.",
    keywords: "catedral são miguel arcanjo, diocese são miguel paulista",
  },
  "/lgpd": {
    path: "/lgpd",
    title: `Política de Privacidade (LGPD)${brandSuffix}`,
    description:
      "Política de Privacidade e proteção de dados da Rádio Conexão Católica, em conformidade com a LGPD. Atualizada em julho de 2026.",
    keywords: "lgpd rádio conexão católica, privacidade",
  },
  "/programacao": {
    path: "/programacao",
    title: `Programação${brandSuffix}`,
    description: "Grade de programação da Rádio Conexão Católica: oração, música católica e conteúdo evangelizador 24 horas.",
  },
  "/comunidade": {
    path: "/comunidade",
    title: `Comunidade${brandSuffix}`,
    description: "Comunidade da Rádio Conexão Católica: diocese, catedral, caminhada e vida pastoral.",
  },
  "/comunidade/caminhada": {
    path: "/comunidade/caminhada",
    title: `Caminhada da Ressurreição${brandSuffix}`,
    description:
      "Caminhada da Ressurreição 2026 — maior evento pascal da Zona Leste de São Paulo, Diocese de São Miguel Paulista.",
  },
};

export function resolvePageSeo(pathname: string): PageSeo {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (PAGE_SEO[clean]) return PAGE_SEO[clean];
  if (PAGE_SEO[pathname]) return PAGE_SEO[pathname];
  if (clean.startsWith("/programacao")) {
    return {
      path: clean,
      title: `Programação${brandSuffix}`,
      description: PAGE_SEO["/programacao"].description,
    };
  }
  if (clean.startsWith("/comunidade")) {
    return {
      path: clean,
      title: `Comunidade${brandSuffix}`,
      description: PAGE_SEO["/comunidade"].description,
    };
  }
  return {
    path: clean,
    title: `Página não encontrada${brandSuffix}`,
    description: "A página solicitada não foi encontrada no site da Rádio Conexão Católica.",
    noindex: true,
  };
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
