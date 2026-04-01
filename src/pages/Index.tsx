import Layout from "@/components/Layout";
import NewsFeedStrict from "@/components/NewsFeedStrict";
import CountdownCard from "@/components/CountdownCard";
import VaticanNewsCarousel from "@/components/VaticanNewsCarousel";
import LiturgiaWidget from "@/components/LiturgiaWidget";
import DioceseCarousel from "@/components/DioceseCarousel";
import BibliaWidget from "@/components/BibliaWidget";
import SantaRitaNewsSection from "@/components/SantaRitaNewsSection";
import DestaqueInstitucional from "@/components/DestaqueInstitucional";
import LojaCard from "@/components/LojaCard";
import LojaProdutosScroller from "@/components/LojaProdutosScroller";
import YouTubeVideos from "@/components/YouTubeVideos";
import PatrocinadoresCarousel from "@/components/PatrocinadoresCarousel";
import NewsSection from "@/components/NewsSection";
import GoogleReviews from "@/components/GoogleReviews";
import PedidoMusica from "@/components/PedidoMusica";

const Index = () => (
  <Layout>
    <NewsFeedStrict />

    {/* Seção 1: Countdown + Vatican News */}
    <section className="container mx-auto px-4 pt-0 pb-[30px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-[30px] items-stretch">
        <div className="md:col-span-1 lg:col-span-3">
          <CountdownCard />
        </div>
        <div className="md:col-span-1 lg:col-span-7">
          <VaticanNewsCarousel />
        </div>
      </div>
    </section>

    {/* Loja + faixa de produtos — acima de Liturgia e Diocese */}
    <section className="container mx-auto px-4 pt-0 pb-[30px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-[30px] items-stretch">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-[30px] items-stretch">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-[30px] items-stretch">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-[30px] items-stretch">
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
  </Layout>
);

export default Index;
