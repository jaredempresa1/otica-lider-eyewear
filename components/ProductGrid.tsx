import Link from "next/link";
import { Collection, Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { isProductSoldOut } from "@/lib/productStatus";

export default function ProductGrid({ products, emptyMessage, scroll = false, collections, limit }: {
  products: Product[];
  emptyMessage?: { title: string; description: string };
  scroll?: boolean;
  collections?: Collection[];
  limit?: { mobile: number; desktop: number };
}) {
  if (!products || products.length === 0) {
    return <div className="rounded-[1.25rem] border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-12 text-center"><p className="font-heading text-2xl font-semibold text-brand-ink">{emptyMessage?.title ?? "Nenhum modelo disponível no momento."}</p><p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-brand-ink/55">{emptyMessage?.description ?? "Novos modelos chegam em breve. Volte mais tarde para conferir as novidades."}</p></div>;
  }

  const sortedProducts = [...products].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b)));

  if (scroll) {
    const mobileProducts = limit ? sortedProducts.slice(0, limit.mobile) : sortedProducts;
    const desktopProducts = limit ? sortedProducts.slice(0, limit.desktop) : sortedProducts;
    return (
      <>
        <div className="shelf-scroll -mx-5 flex gap-4 overflow-x-auto pb-3 pl-5 pr-5 sm:-mx-8 sm:gap-5 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10 lg:overflow-visible lg:px-0">
          {mobileProducts.map((product, index) => (
            <div key={product.id} className={`w-[70vw] shrink-0 sm:w-[31vw] lg:w-auto ${index >= desktopProducts.length ? "lg:hidden" : ""}`}>
              <ProductCard product={product} collections={collections} />
            </div>
          ))}
        </div>
        {sortedProducts.length > (limit?.mobile ?? 0) && (
          <div className="mt-7 flex justify-center lg:hidden"><Link href="/produtos" className="btn-brand px-8 py-3.5 text-[12px]">Ver tudo</Link></div>
        )}
      </>
    );
  }

  const displayProducts = limit ? sortedProducts.slice(0, limit.desktop) : sortedProducts;
  const showViewAll = limit ? sortedProducts.length > limit.mobile : false;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4">
        {displayProducts.map((product, index) => <div key={product.id} className={limit && index >= limit.mobile ? "hidden sm:block" : undefined}><ProductCard product={product} collections={collections} /></div>)}
      </div>
      {showViewAll && <div className="mt-8 flex justify-center sm:mt-10"><Link href="/produtos" className="btn-brand px-8 py-3.5 text-[12px]">Ver tudo</Link></div>}
    </>
  );
}
