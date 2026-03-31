import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import LGPD from "./pages/LGPD";
import Loja from "./pages/Loja";
import SubPage from "./pages/SubPage";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

const subRoutes = [
  "/programacao", "/programacao/locutores", "/programacao/musicas", "/programacao/eventos", "/programacao/pedidos",
  "/midia", "/midia/fotos", "/midia/videos", "/midia/downloads", "/midia/posts",
  "/comunidade", "/comunidade/missas", "/comunidade/renovacao", "/comunidade/musicas-missa", "/comunidade/caminhada",
  "/praca", "/praca/litoral",
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieConsent />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/lgpd" element={<LGPD />} />
          <Route path="/loja" element={<Loja />} />
          {subRoutes.map((r) => (
            <Route key={r} path={r} element={<SubPage />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
