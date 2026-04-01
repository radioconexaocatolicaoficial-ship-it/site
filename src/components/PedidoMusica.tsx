import { useState } from "react";
import { Music, Send, CheckCircle } from "lucide-react";

const PedidoMusica = () => {
  const [form, setForm] = useState({ nome: "", cidade: "", musica: "", artista: "", mensagem: "" });
  const [sent, setSent] = useState(false);

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
    <div className="h-full flex flex-col bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-2"
          style={{ background: "linear-gradient(90deg,#051230,#0a2060)" }}>
          <Music className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Pedido de Música</h2>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="font-bold text-foreground text-lg">Pedido enviado!</p>
            <p className="text-muted-foreground text-sm">Você foi redirecionado para o WhatsApp. Obrigado!</p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seu nome *</label>
              <input required name="nome" value={form.nome} onChange={handle}
                placeholder="Como você se chama?"
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cidade *</label>
              <input required name="cidade" value={form.cidade} onChange={handle}
                placeholder="Sua cidade"
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Música *</label>
              <input required name="musica" value={form.musica} onChange={handle}
                placeholder="Nome da música"
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Artista</label>
              <input name="artista" value={form.artista} onChange={handle}
                placeholder="Nome do artista"
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mensagem</label>
              <textarea name="mensagem" value={form.mensagem} onChange={handle}
                placeholder="Deixe uma mensagem para a equipe (opcional)"
                rows={3}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}>
                <Send className="w-4 h-4" />
                Enviar pelo WhatsApp
              </button>
            </div>
          </form>
        )}
    </div>
  );
};

export default PedidoMusica;
