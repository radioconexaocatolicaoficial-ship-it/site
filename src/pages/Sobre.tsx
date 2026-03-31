import Layout from "@/components/Layout";
import { Cross } from "lucide-react";

const Sobre = () => (
  <Layout>
    <div className="gradient-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-2">Sobre Nós</h1>
        <p className="opacity-80 text-lg">Conheça a Rádio Conexão Católica</p>
      </div>
    </div>
    <section className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-start gap-4 mb-8">
        <Cross className="h-10 w-10 text-accent flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A Rádio Conexão Católica é uma web rádio dedicada à evangelização e à promoção da fé católica. 
            Transmitindo 24 horas por dia, levamos a Palavra de Deus, músicas católicas, missas, terços e 
            programas de formação para fiéis em todo o Brasil e no mundo.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Nascida do desejo de conectar a comunidade católica através dos meios digitais, a rádio se tornou 
            um importante instrumento de evangelização na Diocese de São Miguel Paulista e além.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Nossa programação é feita com amor e dedicação por uma equipe de locutores e voluntários comprometidos 
            com a missão de levar a boa nova para todos os cantos.
          </p>
        </div>
      </div>
    </section>
  </Layout>
);

export default Sobre;
