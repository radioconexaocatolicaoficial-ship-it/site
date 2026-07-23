import Layout from "@/components/Layout";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/programacao": "Programação",
  "/programacao/locutores": "Locutores",
  "/programacao/musicas": "Músicas",
  "/programacao/eventos": "Eventos",
  "/programacao/pedidos": "Pedidos de Oração",
  "/midia": "Mídia",
  "/comunidade": "Comunidade",
  "/comunidade/catedral": "Catedral S.M.A.",
  "/comunidade/renovacao": "Renovação Carismática",
  "/comunidade/musicas-missa": "Músicas da Missa",
  "/comunidade/caminhada": "Caminhada da Ressurreição",
};

const SubPage = () => {
  const location = useLocation();
  const title = titles[location.pathname] || "Página";

  return (
    <Layout>
      <section className="relative overflow-hidden h-[300px] bg-[#051230]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(5,18,48,0.94) 0%, rgba(10,32,96,0.88) 55%, rgba(5,18,48,0.92) 100%)",
          }}
        />
        <div className="relative z-10 h-full container mx-auto px-4 flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-3xl md:text-4xl font-black leading-tight">{title}</h1>
        </div>
      </section>
      <section className="container mx-auto px-4 pt-8 pb-[30px] text-center">
        <div className="max-w-lg mx-auto bg-muted/40 rounded-xl p-10">
          <p className="text-2xl font-bold text-foreground mb-3">Em breve</p>
          <p className="text-muted-foreground">
            O conteúdo de <strong>{title}</strong> está sendo preparado com carinho. Volte em breve!
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default SubPage;
