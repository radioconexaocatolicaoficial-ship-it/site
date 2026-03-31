import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="gradient-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div>
        <img src={logo} alt="Rádio Conexão Católica" className="h-16 mb-4 brightness-200" />
        <p className="text-sm opacity-80 leading-relaxed">
          Web Rádio Católica — a sintonia de vida no ar. Levando a boa nova para todos os cantos.
        </p>
        <p className="text-xs opacity-60 leading-relaxed mt-3 italic">
          Fundada em 5 de Dezembro de 2013, na Diocese de São Miguel Paulista, na cidade de São Paulo, nascida a partir das experiências vividas aos pés de Cristo Ressuscitado que nos chama a amar e servir a Igreja e a toda humanidade.
        </p>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
        <ul className="space-y-2 text-sm opacity-80">
          {[
            { label: "Início", to: "/" },
            { label: "Sobre Nós", to: "/sobre" },
            { label: "Programação", to: "/programacao" },
            { label: "Contato", to: "/contato" },
          ].map((l) => (
            <li key={l.to}><Link to={l.to} className="hover:text-gold transition-colors">{l.label}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-4">Contato</h3>
        <ul className="space-y-3 text-sm opacity-80">
          <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 11 96160-5164</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@radioconexaocatolica.com.br</li>
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> São Paulo, SP</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-60">
      © {new Date().getFullYear()} Rádio Conexão Católica. Todos os direitos reservados.
    </div>
  </footer>
);

export default Footer;
