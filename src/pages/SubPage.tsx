import Layout from "@/components/Layout";
import { useParams, useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/programacao": "Programação",
  "/programacao/locutores": "Locutores",
  "/programacao/musicas": "Músicas",
  "/programacao/eventos": "Eventos",
  "/programacao/pedidos": "Pedidos de Oração",
  "/midia": "Mídia",
  "/midia/fotos": "Fotos",
  "/midia/videos": "Vídeos",
  "/midia/downloads": "Downloads",
  "/midia/posts": "Posts",
  "/comunidade": "Comunidade",
  "/comunidade/missas": "Missas",
  "/comunidade/renovacao": "Renovação Carismática",
  "/comunidade/musicas-missa": "Músicas da Missa",
  "/comunidade/caminhada": "Caminhada da Ressurreição",
  "/praca": "Praça",
  "/praca/litoral": "Litoral",
};

const SubPage = () => {
  const location = useLocation();
  const title = titles[location.pathname] || "Página";

  return (
    <Layout>
      <div className="gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold">{title}</h1>
        </div>
      </div>
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-lg mx-auto bg-muted rounded-xl p-10">
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
