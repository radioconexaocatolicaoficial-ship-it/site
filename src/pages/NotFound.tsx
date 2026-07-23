import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-4">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <p className="mb-6 text-sm text-muted-foreground max-w-md mx-auto">
          O endereço solicitado não existe ou foi movido. Volte à página inicial da Rádio Conexão
          Católica.
        </p>
        <Link to="/" className="text-primary underline hover:text-primary/90 font-medium">
          Voltar à página inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
