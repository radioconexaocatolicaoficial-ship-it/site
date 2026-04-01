/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Opcional: feed RSS do Instagram (rss.app etc.) — prioridade sobre o HTML do perfil; itens ordenados por data (mais recentes primeiro). */
  readonly VITE_INSTAGRAM_RSS_URL?: string;
  readonly VITE_RSS2JSON_API_KEY?: string;
}
