import React, { Suspense } from "react";
import { Instagram, ExternalLink, Waves, Radio, Music2, Cross, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import CountdownCard from "@/components/CountdownCard";
import VaticanNewsCarousel from "@/components/VaticanNewsCarousel";
import litoralBanner from "@/assets/litoral-banner.jpg";
import logoLitoral from "@/assets/logo-litoral.png";

const LiturgiaWidget = React.lazy(() => import("@/components/LiturgiaWidget"));
const BibliaWidget = React.lazy(() => import("@/components/BibliaWidget"));
const DestaqueInstitucional = React.lazy(() => import("@/components/DestaqueInstitucional"));
const LojaCard = React.lazy(() => import("@/components/LojaCard"));
const LojaProdutosScroller = React.lazy(() => import("@/components/LojaProdutosScroller"));
const YouTubeVideos = React.lazy(() => import("@/components/YouTubeVideos"));
const PatrocinadoresCarousel = React.lazy(() => import("@/components/PatrocinadoresCarousel"));
const NewsSection = React.lazy(() => import("@/components/NewsSection"));
const GoogleReviews = React.lazy(() => import("@/components/GoogleReviews"));
const PedidoMusica = React.lazy(() => import("@/components/PedidoMusica"));
const FreiZecaCarousel = React.lazy(() => import("@/components/FreiZecaCarousel"));
const DioceseCarousel = React.lazy(() => import("@/components/DioceseCarousel"));
const CaminhadaSection = React.lazy(() => import("@/components/CaminhadaSection"));

const IG_URL = "https://www.instagram.com/radioconexaocatolicalitoral/";
const BIOLINK = "https://biolink.info/radioconexaocatolica";

const SkeletonBlock = () => <div className="animate-pulse bg-muted/30 rounded-xl h-[300px] w-full" />;

const destaques = [
  {
    icon: Waves,
    title: "Baixada Santista",
    text: "Evangelizando o litoral paulista com proximidade e fé.",
  },
  {
    icon: Radio,
    title: "Afiliada oficial",
    text: "Afiliada à Web Rádio Conexão Católica — a mesma missão.",
  },
  {
    icon: Music2,
    title: "Música e oração",
    text: "Música católica, Palavra de Deus e momentos de oração.",
  },
];

/** Faixa abaixo do banner — informações da Rádio Litoral */
const LitoralInfoSection = () => (
  <section className="container mx-auto px-4 pt-6 sm:pt-8 pb-[30px]">
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
      {/* Destaque principal */}
      <div className="lg:col-span-4">
        <div
          className="h-full rounded-xl overflow-hidden p-5 sm:p-6 text-white flex flex-col justify-between relative"
          style={{ background: "linear-gradient(135deg, #051230 0%, #0a2060 100%)" }}
        >
          <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
            <Cross className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-yellow-400/90 mb-2">
              Afiliada
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
              Rádio Conexão Católica
              <br />
              No Litoral
            </h2>
            <p className="mt-3 text-sm text-white/85 leading-relaxed">
              Evangelizando na Baixada Santista. Afiliada à Web Rádio Conexão Católica — música,
              oração e Palavra de Deus no litoral paulista.
            </p>
          </div>
          <div className="relative z-10 mt-5 space-y-2 text-xs text-white/80">
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
              Baixada Santista — São Paulo
            </p>
            <p className="flex items-center gap-2">
              <Instagram className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
              @radioconexaocatolicalitoral
            </p>
          </div>
          <div className="relative z-10 mt-5 flex flex-wrap gap-2">
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
            >
              <Instagram className="h-3.5 w-3.5" />
              Seguir no Instagram
            </a>
            <a
              href={BIOLINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-white/40 text-white hover:bg-white/10 transition"
            >
              Links e contatos
            </a>
          </div>
        </div>
      </div>

      {/* Cards de informação */}
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {destaques.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col hover:shadow-md transition-shadow"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
              style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)" }}
            >
              <Icon className="h-5 w-5 text-[#002266]" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1.5">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed m-0 flex-1">{text}</p>
          </div>
        ))}
        <div className="sm:col-span-3 rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
          <img
            src={logoLitoral}
            alt="Rádio Conexão Católica No Litoral"
            className="h-16 sm:h-20 w-auto object-contain rounded-lg bg-white p-1.5 border border-border shrink-0"
          />
          <div className="text-center sm:text-left flex-1">
            <p className="text-sm font-bold text-foreground">Conexão Católica Litoral</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Celebrações, acampamentos e evangelização no Instagram oficial da afiliada. Faça
              parte dessa missão no litoral.
            </p>
          </div>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border border-border hover:border-primary hover:text-primary transition-colors"
          >
            Ver perfil
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

const Litoral = () => (
  <Layout>
    {/* Banner topo — mesmo modelo/largura/cores de Sobre Nós */}
    <section className="relative overflow-hidden h-[300px]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${litoralBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(5,18,48,0.94) 0%, rgba(10,32,96,0.88) 55%, rgba(5,18,48,0.92) 100%)",
        }}
      />
      <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center text-white">
        <img
          src={logoLitoral}
          alt="Rádio Conexão Católica No Litoral"
          className="h-14 sm:h-16 md:h-[72px] w-auto mb-2 sm:mb-3 rounded-md bg-white/95 p-1"
          style={{ filter: "drop-shadow(0 4px 24px rgba(0,100,255,0.35))" }}
        />
        <p className="text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.2em] uppercase text-yellow-400/90">
          Baixada Santista
        </p>
        <h1 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight max-w-3xl">
          Rádio Conexão Católica Litoral
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-white/75 max-w-xl px-2">
          Evangelizando na Baixada Santista — afiliada à Web Rádio Conexão Católica.
        </p>
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3 justify-center">
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
          >
            Instagram
          </a>
          <a
            href={BIOLINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border border-white/40 text-white hover:bg-white/10 transition"
          >
            Links e contatos
          </a>
        </div>
      </div>
    </section>

    {/* Informações da Rádio Litoral (sem Abraça São Paulo) */}
    <LitoralInfoSection />

    {/* Abraça São Paulo + Vatican News — mesmo modelo da home */}
    <section className="container mx-auto px-4 pt-0 pb-[30px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
        <div className="md:col-span-1 lg:col-span-3">
          <CountdownCard />
        </div>
        <div className="md:col-span-1 lg:col-span-7">
          <VaticanNewsCarousel />
        </div>
      </div>
    </section>

    <Suspense
      fallback={
        <section className="container mx-auto px-4 pb-[30px]">
          <SkeletonBlock />
        </section>
      }
    >
      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
          <div className="md:col-span-1 lg:col-span-3">
            <LojaCard />
          </div>
          <div className="md:col-span-1 lg:col-span-7 min-h-[320px] lg:min-h-[380px]">
            <LojaProdutosScroller />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
          <div className="md:col-span-1 lg:col-span-3">
            <LiturgiaWidget />
          </div>
          <div className="md:col-span-1 lg:col-span-7">
            <DioceseCarousel />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <PatrocinadoresCarousel />
      </section>

      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
          <div className="md:col-span-1 lg:col-span-3 h-full min-h-0">
            <BibliaWidget />
          </div>
          <div className="md:col-span-1 lg:col-span-7 min-w-0 h-full">
            <NewsSection />
          </div>
        </div>
      </section>

      {/* Pedido de Música + Frei Zeca + Caminhada (mesmo modelo Santa Rita da home) */}
      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
          <div className="md:col-span-1 lg:col-span-3">
            <PedidoMusica />
          </div>
          <div className="md:col-span-1 lg:col-span-7 flex flex-col gap-6">
            <FreiZecaCarousel />
            <CaminhadaSection />
          </div>
        </div>
      </section>

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

export default Litoral;
