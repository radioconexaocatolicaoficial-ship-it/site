import React, { Suspense, useState } from "react";
import Layout from "@/components/Layout";
import midiaBanner from "@/assets/midia-banner.jpg";
import {
  Send,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  MessageCircle,
  Church,
  ExternalLink,
} from "lucide-react";

const DestaqueInstitucional = React.lazy(() => import("@/components/DestaqueInstitucional"));
const YouTubeVideos = React.lazy(() => import("@/components/YouTubeVideos"));
const GoogleReviews = React.lazy(() => import("@/components/GoogleReviews"));

const SkeletonBlock = () => (
  <div className="animate-pulse bg-muted/30 rounded-xl h-[300px] w-full" />
);

const WHATSAPP = "5511961605164";
const WHATSAPP_DISPLAY = "11 96160-5164";
const EMAIL = "radioconexaocatolicaoficial@gmail.com";

const ASSUNTOS = [
  "Dúvida geral",
  "Pedido de oração",
  "Sugestão de programação",
  "Parceria / patrocínio",
  "Loja católica",
  "Outro",
] as const;

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@radioconexaocatolicaoficial",
    url: "https://www.instagram.com/radioconexaocatolicaoficial/",
    color: "#E1306C",
    bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    name: "YouTube",
    handle: "@radioconexaocatolicaofical",
    url: "https://www.youtube.com/@radioconexaocatolicaofical",
    color: "#FF0000",
    bg: "#FF0000",
    icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    name: "Facebook",
    handle: "radioconexaocatolicaofical",
    url: "https://www.facebook.com/radioconexaocatolicaofical",
    color: "#1877F2",
    bg: "#1877F2",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "TikTok",
    handle: "@radioconexaocatolica",
    url: "https://www.tiktok.com/@radioconexaocatolica",
    color: "#010101",
    bg: "#010101",
    icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
] as const;

type FormState = {
  nome: string;
  cidade: string;
  email: string;
  assunto: string;
  mensagem: string;
};

const emptyForm: FormState = {
  nome: "",
  cidade: "",
  email: "",
  assunto: ASSUNTOS[0],
  mensagem: "",
};

const Contato = () => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [sent, setSent] = useState<"whatsapp" | "email" | null>(null);

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const buildMessage = () =>
    [
      "Contato — Rádio Conexão Católica",
      "",
      `Nome: ${form.nome}`,
      `Cidade: ${form.cidade}`,
      form.email ? `E-mail: ${form.email}` : null,
      `Assunto: ${form.assunto}`,
      "",
      "Mensagem:",
      form.mensagem,
    ]
      .filter(Boolean)
      .join("\n");

  const resetAfterSend = (channel: "whatsapp" | "email") => {
    setSent(channel);
    window.setTimeout(() => {
      setSent(null);
      setForm(emptyForm);
    }, 5000);
  };

  const sendWhatsApp = () => {
    const texto = [
      "*Contato — Rádio Conexão Católica*",
      "",
      `👤 Nome: ${form.nome}`,
      `📍 Cidade: ${form.cidade}`,
      form.email ? `✉️ E-mail: ${form.email}` : null,
      `📌 Assunto: ${form.assunto}`,
      "",
      `💬 Mensagem:`,
      form.mensagem,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank");
    resetAfterSend("whatsapp");
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(`[Contato Site] ${form.assunto} — ${form.nome}`);
    const body = encodeURIComponent(buildMessage());
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    resetAfterSend("email");
  };

  return (
    <Layout>
      {/* Banner — mesmo modelo Mídia / Catedral / Loja */}
      <section className="relative overflow-hidden h-[300px] sm:h-[340px] md:h-[380px] bg-[#051230]">
        <img
          src={midiaBanner}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,18,48,0.55) 0%, rgba(10,32,96,0.72) 45%, rgba(5,18,48,0.88) 100%)",
          }}
        />
        <div className="relative z-10 h-full container mx-auto px-4 flex flex-col items-center justify-center text-center text-white">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-yellow-400/90 mb-3">
            Fale conosco
          </p>
          <h1 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            Contato
          </h1>
          <p className="mt-3 text-white/85 max-w-xl mx-auto text-sm sm:text-base drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            Dúvidas, orações, parcerias e sugestões — a equipe da Rádio Conexão Católica responde.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-white/40 text-white hover:bg-white/10 transition backdrop-blur-sm"
            >
              <Mail className="h-4 w-4" />
              E-mail
            </a>
          </div>
        </div>
      </section>

      {/* Formulário + canais — grid da home */}
      <section className="container mx-auto px-4 pt-8 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-start">
          {/* Formulário */}
          <div className="md:col-span-1 lg:col-span-7">
            <span
              className="inline-block text-[11px] font-bold tracking-[0.1em] uppercase text-white px-3 py-1.5 rounded-md mb-4"
              style={{
                background: "linear-gradient(135deg, #004a99, #0066cc)",
                boxShadow: "0 4px 12px rgba(0, 74, 153, 0.25)",
              }}
            >
              Mensagem
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Envie sua mensagem
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Preencha o formulário e envie por e-mail para a rádio ou pelo WhatsApp.
            </p>

            {sent ? (
              <div className="rounded-xl bg-muted/40 p-10 text-center flex flex-col items-center gap-3">
                <CheckCircle className="h-14 w-14 text-green-500" />
                <p className="text-lg font-bold text-foreground">
                  {sent === "email" ? "Formulário pronto!" : "Mensagem pronta!"}
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {sent === "email"
                    ? `O e-mail será enviado para ${EMAIL}. Se o aplicativo de e-mail não abriu, use o botão abaixo.`
                    : "Você foi redirecionado para o WhatsApp. Se a janela não abriu, use o botão abaixo."}
                </p>
                {sent === "email" ? (
                  <a
                    href={`mailto:${EMAIL}`}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#051230,#0a2060)" }}
                  >
                    <Mail className="h-4 w-4" />
                    Abrir e-mail
                  </a>
                ) : (
                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
                    style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Abrir WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <form
                id="contato-form-check"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendEmail();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                      Seu nome *
                    </label>
                    <input
                      required
                      name="nome"
                      value={form.nome}
                      onChange={handle}
                      placeholder="Como você se chama?"
                      className="px-4 py-2.5 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                      Cidade *
                    </label>
                    <input
                      required
                      name="cidade"
                      value={form.cidade}
                      onChange={handle}
                      placeholder="Sua cidade"
                      className="px-4 py-2.5 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handle}
                      placeholder="seu@email.com"
                      className="px-4 py-2.5 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                      Assunto *
                    </label>
                    <select
                      required
                      name="assunto"
                      value={form.assunto}
                      onChange={handle}
                      className="px-4 py-2.5 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-11"
                    >
                      {ASSUNTOS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                    Mensagem *
                  </label>
                  <textarea
                    required
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handle}
                    rows={6}
                    placeholder="Escreva sua mensagem..."
                    className="px-4 py-3 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[140px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("contato-form-check") as HTMLFormElement | null;
                      if (el && !el.checkValidity()) {
                        el.reportValidity();
                        return;
                      }
                      sendWhatsApp();
                    }}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-bold text-sm transition hover:brightness-110 shadow-lg active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar pelo WhatsApp
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-bold text-sm text-white transition hover:brightness-110 shadow-lg active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg,#051230,#0a2060)" }}
                  >
                    <Send className="h-4 w-4" />
                    Enviar formulário
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Canais laterais */}
          <aside className="md:col-span-1 lg:col-span-3 space-y-4">
            <div
              className="rounded-xl p-5 text-white"
              style={{ background: "linear-gradient(135deg, #051230 0%, #0a2060 100%)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-yellow-400 shrink-0" />
                <h3 className="font-bold text-base">WhatsApp</h3>
              </div>
              <p className="text-2xl font-black text-yellow-400 tracking-tight">
                {WHATSAPP_DISPLAY}
              </p>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                Atendimento da rádio para pedidos, dúvidas e parcerias.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
              >
                <Phone className="h-3.5 w-3.5" />
                Chamar agora
              </a>
            </div>

            <div className="rounded-xl bg-muted/40 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">E-mail</p>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-xs text-muted-foreground hover:text-primary whitespace-nowrap"
                  >
                    {EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Localização</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Diocese de São Miguel Paulista
                    <br />
                    Zona Leste — São Paulo, SP
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Church className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Missão</p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-nowrap">
                    Evangelizar pela web rádio, 24 horas no ar.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Redes — largura total até 1140px, abaixo do formulário */}
        <div className="mt-8 mx-auto w-full max-w-[1140px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Redes sociais
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl bg-muted/40 px-4 py-5 md:px-5 md:py-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ background: s.bg }}
                  aria-hidden
                >
                  <svg className="h-6 w-6 md:h-7 md:w-7 fill-current" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {s.name}
                    </p>
                    <ExternalLink className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 shrink-0" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5">{s.handle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Mesmas seções da home abaixo da Caminhada da Ressurreição */}
      <Suspense
        fallback={
          <section className="container mx-auto px-4 pb-[30px]">
            <SkeletonBlock />
          </section>
        }
      >
        <div className="mb-[30px]">
          <DestaqueInstitucional />
        </div>

        <section className="container mx-auto px-4 pt-0 pb-[30px]">
          <YouTubeVideos />
        </section>

        <GoogleReviews />
      </Suspense>
    </Layout>
  );
};

export default Contato;
