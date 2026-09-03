import { useEffect, useState, type ReactNode } from "react";
import {
  Bus,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Fuel,
  MapPin,
  Sun,
  TrainFront,
} from "lucide-react";
import {
  CIDADE_LINKS,
  fetchFuel,
  fetchTraffic,
  fetchTransport,
  fetchWeather,
  type FuelData,
  type TrafficData,
  type TransportData,
  type TransportLine,
  type WeatherData,
} from "@/lib/cidadeAgora";

type BoxState<T> = { data: T | null; error: boolean; loading: boolean };

function useLiveBox<T>(loader: () => Promise<T>, refreshMs: number): BoxState<T> {
  const [state, setState] = useState<BoxState<T>>({ data: null, error: false, loading: true });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await loader();
        if (!cancelled) setState({ data, error: false, loading: false });
      } catch {
        if (!cancelled) setState((prev) => ({ ...prev, error: true, loading: false }));
      }
    };
    load();
    const id = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [loader, refreshMs]);

  return state;
}

function weatherIcon(text: string) {
  const t = text.toLowerCase();
  if (t.includes("tempestade")) return CloudLightning;
  if (t.includes("chuva") || t.includes("garoa")) return CloudRain;
  if (t.includes("neblina")) return CloudFog;
  if (t.includes("limpo")) return Sun;
  if (t.includes("nublado")) return Cloud;
  return CloudSun;
}

function rodizioHoje(): string {
  const map: Record<number, string> = {
    1: "Rodízio 1 e 2",
    2: "Rodízio 3 e 4",
    3: "Rodízio 5 e 6",
    4: "Rodízio 7 e 8",
    5: "Rodízio 9 e 0",
  };
  return map[new Date().getDay()] || "Sem rodízio";
}

function zoneLabel(name: string): string {
  if (name === "Centro") return "Centro";
  return `Zona ${name}`;
}

function pctColor(pct: number): string {
  if (pct >= 25) return "text-orange-500";
  if (pct >= 15) return "text-amber-500";
  return "text-emerald-600";
}

function modeStatus(lines: TransportLine[], kind: TransportLine["kind"]): string {
  const subset = lines.filter((l) => l.kind === kind);
  if (!subset.length) return "—";
  const issues = subset.filter(
    (l) => l.level === "warn" || (l.level === "off" && l.code !== "6" && l.code !== "17"),
  );
  if (issues.length) return "Com ocorrências";
  return "Operação Normal";
}

function Card({
  title,
  icon,
  href,
  children,
}: {
  title: string;
  icon: ReactNode;
  href: string;
  children: ReactNode;
}) {
  return (
    <article className="flex h-full max-h-[164px] flex-col rounded-2xl border border-[#d7e4f4] bg-white px-4 py-1.5">
      <div className="mb-1 flex items-center gap-1.5 text-primary">
        {icon}
        <h3 className="text-[13px] font-bold uppercase tracking-wide">{title}</h3>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 text-[13px] font-semibold text-primary hover:underline"
      >
        Ver detalhes →
      </a>
    </article>
  );
}

function WeatherCard({ box }: { box: BoxState<WeatherData> }) {
  const Icon = weatherIcon(box.data?.text || "");
  const today = box.data?.days[0];
  return (
    <Card title="Tempo" icon={<CloudSun className="h-4 w-4" />} href={CIDADE_LINKS.weather}>
      {box.loading && !box.data ? (
        <div className="h-14 animate-pulse rounded bg-muted" />
      ) : box.data ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-primary">São Paulo</p>
            <p className="text-[13px] text-muted-foreground">{box.data.text}</p>
            {today && (
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {today.min}°/{today.max}°
              </p>
            )}
          </div>
          <p className="text-[30px] font-bold leading-none text-primary">{box.data.temp}°</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Indisponível</p>
      )}
    </Card>
  );
}

function TrafficCard({ box }: { box: BoxState<TrafficData> }) {
  const order = ["Norte", "Centro", "Sul", "Oeste", "Leste"];
  const regions = [...(box.data?.regions ?? [])].sort(
    (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
  );
  return (
    <Card title="Trânsito" icon={<MapPin className="h-4 w-4" />} href={CIDADE_LINKS.traffic}>
      {box.loading && !box.data ? (
        <div className="h-14 animate-pulse rounded bg-muted" />
      ) : box.data ? (
        <>
          <p className="text-sm font-bold text-primary">SP · {box.data.totalKm} km</p>
          <p className="mb-1 text-[12px] leading-tight text-muted-foreground">{rodizioHoje()}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-[13px] leading-tight">
            {regions.map((r) => (
              <div key={r.name} className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-primary">{zoneLabel(r.name)}</span>
                <span className={`font-semibold ${pctColor(r.pct)}`}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Ver CET / Waze</p>
      )}
    </Card>
  );
}

function TransportCard({ box }: { box: BoxState<TransportData> }) {
  const rows = box.data
    ? [
        { label: "Metrô", icon: <TrainFront className="h-4 w-4 text-[#1a5fd0]" />, status: modeStatus(box.data.lines, "metro") },
        { label: "Trens", icon: <TrainFront className="h-4 w-4 text-[#d1242a]" />, status: modeStatus(box.data.lines, "trem") },
        { label: "Ônibus", icon: <Bus className="h-4 w-4 text-[#e6b800]" />, status: "Olho Vivo" },
      ]
    : [];

  return (
    <Card title="Transporte" icon={<TrainFront className="h-4 w-4" />} href={CIDADE_LINKS.transport}>
      {box.loading && !box.data ? (
        <div className="h-14 animate-pulse rounded bg-muted" />
      ) : box.data ? (
        <ul className="space-y-1">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                {row.icon}
                {row.label}
              </span>
              <span className="text-[13px] text-muted-foreground">{row.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Ver linhas</p>
      )}
    </Card>
  );
}

function FuelCard({ box }: { box: BoxState<FuelData> }) {
  const gas = box.data?.items.find((i) => i.name === "Gasolina");
  const others = box.data?.items.filter((i) => i.name !== "Gasolina") ?? [];
  return (
    <Card title="Combustível" icon={<Fuel className="h-4 w-4" />} href={CIDADE_LINKS.fuel}>
      {box.loading && !box.data ? (
        <div className="h-14 animate-pulse rounded bg-muted" />
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-primary">São Paulo</p>
            <p className="mb-1 text-[12px] text-muted-foreground">Média ANP</p>
            <div className="space-y-0.5 text-[13px]">
              {others.map((item) => (
                <div key={item.name} className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-primary">{item.name}</span>
                  <span className="text-muted-foreground">{item.price || "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-bold leading-none text-primary">{gas?.price || "—"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Gasolina</p>
          </div>
        </div>
      )}
    </Card>
  );
}

const loadWeather = () => fetchWeather();
const loadTraffic = () => fetchTraffic();
const loadTransport = () => fetchTransport();
const loadFuel = () => fetchFuel();

const CidadeAgoraCards = () => {
  const weather = useLiveBox(loadWeather, 10 * 60 * 1000);
  const traffic = useLiveBox(loadTraffic, 2 * 60 * 1000);
  const transport = useLiveBox(loadTransport, 2 * 60 * 1000);
  const fuel = useLiveBox(loadFuel, 30 * 60 * 1000);

  return (
    <section className="container mx-auto px-4 pt-4 pb-4" aria-label="São Paulo agora">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
        <WeatherCard box={weather} />
        <TrafficCard box={traffic} />
        <TransportCard box={transport} />
        <FuelCard box={fuel} />
      </div>
    </section>
  );
};

export default CidadeAgoraCards;
