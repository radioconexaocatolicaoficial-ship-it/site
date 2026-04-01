import { useState, useEffect } from "react";

export interface RssItem {
  title: string;
  link: string;
  description: string;
  thumbnail: string;
  pubDate: string;
}

// Proxies CORS em ordem de preferência
const PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.cors.lol/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

async function fetchRss(url: string, count = 8): Promise<RssItem[]> {
  let lastError: unknown;

  for (const makeProxy of PROXIES) {
    try {
      const res = await fetch(makeProxy(url), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;

      // codetabs retorna XML direto; allorigins retorna JSON com .contents
      const text = await res.text();
      let xmlText = text;
      try {
        const json = JSON.parse(text);
        if (json.contents) xmlText = json.contents;
      } catch { /* já é XML */ }

      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "text/xml");
      const items = Array.from(xml.querySelectorAll("item")).slice(0, count);
      if (items.length === 0) continue;

      return items.map((item) => {
        const title = item.querySelector("title")?.textContent?.trim() ?? "";
        const link = item.querySelector("link")?.textContent?.trim() ?? "";
        const description = item.querySelector("description")?.textContent
          ?.replace(/<[^>]+>/g, "").trim().slice(0, 300) ?? "";
        const pubDate = item.querySelector("pubDate")?.textContent?.trim() ?? "";
        const mediaContent = item.getElementsByTagNameNS("*", "content")[0];
        const enclosure = item.querySelector("enclosure");
        const thumbnail = mediaContent?.getAttribute("url") || enclosure?.getAttribute("url") || "";
        return { title, link, description, thumbnail, pubDate };
      });
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError ?? new Error("Todos os proxies falharam");
}

export function useRssFeed(url: string, count = 8, refreshMs = 5 * 60 * 1000) {
  const cacheKey = `rss_cache_${url}`;
  
  const [items, setItems] = useState<RssItem[]>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? false : true;
    } catch {
      return true;
    }
  });

  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchRss(url, count);
        if (!cancelled) {
          setItems(data);
          setError(false);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch { /* ignore */ }
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
  }, [url, count, refreshMs, cacheKey]);

  return { items, loading, error };
}
