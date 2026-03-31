import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, BookOpen, Heart, Music, Cross } from "lucide-react";

interface Leitura { referencia?: string; titulo?: string; texto?: string; refrao?: string; }
interface LiturgiaData {
  data?: string; liturgia?: string; cor?: string;
  leituras?: {
    primeiraLeitura?: Leitura[]; segundaLeitura?: Leitura[];
    salmo?: Leitura[]; evangelho?: Leitura[];
  };
  oracoes?: { coleta?: string; oferendas?: string; comunhao?: string };
  antifonas?: { entrada?: string; comunhao?: string };
}

const WEEKDAYS = ["D","S","T","Q","Q","S","S"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const COR_COLORS: Record<string, string> = {
  Verde:"#27ae60", Vermelho:"#c0392b", Roxo:"#8e44ad",
  Rosa:"#e91e8c", Branco:"#6b7280", Dourado:"#d4af37",
};

const LiturgiaWidget = () => {
  const [view, setView] = useState(new Date());
  const [liturgia, setLiturgia] = useState<LiturgiaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const year = view.getFullYear();
  const month = view.getMonth();
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const fetchLiturgia = useCallback(async (day: number) => {
    setLoading(true);
    setLiturgia(null);
    try {
      const res = await fetch(`https://liturgia.up.railway.app/v2/?dia=${day}&mes=${month + 1}&ano=${year}`);
      if (res.ok) setLiturgia(await res.json());
    } catch { /* silently fail */ }
    setLoading(false);
  }, [month, year]);

  const openDay = (day: number) => {
    setSelectedDay(day);
    setActiveTab(0);
    setModalOpen(true);
    fetchLiturgia(day);
  };

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const tabs = [
    { label: "Leituras", icon: <BookOpen className="h-3 w-3" /> },
    { label: "Orações", icon: <Heart className="h-3 w-3" /> },
    { label: "Antífonas", icon: <Music className="h-3 w-3" /> },
  ];

  const corHex = liturgia?.cor ? (COR_COLORS[liturgia.cor] || "#0056b3") : "#0056b3";

  return (
    <>
      {/* Card principal — mesmo estilo do CountdownCard */}
      <div className="h-full rounded-xl overflow-hidden gradient-primary text-primary-foreground flex flex-col relative">
        {/* Cruz decorativa */}
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
          <Cross className="h-24 w-24" />
        </div>

        {/* Título */}
        <div className="px-5 pt-5 pb-3 relative z-10">
          <p className="text-[10px] font-semibold tracking-widest uppercase opacity-75">Calendário</p>
          <h2 className="text-xl font-extrabold leading-tight mt-0.5">LITURGIA DIÁRIA</h2>
          <p className="text-xs mt-1 italic opacity-80">Clique em um dia para ver as leituras</p>
        </div>

        {/* Navegação mês */}
        <div className="flex items-center justify-between px-5 pb-2 relative z-10">
          <button onClick={() => setView(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/30 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold">{MONTHS[month]} {year}</span>
          <button onClick={() => setView(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/30 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendário */}
        <div className="px-4 pb-5 flex-1 relative z-10">
          {/* Cabeçalho dias */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="text-center text-[10px] font-bold opacity-60 py-1">{w}</div>
            ))}
          </div>
          {/* Dias */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (!d) return <div key={`e-${i}`} />;
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <button key={d} onClick={() => openDay(d)}
                  className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all
                    ${isToday
                      ? "bg-accent text-accent-foreground shadow-lg scale-110 font-extrabold"
                      : "hover:bg-primary-foreground/20 opacity-90 hover:opacity-100"
                    }`}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra dourada inferior */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f5c518, #e8a800, #f5c518)" }} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}>
          <div className="bg-card w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border"
            onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div className="gradient-primary text-primary-foreground p-4 flex items-center justify-between flex-shrink-0 relative">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-75">Liturgia do Dia</p>
                <h3 className="font-bold text-base">
                  {selectedDay} de {MONTHS[month]} de {year}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/30 transition-colors">
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg,#f5c518,#e8a800,#f5c518)" }} />
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm">Carregando liturgia...</p>
                </div>
              </div>
            ) : liturgia ? (
              <>
                {/* Celebração */}
                {liturgia.liturgia && (
                  <div className="px-4 pt-3 pb-2 flex-shrink-0 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{liturgia.liturgia}</p>
                      {liturgia.cor && (
                        <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                          style={{ background: corHex }}>
                          {liturgia.cor}
                        </span>
                      )}
                    </div>
                    {liturgia.data && <p className="text-xs text-muted-foreground mt-0.5">{liturgia.data}</p>}
                  </div>
                )}

                {/* Abas */}
                <div className="flex border-b border-border flex-shrink-0 bg-muted/20">
                  {tabs.map((tab, idx) => (
                    <button key={tab.label} onClick={() => setActiveTab(idx)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors border-b-2
                        ${activeTab === idx ? "text-primary border-accent bg-card" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Conteúdo */}
                <div className="overflow-y-auto flex-1 p-4 space-y-4 text-sm">
                  {activeTab === 0 && (
                    <>
                      {liturgia.leituras?.primeiraLeitura?.map((l, i) => <LeituraBlock key={i} titulo="1ª Leitura" leitura={l} />)}
                      {liturgia.leituras?.salmo?.map((s, i) => (
                        <div key={i} className="border-l-4 pl-3 py-1" style={{ borderColor: "#f5c518" }}>
                          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">🎵 Salmo Responsorial</p>
                          {s.referencia && <p className="text-xs text-muted-foreground italic mb-1">{s.referencia}</p>}
                          {s.refrao && <p className="text-xs bg-accent/10 text-foreground italic px-2 py-1 rounded mb-1">Refrão: {s.refrao}</p>}
                          {s.texto && <p className="text-xs leading-relaxed whitespace-pre-line text-foreground/80">{s.texto}</p>}
                        </div>
                      ))}
                      {liturgia.leituras?.segundaLeitura?.map((l, i) => <LeituraBlock key={i} titulo="2ª Leitura" leitura={l} />)}
                      {liturgia.leituras?.evangelho?.map((l, i) => <LeituraBlock key={i} titulo="✝ Evangelho" leitura={l} primary />)}
                    </>
                  )}
                  {activeTab === 1 && (
                    <>
                      {liturgia.oracoes?.coleta && <OracaoBlock titulo="Oração da Coleta" texto={liturgia.oracoes.coleta} />}
                      {liturgia.oracoes?.oferendas && <OracaoBlock titulo="Sobre as Oferendas" texto={liturgia.oracoes.oferendas} />}
                      {liturgia.oracoes?.comunhao && <OracaoBlock titulo="Após a Comunhão" texto={liturgia.oracoes.comunhao} />}
                      {!liturgia.oracoes?.coleta && !liturgia.oracoes?.oferendas && !liturgia.oracoes?.comunhao &&
                        <p className="text-xs text-muted-foreground text-center py-4">Orações não disponíveis.</p>}
                    </>
                  )}
                  {activeTab === 2 && (
                    <>
                      {liturgia.antifonas?.entrada && <OracaoBlock titulo="Antífona de Entrada" texto={liturgia.antifonas.entrada} />}
                      {liturgia.antifonas?.comunhao && <OracaoBlock titulo="Antífona da Comunhão" texto={liturgia.antifonas.comunhao} />}
                      {!liturgia.antifonas?.entrada && !liturgia.antifonas?.comunhao &&
                        <p className="text-xs text-muted-foreground text-center py-4">Antífonas não disponíveis.</p>}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground text-sm">
                Liturgia não disponível para esta data.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const LeituraBlock = ({ titulo, leitura, primary }: { titulo: string; leitura: Leitura; primary?: boolean }) => (
  <div className={`border-l-4 pl-3 py-1 ${primary ? "border-primary" : "border-border"}`}>
    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">{titulo}</p>
    {leitura.referencia && <p className="text-xs text-muted-foreground italic mb-1">{leitura.referencia}</p>}
    {leitura.titulo && <p className="text-xs text-muted-foreground mb-1">{leitura.titulo}</p>}
    {leitura.texto && <p className="text-xs leading-relaxed whitespace-pre-line text-foreground/80">{leitura.texto}</p>}
  </div>
);

const OracaoBlock = ({ titulo, texto }: { titulo: string; texto: string }) => (
  <div className="border-l-4 border-accent pl-3 py-1">
    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">✝ {titulo}</p>
    <p className="text-xs leading-relaxed whitespace-pre-line text-foreground/80">{texto}</p>
  </div>
);

export default LiturgiaWidget;
