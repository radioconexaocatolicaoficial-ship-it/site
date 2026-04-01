import React, { Suspense } from "react";
import Layout from "@/components/Layout";
import NewsFeedStrict from "@/components/NewsFeedStrict";
import CountdownCard from "@/components/CountdownCard";
import VaticanNewsCarousel from "@/components/VaticanNewsCarousel";

// Lazy Loaded Below-the-fold Components
const LiturgiaWidget = React.lazy(() => import("@/components/LiturgiaWidget"));
const DioceseCarousel = React.lazy(() => import("@/components/DioceseCarousel"));
const BibliaWidget = React.lazy(() => import("@/components/BibliaWidget"));
const SantaRitaNewsSection = React.lazy(() => import("@/components/SantaRitaNewsSection"));
const DestaqueInstitucional = React.lazy(() => import("@/components/DestaqueInstitucional"));
const LojaCard = React.lazy(() => import("@/components/LojaCard"));
const LojaProdutosScroller = React.lazy(() => import("@/components/LojaProdutosScroller"));
const YouTubeVideos = React.lazy(() => import("@/components/YouTubeVideos"));
const PatrocinadoresCarousel = React.lazy(() => import("@/components/PatrocinadoresCarousel"));
const NewsSection = React.lazy(() => import("@/components/NewsSection"));
const GoogleReviews = React.lazy(() => import("@/components/GoogleReviews"));
const PedidoMusica = React.lazy(() => import("@/components/PedidoMusica"));

const SkeletonBlock = () => <div className="animate-pulse bg-muted/30 rounded-xl h-[300px] w-full" />;

const Index = () => (
  <Layout>
    <NewsFeedStrict /> {/* Acima da dobra - Eager Load */}

    {/* Seção 1: Countdown + Vatican News (Ainda importantes o suficiente para serem eager) */}
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

    <Suspense fallback={
      <section className="container mx-auto px-4 pb-[30px]"><SkeletonBlock /></section>
    }>
      {/* Loja + faixa de produtos — acima de Liturgia e Diocese */}
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

      {/* Seção 2: Liturgia Diária + Notícias Diocese */}
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

      {/* Patrocinadores — entre seções 2 e 3 */}
      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <PatrocinadoresCarousel />
      </section>

      {/* Bíblia + Rádio Notícias (tempo por GPS + feeds G1 por cartão), abaixo do patrocinador */}
      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
          <div className="md:col-span-1 lg:col-span-3">
            <BibliaWidget />
          </div>
          <div className="md:col-span-1 lg:col-span-7">
            <NewsSection />
          </div>
        </div>
      </section>

      {/* Seção 4: Pedido de Música + Rádio Santa Rita (Grid 3x2) */}
      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6 md:gap-[30px] items-stretch">
          <div className="md:col-span-1 lg:col-span-3">
            <PedidoMusica />
          </div>
          <div className="md:col-span-1 lg:col-span-7">
            <SantaRitaNewsSection />
          </div>
        </div>
      </section>

      {/* Destaque Institucional */}
      <div className="mb-[30px]">
        <DestaqueInstitucional />
      </div>

      {/* Seção 5: YouTube */}
      <section className="container mx-auto px-4 pt-0 pb-[30px]">
        <YouTubeVideos />
      </section>

      {/* Seção 6: Avaliações Google */}
      <GoogleReviews />
    </Suspense>
  </Layout>
);

export default Index;
