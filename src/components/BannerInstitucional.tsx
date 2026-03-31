import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const BannerInstitucional = () => (
  <div className="w-full relative overflow-hidden" style={{ minHeight: "130px" }}>
    {/* Fundo */}
    <div className="absolute inset-0">
      <img src={heroBg} alt="" className="w-full h-full object-cover object-center" />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(100deg, rgba(5,30,80,0.92) 0%, rgba(10,60,140,0.82) 40%, rgba(5,30,80,0.70) 100%)"
      }} />
    </div>

    {/* Linha dourada topo */}
    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg,#f5c518,#e8a800,#f5c518)" }} />

    {/* Conteúdo */}
    <div className="relative z-10 container mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">

      {/* Texto esquerdo */}
      <div className="text-white text-center sm:text-left">
        <p className="text-sm md:text-base font-light tracking-widest uppercase opacity-80 mb-1">
          Web Rádio Católica
        </p>
        <h2 className="text-2xl md:text-4xl font-black leading-tight italic"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          a sintonia de vida no ar
        </h2>
        <p className="text-sm md:text-base opacity-70 mt-2 font-light">
          Levando a boa nova para todos os cantos.
        </p>
      </div>

      {/* Logo PNG com todos os efeitos originais */}
      <div className="flex-shrink-0">
        <img
          src={logo}
          alt="Rádio Conexão Católica"
          className="h-24 md:h-32 w-auto object-contain drop-shadow-2xl"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,80,200,0.5))" }}
        />
      </div>
    </div>

    {/* Linha dourada base */}
    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg,#f5c518,#e8a800,#f5c518)" }} />
  </div>
);

export default BannerInstitucional;
