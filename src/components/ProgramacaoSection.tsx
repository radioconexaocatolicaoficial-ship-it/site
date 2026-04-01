import { useState } from "react";

export const programas = [
  { dia: "Seg-Sex", hora: "06:00", nome: "Manhã com Fé", desc: "Louvor, oração e palavra para começar o dia" },
  { dia: "Seg-Sex", hora: "08:00", nome: "Santa Missa pelas Almas", desc: "Com Padre PH ao vivo" },
  { dia: "Seg-Sex", hora: "10:00", nome: "Terço das Crianças", desc: "Rezando juntos pela família" },
  { dia: "Seg-Sex", hora: "12:00", nome: "Ângelus", desc: "Oração do meio-dia com reflexão" },
  { dia: "Seg-Sex", hora: "15:00", nome: "Hora da Misericórdia", desc: "Coroa da Misericórdia Divina" },
  { dia: "Seg-Sex", hora: "18:00", nome: "Terço da Família", desc: "Rezando o terço ao entardecer" },
  { dia: "Seg-Sex", hora: "21:00", nome: "Noite de Louvor", desc: "Música católica e adoração" },
  { dia: "Sábado", hora: "09:00", nome: "Encontro de Oração", desc: "Formação e espiritualidade" },
  { dia: "Sábado", hora: "11:00", nome: "Terço da Misericórdia", desc: "Oração comunitária ao vivo" },
  { dia: "Sábado", hora: "15:00", nome: "Hora Santa", desc: "Adoração ao Santíssimo Sacramento" },
  { dia: "Sábado", hora: "19:00", nome: "Louvor da Noite", desc: "Música e adoração ao entardecer" },
  { dia: "Domingo", hora: "08:00", nome: "Terço Matinal", desc: "Começando o domingo em oração" },
  { dia: "Domingo", hora: "10:00", nome: "Missa Dominical", desc: "Santa Missa ao vivo" },
  { dia: "Domingo", hora: "15:00", nome: "Hora da Misericórdia", desc: "Coroa da Misericórdia Divina" },
  { dia: "Domingo", hora: "19:00", nome: "Domingo de Louvor", desc: "Especial de música e adoração" },
];

export const dias = [
  { key: "Seg-Sex", label: "Seg-Sex" },
  { key: "Sábado", label: "Sábado" },
  { key: "Domingo", label: "Domingo" },
];

export const ProgramacaoContent = () => {
  const [aba, setAba] = useState("Seg-Sex");
  const lista = programas.filter(p => p.dia === aba);
  return (
    <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-0">
      <div className="flex border-b border-border bg-muted/20">
        {dias.map(d => (
          <button key={d.key} onClick={() => setAba(d.key)}
            className="flex-1 py-3 text-xs font-bold transition-all"
            style={aba === d.key ? { background: "linear-gradient(90deg,#051230,#0a2060)", color: "#fff", borderBottom: "2px solid #f5c518" } : { color: "var(--muted-foreground)" }}>
            {d.label}
          </button>
        ))}
      </div>
      <ul className="flex-1 divide-y divide-border overflow-y-auto custom-scrollbar">
        {lista.map((p, i) => (
          <li key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
            <span className="text-xs font-bold text-primary w-12 flex-shrink-0">{p.hora}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">{p.nome}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{p.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProgramacaoSection = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Programação</h2>
      </div>
      <ProgramacaoContent />
    </div>
  );
};

export default ProgramacaoSection;
