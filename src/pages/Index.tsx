import Layout from "@/components/Layout";
import BannerCarousel from "@/components/BannerCarousel";
import CountdownCard from "@/components/CountdownCard";
import VaticanNewsCarousel from "@/components/VaticanNewsCarousel";
import LiturgiaWidget from "@/components/LiturgiaWidget";
import DioceseCarousel from "@/components/DioceseCarousel";
import BibliaWidget from "@/components/BibliaWidget";
import RadioSantaRitaCarousel from "@/components/RadioSantaRitaCarousel";
import DestaqueInstitucional from "@/components/DestaqueInstitucional";
import LojaCard from "@/components/LojaCard";
import CaminhadaCarousel from "@/components/CaminhadaCarousel";
import YouTubeVideos from "@/components/YouTubeVideos";
import PatrocinadoresCarousel from "@/components/PatrocinadoresCarousel";

const Index = () => (
  <Layout>
    <BannerCarousel />

    {/* Seção 1: Countdown + Vatican News */}
    <section className="container mx-auto px-4 pt-4 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        <div className="lg:col-span-3">
          <CountdownCard />
        </div>
        <div className="lg:col-span-7">
          <VaticanNewsCarousel />
        </div>
      </div>
    </section>

    {/* Seção 2: Liturgia Diária + Notícias Diocese */}
    <section className="container mx-auto px-4 pt-2 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        <div className="lg:col-span-3">
          <LiturgiaWidget />
        </div>
        <div className="lg:col-span-7">
          <DioceseCarousel />
        </div>
      </div>
    </section>

    {/* Patrocinadores — entre seções 2 e 3 */}
    <section className="container mx-auto px-4 py-3">
      <PatrocinadoresCarousel />
    </section>

    {/* Seção 3: Bíblia Sagrada + Rádio Santa Rita */}
    <section className="container mx-auto px-4 pt-2 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        <div className="lg:col-span-3">
          <BibliaWidget />
        </div>
        <div className="lg:col-span-7">
          <RadioSantaRitaCarousel />
        </div>
      </div>
    </section>

    {/* Seção 4: Loja + Caminhada da Ressurreição */}
    <section className="container mx-auto px-4 pt-[30px] pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        <div className="lg:col-span-3">
          <LojaCard />
        </div>
        <div className="lg:col-span-7">
          <CaminhadaCarousel />
        </div>
      </div>
    </section>

    {/* Seção 4: Destaque Institucional */}
    <div className="my-5">
      <DestaqueInstitucional />
    </div>

    {/* Seção 5: YouTube */}
    <section className="container mx-auto px-4 pt-2 pb-6">
      <YouTubeVideos />
    </section>
  </Layout>
);

export default Index;
