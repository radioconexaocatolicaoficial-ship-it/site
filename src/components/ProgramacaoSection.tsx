import { useState } from "react";

const programas = [
  { dia: "Seg-Sex", hora: "06:00", nome: "Manha com Fe", desc: "Louvor, oracao e palavra para comecar o dia" },
  { dia: "Seg-Sex", hora: "08:00", nome: "Santa Missa pelas Almas", desc: "Com Padre PH ao vivo" },
  { dia: "Seg-Sex", hora: "10:00", nome: "Terco das Criancas", desc: "Rezando juntos pela familia" },
  { dia: "Seg-Sex", hora: "12:00", nome: "Angelus", desc: "Oracao do meio-dia com reflexao" },
  { dia: "Seg-Sex", hora: "15:00", nome: "Hora da Misericordia", desc: "Coroa da Misericordia Divina" },
  { dia: "Seg-Sex", hora: "18:00", nome: "Terco da Familia", desc: "Rezando o terco ao entardecer" },
  { dia: "Seg-Sex", hora: "21:00", nome: "Noite de Louvor", desc: "Musica catolica e adoracao" },
  { dia: "Sabado", hora: "09:00", nome: "Encontro de Oracao", desc: "Formacao e espiritualidade" },
  { dia: "Sabado", hora: "11:00", nome: "Terco da Misericordia", desc: "Oracao comunitaria ao vivo" },
  { dia: "Sabado", hora: "15:00", nome: "Hora Santa", desc: "Adoracao ao Santissimo Sacramento" },
  { dia: "Sabado", hora: "19:00", nome: "Louvor da Noite", desc: "Musica e adoracao ao entardecer" },
  { dia: "Domingo", hora: "08:00", nome: "Terco Matinal", desc: "Comecando o domingo em oracao" },
  { dia: "Domingo", hora: "10:00", nome: "Missa Dominical", desc: "Santa Missa ao vivo" },
  { dia: "Domingo", hora: "15:00", nome: "Hora da Misericordia", desc: "Coroa da Misericordia Divina" },
  { dia: "Domingo", hora: "19:00", nome: "Domingo de Louvor", desc: "Especial de musica e adoracao" },
];

const dias = [
  { key: "Seg-Sex", label: "Seg-Sex" },
  { key: "Sabado", label: "Sabado" },
  { key: "Domingo", label: "Domingo" },
];

const ProgramacaoSection = () => {
  const [aba, setAba] = useState("Seg-Sex");
  const lista = programas.filter(p => p.dia === aba);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Programacao</h2>
      </div>
      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="flex border-b border-border">
          {dias.map(d => (
            <button key={d.key} onClick={() => setAba(d.key)}
              className="flex-1 py-2.5 text-xs font-bold transition-colors"
              style={aba === d.key ? { background: "linear-gradient(90deg,#051230,#0a2060)", color: "#fff", borderBottom: "2px solid #f5c518" } : { color: "var(--muted-foreground)" }}>
              {d.label}
            </button>
          ))}
        </div>
        <ul className="flex-1 divide-y divide-border">
          {lista.map((p, i) => (
            <li key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-xs font-bold text-primary w-10 flex-shrink-0">{p.hora}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProgramacaoSection;
