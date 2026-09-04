import Link from "next/link";
import { Suspense } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, Product } from "@/types/product";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductGrid from "@/components/ProductGrid";
import CollectionTiles from "@/components/CollectionTiles";
import Testimonials from "@/components/Testimonials";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFilters from "@/components/QuickFilters";
import { applyQuickFilter, filterProducts, parseFilterState } from "@/lib/filters";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { genero?: string; marca?: string; cor?: string; precoMin?: string; precoMax?: string; ordenar?: string };
}) {
  let products: Product[] = [];
  let testimonials: Array<{ id: string; author_name: string; content: string }> = [];
  let collections: Collection[] = [];

  if (hasSupabaseConfig) {
    const [{ data: productData }, { data: testimonialData }, { data: collectionData }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
    ]);
    products = (productData as Product[]) ?? [];
    testimonials = testimonialData ?? [];
    collections = (collectionData as Collection[]) ?? [];
  }

  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const filterState = parseFilterState(searchParams ?? {});
  const hasActiveFilters = filterState.genero.length > 0 || filterState.marca.length > 0 || filterState.cor.length > 0 || filterState.precoMin !== null || filterState.precoMax !== null;
  const catalogProducts = applyQuickFilter(filterProducts(products, filterState), searchParams?.ordenar);

  return (
    <main>
      <Hero />

      {collections.length > 0 && (
        <section className="section-shell border-t border-brand-ink/10 pb-2 pt-12 sm:pt-16">
          <div className="mb-6">
            <h2 className="section-title">Marcas e coleções</h2>
            <p className="mt-2 font-body text-sm leading-6 text-brand-ink/55">
              Compre por marca
            </p>
          </div>
          <CollectionTiles collections={collections} />
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="section-shell pb-4 pt-12 sm:pb-6 sm:pt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Coleção Destaque</p>
              <h2 className="section-title">Escolhas em destaque</h2>
            </div>
            <Link href="/produtos" className="text-link hidden sm:inline-flex">
              Ver coleção completa <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ProductGrid products={featuredProducts} scroll />
        </section>
      )}

      <section id="catalogo" className={`section-shell pb-12 pt-4 sm:pb-16 sm:pt-6 ${collections.length === 0 ? "border-t border-brand-ink/10" : ""}`}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Catálogo completo</p>
            <h2 className="section-title">Encontre seu próximo óculos de sol</h2>
          </div>
          <Link href="/produtos" className="text-link hidden sm:inline-flex">
            Ver todos <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <Suspense fallback={<div className="h-10 w-24 rounded-full bg-brand-paper" />}>
            <FilterDrawer products={products} collections={collections} anchor="catalogo" />
          </Suspense>
          <Suspense fallback={null}>
            <QuickFilters anchor="catalogo" />
          </Suspense>
        </div>
        <ProductGrid
          products={catalogProducts}
          emptyMessage={hasActiveFilters ? { title: "Nenhum modelo encontrado.", description: "Ainda não há óculos cadastrados para esse filtro. Veja a coleção completa ou tente outro filtro." } : undefined}
        />
      </section>

      <TrustBadges />
      <Testimonials testimonials={testimonials} />
    </main>
  );
}
