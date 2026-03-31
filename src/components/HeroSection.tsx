import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <p className="text-gold font-heading font-bold text-lg md:text-xl uppercase tracking-widest mb-4">
          Web Rádio Católica
        </p>
        <h1 className="font-heading font-black text-primary-foreground text-4xl md:text-6xl lg:text-7xl leading-tight mb-4">
          Rádio Conexão
          <br />
          <span className="text-gold">Católica</span>
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-body">
          A sintonia de vida no ar — Levando a boa nova para todos os cantos. 
          24 horas de fé, esperança e amor.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="lg" className="text-base px-8" onClick={() => document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' })}>
            🎧 Ouvir ao Vivo
          </Button>
          <a href="#baixar-app">
            <Button variant="hero-outline" size="lg" className="text-base px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              📱 Baixar o App
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
