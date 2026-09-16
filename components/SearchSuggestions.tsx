"use client";

/**
 * Sugestões de busca "ao vivo" no cabeçalho: enquanto a pessoa digita,
 * sugerimos a coleção/marca que bate com o texto (ex.: "ray" -> "Rayban"),
 * alguns recortes dessa marca (masculino/feminino/promoção/mais vendidos —
 * só quando existe pelo menos 1 produto naquele recorte) e os 3 produtos
 * mais relevantes encontrados.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, Product } from "@/types/product";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type SuggestionTerm = { label: string; href: string };

export default function SearchSuggestions({ query, onNavigate }: { query: string; onNavigate?: () => void }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmed = query.trim();

  useEffect(() => {
    if (!hasSupabaseConfig || trimmed.length < 2) {
      setCollections([]);
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      const like = `%${trimmed}%`;
      const [{ data: collectionData }, { data: productData }] = await Promise.all([
        supabase.from("collections").select("*").ilike("name", like).order("sort_order", { ascending: true }).limit(5),
        supabase
          .from("products")
          .select("id,slug,name,brand,model,images,price,compare_at_price,gender,more_sold,featured,collection_slugs")
          .or(`name.ilike.${like},brand.ilike.${like},model.ilike.${like}`)
          .limit(30),
      ]);
      if (cancelled) return;
      setCollections((collectionData as Collection[]) ?? []);
      setProducts((productData as Product[]) ?? []);
      setLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  if (trimmed.length < 2 || (!loading && collections.length === 0 && products.length === 0)) return null;

  const matchedCollection = collections[0] ?? null;
  const matchedLabel = matchedCollection?.name ?? products[0]?.brand?.trim() ?? "";

  // Se achamos uma coleção/marca, restringe os produtos analisados a ela;
  // senão, usa os produtos já filtrados pelo texto digitado.
  const scopedProducts = matchedCollection
    ? products.filter((product) => (product.collection_slugs ?? []).includes(matchedCollection.slug))
    : products;

  // Usa o mesmo parâmetro "colecao" da faixa de marcas da home, para abrir a
  // mesma página com a logo da marca em destaque (banner) — antes usava
  // "marca", que é um filtro diferente e não ativa esse banner.
  const baseParams = matchedCollection ? `colecao=${matchedCollection.slug}` : trimmed ? `q=${encodeURIComponent(trimmed)}` : "";
  const withBase = (extra?: string) => `/produtos?${[baseParams, extra].filter(Boolean).join("&")}`;

  const hasMasculino = scopedProducts.some((product) => product.gender === "masculino");
  const hasFeminino = scopedProducts.some((product) => product.gender === "feminino");
  const hasPromocao = scopedProducts.some((product) => (product.compare_at_price ?? 0) > product.price);
  const hasMaisVendidos = scopedProducts.some((product) => product.more_sold);

  const terms: SuggestionTerm[] = [];
  if (matchedLabel) {
    terms.push({ label: matchedLabel, href: withBase() });
    if (hasMasculino) terms.push({ label: `${matchedLabel} masculino`, href: withBase("genero=masculino") });
    if (hasFeminino) terms.push({ label: `${matchedLabel} feminino`, href: withBase("genero=feminino") });
    if (hasPromocao) terms.push({ label: `${matchedLabel} promoção`, href: withBase("ordenar=ofertas") });
    if (hasMaisVendidos) terms.push({ label: `${matchedLabel} mais vendidos`, href: withBase("ordenar=mais-vendidos") });
  }

  // Os 3 produtos mostrados priorizam quem está em oferta, depois os mais
  // vendidos, depois destaques — só cai pros primeiros da lista se nenhum
  // produto tiver nenhuma dessas marcações.
  const rankedProducts = [...scopedProducts].sort((a, b) => {
    const score = (product: Product) => {
      const inOffer = (product.compare_at_price ?? 0) > product.price ? 3 : 0;
      const bestSeller = product.more_sold ? 2 : 0;
      const highlighted = product.featured ? 1 : 0;
      return inOffer + bestSeller + highlighted;
    };
    return score(b) - score(a);
  });
  const topProducts = rankedProducts.slice(0, 3);

  if (!loading && terms.length === 0 && topProducts.length === 0) return null;

  return (
    <div className="mt-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-4 shadow-soft">
      {loading && terms.length === 0 && topProducts.length === 0 && (
        <p className="font-body text-[13px] text-brand-ink/45">Buscando…</p>
      )}

      {terms.length > 0 && (
        <ul className="flex flex-col gap-1">
          {terms.map((term) => (
            <li key={term.label}>
              <Link
                href={term.href}
                onClick={onNavigate}
                className="block rounded-lg px-2 py-1.5 font-body text-[14px] text-brand-ink/75 transition-colors hover:bg-brand-gold/10 hover:text-brand-ink"
              >
                {term.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {topProducts.length > 0 && (
        <div className={terms.length > 0 ? "mt-4 border-t border-brand-ink/8 pt-4" : ""}>
          <div className="flex items-center justify-between">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/45">Principais resultados</p>
            <Link
              href={withBase()}
              onClick={onNavigate}
              className="rounded-full border border-brand-ink/15 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-ink"
            >
              Ver todos
            </Link>
          </div>

          <ul className="mt-3 flex flex-col gap-3">
            {topProducts.map((product) => {
              const hasDiscount = (product.compare_at_price ?? 0) > product.price;
              const discountPct = hasDiscount ? Math.round((1 - product.price / (product.compare_at_price as number)) * 100) : 0;
              const label = `${product.brand?.trim() ? `${product.brand.trim()} ` : ""}${product.model?.trim() || product.name}`.trim();
              return (
                <li key={product.id}>
                  <Link href={`/produtos/${product.slug}`} onClick={onNavigate} className="flex items-center gap-3">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-sage/40">
                      {hasDiscount && (
                        <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-brand-gold px-1.5 py-0.5 font-body text-[9px] font-bold text-brand-paper">
                          -{discountPct}%
                        </span>
                      )}
                      {product.images?.[0] && (
                        <Image src={product.images[0]} alt={product.name} fill sizes="56px" className="object-contain p-1.5 mix-blend-multiply" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-body text-[13px] font-medium text-brand-ink">{label}</span>
                      <span className="mt-0.5 flex items-center gap-2 font-body text-[13px]">
                        {hasDiscount && <span className="text-brand-ink/40 line-through">{formatBRL(product.compare_at_price as number)}</span>}
                        <span className="font-semibold text-brand-ink">{formatBRL(product.price)}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
