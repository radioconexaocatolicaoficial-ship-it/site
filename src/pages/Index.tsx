import Layout from "@/components/Layout";
import NewsFeedStrict from "@/components/NewsFeedStrict";
import CountdownCard from "@/components/CountdownCard";
import VaticanNewsCarousel from "@/components/VaticanNewsCarousel";
import LiturgiaWidget from "@/components/LiturgiaWidget";
import DioceseCarousel from "@/components/DioceseCarousel";
import BibliaWidget from "@/components/BibliaWidget";
import RadioSantaRitaCarousel from "@/components/RadioSantaRitaCarousel";
import DestaqueInstitucional from "@/components/DestaqueInstitucional";
import LojaCard from "@/components/LojaCard";
import LojaProdutosScroller from "@/components/LojaProdutosScroller";
import CaminhadaCarousel from "@/components/CaminhadaCarousel";
import YouTubeVideos from "@/components/YouTubeVideos";
import PatrocinadoresCarousel from "@/components/PatrocinadoresCarousel";
import GoogleReviews from "@/components/GoogleReviews";
import ProgramacaoSection from "@/components/ProgramacaoSection";
import PedidoMusica from "@/components/PedidoMusica";

const Index = () => (
  <Layout>
    <NewsFeedStrict />

    {/* Seção 1: Countdown + Vatican News */}
    <section className="container mx-auto px-4 pt-4 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 items-stretch">
        <div className="md:col-span-1 lg:col-span-3">
          <CountdownCard />
        </div>
        <div className="md:col-span-1 lg:col-span-7">
          <VaticanNewsCarousel />
        </div>
      </div>
    </section>

    {/* Loja + faixa de produtos — acima de Liturgia e Diocese */}
    <section className="container mx-auto px-4 pt-2 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 items-stretch">
        <div className="md:col-span-1 lg:col-span-3">
          <LojaCard />
        </div>
        <div className="md:col-span-1 lg:col-span-7 min-h-[320px] lg:min-h-[380px]">
          <LojaProdutosScroller />
        </div>
      </div>
    </section>

    {/* Seção 2: Liturgia Diária + Notícias Diocese */}
    <section className="container mx-auto px-4 pt-2 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 items-stretch">
        <div className="md:col-span-1 lg:col-span-3">
          <LiturgiaWidget />
        </div>
        <div className="md:col-span-1 lg:col-span-7">
          <DioceseCarousel />
        </div>
      </div>
    </section>

    {/* Patrocinadores — entre seções 2 e 3 */}
    <section className="container mx-auto px-4 pt-0 pb-3">
      <PatrocinadoresCarousel />
    </section>

    {/* Seção 3: Bíblia Sagrada + Rádio Santa Rita */}
    <section className="container mx-auto px-4 pt-2 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 items-stretch">
        <div className="md:col-span-1 lg:col-span-3">
          <BibliaWidget />
        </div>
        <div className="md:col-span-1 lg:col-span-7">
          <RadioSantaRitaCarousel />
        </div>
      </div>
    </section>

    {/* Caminhada da Ressurreição (largura total do container) */}
    <section className="container mx-auto px-4 pt-4 pb-2">
      <CaminhadaCarousel />
    </section>

    {/* Destaque Institucional */}
    <div className="my-5">
      <DestaqueInstitucional />
    </div>

    {/* Seção 5: YouTube */}
    <section className="container mx-auto px-4 pt-2 pb-6">
      <YouTubeVideos />
    </section>

    {/* Programação + Pedido de Música */}
    <section className="container mx-auto px-4 pt-2 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 items-stretch">
        <div className="md:col-span-1 lg:col-span-3">
          <PedidoMusica />
        </div>
        <div className="md:col-span-1 lg:col-span-7">
          <ProgramacaoSection />
        </div>
      </div>
    </section>

    {/* Seção 6: Avaliações Google */}
    <GoogleReviews />
  </Layout>
);

export default Index;
