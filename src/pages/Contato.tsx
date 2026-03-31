import Layout from "@/components/Layout";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";

const Contato = () => {
  const [sent, setSent] = useState(false);

  return (
    <Layout>
      <div className="gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-2">Contato</h1>
          <p className="opacity-80 text-lg">Fale conosco</p>
        </div>
      </div>
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Envie sua mensagem</h2>
            {sent ? (
              <div className="bg-muted rounded-xl p-8 text-center">
                <p className="text-lg font-semibold text-primary">Mensagem enviada com sucesso!</p>
                <p className="text-muted-foreground mt-2">Retornaremos em breve.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <input type="text" placeholder="Seu nome" required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
                <input type="email" placeholder="Seu email" required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
                <textarea rows={5} placeholder="Sua mensagem" required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
                <button type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition">
                  <Send className="h-4 w-4" /> Enviar
                </button>
              </form>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Informações</h2>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">WhatsApp</p>
                <p className="text-muted-foreground">11 96160-5164</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <p className="text-muted-foreground">contato@radioconexaocatolica.com.br</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Localização</p>
                <p className="text-muted-foreground">São Paulo, SP — Brasil</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contato;
