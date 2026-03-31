import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerDiante from "@/assets/banner-diante-do-rei.jpg";
import bannerHomens from "@/assets/banner-encontro-homens.jpg";
import bannerKairos from "@/assets/banner-kairos-mulheres.jpg";
import bannerConexao from "@/assets/banner-conexao-catolica.jpg";

const banners = [
  { src: bannerDiante, alt: "Noite Oracional Diante do Rei", link: "https://saopaulo.cancaonova.com/noticias/cancao-nova-realiza-noite-de-oracao-diante-do-rei-em-sao-paulo/" },
  { src: bannerHomens, alt: "Encontro para Homens", link: "https://saopaulo.cancaonova.com/noticias/encontro-para-homens-propoe-um-dia-de-formacao-e-espiritualidade-em-sao-paulo/" },
  { src: bannerKairos, alt: "Kairós para Mulheres", link: "https://saopaulo.cancaonova.com/noticias/cancao-nova-sao-paulo-promove-kairos-para-mulheres-em-sao-paulo/" },
  { src: bannerConexao, alt: "Rádio Conexão Católica - A Sintonia de Vida no Ar", link: "https://play.google.com/store/apps/details?id=br.webofus.rdioconexocatlica&hl=pt_BR" },
];

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), []);
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1140px] px-4">
        <div className="relative overflow-hidden rounded-lg">

          {/* Imagem ativa — altura natural, sem corte */}
          <a href={banners[current].link} target="_blank" rel="noopener noreferrer" className="block w-full">
            <img
              src={banners[current].src}
              alt={banners[current].alt}
              className="w-full h-auto block"
              loading="eager"
            />
          </a>

          {/* Setas */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            aria-label="Próximo banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
                aria-label={`Ir para banner ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
