import { useState, useEffect } from "react";

export interface RssItem {
  title: string;
  link: string;
  description: string;
  thumbnail: string;
  pubDate: string;
}

// Usa allorigins como proxy CORS para parsear RSS diretamente no browser
async function fetchRss(url: string, count = 8): Promise<RssItem[]> {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error("Falha ao buscar RSS");
  const data = await res.json();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, "text/xml");
  const items = Array.from(xml.querySelectorAll("item")).slice(0, count);

  return items.map((item) => {
    const title = item.querySelector("title")?.textContent?.trim() ?? "";
    const link = item.querySelector("link")?.textContent?.trim() ?? "";
    const description = item.querySelector("description")?.textContent
      ?.replace(/<[^>]+>/g, "").trim().slice(0, 300) ?? "";
    const pubDate = item.querySelector("pubDate")?.textContent?.trim() ?? "";

    // Tenta pegar imagem de media:content, enclosure ou og dentro da descrição
    const mediaContent = item.getElementsByTagNameNS("*", "content")[0];
    const enclosure = item.querySelector("enclosure");
    const thumbnail =
      mediaContent?.getAttribute("url") ||
      enclosure?.getAttribute("url") ||
      "";

    return { title, link, description, thumbnail, pubDate };
  });
}

export function useRssFeed(url: string, count = 8, refreshMs = 5 * 60 * 1000) {
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchRss(url, count);
        if (!cancelled) {
          setItems(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [url, count, refreshMs]);

  return { items, loading, error };
}
