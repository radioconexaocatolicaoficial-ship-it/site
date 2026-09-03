import { useState } from "react";
import { ChevronLeft, ChevronRight, Images, MapPin, Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ultimosEventos, type Evento } from "@/data/ultimosEventos";

const UltimosEventos = () => {
  const [index, setIndex] = useState(0);
  const [textOpen, setTextOpen] = useState(false);
  const [fotosOpen, setFotosOpen] = useState(false);
  const [photo, setPhoto] = useState(0);

  const event = ultimosEventos[index];
  const max = ultimosEventos.length - 1;
  const thumbs = event.photos.slice(0, 8);

  const openFotos = (photoIndex = 0) => {
    setPhoto(Math.max(0, photoIndex));
    setFotosOpen(true);
  };

  return (
    <div className="h-full max-h-[720px] flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-foreground">Últimos eventos</h2>
        {ultimosEventos.length > 1 && (
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-colors"
              aria-label="Evento anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(max, i + 1))}
              disabled={index >= max}
              className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-colors"
              aria-label="Próximo evento"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <article className="flex-1 min-h-0 max-h-[720px] bg-card rounded-xl border border-border overflow-hidden flex flex-col lg:flex-row">
        <button
          type="button"
          onClick={() => openFotos(event.photos.indexOf(event.cover))}
          className="relative lg:w-[38%] aspect-video lg:aspect-auto lg:min-h-full overflow-hidden bg-muted shrink-0 text-left"
        >
          <img
            src={event.cover}
            alt={event.title}
            className="h-full w-full object-contain object-center bg-muted"
          />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            <Images className="h-3 w-3" />
            {event.photos.length} fotos
            {event.videos.length > 0 && (
              <>
                <Play className="h-3 w-3" />
                {event.videos.length} vídeos
              </>
            )}
          </span>
        </button>

        <div className="flex-1 min-w-0 p-4 flex flex-col min-h-0">
          <button
            type="button"
            onClick={() => setTextOpen(true)}
            className="flex-1 min-h-0 w-full text-left flex flex-col group"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {event.dateLabel}
            </p>
            <h3 className="mt-1 text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="mt-2 w-full overflow-hidden text-[13px] text-muted-foreground leading-relaxed line-clamp-[11]">
              {event.paragraphs.slice(0, 4).join(" ")}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {event.place}
            </p>
            <span className="mt-2 text-xs font-bold text-primary group-hover:underline">
              Clique para ler o texto completo →
            </span>
          </button>

          <div className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {thumbs.map((src, i) => {
              const extra = i === thumbs.length - 1 && event.photos.length > thumbs.length;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => openFotos(event.photos.indexOf(src))}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted hover:ring-2 hover:ring-primary"
                >
                  <img src={src} alt="" className="h-full w-full object-contain object-center" loading="lazy" />
                  {extra && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-bold text-white">
                      +{event.photos.length - thumbs.length}
                    </span>
                  )}
                </button>
              );
            })}
            {event.videos[0] && (
              <button
                type="button"
                onClick={() => openFotos(event.photos.length)}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-primary text-primary-foreground hover:ring-2 hover:ring-primary"
                aria-label="Ver vídeos"
              >
                <Play className="absolute inset-0 m-auto h-5 w-5" />
                <span className="absolute bottom-0.5 inset-x-0 text-[9px] font-bold">
                  {event.videos.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </article>

      <TextoDialog event={event} open={textOpen} onOpenChange={setTextOpen} />
      <FotosDialog
        event={event}
        open={fotosOpen}
        onOpenChange={setFotosOpen}
        photo={photo}
        setPhoto={setPhoto}
      />
    </div>
  );
};

function TextoDialog({
  event,
  open,
  onOpenChange,
}: {
  event: Evento;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-left pr-6">
          <DialogTitle className="text-base sm:text-lg leading-snug">{event.title}</DialogTitle>
          <DialogDescription>
            {event.dateLabel} · {event.place}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
          {event.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex items-center justify-center gap-2 self-end text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Fechar
        </button>
      </DialogContent>
    </Dialog>
  );
}

function FotosDialog({
  event,
  open,
  onOpenChange,
  photo,
  setPhoto,
}: {
  event: Evento;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: number;
  setPhoto: (n: number) => void;
}) {
  const media = [...event.photos, ...event.videos];
  const current = media[photo] ?? event.cover;
  const isVideo = current.endsWith(".mp4");
  const prev = () => setPhoto((photo - 1 + media.length) % media.length);
  const next = () => setPhoto((photo + 1) % media.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] w-auto max-h-[95vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader className="text-left pr-6">
          <DialogTitle className="text-base leading-snug">Fotos e vídeos do evento</DialogTitle>
          <DialogDescription>
            {event.title} · {photo + 1} de {media.length}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mx-auto flex h-[min(700px,70vh)] w-[min(700px,calc(100vw-3rem))] items-center justify-center rounded-xl bg-muted">
          {isVideo ? (
            <video
              key={current}
              src={current}
              controls
              playsInline
              className="max-h-full max-w-full object-contain object-center"
            />
          ) : (
            <img
              src={current}
              alt=""
              className="max-h-full max-w-full object-contain object-center"
            />
          )}
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 text-white hover:bg-black/75"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 text-white hover:bg-black/75"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
          {media.map((src, i) => {
            const video = src.endsWith(".mp4");
            return (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto(i)}
                className={`relative aspect-square overflow-hidden rounded-md border bg-muted ${
                  i === photo ? "ring-2 ring-primary border-primary" : "border-border"
                }`}
              >
                {video ? (
                  <>
                    <video src={`${src}#t=0.1`} muted preload="metadata" className="h-full w-full object-contain object-center" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Play className="h-4 w-4 text-white" />
                    </span>
                  </>
                ) : (
                  <img src={src} alt="" className="h-full w-full object-contain object-center" loading="lazy" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UltimosEventos;
