import heroBg from "@/assets/Banner-Topo-.jpg";
import heroBgMobile from "@/assets/Banner-topo-mobile.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative w-full overflow-hidden">
      {/* Banner para Desktop */}
      <img 
        src={heroBg} 
        alt="Banner Rádio Conexão Católica" 
        className="hidden md:block w-full h-[400px] object-contain" 
        width={1920} 
        height={1080} 
      />
      {/* Banner para Mobile */}
      <img 
        src={heroBgMobile} 
        alt="Banner Rádio Conexão Católica" 
        className="block md:hidden w-full h-[400px] object-contain" 
        width={1080} 
        height={1920} 
      />
    </section>
  );
};

export default HeroSection;
