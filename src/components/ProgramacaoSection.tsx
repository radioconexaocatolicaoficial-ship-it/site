import { Clock, Music, BookOpen, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

const programas = [
  { icon: <BookOpen className="w-8 h-8" />, nome: "Santa Missa", horario: "07:00 - 08:00", desc: "Transmissão ao vivo da Santa Missa diária" },
  { icon: <Heart className="w-8 h-8" />, nome: "Terço da Misericórdia", horario: "15:00 - 15:30", desc: "Oração do Terço da Divina Misericórdia" },
  { icon: <Music className="w-8 h-8" />, nome: "Música Católica", horario: "09:00 - 12:00", desc: "As melhores músicas católicas para o seu dia" },
  { icon: <Clock className="w-8 h-8" />, nome: "Liturgia do Dia", horario: "06:00 - 06:30", desc: "Reflexão sobre as leituras litúrgicas do dia" },
];

const ProgramacaoSection = () => {
  return (
    <section id="programacao" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-1 flex-1 bg-primary rounded" />
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary uppercase tracking-wide">
            Programação
          </h2>
          <div className="h-1 flex-1 bg-primary rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programas.map((p, i) => (
            <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {p.icon}
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg mb-1">{p.nome}</h3>
              <p className="text-gold font-heading font-semibold text-sm mb-2">{p.horario}</p>
              <p className="text-muted-foreground text-sm">{p.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramacaoSection;
