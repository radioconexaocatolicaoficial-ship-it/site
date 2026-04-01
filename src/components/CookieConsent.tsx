import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "rcc_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-[80px] left-0 right-0 z-[60] p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          
          {/* Ícone */}
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Cookie className="h-5 w-5 text-yellow-400" />
          </div>

          {/* Texto */}
          <div className="flex-1 text-sm text-white/80 leading-relaxed">
            Utilizamos cookies para melhorar sua experiência no site. Ao continuar navegando, você concorda com nossa{" "}
            <Link to="/lgpd" className="text-yellow-400 underline hover:text-yellow-300 transition-colors">
              Política de Privacidade
            </Link>
            {" "}e o uso de cookies.
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={decline}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:border-white/40 hover:text-white/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Recusar
            </button>
            <button
              onClick={accept}
              className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm transition-colors"
            >
              Aceitar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
