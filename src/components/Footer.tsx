import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Radio, Zap, Building2, Headphones, Clapperboard } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const col = "space-y-2 text-sm opacity-80";
const heading = "font-semibold text-sm mb-4 flex items-center gap-2 whitespace-nowrap";

const socials = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/radioconexaocatolicaofical",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/radioconexaocatolicaoficial/",
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@radioconexaocatolicaofical",
    icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    name: "TikTok",
    url: null,
    icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    name: "X",
    url: null,
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
  <footer className="gradient-primary text-primary-foreground">

    {/* Tarja de newsletter */}
    <div className="bg-[#1a1a2e] border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Logo */}
        <div className="shrink-0">
          <img src={logo} alt="Rádio Conexão Católica" className="h-14 brightness-200" />
        </div>

        {/* Newsletter */}
        <form onSubmit={handleSubscribe} className="flex flex-col xsm:flex-row w-full max-w-md gap-2 xsm:gap-0 px-2 sm:px-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@mail.com"
            required
            className="flex-1 px-4 py-2 rounded-md xsm:rounded-r-none text-sm text-gray-900 outline-none bg-white min-w-0"
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-5 py-2 rounded-md xsm:rounded-l-none text-sm transition-colors whitespace-nowrap"
          >
            Inscreva-se
          </button>
        </form>

        {/* Google Play */}
        <a
          href="https://play.google.com/store/apps/details?id=br.webofus.rdioconexocatlica&hl=pt_BR"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "linear-gradient(135deg, #1a74c4 0%, #115591 100%)",
            color: "#ffffff",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 12px",
            borderRadius: "7px",
            border: "1px solid #115591",
            width: "150px",
            boxSizing: "border-box",
            boxShadow: "0 4px 10px rgba(17,85,145,0.3)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #2086e3 0%, #1562a6 100%)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 15px rgba(17,85,145,0.5)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #1a74c4 0%, #115591 100%)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 10px rgba(17,85,145,0.3)";
          }}
        >
          <svg style={{ fontSize: "25px", marginRight: "8px", color: "#ffde00", width: "25px", height: "25px", fill: "#ffde00", flexShrink: 0 }} viewBox="0 0 24 24">
            <path d="M3.18 23.76c.3.17.64.24.99.2l12.6-11.96-3.24-3.24L3.18 23.76zM.54 1.96C.2 2.3 0 2.84 0 3.54v16.92c0 .7.2 1.24.54 1.58l.08.08 9.48-9.48v-.22L.62 1.88l-.08.08zM20.12 10.4l-2.7-1.54-3.6 3.14 3.6 3.14 2.72-1.54c.78-.44.78-1.16-.02-1.2zM4.17.24l12.6 11.96-3.24 3.24L4.17.24z"/>
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, textAlign: "left" }}>
            <span style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 400, color: "#ffffff", whiteSpace: "nowrap" }}>BAIXAR NO</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap" }}>Google Play</span>
          </div>
        </a>
      </div>
    </div>
    <div className="container mx-auto px-4 py-12 flex flex-wrap gap-8">

      {/* Coluna 1 — Nossa Rádio */}
      <div className="w-full sm:w-auto" style={{ minWidth: "200px", flex: "1 1 200px" }}>
        <h3 className={heading}><Radio className="h-5 w-5 opacity-80" />Nossa Rádio</h3>
        <p className="text-xs opacity-60 leading-relaxed italic text-justify">
          Fundada em 5 de Dezembro de 2013, na Diocese de São Miguel Paulista, na cidade de São Paulo, nascida a partir das experiências vividas aos pés de Cristo Ressuscitado que nos chama a amar e servir a Igreja e a toda humanidade.
        </p>
      </div>

      {/* Coluna 2 — Links Rápidos */}
      <div className="w-full sm:w-auto" style={{ minWidth: "130px", flex: "1 1 130px" }}>
        <h3 className={heading}><Zap className="h-5 w-5 opacity-80" />Links Rápidos</h3>
        <ul className={col}>
          {[
            { label: "Início", to: "/" },
            { label: "Programação", to: "/programacao" },
            { label: "Comunidade", to: "/comunidade" },
            { label: "Praça", to: "/praca" },
            { label: "Contato", to: "/contato" },
          ].map((l) => (
            <li key={l.to}><Link to={l.to} className="hover:text-gold transition-colors whitespace-nowrap">{l.label}</Link></li>
          ))}
        </ul>
      </div>

      {/* Coluna 3 — Institucional */}
      <div className="w-full sm:w-auto" style={{ minWidth: "150px", flex: "1 1 150px" }}>
        <h3 className={heading}><Building2 className="h-5 w-5 opacity-80" />Institucional</h3>
        <ul className={col}>
          {[
            { label: "Sobre Nós", to: "/sobre" },
            { label: "Locutores", to: "/programacao/locutores" },
            { label: "Eventos", to: "/programacao/eventos" },
            { label: "Caminhada", to: "/comunidade/caminhada" },
            { label: "Renovação", to: "/comunidade/renovacao" },
            { label: "LGPD / Privacidade", to: "/lgpd" },
          ].map((l) => (
            <li key={l.to}><Link to={l.to} className="hover:text-gold transition-colors whitespace-nowrap">{l.label}</Link></li>
          ))}
        </ul>
      </div>

      {/* Coluna 4 — Atendimento */}
      <div className="w-full sm:w-auto" style={{ minWidth: "260px", flex: "1 1 260px" }}>
        <h3 className={heading}><Headphones className="h-5 w-5 opacity-80" />Atendimento</h3>
        <ul className="space-y-3 text-sm opacity-80">
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">11 96160-5164</span>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap text-xs">contato@radioconexaocatolica.com.br</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">São Paulo, SP</span>
          </li>
        </ul>
        <div className="mt-4 text-sm opacity-80">
          <p className="font-semibold mb-1 whitespace-nowrap">Horário de atendimento</p>
          <p className="whitespace-nowrap">Seg – Sex: 9h às 18h</p>
        </div>
      </div>

      {/* Coluna 5 — Mídia */}
      <div className="w-full sm:w-auto" style={{ minWidth: "160px", flex: "1 1 160px" }}>
        <h3 className={heading}><Clapperboard className="h-5 w-5 opacity-80" />Mídia</h3>
        <ul className={`${col} mb-4`}>
          {[
            { label: "Fotos", to: "/midia/fotos" },
            { label: "Vídeos", to: "/midia/videos" },
            { label: "Downloads", to: "/midia/downloads" },
            { label: "Posts", to: "/midia/posts" },
            { label: "Músicas da Missa", to: "/comunidade/musicas-missa" },
          ].map((l) => (
            <li key={l.to}><Link to={l.to} className="hover:text-gold transition-colors whitespace-nowrap">{l.label}</Link></li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {socials.map((s) =>
            s.url ? (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md border border-white/50 text-white hover:border-gold hover:text-gold transition-colors"
              >
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d={s.icon} />
                </svg>
              </a>
            ) : (
              <span
                key={s.name}
                aria-label={`${s.name} — em breve`}
                title={`${s.name} — em breve`}
                className="w-6 h-6 sm:w-7 sm:h-7 hidden xsm:flex items-center justify-center rounded-md border border-white/20 text-white/40 cursor-default"
              >
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d={s.icon} />
                </svg>
              </span>
            )
          )}
        </div>
      </div>

    </div>

    <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-60">
      © {new Date().getFullYear()} Rádio Conexão Católica. Todos os direitos reservados.
    </div>
  </footer>
  );
};

export default Footer;
