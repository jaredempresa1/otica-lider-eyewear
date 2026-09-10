import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, Product } from "@/types/product";
import ProductGrid from "@/components/ProductGrid";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFilters from "@/components/QuickFilters";
import ProductSearch from "@/components/ProductSearch";
import { applyQuickFilter, filterProducts, parseFilterState } from "@/lib/filters";

export const revalidate = 60;

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: { colecao?: string; q?: string; genero?: string; marca?: string; cor?: string; formato?: string; ia?: string; precoMin?: string; precoMax?: string; ordenar?: string };
}) {
  const colecao = searchParams?.colecao;
  let products: Product[] = [];
  let collections: Collection[] = [];
  let activeCollection: Collection | null = null;

  if (hasSupabaseConfig) {
    const [{ data }, { data: collectionData }, collectionResult] = await Promise.all([
      // A "coleção inteira" sempre vem direto da tabela products (1 linha por
      // produto), então mesmo que um óculos esteja em 2 coleções ele nunca
      // aparece duplicado aqui.
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
      colecao ? supabase.from("collections").select("*").eq("slug", colecao).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    products = (data as Product[]) ?? [];
    collections = (collectionData as Collection[]) ?? [];
    activeCollection = (collectionResult?.data as Collection | null) ?? null;
  }

  const collectionScopedProducts = colecao ? products.filter((product) => (product.collection_slugs ?? []).includes(colecao)) : products;

  const filterState = parseFilterState(searchParams ?? {});
  const hasActiveFilters = filterState.busca.length > 0 || filterState.genero.length > 0 || filterState.marca.length > 0 || filterState.cor.length > 0 || filterState.formato.length > 0 || filterState.ia || filterState.precoMin !== null || filterState.precoMax !== null;
  const visibleProducts = applyQuickFilter(filterProducts(collectionScopedProducts, filterState), searchParams?.ordenar);

  return (
    <main className="section-shell py-10 sm:py-14">
      {activeCollection?.image_url && <div className="mb-8 relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-ink"><img src={activeCollection.image_url} alt={activeCollection.name} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 to-transparent" /><h2 className="absolute bottom-4 left-5 font-heading text-2xl font-semibold text-brand-paper sm:bottom-6 sm:left-8 sm:text-4xl">{activeCollection.name}</h2></div>}
      <Link href="/" className="mb-6 inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink transition-colors hover:text-brand-gold sm:hidden">
        <ArrowLeft size={14} /> Voltar para o início
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {activeCollection ? (
            <>
              <p className="eyebrow">Coleção</p>
              <h1 className="section-title mt-2">{activeCollection.name}</h1>
              <Link href="/produtos" className="text-link mt-4 inline-flex">
                Ver coleção completa <span aria-hidden="true">↗</span>
              </Link>
            </>
          ) : (
            <>
              <p className="eyebrow">A coleção inteira</p>
              <h1 className="section-title mt-2">Óculos de sol para ver e ser visto</h1>
            </>
          )}
        </div>
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {!colecao && !hasActiveFilters && <ProductSearch />}
        <Suspense fallback={<div className="h-10 w-24 rounded-full bg-brand-paper" />}>
          <FilterDrawer products={collectionScopedProducts} collections={collections} />
        </Suspense>
        <Suspense fallback={null}>
          <QuickFilters />
        </Suspense>
      </div>
      <ProductGrid
        products={visibleProducts}
        emptyMessage={hasActiveFilters ? { title: "Nenhum modelo encontrado.", description: "Ainda não há óculos cadastrados para esse filtro. Tente outro filtro ou veja a coleção completa." } : undefined}
      />
    </main>
  );
}
