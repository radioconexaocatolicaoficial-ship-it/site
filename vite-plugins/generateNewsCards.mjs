/**
 * Gera public/news-cards.json para deploy estático.
 * node vite-plugins/generateNewsCards.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const FEEDS = [
  { badge: "Música Católica", feeds: ["https://musica.cancaonova.com/feed/"] },
  { badge: "Canção Nova", feeds: ["https://noticias.cancaonova.com/feed/"] },
  {
    badge: "Trânsito em tempo real SP",
    feeds: [
      "https://feeds.folha.uol.com.br/cotidiano/rss091.xml",
      "https://news.google.com/rss/search?q=tr%C3%A1nsito+S%C3%A3o+Paulo+when:2d&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    ],
    hrefOverride: "https://www.waze.com/pt-BR/live-map/",
    trafficFilter: true,
  },
  {
    badge: "Esportes",
    feeds: [
      "https://www.gazetaesportiva.com/feed/",
      "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=pt-BR&gl=BR&ceid=BR:pt-419",
    ],
  },
];

const SANTO_URL = "https://santo.cancaonova.com/";

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    signal: AbortSignal.timeout(14000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  let text = buf.toString("utf8");
  // Feeds da Folha às vezes vêm em latin1
  if (text.includes("\uFFFD")) text = buf.toString("latin1");
  return text;
}

function decodeXml(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html) {
  return decodeXml(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function upgradeImg(url) {
  return url.replace(/&amp;/g, "&").replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp|gif))/i, "").trim();
}

function isJunk(url) {
  return /logo|icon|spacer|pixel|1x1|favicon|avatar|badge|sprite|tracking|unsplash|gstatic\.com\/gnews|google_news_/i.test(url);
}

function unwrapLink(url) {
  const u = decodeXml(url).trim();
  const folha = u.match(/\*(https?:\/\/www1\.folha\.uol\.com\.br\/[^\s]+)/i);
  if (folha) return folha[1];
  const emb = u.match(/\*(https?:\/\/[^\s]+)/i);
  if (emb) return emb[1];
  return u;
}

function meta(html, prop) {
  const re1 = new RegExp(`property=["']${prop}["']\\s+content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`content=["']([^"']+)["']\\s+property=["']${prop}["']`, "i");
  const re3 = new RegExp(`name=["']${prop}["']\\s+content=["']([^"']+)["']`, "i");
  return decodeXml(re1.exec(html)?.[1] || re2.exec(html)?.[1] || re3.exec(html)?.[1] || "");
}

function parseItems(xml) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  const out = [];
  for (const block of blocks) {
    const title = stripTags(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(block)?.[1] || "");
    let link =
      /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block)?.[1]?.trim() ||
      /<link[^>]+href=["']([^"']+)["']/i.exec(block)?.[1] ||
      "";
    link = unwrapLink(link);
    const description =
      /<description[^>]*>([\s\S]*?)<\/description>/i.exec(block)?.[1] ||
      /<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i.exec(block)?.[1] ||
      "";
    const pubDate = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i.exec(block)?.[1] || "";
    let image =
      /enclosure[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ||
      /media:content[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ||
      /media:thumbnail[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ||
      "";
    if (!image) {
      const imgTag = /<img[^>]+(?:src|data-src)=["'](https?:\/\/[^"']+)["']/i.exec(decodeXml(description));
      if (imgTag) image = imgTag[1];
    }
    image = image ? upgradeImg(decodeXml(image)) : "";
    if (image && isJunk(image)) image = "";
    if (!title || !link) continue;
    out.push({
      title: title.replace(/\s+-\s+[^-]+$/, "").trim(),
      link,
      description: stripTags(description).slice(0, 160),
      pubDate,
      image,
    });
  }
  return out;
}

async function fetchOgImage(articleUrl) {
  if (!articleUrl || /news\.google\.com/i.test(articleUrl)) return "";
  try {
    const html = await fetchText(articleUrl);
    const og = meta(html, "og:image") || meta(html, "twitter:image");
    if (og && /^https?:\/\//i.test(og) && !isJunk(og)) return upgradeImg(og);
  } catch {}
  return "";
}

function isTraffic(title, desc) {
  return /tr[áa]nsito|engarrafamento|marginal|rodovia|avenida|pista|sem[áa]foro|guinch|ciclista|ciclomotor|motot[áa]xi|acidente|interdit|cet-?sp|congestionamento|[oô]nibus|metr[oô]/i.test(
    `${title} ${desc}`,
  );
}

async function resolveFeedCard(def) {
  for (const feedUrl of def.feeds) {
    try {
      let items = parseItems(await fetchText(feedUrl));
      if (!items.length) continue;
      items.sort((a, b) => (Date.parse(b.pubDate || "") || 0) - (Date.parse(a.pubDate || "") || 0));
      if (def.trafficFilter) {
        const filtered = items.filter((it) => isTraffic(it.title, it.description));
        if (filtered.length) items = filtered;
        else continue;
      }
      items = [...items].sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
      for (const it of items.slice(0, 8)) {
        if (/youtube\.com|youtu\.be/i.test(it.link)) continue;
        if (
          def.trafficFilter &&
          /tempo seco|frente fria|previs[aã]o|chuva|calor|temperatur/i.test(it.title) &&
          !/tr[áa]nsito|engarrafamento|guinch|acidente|interdit/i.test(`${it.title} ${it.description}`)
        ) {
          continue;
        }
        let image = it.image;
        const og = await fetchOgImage(it.link);
        if (og) {
          if (!image || /-\d{2,3}x\d{2,3}\./i.test(image)) image = og;
          else {
            try {
              const ha = new URL(image).hostname.split(".").slice(-2).join(".");
              const hb = new URL(og).hostname.split(".").slice(-2).join(".");
              if (ha === hb) image = og;
            } catch {
              image = og;
            }
          }
        }
        if (!image || isJunk(image)) continue;
        return {
          badge: def.badge,
          title: it.title.slice(0, 120),
          subtitle: (it.description || it.title).slice(0, 120),
          href: def.hrefOverride || it.link,
          image,
        };
      }
    } catch {}
  }
  return null;
}

async function resolveSanto() {
  try {
    const home = await fetchText(SANTO_URL);
    const now = new Date();
    const dia = now.getDate();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const ano = now.getFullYear();
    const dayRe = new RegExp(
      `href=["'](https:\\/\\/santo\\.cancaonova\\.com\\/santo\\/[^"']*sDia=${dia}&sMes=${mes}&sAno=${ano}[^"']*)["']`,
      "i",
    );
    const dayLink = dayRe.exec(home)?.[1] || SANTO_URL;
    let html = home;
    if (dayLink !== SANTO_URL) {
      try {
        html = await fetchText(dayLink);
      } catch {}
    }
    let title = meta(html, "og:title");
    if (!title || /^canção nova/i.test(title)) {
      title = stripTags(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] || "");
    }
    const image = meta(html, "og:image") || meta(html, "twitter:image");
    if (!title || !image || isJunk(image)) return null;
    return {
      badge: "Santo do Dia",
      title: title.slice(0, 120),
      subtitle: (meta(html, "og:description") || "Santo celebrado hoje").slice(0, 120),
      href: dayLink,
      image: upgradeImg(image),
    };
  } catch {
    return null;
  }
}

async function main() {
  const [musica, noticias, transito, santo, esportes] = await Promise.all([
    resolveFeedCard(FEEDS[0]),
    resolveFeedCard(FEEDS[1]),
    resolveFeedCard(FEEDS[2]),
    resolveSanto(),
    resolveFeedCard(FEEDS[3]),
  ]);
  const cards = [musica, noticias, transito, santo, esportes].filter((c) => c && c.image);
  const out = resolve(__dirname, "../public/news-cards.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    JSON.stringify({ ok: true, generatedAt: new Date().toISOString(), cards }, null, 2),
    "utf8",
  );
  console.log(`OK ${cards.length} cards → ${out}`);
  for (const c of cards) console.log(` - ${c.badge}: ${c.title.slice(0, 70)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
