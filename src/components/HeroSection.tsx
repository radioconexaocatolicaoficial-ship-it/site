import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerApp from "@/assets/banner-topo-app.jpg";
import bannerPousada from "@/assets/banner-topo-pousada.jpg";

const APP_URL = "https://play.google.com/store/apps/details?id=hoostcomv2.ogvopund";
const POUSADA_URL = "https://pousadasaojosedeanchieta.com.br";

type Slide = {
  id: string;
  desktop: string;
  mobile: string;
  alt: string;
  href: string | null;
  ctaLabel?: string;
};

const slides: Slide[] = [
  {
    id: "app",
    desktop: bannerApp,
    mobile: bannerApp,
    alt: "Baixe o app da Rádio Conexão Católica",
    href: APP_URL,
    ctaLabel: "Baixar o app no Google Play",
  },
  {
    id: "pousada",
    desktop: bannerPousada,
    mobile: bannerPousada,
    alt: "Pousada São José de Anchieta — Acolhimento, fé e tranquilidade",
    href: POUSADA_URL,
    ctaLabel: "Reservar na Pousada São José de Anchieta",
  },
];

const ArrowButtons = ({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) => (
  <>
    <button
      type="button"
      onClick={onPrev}
      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 text-white/75 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-colors"
      aria-label="Banner anterior"
    >
      <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.75} />
    </button>
    <button
      type="button"
      onClick={onNext}
      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 text-white/75 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-colors"
      aria-label="Próximo banner"
    >
      <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.75} />
    </button>
  </>
);

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [],
  );

  useEffect(() => {
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="inicio" className="relative w-full overflow-hidden mb-[8%] md:mb-0">
      {/* Desktop — largura original (object-contain), setas dentro do banner */}
      <div className="hidden md:flex w-full justify-center">
        <div className="relative h-[400px] max-w-full inline-block overflow-hidden rounded-b-xl">
          {/* Define a largura real do banner (mesma proporção de antes) */}
          <img
            src={slides[current].desktop}
            alt=""
            aria-hidden
            className="h-[400px] w-auto max-w-full block invisible"
            width={1024}
            height={360}
          />

          {slides.map((slide, i) => {
            const active = i === current;
            const img = (
              <img
                src={slide.desktop}
                alt={slide.alt}
                className="h-[400px] w-auto max-w-full object-contain"
                width={1024}
                height={360}
                loading={i === 0 ? "eager" : "lazy"}
              />
            );

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[1200ms] ease-in-out ${
                  active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-hidden={!active}
              >
                {slide.href ? (
                  <a
                    href={slide.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                    aria-label={slide.ctaLabel ?? slide.alt}
                  >
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          })}

          <ArrowButtons onPrev={prev} onNext={next} />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? "bg-white shadow" : "bg-white/45"
                }`}
                aria-label={`Ir para banner ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile — todos os cantos arredondados + padding 5px */}
      <div className="relative block md:hidden w-full p-[15px]">
        <div className="relative w-full overflow-hidden rounded-xl">
          <img
            src={slides[current].mobile}
            alt=""
            aria-hidden
            className="w-full h-auto object-contain invisible"
            width={1024}
            height={360}
          />
          {slides.map((slide, i) => {
            const active = i === current;
            const img = (
              <img
                src={slide.mobile}
                alt={slide.alt}
                className="w-full h-auto object-contain absolute inset-0"
                width={1024}
                height={360}
                loading={i === 0 ? "eager" : "lazy"}
              />
            );

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                  active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-hidden={!active}
              >
                {slide.href ? (
                  <a
                    href={slide.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative"
                    aria-label={slide.ctaLabel ?? slide.alt}
                  >
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          })}

          <ArrowButtons onPrev={prev} onNext={next} />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? "bg-white shadow" : "bg-white/45"
                }`}
                aria-label={`Ir para banner ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
