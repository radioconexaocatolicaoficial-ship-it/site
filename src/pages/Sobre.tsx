import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import logo from "@/assets/logo.png";
import baseRadio from "@/assets/Base-radio-1.png";
import LojaCard from "@/components/LojaCard";
import SobreProdutosCarousel from "@/components/SobreProdutosCarousel";
import {
  CalendarDays,
  Church,
  Heart,
  Headphones,
  Radio,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@radioconexaocatolicaoficial",
    url: "https://www.instagram.com/radioconexaocatolicaoficial/",
    blurb: "Bastidores, orações e avisos da programação.",
    color: "#E1306C",
  },
  {
    name: "YouTube",
    handle: "@radioconexaocatolicaofical",
    url: "https://www.youtube.com/@radioconexaocatolicaofical",
    blurb: "Vídeos, missas e conteúdos evangelizadores.",
    color: "#FF0000",
  },
  {
    name: "Facebook",
    handle: "radioconexaocatolicaofical",
    url: "https://www.facebook.com/radioconexaocatolicaofical",
    blurb: "Comunidade, lives e partilha diária de fé.",
    color: "#1877F2",
  },
  {
    name: "TikTok",
    handle: "@radioconexaocatolica",
    url: "https://www.tiktok.com/@radioconexaocatolica",
    blurb: "Momentos curtos de louvor e evangelização.",
    color: "#010101",
  },
] as const;

const PILARES = [
  {
    icon: Radio,
    title: "Evangelizar",
    text: "Levar a Boa Nova todos os dias, com música católica, oração e formação espiritual.",
  },
  {
    icon: Church,
    title: "Servir a Igreja",
    text: "Divulgar a vida da Diocese de São Miguel Paulista, paróquias, pastorais e movimentos.",
  },
  {
    icon: Heart,
    title: "Conectar pessoas",
    text: "Criar comunhão entre fiéis pela internet, unindo oração e partilha onde estiverem.",
  },
  {
    icon: Headphones,
    title: "Estar no ar 24h",
    text: "Companhia espiritual contínua — a sintonia de vida no ar, dia e noite.",
  },
] as const;

const Sobre = () => (
  <Layout>
    {/* Hero — altura fixa 300px em todos os dispositivos */}
    <section className="relative overflow-hidden h-[300px]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/1280px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg')",
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
          src={logo}
          alt="Rádio Conexão Católica"
          className="h-14 sm:h-16 md:h-[72px] w-auto mb-2 sm:mb-3"
          style={{ filter: "drop-shadow(0 4px 24px rgba(0,100,255,0.35))" }}
        />
        <p className="text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.2em] uppercase text-yellow-400/90">
          Desde 5 de dezembro de 2013
        </p>
        <h1 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight max-w-3xl">
          Rádio Conexão Católica
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-white/75 max-w-xl px-2">
          A sintonia de vida no ar — web rádio católica da Zona Leste de São Paulo.
        </p>
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3 justify-center">
          <Link
            to="/contato"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
          >
            Fale conosco
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=br.webofus.rdioconexocatlica&hl=pt_BR"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border border-white/40 text-white hover:bg-white/10 transition"
          >
            Baixar o app
          </a>
        </div>
      </div>
    </section>

    {/* História + Missão (esquerda) | Cards (direita) */}
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 lg:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-14 items-stretch">
        <div className="md:col-span-1 lg:col-span-7">
          {/* Nossa história */}
          <span
            className="inline-block text-[11px] font-bold tracking-[0.1em] uppercase text-white px-3 py-1.5 rounded-md mb-4 leading-tight"
            style={{
              background: "linear-gradient(135deg, #004a99, #0066cc)",
              boxShadow: "0 4px 12px rgba(0, 74, 153, 0.25)",
            }}
          >
            Nossa História!
          </span>
          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-justify [&_p]:m-0">
            <p>
              A <strong className="text-foreground">Rádio Conexão Católica</strong> nasce a partir
              de um programa feito no ano de 2000, idealizado por{" "}
              <strong className="text-foreground">Aurélio Batista</strong>, com o propósito de
              evangelizar e levar a Palavra de Deus por meio da comunicação.
            </p>
            <p>
              O programa ia ao ar todos os domingos pela extinta{" "}
              <strong className="text-foreground">Rádio Conexão FM 98.4 MHZ</strong>, uma rádio até
              então denominada comunitária, mas que já exercia um importante papel social e
              espiritual junto aos seus ouvintes.
            </p>
            <p>
              O programa foi ao ar por 4 anos, sempre aos domingos, das 7h às 9h, conquistando
              espaço, credibilidade e criando uma conexão especial com o público, através da
              música, da informação e da evangelização.
            </p>
            <p>
              Anos depois, em 2010, na Caminhada da Ressurreição, a{" "}
              <strong className="text-foreground">Missão Nova Visão</strong> vem inovando com a
              transmissão via Internet, acompanhando a evolução dos meios de comunicação e
              ampliando significativamente o alcance da mensagem.
            </p>
            <p>
              Em 2012, a Missão deixa a transmissão do evento, encerrando um ciclo, mas abrindo
              caminho para novos projetos e iniciativas dentro da comunicação católica.
            </p>
            <p>
              Ainda em 2012, Aurélio Batista começa a fazer os testes visando a continuidade desse
              trabalho.
            </p>
            <p>
              Na Caminhada de 2013, faz uma transmissão experimental da Caminhada da Ressurreição,
              que deu certo, contando com a mesma equipe da Missão Nova Visão. Esse momento marcou
              um divisor de águas, consolidando um novo formato de evangelização digital.
            </p>
            <p>
              E em <strong className="text-foreground">05 de dezembro de 2013</strong>, o sinal
              entra no ar definitivamente, dando início oficialmente à Rádio Conexão Católica, um
              projeto sólido, inovador e totalmente voltado à missão de comunicar a fé.
            </p>
            <p>
              Fundada por Aurélio Batista, meses depois chega{" "}
              <strong className="text-foreground">Gabriela Del Vagem</strong>, fortalecendo ainda
              mais a equipe. Logo depois,{" "}
              <strong className="text-foreground">Roberto Pires</strong> também passa a integrar
              esse projeto, contribuindo para o crescimento e estruturação da rádio.
            </p>
            <p>
              Em 2019, a Rádio Conexão Católica é registrada como empresa jornalística e
              radiodifusora, sendo reconhecida como a primeira Rádio Católica na Web, tendo um
              quadro de sociedade formado por Aurélio Batista e{" "}
              <strong className="text-foreground">Leandro Gonçalves</strong>, consolidando sua
              presença no cenário da comunicação digital.
            </p>
            <p>
              Hoje, estamos no ar, mesmo com as dificuldades da pandemia, continuamos firmes na
              missão, informando, evangelizando e entretendo nossos ouvintes e seguidores, levando
              esperança e fé a todos os lares.
            </p>
            <p>
              Em 2024, uma nova fase se inicia, com a troca do quadro societário, onde sai Leandro
              Gonçalves e entram Roberto Pires e{" "}
              <strong className="text-foreground">Margarete Pires</strong>, tendo Aurélio Batista
              junto ao quadro societário, garantindo a continuidade da essência e dos valores que
              deram origem a essa missão.
            </p>
          </div>

          {/* Missão */}
          <span
            className="inline-block text-[11px] font-bold tracking-[0.1em] uppercase text-white px-3 py-1.5 rounded-md mb-3 mt-5 leading-tight"
            style={{
              background: "linear-gradient(135deg, #004a99, #0066cc)",
              boxShadow: "0 4px 12px rgba(0, 74, 153, 0.25)",
            }}
          >
            Nossa Missão
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight whitespace-nowrap mb-0">
            Comunicar a fé com tecnologia e coração
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0 mb-0 leading-relaxed text-justify">
            Usamos a internet para propagar valores cristãos, fortalecer a formação espiritual e
            divulgar as atividades das paróquias, pastorais, movimentos e comunidades da Diocese
            de São Miguel Paulista. Por meio da web rádio, aproximamos a mensagem do Evangelho de
            cada lar, com oração, música católica, informação e conteúdo que edificam a fé no
            dia a dia. Queremos ser ponte entre a Igreja e o povo — comunicando com clareza,
            proximidade e constância, para que ninguém fique sem ouvir a Boa Nova.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
            {PILARES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                  style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)" }}
                >
                  <Icon className="h-4 w-4 text-[#002266]" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-0">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-justify m-0">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="md:col-span-1 lg:col-span-5 flex flex-col gap-4 min-h-0 h-full">
          <div
            className="rounded-xl p-4 sm:p-5 text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #051230 0%, #0a2060 100%)",
              border: "1px solid rgba(200,168,75,0.35)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays className="h-5 w-5 text-yellow-400 shrink-0" />
              <h3 className="font-bold text-base sm:text-lg">Marco fundador</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-tight">
              05 / 12 / 2013
            </p>
            <p className="text-xs sm:text-sm text-white/70 mt-2">
              Fundação da Rádio Conexão Católica — Diocese de São Miguel Paulista, São Paulo.
            </p>
          </div>

          <div className="rounded-xl overflow-hidden border border-border bg-card shrink-0">
            <img
              src={baseRadio}
              alt="Estúdio da Rádio Conexão Católica"
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Em números
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div>
                <p className="text-lg sm:text-xl font-black text-primary">24h</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">No ar todo dia</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-black text-primary">10k+</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Ouvintes/mês</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-black text-primary">100%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Público católico</p>
              </div>
            </div>
          </div>

          <div className="shrink-0 min-h-[280px] lg:min-h-[320px]">
            <LojaCard />
          </div>

          {/* Preenche só o espaço restante até a linha da coluna esquerda */}
          <SobreProdutosCarousel />
        </aside>
      </div>
    </section>

    {/* Redes sociais */}
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12 md:pb-16 lg:pb-20">
      <div className="mb-6 sm:mb-8 max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Nossas redes
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
          Acompanhe a Conexão Católica
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed text-justify">
          Siga a rádio nas plataformas oficiais e fique por dentro da programação, lives e
          conteúdos de evangelização.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 sm:gap-4 rounded-lg border border-border bg-card px-4 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span
              className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-foreground">{s.name}</h3>
                <ExternalLink className="h-3.5 w-3.5 text-primary opacity-60 group-hover:opacity-100 shrink-0" />
              </div>
              <p className="text-xs text-primary/80 font-medium mt-0.5 truncate">{s.handle}</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-snug text-justify">{s.blurb}</p>
            </div>
          </a>
        ))}
      </div>
    </section>

    {/* Contato rápido */}
    <section
      className="border-t border-border"
      style={{
        background: "linear-gradient(90deg, #051230 0%, #0a2060 50%, #051230 100%)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              Quer falar com a rádio?
            </h2>
            <p className="text-sm sm:text-base text-white/70 mt-2 max-w-md">
              Pedidos de música, parcerias, orações e dúvidas — estamos prontos para ouvir você.
            </p>
            <Link
              to="/contato"
              className="inline-flex mt-4 sm:mt-5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#f5c518,#e8a800)", color: "#002266" }}
            >
              Ir para Contato
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4 text-sm break-words">
            <a
              href="https://wa.me/5511961605164"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/85 hover:text-yellow-400 transition"
            >
              <Phone className="h-4 w-4 shrink-0" />
              (11) 96160-5164
            </a>
            <a
              href="mailto:contato@radioconexaocatolica.com.br"
              className="flex items-center gap-3 text-white/85 hover:text-yellow-400 transition min-w-0"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">contato@radioconexaocatolica.com.br</span>
            </a>
            <p className="flex items-start sm:items-center gap-3 text-white/85">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
              São Paulo, SP — Diocese de São Miguel Paulista
            </p>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default Sobre;
