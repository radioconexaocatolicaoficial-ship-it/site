import logo from "@/assets/logo.png";

const AboutSection = () => {
  return (
    <section id="sobre" className="py-16 bg-section-alt">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-1 flex-1 bg-secondary rounded" />
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary uppercase tracking-wide">
            Sobre Nós
          </h2>
          <div className="h-1 flex-1 bg-secondary rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="Rádio Conexão Católica"
              className="w-48 h-48 md:w-64 md:h-64 object-contain"
              loading="lazy"
              width={256}
              height={256}
            />
          </div>
          <div>
            <h3 className="font-heading font-bold text-foreground text-2xl mb-4">
              Web Rádio Católica — A Sintonia de Vida no Ar
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Rádio Conexão Católica é uma web rádio dedicada a levar a Boa Nova a todos os cantos. 
              Com programação 24 horas, transmitimos missas, terços, músicas católicas, notícias do 
              Vaticano e da Diocese de São Miguel Paulista.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nossa missão é conectar fiéis à fé católica através da comunicação, 
              promovendo esperança, caridade e a Palavra de Deus em cada transmissão.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
