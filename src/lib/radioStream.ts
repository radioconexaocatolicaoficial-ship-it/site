/**
 * Stream e metadados HoostCast — Rádio Conexão Católica.
 * Usamos só o play/API; o visual continua o do site.
 */
export const HOOST_USERNAME = "ogvopund";
export const HOOST_BASE = "https://cast5.hoost.com.br";

/** Stream HTTPS (play). */
export const STREAM_URL = `${HOOST_BASE}:8195/stream`;

export const STATION_NAME = "Rádio Conexão Católica";
export const STATION_LOGO = `${HOOST_BASE}/stations/${HOOST_USERNAME}/logo`;
export const NOWPLAYING_URL = `${HOOST_BASE}/api/nowplaying/${HOOST_USERNAME}`;

export interface NowPlayingInfo {
  title: string;
  artist: string;
  album: string;
  cover: string;
  listeners: number;
}

interface HoostNowPlayingResponse {
  listeners?: { current?: number } | number;
  now_playing?: {
    song?: {
      title?: string;
      artist?: string;
      album?: string;
      cover?: string;
    };
  };
}

export async function fetchNowPlaying(): Promise<NowPlayingInfo> {
  try {
    const res = await fetch(NOWPLAYING_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`nowplaying ${res.status}`);
    const data = (await res.json()) as HoostNowPlayingResponse;
    const song = data.now_playing?.song;
    const listeners =
      typeof data.listeners === "object"
        ? data.listeners?.current || 0
        : typeof data.listeners === "number"
          ? data.listeners
          : 0;

    const title = (song?.title || "").trim();
    const artist = (song?.artist || "").trim();
    const display =
      title && artist ? `${artist} — ${title}` : title || artist || STATION_NAME;

    return {
      title: display,
      artist,
      album: (song?.album || "").trim(),
      cover: song?.cover || STATION_LOGO,
      listeners,
    };
  } catch {
    return {
      title: STATION_NAME,
      artist: "",
      album: "",
      cover: STATION_LOGO,
      listeners: 0,
    };
  }
}
