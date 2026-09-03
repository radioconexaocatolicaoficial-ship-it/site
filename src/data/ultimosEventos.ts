export type Evento = {
  id: string;
  title: string;
  place: string;
  dateLabel: string;
  excerpt: string;
  cover: string;
  photos: string[];
  videos: string[];
  paragraphs: string[];
};

const divinaPhotos = Array.from({ length: 46 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/eventos/divina-providencia/${n}.jpg`;
});

const divinaVideos = Array.from({ length: 9 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/eventos/divina-providencia/v${n}.mp4`;
});

export const ultimosEventos: Evento[] = [
  {
    id: "divina-providencia-cancao-nova-sp",
    title: "Dia da Divina Providência reúne fé, música e alegria na Canção Nova São Paulo",
    place: "Canção Nova São Paulo",
    dateLabel: "São Paulo (SP)",
    excerpt:
      "Celebração de fé, oração e música, com o aniversário de um ano da Rádio Canção Nova FM 85,9. A Rádio Conexão Católica esteve presente.",
    cover: "/eventos/divina-providencia/32.jpg",
    photos: divinaPhotos,
    videos: divinaVideos,
    paragraphs: [
      "São Paulo (SP) — Um dia marcado pela fé, espiritualidade, música e muita alegria. Assim foi a celebração do Dia da Divina Providência, realizada na Canção Nova São Paulo, que também contou com uma programação especial em sintonia com o Projeto Dai-me Almas.",
      "O encontro reuniu fiéis em um momento de oração, louvor e evangelização, proporcionando uma experiência de fé e comunhão para todos os participantes.",
      "A programação também teve um motivo especial para celebrar: o aniversário de um ano da Rádio Canção Nova FM 85,9 em São Paulo, marcando um importante momento na presença da emissora na capital paulista.",
      "Durante o dia, os participantes puderam acompanhar uma programação diversificada, com momentos de oração, música, reflexão e espiritualidade.",
      "Entre os destaques estiveram o programa “Amor Vencerá”, com Antonieta; “Juntos Somos Mais”, com Cris Rocha; o Terço da Misericórdia, conduzido por Elza; e o Terço Mariano, com Juliana.",
      "A programação contou ainda com a participação do Padre Gilberto Duarte, conhecido carinhosamente como Padre Gilbertinho, sacerdote e missionário da Comunidade Canção Nova, que conduziu momentos de espiritualidade, oração e reflexão.",
      "Também esteve presente Djanira Silva, representando a Rádio Canção Nova FM, contribuindo para a programação especial realizada na capital paulista.",
      "A Rádio Conexão Católica também esteve presente neste dia tão especial, prestigiando a missão da Canção Nova em São Paulo e acompanhando de perto esse importante momento de evangelização e celebração.",
      "A presença da Rádio Conexão Católica reforça seu compromisso com a comunicação a serviço da fé e com a divulgação das iniciativas de evangelização realizadas pela Igreja e pelas comunidades católicas.",
      "Durante o encontro, a emissora acompanhou a programação e registrou os momentos de oração, espiritualidade, música e confraternização, celebrando junto com os participantes a caminhada da Canção Nova na capital paulista.",
      "A participação também representa uma aproximação entre os meios de comunicação católicos, que têm como missão utilizar o rádio, a internet e as novas tecnologias para levar a Palavra de Deus, informar, evangelizar e aproximar as pessoas da vida da Igreja.",
      "O Dia da Divina Providência foi uma oportunidade para os fiéis renovarem a confiança em Deus e agradecerem pelas bênçãos recebidas. A espiritualidade esteve presente durante toda a programação, unindo oração, música e momentos de convivência.",
      "A celebração também reforçou a missão evangelizadora da Canção Nova e sua presença na cidade de São Paulo, utilizando os meios de comunicação para levar a Palavra de Deus e uma mensagem de esperança às famílias.",
      "O aniversário de um ano da Rádio Canção Nova FM 85,9 tornou o momento ainda mais significativo, celebrando uma trajetória de comunicação e evangelização por meio do rádio.",
      "Para a Rádio Conexão Católica, estar presente nesse momento foi uma oportunidade de prestigiar e valorizar a missão da Canção Nova em São Paulo, reconhecendo a importância da comunicação católica na construção de uma sociedade mais próxima de Deus e dos valores do Evangelho.",
      "Com fé, música, oração e alegria, o Dia da Divina Providência na Canção Nova São Paulo ficou marcado como um momento especial de encontro com Deus, fraternidade e celebração da missão evangelizadora da Canção Nova na capital paulista.",
      "A Rádio Conexão Católica esteve presente para celebrar, prestigiar e testemunhar esse momento de fé, reafirmando sua missão de conectar corações a Deus por meio da comunicação e da evangelização.",
    ],
  },
];
