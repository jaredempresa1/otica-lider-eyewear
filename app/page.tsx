import Link from "next/link";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, HeroSlide, Product, Testimonial } from "@/types/product";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductGrid from "@/components/ProductGrid";
import BrandMarquee from "@/components/BrandMarquee";
import PromoBanner from "@/components/PromoBanner";
import Testimonials from "@/components/Testimonials";
import NewsletterSignup from "@/components/NewsletterSignup";
import ScrollReveal from "@/components/ScrollReveal";

export const revalidate = 60;

type ShelfProps = { title: string; section: string; products: Product[]; collections: Collection[] };

function HomeShelf({ title, section, products, collections }: ShelfProps) {
  if (products.length === 0) return null;
  return (
    <section className="section-shell reveal-on-scroll pb-7 pt-10 sm:pb-10 sm:pt-14">
      <div className="mb-5 flex flex-col items-start gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2 className="section-title whitespace-nowrap text-[26px] font-extrabold sm:text-4xl">{title}</h2>
        </div>
        <Link href={`/produtos?secao=${section}`} className="shelf-link shrink-0">
          Ver tudo <span aria-hidden="true" className="shelf-link-arrow">›</span>
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

  const isLegacyProduct = (product: Product) => product.home_section === undefined;
  const featuredProducts = products.filter((product) => isLegacyProduct(product) ? product.featured : product.home_section === "destaque");
  const sportVisionProducts = products.filter((product) => isLegacyProduct(product) ? product.sportivo : product.home_section === "sport-vision");
  const feminineProducts = products.filter((product) => isLegacyProduct(product) ? (!product.gender || product.gender === "feminino" || product.gender === "unissex") : product.home_section === "feminino");
  const masculineProducts = products.filter((product) => isLegacyProduct(product) ? (!product.gender || product.gender === "masculino" || product.gender === "unissex") : product.home_section === "masculino");
  const childrenProducts = products.filter((product) => isLegacyProduct(product) ? product.gender === "infantil" : product.home_section === "infantil");

  return (
    <main>
      <ScrollReveal />
      <Hero slides={heroSlides} />
      {collections.length > 0 && (
        <section className="mx-auto w-full max-w-7xl border-t border-brand-ink/10 px-0 pb-2 pt-8 sm:px-8 sm:pt-10 lg:px-10">
          <BrandMarquee collections={collections} />
        </section>
      )}

      <HomeShelf title="Óculos em destaque" section="destaque" products={featuredProducts} collections={collections} />
      <HomeShelf title="Óculos Sport Vision" section="sport-vision" products={sportVisionProducts} collections={collections} />
      <HomeShelf title="Óculos de sol feminino" section="feminino" products={feminineProducts} collections={collections} />
      <div className="section-shell py-2 sm:py-4"><PromoBanner banner={promoBanner} /></div>
      <HomeShelf title="Óculos de sol masculino" section="masculino" products={masculineProducts} collections={collections} />
      <HomeShelf title="Óculos de sol infantil" section="infantil" products={childrenProducts} collections={collections} />

      <TrustBadges /><Testimonials testimonials={testimonials} totalCount={testimonialCount} /><NewsletterSignup />
    </main>
  );
}
