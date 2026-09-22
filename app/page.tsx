import Link from "next/link";
import { Suspense } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, HeroSlide, Product, Testimonial } from "@/types/product";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductGrid from "@/components/ProductGrid";
import BrandMarquee from "@/components/BrandMarquee";
import PromoBanner from "@/components/PromoBanner";
import Testimonials from "@/components/Testimonials";
import NewsletterSignup from "@/components/NewsletterSignup";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFilters from "@/components/QuickFilters";
import { applyQuickFilter, filterProducts, parseFilterState } from "@/lib/filters";

export const revalidate = 60;

type ShelfProps = { eyebrow: string; title: string; products: Product[]; collections: Collection[] };

function HomeShelf({ eyebrow, title, products, collections }: ShelfProps) {
  if (products.length === 0) return null;
  return (
    <section className="section-shell pb-7 pt-10 sm:pb-10 sm:pt-14">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <Link href="/produtos" className="text-link shrink-0 text-[11px] sm:text-[13px]">
          Ver todos <span aria-hidden="true">›</span>
        </Link>
      </div>
      <ProductGrid products={products} scroll collections={collections} limit={{ mobile: 5, desktop: 3 }} />
    </section>
  );
}

export default async function HomePage({ searchParams }: { searchParams?: { q?: string; genero?: string; marca?: string; cor?: string; formato?: string; ia?: string; esportivo?: string; precoMin?: string; precoMax?: string; ordenar?: string } }) {
  let products: Product[] = [];
  let testimonials: Testimonial[] = [];
  let testimonialCount = 0;
  let collections: Collection[] = [];
  let promoBanner: { image_url: string; href: string; alt_text: string } | null = null;
  let heroSlides: HeroSlide[] = [];

  if (hasSupabaseConfig) {
    const [{ data: productData }, { data: testimonialData, count: testimonialTotal }, { data: collectionData }, { data: bannerData }, { data: heroSlideData }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("testimonials").select("*", { count: "exact" }).order("created_at", { ascending: false }),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
      supabase.from("promo_banner").select("image_url, href, alt_text").eq("id", 1).maybeSingle(),
      supabase.from("hero_slides").select("*").eq("active", true).order("sort_order", { ascending: true }),
    ]);
    products = (productData as Product[]) ?? [];
    testimonials = testimonialData ?? [];
    testimonialCount = testimonialTotal ?? testimonials.length;
    collections = (collectionData as Collection[]) ?? [];
    promoBanner = bannerData ?? null;
    heroSlides = (heroSlideData as HeroSlide[]) ?? [];
  }

  const featuredProducts = products.filter((product) => product.featured);
  const sportVisionProducts = products.filter((product) => product.sportivo);
  const feminineProducts = products.filter((product) => !product.gender || product.gender === "feminino" || product.gender === "unissex");
  const masculineProducts = products.filter((product) => !product.gender || product.gender === "masculino" || product.gender === "unissex");
  const childrenProducts = products.filter((product) => product.gender === "infantil");

  const filterState = parseFilterState(searchParams ?? {});
  const hasActiveFilters = filterState.busca.length > 0 || filterState.genero.length > 0 || filterState.marca.length > 0 || filterState.cor.length > 0 || filterState.formato.length > 0 || filterState.ia || filterState.esportivo || filterState.precoMin !== null || filterState.precoMax !== null;
  const catalogProducts = applyQuickFilter(filterProducts(products, filterState), searchParams?.ordenar);

  return (
    <main>
      <Hero slides={heroSlides} />
      {collections.length > 0 && (
        <section className="mx-auto w-full max-w-7xl border-t border-brand-ink/10 px-0 pb-2 pt-8 sm:px-8 sm:pt-10 lg:px-10">
          <BrandMarquee collections={collections} />
        </section>
      )}

      <HomeShelf eyebrow="Seleção da casa" title="Óculos em destaque" products={featuredProducts} collections={collections} />
      <HomeShelf eyebrow="Performance e movimento" title="Óculos Sport Vision" products={sportVisionProducts} collections={collections} />
      <HomeShelf eyebrow="Para ela" title="Óculos de sol feminino" products={feminineProducts} collections={collections} />
      <div className="section-shell py-2 sm:py-4"><PromoBanner banner={promoBanner} /></div>
      <HomeShelf eyebrow="Para ele" title="Óculos de sol masculino" products={masculineProducts} collections={collections} />
      <HomeShelf eyebrow="Para os pequenos" title="Óculos de sol infantil" products={childrenProducts} collections={collections} />

      <section id="catalogo" className="section-shell border-t border-brand-ink/10 pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Catálogo completo</p><h2 className="section-title">Encontre seu próximo óculos de sol</h2></div>
          <Link href="/produtos" className="text-link hidden sm:inline-flex">Ver todos <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="mb-7 flex min-w-0 items-center gap-3 overflow-hidden">
          <Suspense fallback={<div className="h-10 w-24 rounded-full bg-brand-paper" />}><FilterDrawer products={products} collections={collections} anchor="catalogo" /></Suspense>
          <Suspense fallback={null}><QuickFilters anchor="catalogo" /></Suspense>
        </div>
        <ProductGrid products={catalogProducts} emptyMessage={hasActiveFilters ? { title: "Nenhum modelo encontrado.", description: "Ainda não há óculos cadastrados para esse filtro. Veja a coleção completa ou tente outro filtro." } : undefined} collections={collections} limit={hasActiveFilters ? undefined : { mobile: 10, desktop: 12 }} />
      </section>

      <TrustBadges /><Testimonials testimonials={testimonials} totalCount={testimonialCount} /><NewsletterSignup />
    </main>
  );
}
