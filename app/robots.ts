import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oticaliderbrasil.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Páginas de administração e de conta não têm valor de busca e não
        // devem aparecer no Google — além de ser uma boa prática de segurança
        // não sinalizar publicamente onde fica o painel de admin.
        disallow: ["/admin", "/admin/", "/conta/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
