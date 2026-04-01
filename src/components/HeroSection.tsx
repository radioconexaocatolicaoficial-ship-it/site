import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-[55vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-10 md:py-20 text-center">
        <p className="text-gold font-heading font-bold text-lg md:text-xl uppercase tracking-widest mb-4">
          Web Rádio Católica
        </p>
        <h1 className="font-heading font-black text-primary-foreground text-3xl md:text-5xl lg:text-6xl leading-tight mb-4">
          Rádio Conexão <span className="text-gold">Católica</span>
        </h1>
        <p className="text-primary-foreground/90 text-base md:text-lg max-w-2xl mx-auto mb-8 font-body">
          A sintonia de vida no ar. Levando a boa nova para todos os cantos, 24 horas de fé, esperança e amor.
        </p>
        <div className="flex flex-row flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="whitespace-nowrap px-8 py-3 rounded-full bg-white/20 border border-white text-white font-bold text-sm hover:bg-white hover:text-primary transition-colors"
          >
            ▶ Ouvir ao Vivo
          </button>
          <a href="#baixar-app">
            <button className="whitespace-nowrap px-8 py-3 rounded-full bg-gold text-primary font-bold text-sm hover:brightness-110 transition-all">
              📱 Baixar no Google Play
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
