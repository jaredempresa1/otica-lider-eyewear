import type { MetadataRoute } from "next";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oticaliderbrasil.com.br";

// O Google usa esse arquivo como um "mapa" do site: em vez de precisar
// descobrir cada produto clicando em links, ele recebe a lista pronta.
// Isso acelera bastante a indexação, principalmente logo após o lançamento.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/produtos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/politica-de-garantia`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/politica-de-privacidade`, changeFrequency: "monthly", priority: 0.3 },
  ];

  if (!hasSupabaseConfig) {
    return staticRoutes;
  }

  const [{ data: products }, { data: collections }] = await Promise.all([
    supabase.from("products").select("slug, created_at"),
    supabase.from("collections").select("slug"),
  ]);

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
    url: `${SITE_URL}/produtos/${product.slug}`,
    lastModified: product.created_at ? new Date(product.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = (collections ?? []).map((collection) => ({
    url: `${SITE_URL}/produtos?colecao=${collection.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
