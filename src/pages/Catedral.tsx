import {
  Church,
  Clock,
  Instagram,
  Cross,
  HeartHandshake,
  MapPin,
  Phone,
  Copy,
} from "lucide-react";
import Layout from "@/components/Layout";
import catedralBanner from "@/assets/catedral-banner.png";
import CatedralReformaCarousel from "@/components/CatedralReformaCarousel";
import CatedralFacebookFeed from "@/components/CatedralFacebookFeed";

const INSTAGRAM_URL = "https://www.instagram.com/catedral_sm/?hl=pt";
const PIX_KEY = "catedralsaomiguelarcanjo@hotmail.com";
const WHATSAPP = "11999089747";
const WHATSAPP_DISPLAY = "(11) 99908-9747";

const HORARIOS_MISSA = [
  { dia: "Domingo", horario: "8h, 10h e 19h" },
  { dia: "Segunda a Sábado", horario: "12h" },
  { dia: "Segunda e Sexta", horario: "16h" },
  { dia: "Quarta", horario: "19h30" },
  { dia: "Quinta e Sábado", horario: "18h — Capela" },
] as const;

const HORARIOS_CONFISSAO = [
  { dia: "Quarta", horario: "17h às 19h" },
  { dia: "Quinta a Sábado", horario: "9h às 11h30" },
] as const;

const copyPix = async () => {
  try {
    await navigator.clipboard.writeText(PIX_KEY);
  } catch {
    /* ignore */
  }
};

const Catedral = () => (
  <Layout>
    <section className="relative overflow-hidden h-[300px] sm:h-[340px] md:h-[380px] bg-[#051230]">
      <img
        src={catedralBanner}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,18,48,0.50) 0%, rgba(10,32,96,0.68) 45%, rgba(5,18,48,0.82) 100%)",
        }}
      />
      <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center text-white">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-yellow-400/90 mb-3">
          Comunidade
        </p>
        <h1 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
          Catedral de São Miguel Arcanjo
        </h1>
        <p className="mt-3 text-white/85 max-w-xl mx-auto text-sm sm:text-base drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          Igreja-mãe da Diocese de São Miguel Paulista — missas, confissões e a campanha de
          reforma.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
          >
            <Instagram className="h-4 w-4" />
            @catedral_sm
          </a>
          <a
            href={`https://wa.me/55${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-white/40 text-white hover:bg-white/10 transition backdrop-blur-sm"
          >
            <Phone className="h-4 w-4" />
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
    </section>

    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14 space-y-8 lg:space-y-10">
      {/* Linha 1: Sobre + horários */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)" }}
              >
                <Church className="h-5 w-5 text-[#002266]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Sobre
                </p>
                <h2 className="text-xl font-bold text-foreground">Catedral São Miguel</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed text-justify">
              <p>
                A <strong className="text-foreground">Catedral de São Miguel Arcanjo</strong> é a
                igreja-mãe da{" "}
                <strong className="text-foreground">Diocese de São Miguel Paulista</strong>, na
                Zona Leste de São Paulo. A diocese foi criada pelo Papa João Paulo II em 15 de
                março de 1989, e o templo é a sede episcopal dessa Igreja particular — referência
                de fé e liturgia para milhares de famílias da região.
              </p>
              <p>
                A construção começou em <strong className="text-foreground">1950</strong>, sob o
                impulso do{" "}
                <strong className="text-foreground">Padre Aleixo Monteiro Mafra</strong>, quando a
                antiga capela já não comportava o crescimento do bairro. A pedra fundamental foi
                assentada em 13 de janeiro de 1952. O templo foi inaugurado em{" "}
                <strong className="text-foreground">22 de agosto de 1965</strong> e consagrado em{" "}
                <strong className="text-foreground">31 de maio de 1992</strong> pelo núncio
                apostólico Dom Carlo Furno.
              </p>
              <p>
                No mesmo complexo histórico, na Praça Padre Aleixo Monteiro Mafra, está a{" "}
                <strong className="text-foreground">Capela de São Miguel Arcanjo</strong> —
                conhecida como Capela dos Índios e considerada a igreja mais antiga ainda
                existente no Estado de São Paulo. Sua origem remonta à missão do padre José de
                Anchieta, por volta de 1560; a edificação atual foi reconstruída e concluída em{" "}
                <strong className="text-foreground">18 de julho de 1622</strong>.
              </p>
              <p>
                Acompanhe celebrações, avisos e a campanha de reforma pelo Instagram oficial{" "}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  @catedral_sm
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold text-foreground">Horários das Missas</h2>
            </div>
            <ul className="space-y-3">
              {HORARIOS_MISSA.map((item) => (
                <li
                  key={item.dia}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-semibold text-foreground">{item.dia}</span>
                  <span className="text-sm text-muted-foreground text-right">{item.horario}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-xl p-5 sm:p-6 text-white"
            style={{
              background: "linear-gradient(135deg, #051230 0%, #0a2060 100%)",
              border: "1px solid rgba(200,168,75,0.35)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Cross className="h-5 w-5 text-yellow-400 shrink-0" />
              <h2 className="text-lg font-bold">Confissões</h2>
            </div>
            <ul className="space-y-3">
              {HORARIOS_CONFISSAO.map((item) => (
                <li
                  key={item.dia}
                  className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-semibold text-white">{item.dia}</span>
                  <span className="text-sm text-white/75 text-right">{item.horario}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
              style={{
                background:
                  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
              }}
            >
              <Instagram className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground">Instagram oficial</h3>
              <p className="text-sm text-primary/90 font-medium">@catedral_sm</p>
              <p className="text-sm text-muted-foreground mt-1">
                Fotos, vídeos, avisos e novidades da reforma.
              </p>
            </div>
          </a>
        </aside>
      </div>

      {/* Linha 2: Campanha + carrossel — mesma altura */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        <div className="lg:col-span-7 flex flex-col gap-4 h-full min-h-0">
          <div
            className="rounded-xl p-5 sm:p-6 text-white flex-1 flex flex-col"
            style={{
              background: "linear-gradient(135deg, #051230 0%, #0a2060 100%)",
              border: "1px solid rgba(200,168,75,0.35)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)" }}
              >
                <HeartHandshake className="h-5 w-5 text-[#002266]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-400/90">
                  Campanha
                </p>
                <h2 className="text-xl font-bold">Quem ama cuida</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-white/85 leading-relaxed text-justify flex-1">
              <p>
                <strong className="text-white">Contribua com a reforma e pintura</strong> da
                Catedral de São Miguel Arcanjo. Chegou a hora de retribuir tudo o que aqui
                recebemos.
              </p>
              <p>
                Com a sua ajuda, podemos{" "}
                <strong className="text-white">restaurar, preservar e manter viva</strong> essa
                casa que é de todos nós. Cada contribuição é um ato concreto de fé e cuidado.
              </p>
              <p>
                Vamos juntos cuidar da nossa Catedral? Participe, colabore, compartilhe e faça
                parte dessa missão.
              </p>
            </div>

            <div className="mt-5 rounded-lg bg-white/10 border border-white/15 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-400/90 mb-1">
                Doação via PIX
              </p>
              <p className="text-sm text-white/80 mb-2">
                Chave e-mail da campanha de reforma e pintura:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-sm sm:text-base font-bold text-yellow-400 break-all">
                  {PIX_KEY}
                </code>
                <button
                  type="button"
                  onClick={copyPix}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar PIX
                </button>
              </div>
              <p className="text-xs text-white/55 mt-3">
                Fonte: Instagram oficial{" "}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-400"
                >
                  @catedral_sm
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">Endereço:</strong> Praça Padre Aleixo Monteiro
                Mafra, 11 — São Miguel Paulista, São Paulo — SP, CEP 08011-010
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">Telefones:</strong> (11) 2032-4160 / (11)
                2031-9785 — WhatsApp{" "}
                <a
                  href={`https://wa.me/55${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </p>
            </div>
            <p className="text-muted-foreground pl-7">
              <strong className="text-foreground">Pároco:</strong> Pe. Rodrigo Floco Porto
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 h-full min-h-[360px]">
          <CatedralReformaCarousel fillHeight />
        </div>
      </div>
    </section>

    <CatedralFacebookFeed />
  </Layout>
);

export default Catedral;
