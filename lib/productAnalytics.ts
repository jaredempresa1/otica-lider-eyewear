import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";

export function trackProductClick(product: { id: string; slug: string; name: string }) {
  if (!hasSupabaseConfig) return;
  void supabase.from("product_clicks").insert({ product_id: product.id, product_slug: product.slug, product_name: product.name });
}
