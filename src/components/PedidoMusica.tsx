import { useState } from "react";
import { Music, Send, CheckCircle, Calendar, X } from "lucide-react";
import { ProgramacaoContent } from "./ProgramacaoSection";

const PedidoMusica = () => {
  const [form, setForm] = useState({ nome: "", cidade: "", musica: "", artista: "", mensagem: "" });
  const [sent, setSent] = useState(false);
  const [showProgramacao, setShowProgramacao] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = `🎵 *Pedido de Música*\n\n👤 Nome: ${form.nome}\n📍 Cidade: ${form.cidade}\n🎶 Música: ${form.musica}\n🎤 Artista: ${form.artista}\n💬 Mensagem: ${form.mensagem}`;
    const url = `https://wa.me/5511961605164?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ nome: "", cidade: "", musica: "", artista: "", mensagem: "" }); }, 4000);
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-xl border border-border overflow-hidden relative">
        <div className="px-5 py-3.5 flex items-center gap-2"
          style={{ background: "linear-gradient(90deg,#051230,#0a2060)" }}>
          <Music className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Pedido de Música</h2>
        </div>

        {/* Modal da Programação */}
        {showProgramacao && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Nossa Programação</h3>
              </div>
              <button
                onClick={() => setShowProgramacao(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col p-2">
              <ProgramacaoContent />
            </div>
          </div>
        )}

        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 text-center px-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="font-bold text-foreground text-xl">Pedido enviado!</p>
            <p className="text-muted-foreground">Você foi redirecionado para o WhatsApp. Obrigado!</p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 flex-1 flex flex-col gap-3 overflow-hidden">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-primary/80">Seu nome *</label>
              <input required name="nome" value={form.nome} onChange={handle}
                placeholder="Como você se chama?"
                className="px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-primary/80">Cidade *</label>
              <input required name="cidade" value={form.cidade} onChange={handle}
                placeholder="Sua cidade"
                className="px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-primary/80">Música *</label>
              <input required name="musica" value={form.musica} onChange={handle}
                placeholder="Nome da música"
                className="px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-primary/80">Artista</label>
              <input name="artista" value={form.artista} onChange={handle}
                placeholder="Nome do artista"
                className="px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-h-0">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-primary/80">Mensagem</label>
              <textarea name="mensagem" value={form.mensagem} onChange={handle}
                placeholder="Deixe uma mensagem..."
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none flex-1 min-h-[60px] transition-all" />
            </div>
            <div className="pt-4 space-y-2.5 mt-auto">
              <button type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all hover:brightness-110 shadow-lg active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}>
                <Send className="w-4 h-4" />
                Enviar pelo WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setShowProgramacao(true)}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all hover:brightness-110 text-white shadow-md border border-white/10 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#051230,#0a2060)" }}
              >
                <Calendar className="w-4 h-4 text-yellow-400" />
                Ver Programação Completa
              </button>
            </div>
          </form>
        )}
    </div>
  );
};

export default PedidoMusica;
