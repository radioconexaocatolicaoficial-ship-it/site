import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_OG_IMAGE,
  PAGE_SEO,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  resolvePageSeo,
} from "@/lib/seo";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${extra?.hreflang ? `[hreflang="${extra.hreflang}"]` : ""}`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
    }
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Atualiza title, meta, canonical e JSON-LD a cada rota (SPA). */
const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolvePageSeo(pathname);
    const url = absoluteUrl(seo.path === "/" ? "/" : seo.path);
    const title = seo.title;
    const description = seo.description;

    document.title = title;
    document.documentElement.lang = "pt-BR";

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", seo.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    upsertMeta("name", "googlebot", seo.noindex ? "noindex" : "index, follow");
    upsertMeta("name", "bingbot", seo.noindex ? "noindex" : "index, follow");
    if (seo.keywords) upsertMeta("name", "keywords", seo.keywords);
    upsertMeta("name", "author", SITE_NAME);
    upsertMeta("name", "publisher", SITE_NAME);
    upsertMeta("name", "theme-color", "#0a2060");
    upsertMeta("name", "geo.region", "BR-SP");
    upsertMeta("name", "geo.placename", "São Paulo");
    upsertMeta("name", "language", "Portuguese");
    upsertMeta("name", "revisit-after", "3 days");

    upsertMeta("property", "og:type", seo.type || "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "pt_BR");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);
    upsertMeta("property", "og:image:alt", `${SITE_NAME} — ${seo.title}`);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);

    upsertLink("canonical", url);
    upsertLink("alternate", url, { hreflang: "pt-BR" });
    upsertLink("alternate", url, { hreflang: "x-default" });

    upsertJsonLd("seo-org", {
      "@context": "https://schema.org",
      "@type": "RadioStation",
      "@id": `${SITE_URL}/#radiostation`,
      name: SITE_NAME,
      alternateName: ["Web Rádio Conexão Católica", "Conexão Católica"],
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      image: DEFAULT_OG_IMAGE,
      description:
        "Web rádio católica 24 horas. Evangelização, música católica, oração e notícias da Igreja na Diocese de São Miguel Paulista e no Litoral (Baixada Santista).",
      foundingDate: "2013-12-05",
      email: "contato@radioconexaocatolica.com.br",
      address: {
        "@type": "PostalAddress",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR",
      },
      areaServed: ["São Paulo", "Baixada Santista", "Brasil"],
      sameAs: [
        "https://www.instagram.com/radioconexaocatolicaoficial/",
        "https://www.facebook.com/radioconexaocatolicaofical",
        "https://www.youtube.com/@radioconexaocatolicaofical",
        "https://www.tiktok.com/@radioconexaocatolica",
        "https://www.instagram.com/radioconexaocatolicalitoral/",
      ],
      potentialAction: {
        "@type": "ListenAction",
        target: SITE_URL,
      },
    });

    upsertJsonLd("seo-website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: PAGE_SEO["/"].description,
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE_URL}/#radiostation` },
      dateModified: "2026-07-23",
    });

    upsertJsonLd("seo-webpage", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#radiostation` },
      inLanguage: "pt-BR",
      dateModified: "2026-07-23",
    });
  }, [pathname]);

  return null;
};

export default Seo;
