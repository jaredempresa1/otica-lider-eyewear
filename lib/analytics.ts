/**
 * Rastreamento de cliques em produtos.
 *
 * Cada vez que a página de um produto é aberta, registramos uma linha na
 * tabela `product_clicks` do Supabase. O dashboard usa isso para montar o
 * ranking "Produtos mais clicados" (veja app/admin/dashboard/page.tsx).
 *
 * IMPORTANTE: a tabela precisa existir no Supabase antes de usar. Rode isto
 * uma vez no SQL Editor do projeto:
 *
 *   create table if not exists product_clicks (
 *     id uuid primary key default gen_random_uuid(),
 *     product_id uuid not null,
 *     product_slug text not null,
 *     product_name text not null,
 *     created_at timestamptz not null default now()
 *   );
 *
 *   alter table product_clicks enable row level security;
 *
 *   create policy "Permitir inserção pública de cliques"
 *     on product_clicks for insert to anon with check (true);
 *
 *   create policy "Permitir leitura autenticada de cliques"
 *     on product_clicks for select to authenticated using (true);
 *
 * (mesmo padrão de acesso já usado pela tabela `leads`: qualquer visitante
 * pode inserir, só o admin logado consegue ler.)
 */

import { supabase, hasSupabaseConfig } from "./supabaseClient";

export async function registerProductClick(product: { id: string; slug: string; name: string }) {
  if (!hasSupabaseConfig || !product.id) return;
  try {
    await supabase.from("product_clicks").insert({
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
    });
  } catch {
    // Falha silenciosa: o rastreamento nunca pode travar a navegação do cliente.
  }
}
