import { Link } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";

/**
 * Destaque da loja virtual — mesmo estilo azul dos cards principais (ex.: countdown).
 */
const LojaCard = () => (
  <div className="h-full min-h-[280px] lg:min-h-[320px] rounded-xl overflow-hidden gradient-primary text-primary-foreground p-4 md:p-6 flex flex-col justify-between relative">
    <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
      <Store className="h-24 w-24" />
    </div>
    <div className="relative z-10">
      <p className="text-xs font-medium tracking-widest uppercase opacity-80">Rádio Conexão Católica</p>
      <h2 className="text-xl md:text-2xl font-extrabold mt-1 leading-tight">Loja virtual</h2>
      <p className="text-sm mt-3 opacity-90 leading-relaxed max-w-sm">
        Camisetas, squeezes, livros, terços e acessórios oficiais. Confira o catálogo e compre pelo WhatsApp.
      </p>
    </div>
    <div className="relative z-10 mt-6">
      <Link
        to="/loja"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:brightness-110 transition-all"
      >
        <ShoppingCart className="h-5 w-5 shrink-0" />
        Ver loja completa
      </Link>
    </div>
  </div>
);

export default LojaCard;
