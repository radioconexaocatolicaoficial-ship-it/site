import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, CalendarDays } from "lucide-react";

const SWAY_URL = "https://sway.cloud.microsoft/CGvGjkrWGR8YzP3W?ref=Link";
const SWAY_ACCESSIBLE = "https://sway.cloud.microsoft/CGvGjkrWGR8YzP3W?accessible=true";
const IG_PAROQUIA = "https://www.instagram.com/nsconceicaoitanhaem/";
const IG_DIOCESE = "https://www.instagram.com/diocesedesantossp/";
const FB_DIOCESE = "https://www.facebook.com/diocesedesantos";

const CACHE_KEY = "rcc_litoral_eventos_v4";
const FETCH_MS = 16000;
const REFRESH_MS = 15 * 60 * 1000;
const ROTATE_MS = 8 * 1000;
const VISIBLE = 3;

type EventItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  href: string;
  source: string;
  /** Timestamp do início (ou fim do período) para filtrar/ordenar */
  when: number;
  label?: string;
  /** Prioridade: festa / comida / carreata / geral */
  kind?: "festa" | "comida" | "carreata" | "geral";
};

const FESTA_RE =
  /festa|julina|junina|quermesse|arraial|arrai[aá]|padroeir|prociss[aã]o|novena|carreata|cerco\s+de\s+jeric[oó]|kermesse|barraca|bingo|quadrilha|fogueira|comidas?\s+e\s+bebidas|comida\s+t[ií]pica|feijoada|tainha|pastel|churrasco|almo[cç]o\s+beneficente|jantar\s+beneficente|bazar|pastelada|caldo|sopa\s+beneficente|lanchonete\s+beneficente|s[aã]o\s+crist[oó]v[aã]o/i;

const HTML_PROXIES = [
  (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`,
  (url: string) => `https://r.jina.ai/${url}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function proxyImg(url: string): string {
  const clean = url.replace(/&amp;/g, "&");
  if (!clean || !/^https?:\/\//i.test(clean)) return clean || "";
  if (import.meta.env.DEV) {
    return `/api/img?u=${encodeURIComponent(clean)}`;
  }
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=720&h=480&fit=cover&output=jpg`;
}

async function fetchText(url: string): Promise<string> {
  for (const make of HTML_PROXIES) {
    try {
      const res = await fetch(make(url), { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      let text = await res.text();
      try {
        const j = JSON.parse(text) as { contents?: string };
        if (j.contents) text = j.contents;
      } catch {
        /* puro */
      }
      if (text.length > 400) return text;
    } catch {
      /* next */
    }
  }
  throw new Error("fetch fail");
}

function parsePtDate(day: number, monthName: string, year: number): number | null {
  const key = monthName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("ç", "c");
  const aliases: Record<string, number> = {
    janeiro: 0,
    fevereiro: 1,
    marco: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
  };
  const month = aliases[key];
  if (month == null || !year || day < 1 || day > 31) return null;
  return new Date(year, month, day, 23, 59, 59).getTime();
}

function extractEndDate(text: string): number | null {
  const year = new Date().getFullYear();

  // 09/08 a 15/08 ou 09/08/2026
  const slashRange = text.match(
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*(?:a|até|ate|e|-|–)\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/i,
  );
  if (slashRange) {
    const y = slashRange[6]
      ? Number(slashRange[6].length === 2 ? `20${slashRange[6]}` : slashRange[6])
      : slashRange[3]
        ? Number(slashRange[3].length === 2 ? `20${slashRange[3]}` : slashRange[3])
        : year;
    return new Date(y, Number(slashRange[5]) - 1, Number(slashRange[4]), 23, 59, 59).getTime();
  }
  const slashOne = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashOne && /festa|cerco|encontro|carreata|julina|semana|data|dia/i.test(text)) {
    const y = slashOne[3]
      ? Number(slashOne[3].length === 2 ? `20${slashOne[3]}` : slashOne[3])
      : year;
    return new Date(y, Number(slashOne[2]) - 1, Number(slashOne[1]), 23, 59, 59).getTime();
  }

  const range = text.match(
    /(?:entre\s+os\s+dias|de)\s+(\d{1,2})\s+(?:a|e|até|ate)\s+(\d{1,2})\s+de\s+([A-Za-zçãáéíóúôêÇÃÁÉÍÓÚÔÊ]+)(?:\s+de\s+(\d{4}))?/i,
  );
  if (range) {
    const end = parsePtDate(
      Number(range[2]),
      range[3],
      range[4] ? Number(range[4]) : year,
    );
    if (end) return end;
  }
  // "25 e 26 de julho"
  const andRange = text.match(
    /(\d{1,2})\s+e\s+(\d{1,2})\s+de\s+([A-Za-zçãáéíóúôêÇÃÁÉÍÓÚÔÊ]+)(?:\s+de\s+(\d{4}))?/i,
  );
  if (andRange) {
    return parsePtDate(
      Number(andRange[2]),
      andRange[3],
      andRange[4] ? Number(andRange[4]) : year,
    );
  }
  const single = text.match(
    /(?:data|dia)\s*:?\s*(\d{1,2})\s+de\s+([A-Za-zçãáéíóúôêÇÃÁÉÍÓÚÔÊ]+)(?:\s+de\s+(\d{4}))?/i,
  );
  if (single) {
    return parsePtDate(Number(single[1]), single[2], single[3] ? Number(single[3]) : year);
  }
  const loose = text.match(/(\d{1,2})\s+de\s+([A-Za-zçãáéíóúôêÇÃÁÉÍÓÚÔÊ]+)(?:\s+de\s+(\d{4}))?/i);
  if (loose) {
    return parsePtDate(Number(loose[1]), loose[2], loose[3] ? Number(loose[3]) : year);
  }
  return null;
}

function eventKind(text: string): EventItem["kind"] {
  if (/carreata/i.test(text)) return "carreata";
  if (
    /comida|feijoada|pastel|churrasco|almo[cç]o|jantar|barraca|bebidas?\s+t[ií]picas|caldo|sopa\s+beneficente/i.test(
      text,
    )
  )
    return "comida";
  if (FESTA_RE.test(text)) return "festa";
  return "geral";
}

function kindLabel(kind: EventItem["kind"]): string {
  if (kind === "carreata") return "Carreata";
  if (kind === "comida") return "Comida / festa";
  if (kind === "festa") return "Festa";
  return "Evento";
}

function isPastEvent(text: string, when: number | null): boolean {
  const today = startOfToday();
  if (when != null && when < today) return true;
  if (
    /\b(reuniu|aconteceu|realizado|realizada|foi\s+ordenado|celebrou|celebra[cç][aã]o\s+ocorreu|foi\s+um\s+sucesso)\b/i.test(
      text,
    ) &&
    !(when != null && when >= today)
  ) {
    return true;
  }
  return false;
}

function looksLikeUpcomingEvent(text: string): boolean {
  return (
    FESTA_RE.test(text) ||
    /inscri[cç][oõ]es|encontro|evento|agenda|particip|ordena[cç]|celebra[cç]|missa|retiro|forma[cç][aã]o|convite|acontece|acontecer[aá]|ser[aã]o\s+realiz|dia\s+nacional|hor[aá]rio|local\s*:|vem\s+ai|semana\s+nacional/i.test(
      text,
    )
  );
}

function kindPriority(kind: EventItem["kind"]): number {
  if (kind === "festa" || kind === "comida" || kind === "carreata") return 0;
  return 1;
}

/** Eventos pedidos — sempre no topo enquanto estiverem vigentes. */
function featuredParishEvents(): EventItem[] {
  const y = 2026;
  return [
    {
      id: "feijoada-santuario",
      title: "Feijoada do Santuário",
      desc: "Feijoada beneficente no Santuário — confira data, horário e retirada no boletim e nas redes da Diocese.",
      image: proxyImg(
        "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/xLOPtX7slb0cDu?quality=688&allowAnimation=true",
      ),
      href: SWAY_URL,
      source: "Presença Diocesana",
      when: new Date(y, 6, 27, 23, 59, 59).getTime(),
      label: "Comida / festa",
      kind: "comida",
    },
    {
      id: "carreata-sao-cristovao",
      title: "Carreata de São Cristóvão",
      desc: "Carreata e bênção dos veículos em honra a São Cristóvão, padroeiro dos motoristas.",
      image: proxyImg(
        "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/OXdzYvxmgfTjM8?quality=640&allowAnimation=true",
      ),
      href: FB_DIOCESE,
      source: "Diocese de Santos",
      when: new Date(y, 6, 27, 23, 59, 59).getTime(),
      label: "Carreata",
      kind: "carreata",
    },
    {
      id: "noite-da-tainha",
      title: "Noite da Tainha",
      desc: "Noite da Tainha — gastronomia e confraternização. Confira local e horário no boletim paroquial.",
      image: proxyImg(
        "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/6UIyxV5x2CCCQg?quality=1200&allowAnimation=true",
      ),
      href: SWAY_URL,
      source: "Presença Diocesana",
      when: new Date(y, 6, 27, 23, 59, 59).getTime(),
      label: "Comida / festa",
      kind: "comida",
    },
  ].filter((e) => e.when >= startOfToday());
}

/** Fallbacks — festas, comidas, carreatas e agenda viva (só futuros). */
function curatedUpcoming(): EventItem[] {
  const y = 2026;
  return [
    ...featuredParishEvents(),
    {
      id: "avos-joaquim-anna",
      title: "São Joaquim e Sant'Anna — bênção dos avós",
      desc: "25 e 26 de julho · bênção em todas as Missas da Paróquia e comunidades (Itanhaém).",
      image: proxyImg(
        "https://s7.imginn.com/751720217_18008054450931883_3723517404933948571_n.jpg",
      ),
      href: "https://www.instagram.com/p/DbDyJLauOjk/",
      source: "Paróquia Itanhaém",
      when: new Date(y, 6, 26, 23, 59, 59).getTime(),
      label: "Festa",
      kind: "festa",
    },
    {
      id: "cebs-pj",
      title: "Encontro de CEBs e Pastoral da Juventude",
      desc: "26 de julho · 8h · Paróquia São João Evangelista (São Vicente) · Inscrições abertas.",
      image: proxyImg(
        "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/EN-FoRLgIfuCzr?quality=1080&allowAnimation=true",
      ),
      href: "https://docs.google.com/forms/d/1LcxgX6VI3i9D2UE1uwcb5kMomDVgaleAlX-PFJnbwzs/edit",
      source: "Diocese de Santos",
      when: new Date(y, 6, 26, 23, 59, 59).getTime(),
      label: "Inscrições abertas",
      kind: "geral",
    },
    {
      id: "cerco-jerico",
      title: "III Cerco de Jericó — Itanhaém",
      desc: "09 a 15 de agosto · 19h · Paróquia Nossa Senhora da Conceição · oração e adoração.",
      image: proxyImg(
        "https://s7.imginn.com/753306874_18008053001931883_1921798891414611277_n.jpg",
      ),
      href: "https://www.instagram.com/p/DbDwnrAOHvY/",
      source: "Paróquia Itanhaém",
      when: new Date(y, 7, 15, 23, 59, 59).getTime(),
      label: "Festa / missão",
      kind: "festa",
    },
    {
      id: "semana-familia",
      title: "Semana Nacional da Família 2026",
      desc: "08 a 15 de agosto · abertura dia 08 · 20h · Basílica Santo Antônio do Embaré (Santos).",
      image: proxyImg(
        "https://s12.imginn.com/750274053_18335379562265960_2119971787037490024_n.jpg",
      ),
      href: "https://www.instagram.com/p/Da22Dx7TXMw/",
      source: "Diocese de Santos",
      when: new Date(y, 7, 15, 23, 59, 59).getTime(),
      label: "Festa / família",
      kind: "festa",
    },
    {
      id: "festas-paroquias-sway",
      title: "Festas e agenda pelas paróquias",
      desc: "Carreatas, festas, comidas e eventos das paróquias da Diocese — confira no boletim.",
      image: proxyImg(
        "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/6UIyxV5x2CCCQg?quality=1200&allowAnimation=true",
      ),
      href: SWAY_URL,
      source: "Presença Diocesana",
      when: new Date(y, 7, 31, 23, 59, 59).getTime(),
      label: "Festas paroquiais",
      kind: "festa",
    },
    {
      id: "fb-diocese-festas",
      title: "Festas e carreatas — Facebook Diocese",
      desc: "Acompanhe festas, comidas beneficentes e carreatas anunciadas pela Diocese de Santos.",
      image: proxyImg(
        "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/OXdzYvxmgfTjM8?quality=640&allowAnimation=true",
      ),
      href: FB_DIOCESE,
      source: "Facebook Diocese",
      when: new Date(y, 11, 31, 23, 59, 59).getTime(),
      label: "Facebook",
      kind: "festa",
    },
    {
      id: "ig-itanhaem-agenda",
      title: "Festas e comidas — Conceição Itanhaém",
      desc: "Julina, quermesses, carreatas e agenda da Paróquia Nossa Senhora da Conceição.",
      image: proxyImg(
        "https://s7.imginn.com/743841383_18006517721931883_4594482281930016352_n.jpg",
      ),
      href: IG_PAROQUIA,
      source: "Paróquia Itanhaém",
      when: new Date(y, 11, 31, 23, 59, 59).getTime(),
      label: "Instagram",
      kind: "comida",
    },
  ].filter((e) => e.when >= startOfToday());
}

function parseSwayEvents(md: string): EventItem[] {
  const items: EventItem[] = [];
  const imgRe = /!\[[^\]]*\]\((https:\/\/eus-cdn\.sway\.static\.microsoft\/[^)\s]+)\)/gi;
  const images = [...md.matchAll(imgRe)].map((m) => m[1]);

  // Bloco CEBs / PJ
  if (/ENCONTRO\s+CEBS\s+E\s+PJ|Encontro\s+de\s+CEBs/i.test(md)) {
    const chunk =
      md.match(/ENCONTRO\s+CEBS[\s\S]{0,900}?Inscreva-se[\s\S]{0,200}/i)?.[0] ||
      md.match(/Estão abertas as inscrições para o Encontro de CEBs[\s\S]{0,700}/i)?.[0] ||
      "";
    const when = extractEndDate(chunk) ?? new Date(2026, 6, 26, 23, 59, 59).getTime();
    if (!isPastEvent(chunk, when)) {
      const form =
        chunk.match(/https:\/\/docs\.google\.com\/forms\/[^\s)\]]+/i)?.[0] ||
        "https://docs.google.com/forms/d/1LcxgX6VI3i9D2UE1uwcb5kMomDVgaleAlX-PFJnbwzs/edit";
      items.push({
        id: "sway-cebs-pj",
        title: "Encontro de CEBs e Pastoral da Juventude",
        desc: "26 de julho · 8h · Paróquia São João Evangelista (São Vicente).",
        image: proxyImg(
          images.find((u) => /EN-FoRLgIfuCzr/i.test(u)) ||
            "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/EN-FoRLgIfuCzr?quality=1080&allowAnimation=true",
        ),
        href: form,
        source: "Diocese de Santos",
        when,
        label: "Inscrições abertas",
        kind: "geral",
      });
    }
  }

  // Encontro Nacional CNBB
  if (/Encontro Nacional de Coordenadores/i.test(md)) {
    const chunk =
      md.match(/Entre os dias[\s\S]{0,500}?Diocese de Santos está representada[\s\S]{0,200}/i)?.[0] ||
      md.match(/Encontro Nacional de Coordenadores[\s\S]{0,800}/i)?.[0] ||
      "";
    const when = extractEndDate(chunk) ?? new Date(2026, 6, 24, 23, 59, 59).getTime();
    if (!isPastEvent(chunk, when)) {
      items.push({
        id: "sway-cnbb",
        title: "Encontro Nacional de Coordenadores de Pastoral",
        desc: "20 a 24 de julho · Brasília (DF) — participação da Diocese de Santos.",
        image: proxyImg(
          images.find((u) => /Uq88R18V8eEZs_/i.test(u)) ||
            "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/Uq88R18V8eEZs_?quality=1200&allowAnimation=true",
        ),
        href: SWAY_URL,
        source: "Presença Diocesana",
        when,
        label: when >= startOfToday() && when - startOfToday() < 5 * 86400000 ? "Acontecendo" : "Agenda",
        kind: "geral",
      });
    }
  }

  // Ações de agosto / habitação (futuro)
  if (/Dia Nacional da Habita[cç][aã]o|calend[aá]rio de agosto/i.test(md)) {
    const when = new Date(2026, 7, 21, 23, 59, 59).getTime();
    if (when >= startOfToday()) {
      items.push({
        id: "sway-habitacao",
        title: "Dia Nacional da Habitação — ações em agosto",
        desc: "Manifestações, debates e celebrações pela moradia digna na Baixada Santista.",
        image: proxyImg(
          images.find((u) => /xLOPtX7slb0cDu/i.test(u)) ||
            "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/xLOPtX7slb0cDu?quality=688&allowAnimation=true",
        ),
        href: SWAY_URL,
        source: "Pastoral da Moradia",
        when,
        label: "Em breve",
        kind: "geral",
      });
    }
  }

  // Ordenação: só se houver data futura no texto (fotos de maio = passado)
  if (/Ordena[cç][aã]o Presbiteral/i.test(md)) {
    const chunk = md.match(/Ordena[cç][aã]o Presbiteral[\s\S]{0,600}/i)?.[0] || "";
    const when = extractEndDate(chunk);
    if (when && !isPastEvent(chunk, when)) {
      items.push({
        id: "sway-ordenacao",
        title: "Ordenação Presbiteral",
        desc: "Acompanhe a celebração pela Diocese de Santos.",
        image: proxyImg(
          images.find((u) => /Wuy8Y9ntYbkW9v/i.test(u)) || images[0] || "",
        ),
        href: SWAY_URL,
        source: "Diocese de Santos",
        when,
        label: "Celebração",
        kind: "festa",
      });
    }
  }

  // Pelas Paróquias / Anote aí — festas, carreatas e agenda
  if (/Pelas Par[oó]quias|Anote a[ií]/i.test(md)) {
    items.push({
      id: "sway-paroquias",
      title: "Festas, comidas e carreatas pelas paróquias",
      desc: "Agenda paroquial da Baixada Santista no boletim Presença Diocesana.",
      image: proxyImg(
        images.find((u) => /6UIyxV5x2CCCQg/i.test(u)) || images[0] || "",
      ),
      href: SWAY_URL,
      source: "Presença Diocesana",
      when: Date.now() + 20 * 86400000,
      label: "Festas paroquiais",
      kind: "festa",
    });
  }

  // Qualquer menção explícita a festa/carreata/comida no boletim
  for (const m of md.matchAll(
    /((?:Festa|Carreata|Quermesse|Arraial|Feijoada|Procissão)[^\n.!?]{8,90})/gi,
  )) {
    const line = m[1].trim();
    const when = extractEndDate(md.slice(Math.max(0, m.index! - 40), m.index! + 200));
    if (isPastEvent(line, when)) continue;
    const kind = eventKind(line);
    items.push({
      id: `sway-line-${line.slice(0, 24).replace(/\s+/g, "-").toLowerCase()}`,
      title: line.length > 70 ? `${line.slice(0, 67)}…` : line,
      desc: "Divulgado no boletim Presença Diocesana — confira data e local.",
      image: proxyImg(images[0] || ""),
      href: SWAY_URL,
      source: "Presença Diocesana",
      when: when ?? Date.now() + 10 * 86400000,
      label: kindLabel(kind),
      kind,
    });
  }

  return items;
}

function parseImginnPosts(raw: string): { code: string; caption: string; img: string }[] {
  const byCode = new Map<string, { code: string; caption: string; img: string }>();

  // Formato com Download
  for (const m of raw.matchAll(
    /!\[([^\]]*)\]\((https:\/\/[^)]+)\)\]\((?:https?:)?\/\/(?:www\.)?imginn\.com\/p\/([A-Za-z0-9_-]+)\/\)[\s\S]{0,800}?\[Download\]\((https:\/\/scontent[^)]+)\)/gi,
  )) {
    const code = m[3];
    if (!code || byCode.has(code)) continue;
    const preview = m[2].replace(/&amp;/g, "&");
    if (/t51\.82787-19|s150x150|profile/i.test(preview)) continue;
    byCode.set(code, {
      code,
      caption: (m[1] || "").replace(/#[\wÀ-ÿ_]+/gi, " ").replace(/\s+/g, " ").trim(),
      img: (m[4] || preview).replace(/&amp;/g, "&"),
    });
  }

  // Formato alt + link (sem Download) — comum no imginn
  for (const m of raw.matchAll(
    /!\[([^\]]{20,800})\]\((https:\/\/s[0-9]*\.imginn\.com\/[^)]+|https:\/\/scontent[^)]+)\)\]\((?:https?:)?\/\/(?:www\.)?imginn\.com\/p\/([A-Za-z0-9_-]+)\/\)/gi,
  )) {
    const code = m[3];
    if (!code || byCode.has(code)) continue;
    const img = m[2].replace(/&amp;/g, "&");
    if (/t51\.82787-19|s150x150|profile/i.test(img)) continue;
    byCode.set(code, {
      code,
      caption: (m[1] || "").replace(/#[\wÀ-ÿ_]+/gi, " ").replace(/\s+/g, " ").trim(),
      img,
    });
  }

  return [...byCode.values()];
}

async function fetchIgEvents(user: string, source: string, hrefProfile: string): Promise<EventItem[]> {
  try {
    const raw = await fetchText(`http://www.imginn.com/${user}/`);
    const posts = parseImginnPosts(raw);
    const out: EventItem[] = [];

    for (const p of posts.slice(0, 14)) {
      const caption = p.caption;
      const kind = eventKind(caption);
      const isFesta = kind !== "geral";
      if (!looksLikeUpcomingEvent(caption) && !extractEndDate(caption) && !isFesta) continue;
      const when = extractEndDate(caption);
      if (isPastEvent(caption, when)) continue;
      if (
        when == null &&
        !isFesta &&
        !/inscri[cç]|agenda|convite|vem\s+ai|pr[oó]ximo|neste\s+(s[aá]bado|domingo)|amanh[aã]/i.test(caption)
      ) {
        continue;
      }

      const titleRaw = caption.replace(/^by @[\w._]+\s*/i, "");
      const title =
        titleRaw.length <= 70
          ? titleRaw || `Publicação — ${source}`
          : `${titleRaw.slice(0, titleRaw.lastIndexOf(" ", 64) > 28 ? titleRaw.lastIndexOf(" ", 64) : 64).trim()}…`;

      out.push({
        id: `ig-${user}-${p.code}`,
        title,
        desc: caption.slice(0, 130) || "Confira no Instagram.",
        image: proxyImg(p.img),
        href: `https://www.instagram.com/p/${p.code}/`,
        source,
        when: when ?? Date.now() + (isFesta ? 7 : 14) * 86400000,
        label: kindLabel(kind),
        kind,
      });
    }

    // Garante card âncora de festas do perfil
    out.push({
      id: `ig-profile-${user}`,
      title: `Festas e agenda — ${source}`,
      desc: "Festas, comidas, carreatas e próximos eventos no Instagram oficial.",
      image: proxyImg(posts[0]?.img || ""),
      href: hrefProfile,
      source,
      when: Date.now() + 45 * 86400000,
      label: "Instagram",
      kind: "festa",
    });

    return out;
  } catch {
    return [];
  }
}

async function fetchFacebookEvents(): Promise<EventItem[]> {
  try {
    const raw = await fetchText(FB_DIOCESE);
    const out: EventItem[] = [];
    const chunks = raw.match(
      /(?:Festa|Carreata|Quermesse|Arraial|Feijoada|Procissão|Comida)[^\n]{10,160}/gi,
    );
    if (chunks?.length) {
      for (const [i, line] of chunks.slice(0, 6).entries()) {
        const when = extractEndDate(line);
        if (isPastEvent(line, when)) continue;
        const kind = eventKind(line);
        out.push({
          id: `fb-${i}-${line.slice(0, 16).replace(/\W+/g, "")}`,
          title: line.length > 70 ? `${line.slice(0, 67)}…` : line,
          desc: "Divulgado no Facebook da Diocese de Santos.",
          image: proxyImg(
            "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/OXdzYvxmgfTjM8?quality=640&allowAnimation=true",
          ),
          href: FB_DIOCESE,
          source: "Facebook Diocese",
          when: when ?? Date.now() + 12 * 86400000,
          label: kindLabel(kind),
          kind,
        });
      }
    }
    out.push({
      id: "fb-anchor",
      title: "Festas e carreatas no Facebook da Diocese",
      desc: "Acompanhe festas paroquiais, comidas e carreatas anunciadas pela Diocese de Santos.",
      image: proxyImg(
        "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/6UIyxV5x2CCCQg?quality=1200&allowAnimation=true",
      ),
      href: FB_DIOCESE,
      source: "Facebook Diocese",
      when: Date.now() + 40 * 86400000,
      label: "Facebook",
      kind: "festa",
    });
    return out;
  } catch {
    return [
      {
        id: "fb-anchor",
        title: "Festas e carreatas no Facebook da Diocese",
        desc: "Acompanhe festas paroquiais, comidas e carreatas anunciadas pela Diocese de Santos.",
        image: proxyImg(
          "https://eus-cdn.sway.static.microsoft/s/CGvGjkrWGR8YzP3W/images/6UIyxV5x2CCCQg?quality=1200&allowAnimation=true",
        ),
        href: FB_DIOCESE,
        source: "Facebook Diocese",
        when: Date.now() + 40 * 86400000,
        label: "Facebook",
        kind: "festa",
      },
    ];
  }
}

function dedupeSort(items: EventItem[]): EventItem[] {
  const today = startOfToday();
  const map = new Map<string, EventItem>();
  for (const it of items) {
    if (it.when < today) continue;
    const key = it.title.toLowerCase().replace(/\W+/g, "").slice(0, 36);
    const prev = map.get(key);
    if (!prev || kindPriority(it.kind) < kindPriority(prev.kind)) map.set(key, it);
  }
  return [...map.values()].sort((a, b) => {
    const pk = kindPriority(a.kind) - kindPriority(b.kind);
    if (pk !== 0) return pk;
    return a.when - b.when;
  });
}

async function loadEvents(): Promise<EventItem[]> {
  const featured = featuredParishEvents();
  const collected: EventItem[] = [...featured, ...curatedUpcoming()];

  try {
    const sway = await fetchText(SWAY_ACCESSIBLE);
    collected.push(...parseSwayEvents(sway));
  } catch {
    /* fallback curated */
  }

  const [paroquia, diocese, facebook] = await Promise.all([
    fetchIgEvents("nsconceicaoitanhaem", "Paróquia Itanhaém", IG_PAROQUIA),
    fetchIgEvents("diocesedesantossp", "Diocese de Santos", IG_DIOCESE),
    fetchFacebookEvents(),
  ]);
  collected.push(...paroquia, ...diocese, ...facebook);

  const list = dedupeSort(collected);
  const festas = list.filter((e) => e.kind && e.kind !== "geral");
  const merged = festas.length >= 3 ? [...festas, ...list.filter((e) => e.kind === "geral")] : list;

  // Garante os 3 eventos pedidos no início da rotação
  const pinnedIds = new Set(featured.map((f) => f.id));
  const final = [
    ...featured,
    ...dedupeSort(merged).filter((e) => !pinnedIds.has(e.id)),
  ];

  return final.length >= 3 ? final : curatedUpcoming();
}

const LitoralEventosCarousel = () => {
  const [items, setItems] = useState<EventItem[]>(() => curatedUpcoming());
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  const pageCount = Math.max(1, Math.ceil(items.length / VISIBLE));

  const visible = useMemo(() => {
    const start = (page % pageCount) * VISIBLE;
    const slice = items.slice(start, start + VISIBLE);
    if (slice.length >= VISIBLE) return slice;
    // completa o grid se a última página tiver menos de 3
    return [...slice, ...items.slice(0, VISIBLE - slice.length)].slice(0, VISIBLE);
  }, [items, page, pageCount]);

  const load = useCallback(async () => {
    try {
      const next = await loadEvents();
      if (next.length >= 3) {
        setItems(next);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: next }));
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* mantém curated */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { at: number; items: EventItem[] };
        if (Array.isArray(cached.items) && cached.items.length >= 3) {
          const fresh = dedupeSort(cached.items);
          if (fresh.length >= 3) setItems(fresh);
        }
      }
    } catch {
      /* ignore */
    }
    load();
    const t = window.setInterval(load, REFRESH_MS);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (paused || pageCount <= 1) return;
    const t = window.setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, pageCount]);

  const prev = () => setPage((p) => (p - 1 + pageCount) % pageCount);
  const next = () => setPage((p) => (p + 1) % pageCount);

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Eventos do Litoral</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Festas · comidas · carreatas · agenda paroquial
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <a
            href={SWAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80"
          >
            Boletim
          </a>
          {pageCount > 1 && (
            <div className="flex gap-1 ml-1">
              <button
                type="button"
                onClick={prev}
                className="p-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Anteriores"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="p-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Próximos"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2.5 pt-2 pb-1 flex items-center gap-1">
              <CalendarDays className="h-3 w-3 text-primary" />
              {item.label || item.source}
            </p>

            <div className="aspect-[3/2] overflow-hidden bg-muted shrink-0 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="px-2.5 py-2 flex items-start justify-between gap-2 border-t border-border/60 flex-1 min-h-[3.25rem]">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
                  {item.desc}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden />
            </div>
          </a>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === page % pageCount ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LitoralEventosCarousel;
