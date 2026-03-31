import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Home, Info, CalendarDays, Clapperboard, Users, Network, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import RadioPlayer from "./RadioPlayer";
import TopBar from "./TopBar";

type NavItem = { label: string; to: string; icon?: React.ReactNode; children?: { label: string; to: string }[] };

const navItems: NavItem[] = [
  { label: "Início", to: "/", icon: <Home className="h-4 w-4" /> },
  { label: "Sobre Nós", to: "/sobre", icon: <Info className="h-4 w-4" /> },
  {
    label: "Programação", to: "/programacao", icon: <CalendarDays className="h-4 w-4" />,
    children: [
      { label: "Locutores", to: "/programacao/locutores" },
      { label: "Músicas", to: "/programacao/musicas" },
      { label: "Eventos", to: "/programacao/eventos" },
      { label: "Pedidos", to: "/programacao/pedidos" },
    ],
  },
  {
    label: "Mídia", to: "/midia", icon: <Clapperboard className="h-4 w-4" />,
    children: [
      { label: "Fotos", to: "/midia/fotos" },
      { label: "Vídeos", to: "/midia/videos" },
      { label: "Downloads", to: "/midia/downloads" },
      { label: "Posts", to: "/midia/posts" },
    ],
  },
  {
    label: "Comunidade", to: "/comunidade", icon: <Users className="h-4 w-4" />,
    children: [
      { label: "Missas", to: "/comunidade/missas" },
      { label: "Renovação Carismática", to: "/comunidade/renovacao" },
      { label: "Músicas/Missa", to: "/comunidade/musicas-missa" },
      { label: "Caminhada da Ressurreição", to: "/comunidade/caminhada" },
    ],
  },
  {
    label: "Praça", to: "/praca", icon: <Network className="h-4 w-4" />,
    children: [{ label: "Litoral", to: "/praca/litoral" }],
  },
  { label: "Contato", to: "/contato", icon: <Phone className="h-4 w-4" /> },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-border mb-[10px]">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Rádio Conexão Católica" className="h-12 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}>
                <Link to={item.to}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted">
                  {item.icon}
                  {item.label}
                  {item.children && <ChevronDown className="h-3.5 w-3.5 ml-0.5" />}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-card rounded-lg shadow-xl border border-border py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.children.map((child) => (
                      <Link key={child.to} to={child.to}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <RadioPlayer />
            <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-1 animate-in slide-in-from-top-2">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link to={item.to} onClick={() => !item.children && setMobileOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-foreground">
                  {item.icon}
                  {item.label}
                  {item.children && (
                    <ChevronDown className="h-4 w-4 cursor-pointer" onClick={(e) => {
                      e.preventDefault();
                      setOpenDropdown(openDropdown === item.label ? null : item.label);
                    }} />
                  )}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link key={child.to} to={child.to} onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm text-muted-foreground hover:text-primary">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
