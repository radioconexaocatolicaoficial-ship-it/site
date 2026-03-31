import { useState, useRef, useEffect } from "react";
import { Cross, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface Verse { verse: number; text: string; }

const LIVROS = [
  { n: "Gênesis", e: "Genesis", c: 50, g: "AT — Pentateuco" },
  { n: "Êxodo", e: "Exodus", c: 40, g: "AT — Pentateuco" },
  { n: "Levítico", e: "Leviticus", c: 27, g: "AT — Pentateuco" },
  { n: "Números", e: "Numbers", c: 36, g: "AT — Pentateuco" },
  { n: "Deuteronômio", e: "Deuteronomy", c: 34, g: "AT — Pentateuco" },
  { n: "Josué", e: "Joshua", c: 24, g: "AT — Históricos" },
  { n: "Juízes", e: "Judges", c: 21, g: "AT — Históricos" },
  { n: "Rute", e: "Ruth", c: 4, g: "AT — Históricos" },
  { n: "1 Samuel", e: "1 Samuel", c: 31, g: "AT — Históricos" },
  { n: "2 Samuel", e: "2 Samuel", c: 24, g: "AT — Históricos" },
  { n: "1 Reis", e: "1 Kings", c: 22, g: "AT — Históricos" },
  { n: "2 Reis", e: "2 Kings", c: 25, g: "AT — Históricos" },
  { n: "1 Crônicas", e: "1 Chronicles", c: 29, g: "AT — Históricos" },
  { n: "2 Crônicas", e: "2 Chronicles", c: 36, g: "AT — Históricos" },
  { n: "Esdras", e: "Ezra", c: 10, g: "AT — Históricos" },
  { n: "Neemias", e: "Nehemiah", c: 13, g: "AT — Históricos" },
  { n: "Tobias", e: "Tobit", c: 14, g: "AT — Históricos" },
  { n: "Judite", e: "Judith", c: 16, g: "AT — Históricos" },
  { n: "Ester", e: "Esther", c: 10, g: "AT — Históricos" },
  { n: "1 Macabeus", e: "1 Maccabees", c: 16, g: "AT — Históricos" },
  { n: "2 Macabeus", e: "2 Maccabees", c: 15, g: "AT — Históricos" },
  { n: "Jó", e: "Job", c: 42, g: "AT — Sapienciais" },
  { n: "Salmos", e: "Psalms", c: 150, g: "AT — Sapienciais" },
  { n: "Provérbios", e: "Proverbs", c: 31, g: "AT — Sapienciais" },
  { n: "Eclesiastes", e: "Ecclesiastes", c: 12, g: "AT — Sapienciais" },
  { n: "Cânticos", e: "Song of Solomon", c: 8, g: "AT — Sapienciais" },
  { n: "Sabedoria", e: "Wisdom of Solomon", c: 19, g: "AT — Sapienciais" },
  { n: "Eclesiástico", e: "Sirach", c: 51, g: "AT — Sapienciais" },
  { n: "Isaías", e: "Isaiah", c: 66, g: "AT — Profetas" },
  { n: "Jeremias", e: "Jeremiah", c: 52, g: "AT — Profetas" },
  { n: "Lamentações", e: "Lamentations", c: 5, g: "AT — Profetas" },
  { n: "Baruc", e: "Baruch", c: 6, g: "AT — Profetas" },
  { n: "Ezequiel", e: "Ezekiel", c: 48, g: "AT — Profetas" },
  { n: "Daniel", e: "Daniel", c: 14, g: "AT — Profetas" },
  { n: "Oseias", e: "Hosea", c: 14, g: "AT — Profetas" },
  { n: "Joel", e: "Joel", c: 4, g: "AT — Profetas" },
  { n: "Amós", e: "Amos", c: 9, g: "AT — Profetas" },
  { n: "Abdias", e: "Obadiah", c: 1, g: "AT — Profetas" },
  { n: "Jonas", e: "Jonah", c: 4, g: "AT — Profetas" },
  { n: "Miqueias", e: "Micah", c: 7, g: "AT — Profetas" },
  { n: "Naum", e: "Nahum", c: 3, g: "AT — Profetas" },
  { n: "Habacuc", e: "Habakkuk", c: 3, g: "AT — Profetas" },
  { n: "Sofonias", e: "Zephaniah", c: 3, g: "AT — Profetas" },
  { n: "Ageu", e: "Haggai", c: 2, g: "AT — Profetas" },
  { n: "Zacarias", e: "Zechariah", c: 14, g: "AT — Profetas" },
  { n: "Malaquias", e: "Malachi", c: 3, g: "AT — Profetas" },
  { n: "Mateus", e: "Matthew", c: 28, g: "NT — Evangelhos" },
  { n: "Marcos", e: "Mark", c: 16, g: "NT — Evangelhos" },
  { n: "Lucas", e: "Luke", c: 24, g: "NT — Evangelhos" },
  { n: "João", e: "John", c: 21, g: "NT — Evangelhos" },
  { n: "Atos", e: "Acts", c: 28, g: "NT — Atos" },
  { n: "Romanos", e: "Romans", c: 16, g: "NT — Cartas" },
  { n: "1 Coríntios", e: "1 Corinthians", c: 16, g: "NT — Cartas" },
  { n: "2 Coríntios", e: "2 Corinthians", c: 13, g: "NT — Cartas" },
  { n: "Gálatas", e: "Galatians", c: 6, g: "NT — Cartas" },
  { n: "Efésios", e: "Ephesians", c: 6, g: "NT — Cartas" },
  { n: "Filipenses", e: "Philippians", c: 4, g: "NT — Cartas" },
  { n: "Colossenses", e: "Colossians", c: 4, g: "NT — Cartas" },
  { n: "1 Tessalonicenses", e: "1 Thessalonians", c: 5, g: "NT — Cartas" },
  { n: "2 Tessalonicenses", e: "2 Thessalonians", c: 3, g: "NT — Cartas" },
  { n: "1 Timóteo", e: "1 Timothy", c: 6, g: "NT — Cartas" },
  { n: "2 Timóteo", e: "2 Timothy", c: 4, g: "NT — Cartas" },
  { n: "Tito", e: "Titus", c: 3, g: "NT — Cartas" },
  { n: "Filemon", e: "Philemon", c: 1, g: "NT — Cartas" },
  { n: "Hebreus", e: "Hebrews", c: 13, g: "NT — Cartas" },
  { n: "Tiago", e: "James", c: 5, g: "NT — Cartas" },
  { n: "1 Pedro", e: "1 Peter", c: 5, g: "NT — Cartas" },
  { n: "2 Pedro", e: "2 Peter", c: 3, g: "NT — Cartas" },
  { n: "1 João", e: "1 John", c: 5, g: "NT — Cartas" },
  { n: "2 João", e: "2 John", c: 1, g: "NT — Cartas" },
  { n: "3 João", e: "3 John", c: 1, g: "NT — Cartas" },
  { n: "Judas", e: "Jude", c: 1, g: "NT — Cartas" },
  { n: "Apocalipse", e: "Revelation", c: 22, g: "NT — Apocalipse" },
];

// Agrupa livros por categoria
const GROUPS: Record<string, typeof LIVROS> = {};
LIVROS.forEach(l => { if (!GROUPS[l.g]) GROUPS[l.g] = []; GROUPS[l.g].push(l); });

const BibliaWidget = () => {
  const [livroIdx, setLivroIdx] = useState<number | null>(null);
  const [capIdx, setCapIdx] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const livro = livroIdx !== null ? LIVROS[livroIdx] : null;

  const carregar = async (lIdx: number, cap: number) => {
    const l = LIVROS[lIdx];
    setLoading(true);
    setVerses([]);
    setModalOpen(true);
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(l.e)}+${cap}?translation=almeida`);
      const data = await res.json();
      setVerses(data.verses || []);
    } catch { setVerses([]); }
    setLoading(false);
    setTimeout(() => modalRef.current?.scrollTo(0, 0), 50);
  };

  const navCap = (d: number) => {
    if (!livro || livroIdx === null) return;
    const next = capIdx + d;
    if (next >= 1 && next <= livro.c) { setCapIdx(next); carregar(livroIdx, next); }
  };

  return (
    <>
      {/* Card */}
      <div className="h-full rounded-xl overflow-hidden gradient-primary text-primary-foreground flex flex-col relative">
        {/* Cruz decorativa */}
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
          <Cross className="h-24 w-24" />
        </div>

        {/* Título */}
        <div className="px-5 pt-5 pb-3 relative z-10 flex-shrink-0">
          <p className="text-[10px] font-semibold tracking-widest uppercase opacity-75">73 Livros</p>
          <h2 className="text-xl font-extrabold leading-tight mt-0.5">BÍBLIA SAGRADA</h2>
          <p className="text-xs mt-1 italic opacity-80">Tradução Almeida — Bíblia Católica</p>
        </div>

        {/* Dropdown customizado com categorias */}
        <div className="px-4 pb-3 relative z-20 flex-shrink-0 space-y-2">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="w-full bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground text-xs px-3 py-2 rounded-lg flex items-center justify-between">
              <span>{livro ? livro.n : "📚 Selecione o Livro..."}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl border border-border overflow-y-auto max-h-72 z-50">
                {Object.entries(GROUPS).map(([grupo, livros]) => (
                  <div key={grupo}>
                    {/* Separador de categoria */}
                    <div className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider sticky top-0">
                      {grupo}
                    </div>
                    {livros.map(l => {
                      const idx = LIVROS.indexOf(l);
                      const isSelected = livroIdx === idx;
                      return (
                        <button key={idx}
                          onClick={() => { setLivroIdx(idx); setCapIdx(1); setDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors
                            ${isSelected
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "text-foreground hover:bg-primary/10"
                            }`}>
                          {l.n}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seletor de capítulo */}
          <select onChange={e => setCapIdx(parseInt(e.target.value))} value={capIdx}
            disabled={!livro}
            className="w-full bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground text-xs px-3 py-2 rounded-lg outline-none disabled:opacity-40">
            {livro
              ? Array.from({ length: livro.c }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="text-foreground bg-card">
                    Capítulo {i + 1}
                  </option>
                ))
              : <option>Capítulo</option>}
          </select>

          <button
            onClick={() => livroIdx !== null && carregar(livroIdx, capIdx)}
            disabled={!livro}
            className="w-full py-2 bg-accent text-accent-foreground text-xs font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-40">
            📖 Ler Capítulo
          </button>
        </div>

        {/* Imagem decorativa da Bíblia */}
        <div className="relative flex-1 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=400&fit=crop"
            alt="Bíblia Sagrada"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
            <p className="text-primary-foreground text-sm font-semibold italic leading-relaxed drop-shadow">
              "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho."
            </p>
            <p className="text-primary-foreground/70 text-xs mt-2 font-medium">— Salmos 119:105</p>
          </div>
        </div>
      </div>

      {/* Modal de leitura */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}>
          <div className="bg-card w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border"
            onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div className="gradient-primary text-primary-foreground p-4 flex items-center justify-between flex-shrink-0 relative">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-75">Bíblia Sagrada</p>
                <h3 className="font-bold text-base">
                  {livro?.n} — Capítulo {capIdx}
                  {livro && <span className="text-xs font-normal opacity-70 ml-2">({livro.g})</span>}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/30 transition-colors">
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg,#f5c518,#e8a800,#f5c518)" }} />
            </div>

            {/* Conteúdo */}
            <div ref={modalRef} className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : verses.length > 0 ? (
                <div className="space-y-3">
                  {verses.map(v => (
                    <div key={v.verse} className="flex gap-3 text-sm leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-[10px] font-bold mt-0.5">
                        {v.verse}
                      </span>
                      <span className="text-foreground/90">{v.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-8">
                  Capítulo não disponível nesta tradução.
                </p>
              )}
            </div>

            {/* Footer com navegação e botão fechar */}
            <div className="flex-shrink-0 border-t border-border p-3 flex items-center justify-between gap-3 bg-muted/30">
              <button onClick={() => navCap(-1)} disabled={capIdx <= 1}
                className="flex items-center gap-1 text-xs px-3 py-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg disabled:opacity-30 transition-colors font-semibold">
                <ChevronLeft className="h-3.5 w-3.5" /> Anterior
              </button>

              <button onClick={() => setModalOpen(false)}
                className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors">
                Fechar Leitura
              </button>

              <button onClick={() => navCap(1)} disabled={!livro || capIdx >= livro.c}
                className="flex items-center gap-1 text-xs px-3 py-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg disabled:opacity-30 transition-colors font-semibold">
                Próximo <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BibliaWidget;
