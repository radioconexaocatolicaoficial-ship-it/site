import { useState, useEffect } from "react";
import { X, MapPin, Clock, Bus, Church } from "lucide-react";
import "./CaminhadaPopup.css";

const POPUP_EXPIRY = new Date("2026-04-05T00:00:00-03:00");

interface Paroquia {
  nome: string;
  endereco: string;
  horario: string;
}

const PAROQUIAS: Paroquia[] = [
  { nome: "São Marcos", endereco: "R. Jacareana, 87 - Jardim Camargo Novo, São Paulo - SP, 08121-425", horario: "22h30" },
  { nome: "São Pedro", endereco: "R. Moisés Marx, 848 - Vila Aricanduva, São Paulo - SP, 03507-000", horario: "22h30" },
  { nome: "Jesus de Nazaré", endereco: "R. Frei Fabiano de Cristo, 220 - Jardim Senice, São Paulo - SP, 08150-545", horario: "21h30" },
  { nome: "Paróquia de São Joaquim", endereco: "Rua Freguesia de São Romão, 620 - Jardim Helena, São Paulo - SP, 08180-150", horario: "21h30" },
  { nome: "Paróquia Sagrada Família", endereco: "R. Lourenço Franco do Prado, 04 - Jardim Nélia, São Paulo - SP, 08142-230", horario: "22h00" },
  { nome: "São Benedito", endereco: "Rua Salvador Gianetti, 762, R. Hipólito de Camargo, 398, São Paulo - SP, 08410-000", horario: "22h00" },
  { nome: "Senhor Santo Cristo", endereco: "R. dos Têxteis, 653 - Chácara Santa Etelvina, São Paulo - SP, 08490-582", horario: "22h00" },
  { nome: "São Sebastião", endereco: "R. Erva Prata, 366 - Vila Progresso (Zona Leste), São Paulo - SP, 08240-620", horario: "22h00" },
  { nome: "Nossa Sra. das Graças — Setor Itaquera", endereco: "Rua Morro dos Olhos D'Água, S/Nº - Jardim Copa, CEP: 08270-300", horario: "22h00" },
  { nome: "São José — Setor São Miguel", endereco: "R. Erva de Goiabeira, 101 - Jardim Lajeado, São Paulo - SP, 08041-780", horario: "22h30" },
  { nome: "Santa Verônica", endereco: "Rua Nascer do Sol, 391 - Conj. Hab. Santa Etelvina II, São Paulo - SP, 08485-020", horario: "22h00" },
  { nome: "São José", endereco: "R. Severino Souto Maior, 58 - Cidade Tiradentes, São Paulo - SP, 08471-780", horario: "22h00" },
  { nome: "São Paulo Apóstolo — Guaianases", endereco: "Rua José Higino Neves, 1075 - Jardim São Paulo, CEP: 08461-650 - São Paulo - SP", horario: "22h00" },
  { nome: "Nossa Sra. Aparecida — União de Vila Nova", endereco: "R. Santa Catarina, 351-363 - Vila Nova União, São Paulo - SP, 08072-290", horario: "22h40" },
  { nome: "Bom Jesus das Oliveiras", endereco: "R. Antônio D'Amin, 47 - Jardim das Oliveiras, São Paulo - SP, 08122-190", horario: "22h00" },
  { nome: "De São Pedro Apóstolo", endereco: "Av. Antônio Louzada Antunes, 424 - Jardim Pedro Nunes, 08061-000", horario: "22h00" },
  { nome: "De São Paulo Apóstolo", endereco: "Rua Marco Antonio Setti, 665-695 - Cidade Kemel, 08130-230", horario: "22h00" },
];

const CaminhadaPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (new Date() < POPUP_EXPIRY) {
      setOpen(true);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };

  if (!open) return null;

  return (
    <div
      className="caminhada-popup-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Informações da Caminhada da Ressurreição"
    >
      <div
        className="caminhada-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="caminhada-popup__header">
          <div className="caminhada-popup__header-content">
            <div className="caminhada-popup__header-icon">
              <Bus size={28} />
            </div>
            <div>
              <h2 className="caminhada-popup__title">
                🚌 Saída dos Ônibus
              </h2>
              <p className="caminhada-popup__subtitle">
                42ª Caminhada da Ressurreição 2026 — "Eu vi o Senhor"
              </p>
              <p className="caminhada-popup__date-info">
                Sábado, 4 de abril de 2026 · Concentração na Basílica N. S. da Penha
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="caminhada-popup__close"
            aria-label="Fechar popup"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="caminhada-popup__body">
          <div className="caminhada-popup__list">
            {PAROQUIAS.map((p, i) => (
              <div key={i} className="caminhada-popup__item">
                <div className="caminhada-popup__item-header">
                  <Church size={14} className="caminhada-popup__item-icon" />
                  <span className="caminhada-popup__item-name">{p.nome}</span>
                  <span className="caminhada-popup__item-time">
                    <Clock size={12} />
                    {p.horario}
                  </span>
                </div>
                <div className="caminhada-popup__item-address">
                  <MapPin size={12} className="caminhada-popup__address-icon" />
                  <span>{p.endereco}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="caminhada-popup__footer">
          <p className="caminhada-popup__footer-text">
            Procure o ônibus da sua paróquia e embarque para a concentração na Basílica N. S. da Penha!
          </p>
          <button onClick={handleClose} className="caminhada-popup__btn">
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaminhadaPopup;
