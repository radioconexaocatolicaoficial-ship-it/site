import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Home, Info, ShoppingBag, Clapperboard, Users, Waves, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import RadioPlayer from "./RadioPlayer";
import TopBar from "./TopBar";

type NavChild = { label: string; to: string; external?: boolean };
type NavItem = {
  label: string;
  to?: string;
  icon?: React.ReactNode;
  children?: NavChild[];
  /** Só abre o glossário no hover — não navega */
  dropdownOnly?: boolean;
};

const navItems: NavItem[] = [
  { label: "Início", to: "/", icon: <Home className="h-4 w-4" /> },
  { label: "Sobre Nós", to: "/sobre", icon: <Info className="h-4 w-4" /> },
  { label: "Loja", to: "/loja", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Mídia", to: "/midia", icon: <Clapperboard className="h-4 w-4" /> },
  {
    label: "Comunidade",
    icon: <Users className="h-4 w-4" />,
    dropdownOnly: true,
    children: [
      { label: "Catedral S.M.A.", to: "/comunidade/catedral" },
      {
        label: "Renovação Carismática",
        to: "https://rccbrasil.org.br/",
        external: true,
      },
      {
        label: "Músicas/Missa",
        to: "https://musicasparamissa.com.br/",
        external: true,
      },
      {
        label: "Caminhada da Ressurreição",
        to: "https://www.caminhadadaressurreicao.com/",
        external: true,
      },
    ],
  },
  { label: "Rádio Litoral", to: "/litoral", icon: <Waves className="h-4 w-4" /> },
  { label: "Contato", to: "/contato", icon: <Phone className="h-4 w-4" /> },
];

const TOPBAR_H = 40; // altura do TopBar em px
const DROPDOWN_CLOSE_MS = 220;

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > TOPBAR_H);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openMenu = (label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenDropdown(label);
  };

  const scheduleCloseMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpenDropdown(null);
      closeTimer.current = null;
    }, DROPDOWN_CLOSE_MS);
  };

  return (
    <>
      <TopBar />
      <header
        className={`left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-border transition-all duration-300 ${
          scrolled ? "fixed top-0" : "relative"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-1 md:py-3">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Rádio Conexão Católica" className="h-9 md:h-12 w-auto" fetchPriority="high" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && openMenu(item.label)}
                onMouseLeave={() => item.children && scheduleCloseMenu()}
              >
                {item.dropdownOnly ? (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted cursor-default"
                    aria-haspopup="menu"
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                  </button>
                ) : (
                  <Link
                    to={item.to!}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                  >
                    {item.icon}
                    {item.label}
                    {item.children && <ChevronDown className="h-3.5 w-3.5 ml-0.5" />}
                  </Link>
                )}
                {item.children && openDropdown === item.label && (
                  /* pt-2 = ponte invisível entre o item e o glossário (não fecha ao passar o mouse) */
                  <div className="absolute top-full left-0 z-[60] pt-2 min-w-[14rem] w-max max-w-xs">
                    <div
                      className="bg-card rounded-lg shadow-xl border border-border py-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
                      role="menu"
                      onMouseEnter={() => openMenu(item.label)}
                    >
                      {item.children.map((child) =>
                        child.external ? (
                          <a
                            key={child.to}
                            href={child.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            className="block px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors whitespace-nowrap"
                          >
                            {child.label}
                          </a>
                        ) : (
                          <Link
                            key={child.to}
                            to={child.to}
                            role="menuitem"
                            className="block px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors whitespace-nowrap"
                          >
                            {child.label}
                          </Link>
                        ),
                      )}
                    </div>
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
                {item.dropdownOnly ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === item.label ? null : item.label)
                    }
                    className="flex w-full items-center gap-2 py-3 text-sm font-medium text-foreground"
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </button>
                ) : (
                  <Link
                    to={item.to!}
                    onClick={() => !item.children && setMobileOpen(false)}
                    className="flex items-center gap-2 py-3 text-sm font-medium text-foreground"
                  >
                    {item.icon}
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className="h-4 w-4 cursor-pointer ml-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === item.label ? null : item.label);
                        }}
                      />
                    )}
                  </Link>
                )}
                {item.children && openDropdown === item.label && (
                  <div className="pl-3 space-y-0.5 border-l-2 border-border ml-2 mb-2">
                    {item.children.map((child) =>
                      child.external ? (
                        <a
                          key={child.to}
                          href={child.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileOpen(false)}
                          className="block py-2.5 px-3 text-sm text-muted-foreground hover:text-primary rounded-md hover:bg-muted"
                        >
                          {child.label}
                        </a>
                      ) : (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2.5 px-3 text-sm text-muted-foreground hover:text-primary rounded-md hover:bg-muted"
                        >
                          {child.label}
                        </Link>
                      ),
                    )}
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
