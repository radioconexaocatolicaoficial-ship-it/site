import { useState, useEffect } from "react";

export interface RssItem {
  title: string;
  desc: string;
  img: string;
  link: string;
}

const PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

function extractImg(item: Element, fallback: string): string {
  const media = item.querySelector("thumbnail, content, enclosure");
  if (media) {
    const url = media.getAttribute("url") || media.getAttribute("src");
    if (url) return url;
  }
  const desc = item.querySelector("description")?.textContent || "";
  const match = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];
  return fallback;
}

export function useRssFeed(feedUrl: string, fallback: RssItem[], limit = 6) {
  const [items, setItems] = useState<RssItem[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      for (const proxy of PROXIES) {
        try {
          const res = await fetch(proxy(feedUrl), { signal: AbortSignal.timeout(8000) });
          if (!res.ok) continue;
          const text = res.url.includes("allorigins")
            ? (await res.json()).contents
            : await res.text();
          const doc = new DOMParser().parseFromString(text, "text/xml");
          const entries = Array.from(doc.querySelectorAll("item, entry")).slice(0, limit);
          if (!entries.length) continue;
          const parsed: RssItem[] = entries.map(e => ({
            title: e.querySelector("title")?.textContent?.trim() || "",
            desc: (e.querySelector("description, summary")?.textContent || "").replace(/<[^>]+>/g, "").trim().slice(0, 200),
            img: extractImg(e, fallback[0]?.img || ""),
            link: e.querySelector("link")?.textContent?.trim() || e.querySelector("link")?.getAttribute("href") || feedUrl,
          })).filter(i => i.title);
          if (parsed.length) { setItems(parsed); break; }
        } catch { /* try next */ }
      }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [feedUrl]);

  return { items, loading };
}
