import Link from "next/link";
import { Suspense } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, Product, Testimonial } from "@/types/product";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductGrid from "@/components/ProductGrid";
import CollectionTiles from "@/components/CollectionTiles";
import PromoBanner from "@/components/PromoBanner";
import Testimonials from "@/components/Testimonials";
import WhatsAppSignup from "@/components/WhatsAppSignup";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFilters from "@/components/QuickFilters";
import ProductSearch from "@/components/ProductSearch";
import { applyQuickFilter, filterProducts, parseFilterState } from "@/lib/filters";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string; genero?: string; marca?: string; cor?: string; formato?: string; ia?: string; precoMin?: string; precoMax?: string; ordenar?: string };
}) {
  let products: Product[] = [];
  let testimonials: Testimonial[] = [];
  let testimonialCount = 0;
  let collections: Collection[] = [];
  let promoBanner: { image_url: string; href: string; alt_text: string } | null = null;

  if (hasSupabaseConfig) {
    const [{ data: productData }, { data: testimonialData, count: testimonialTotal }, { data: collectionData }, { data: bannerData }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase
        .from("testimonials")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false }),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
      supabase.from("promo_banner").select("image_url, href, alt_text").eq("id", 1).maybeSingle(),
    ]);
    products = (productData as Product[]) ?? [];
    testimonials = testimonialData ?? [];
    testimonialCount = testimonialTotal ?? testimonials.length;
    collections = (collectionData as Collection[]) ?? [];
    promoBanner = bannerData ?? null;
  }

  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const filterState = parseFilterState(searchParams ?? {});
  const hasActiveFilters = filterState.busca.length > 0 || filterState.genero.length > 0 || filterState.marca.length > 0 || filterState.cor.length > 0 || filterState.formato.length > 0 || filterState.ia || filterState.precoMin !== null || filterState.precoMax !== null;
  const catalogProducts = applyQuickFilter(filterProducts(products, filterState), searchParams?.ordenar);

  return (
    <main>
      <Hero />

      {collections.length > 0 && (
        <section className="section-shell border-t border-brand-ink/10 pb-2 pt-12 sm:pt-16">
          <div className="mb-6">
            <h2 className="section-title">Marcas e coleções</h2>
            <p className="mt-2 font-body text-sm leading-6 text-brand-ink/55">Compre por marca</p>
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

      <PromoBanner banner={promoBanner} />

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
          <ProductSearch anchor="catalogo" />
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
      <Testimonials testimonials={testimonials} totalCount={testimonialCount} />
      <WhatsAppSignup />
    </main>
  );
}
