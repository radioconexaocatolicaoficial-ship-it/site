const SP_LAT = -23.5505;
const SP_LON = -46.6333;

export const CIDADE_LINKS = {
  weather: `https://www.google.com/search?q=${encodeURIComponent("previsão do tempo São Paulo")}`,
  traffic: "https://ssl.cetsp.com.br/transito-agora/transito-nas-principais-vias.aspx",
  waze: "https://www.waze.com/pt-BR/live-map/",
  transport: "https://www.diretodostrens.com.br/",
  buses: "https://www.sptrans.com.br/olho-vivo/",
  fuel: "https://www.combustiveis-anp.com.br/estado/sp/sao-paulo",
  anp: "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas",
};

async function fetchHtml(url: string, timeout = 12000): Promise<string> {
  const candidates = [
    `/api/html?u=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];
  let lastError: unknown;
  for (const src of candidates) {
    try {
      const res = await fetch(src, { signal: AbortSignal.timeout(timeout) });
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.length > 180 && !/proxy failed|upstream error|missing u/i.test(text)) {
        return text;
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("html proxy failed");
}

export type WeatherDay = { label: string; max: number; min: number; text: string };
export type WeatherData = {
  temp: number;
  text: string;
  humidity: number;
  wind: number;
  days: WeatherDay[];
};

export function weatherLabelPt(code: number): string {
  if (code === 0) return "Céu limpo";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Neblina";
  if (code <= 57) return "Garoa";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Neve";
  if (code <= 99) return "Tempestade";
  return "Tempo variável";
}

export async function fetchWeather(): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${SP_LAT}&longitude=${SP_LON}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=America%2FSao_Paulo&forecast_days=3&wind_speed_unit=kmh`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const j = (await res.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
      wind_speed_10m?: number;
      relative_humidity_2m?: number;
    };
    daily?: {
      time?: string[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      weather_code?: number[];
    };
  };
  const dayNames = ["Hoje", "Amanhã", "Depois"];
  const days: WeatherDay[] = (j.daily?.time || []).slice(0, 3).map((iso, i) => ({
    label: dayNames[i] || iso.slice(5).replace("-", "/"),
    max: Math.round(j.daily?.temperature_2m_max?.[i] ?? 0),
    min: Math.round(j.daily?.temperature_2m_min?.[i] ?? 0),
    text: weatherLabelPt(j.daily?.weather_code?.[i] ?? 1),
  }));
  return {
    temp: Math.round(j.current?.temperature_2m ?? 0),
    text: weatherLabelPt(j.current?.weather_code ?? 1),
    humidity: Math.round(j.current?.relative_humidity_2m ?? 0),
    wind: Math.round(j.current?.wind_speed_10m ?? 0),
    days,
  };
}

export type TrafficRegion = { name: string; km: number; pct: number };
export type TrafficData = { regions: TrafficRegion[]; totalKm: number };

export function parseTrafficHtml(html: string): TrafficData {
  const regions: TrafficRegion[] = [];
  const re = /<h3>(Norte|Sul|Leste|Oeste|Centro)<\/h3>\s*<p>Lentid[^\d]*<strong>\s*(\d+)\s*km\((\d+)%\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const name = m[1];
    if (regions.some((r) => r.name === name)) continue;
    regions.push({ name, km: Number(m[2]), pct: Number(m[3]) });
  }
  const order = ["Leste", "Centro", "Norte", "Sul", "Oeste"];
  regions.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  return {
    regions,
    totalKm: regions.reduce((sum, r) => sum + r.km, 0),
  };
}

export async function fetchTraffic(): Promise<TrafficData> {
  const html = await fetchHtml(CIDADE_LINKS.traffic);
  const data = parseTrafficHtml(html);
  if (!data.regions.length) throw new Error("traffic empty");
  return data;
}

export type LineLevel = "ok" | "warn" | "off";
export type TransportLine = {
  code: string;
  name: string;
  color: string;
  status: string;
  level: LineLevel;
  kind: "metro" | "trem" | "onibus";
};

const LINE_META: Record<string, { name: string; color: string; kind: TransportLine["kind"] }> = {
  "1": { name: "Azul", color: "#001A8D", kind: "metro" },
  "2": { name: "Verde", color: "#007A33", kind: "metro" },
  "3": { name: "Vermelha", color: "#EE3124", kind: "metro" },
  "4": { name: "Amarela", color: "#FFD100", kind: "metro" },
  "5": { name: "Lilás", color: "#9B3894", kind: "metro" },
  "6": { name: "Laranja", color: "#F47920", kind: "metro" },
  "7": { name: "Rubi", color: "#C60C30", kind: "trem" },
  "8": { name: "Diamante", color: "#9E9E9E", kind: "trem" },
  "9": { name: "Esmeralda", color: "#00A88E", kind: "trem" },
  "10": { name: "Turquesa", color: "#007C89", kind: "trem" },
  "11": { name: "Coral", color: "#F15A22", kind: "trem" },
  "12": { name: "Safira", color: "#1C4F9C", kind: "trem" },
  "13": { name: "Jade", color: "#00A650", kind: "trem" },
  "15": { name: "Prata", color: "#8A8D8F", kind: "metro" },
  "17": { name: "Ouro", color: "#C4A35A", kind: "metro" },
};

function lineLevel(status: string): LineLevel {
  const s = status.toLowerCase();
  if (/encerrada|paralis|interromp|inoperante/.test(s)) return "off";
  if (/normal/.test(s)) return "ok";
  return "warn";
}

export function parseTransportHtml(html: string): TransportLine[] {
  const block =
    html.match(/Status Atualizado das Linhas[\s\S]{0,2500}/i)?.[0] || html;
  const re =
    /Linha\s+(\d+)\s*[-–]\s*([A-Za-zÀ-ÿ]+)(?:<\/[^>]+>)?\s*[-–]\s*([^<\n]+)/gi;
  const out: TransportLine[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    const code = m[1];
    if (seen.has(code)) continue;
    seen.add(code);
    const meta = LINE_META[code];
    const status = m[3].replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    out.push({
      code,
      name: meta?.name || m[2] || `Linha ${code}`,
      color: meta?.color || "#0a2060",
      status,
      level: lineLevel(status),
      kind: meta?.kind || "metro",
    });
  }
  return out;
}

export type TransportData = { lines: TransportLine[]; updated: string };

export async function fetchTransport(): Promise<TransportData> {
  const html = await fetchHtml("https://t.me/s/DiretoDosTrens");
  const lines = parseTransportHtml(html);
  if (!lines.length) throw new Error("transport empty");
  const updated =
    html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/)?.[1] ||
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return { lines, updated };
}

export type FuelItem = { name: string; price: string | null };
export type FuelData = { items: FuelItem[]; source: string };

const FUEL_NAMES = ["Gasolina", "Etanol", "Diesel", "GNV"] as const;

function formatFuelPrice(raw: string): string {
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return `R$ ${raw.replace(".", ",")}`;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pickFuelPrice(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return formatFuelPrice(m[1]);
  }
  return null;
}

export async function fetchFuel(): Promise<FuelData> {
  const items: FuelItem[] = FUEL_NAMES.map((name) => ({ name, price: null }));
  try {
    const html = await fetchHtml("https://www.combustiveis-anp.com.br/estado/sp/sao-paulo");
    items[0].price = pickFuelPrice(html, [
      /Gasolina Comum[\s\S]{0,180}?R\$\s*(\d{1,2}[.,]\d{2,3})/i,
      /Gasolina em SAO PAULO[\s\S]{0,80}?R\$\s*(\d{1,2}[.,]\d{2,3})/i,
    ]);
    items[1].price = pickFuelPrice(html, [
      /Etanol Hidratado[\s\S]{0,180}?R\$\s*(\d{1,2}[.,]\d{2,3})/i,
      /Etanol(?! ou)[\s\S]{0,80}?R\$\s*(\d{1,2}[.,]\d{2,3})/i,
    ]);
    items[2].price = pickFuelPrice(html, [
      /Diesel S-10[\s\S]{0,180}?R\$\s*(\d{1,2}[.,]\d{2,3})/i,
      /Diesel S10[\s\S]{0,80}?R\$\s*(\d{1,2}[.,]\d{2,3})/i,
    ]);
    items[3].price = pickFuelPrice(html, [/GNV[\s\S]{0,180}?R\$\s*(\d{1,2}[.,]\d{2,3})/i]);
  } catch {
    /* keep empty prices */
  }
  return { items, source: "ANP" };
}

export function trafficTone(pct: number): string {
  if (pct >= 25) return "text-red-600";
  if (pct >= 15) return "text-amber-600";
  return "text-emerald-600";
}
