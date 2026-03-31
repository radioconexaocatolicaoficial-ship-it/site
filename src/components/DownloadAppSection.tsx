import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const DownloadAppSection = () => {
  return (
    <section id="baixar-app" className="py-20 bg-hero-gradient relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-secondary/10" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-secondary/10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center shadow-xl">
            <Smartphone className="w-10 h-10 text-secondary-foreground" />
          </div>
          <h2 className="font-heading font-bold text-primary-foreground text-3xl md:text-4xl mb-4">
            Baixe nosso App
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Ouça a Rádio Conexão Católica de qualquer lugar! Baixe o app gratuitamente e leve a fé no seu bolso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="hero" size="lg" className="text-base px-8 gap-3">
                <Download className="w-5 h-5" />
                Google Play
              </Button>
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="hero" size="lg" className="text-base px-8 gap-3">
                <Download className="w-5 h-5" />
                App Store
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
