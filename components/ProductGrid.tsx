import Link from "next/link";
import { Collection, Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { isProductSoldOut } from "@/lib/productStatus";

export default function ProductGrid({
  products,
  emptyMessage,
  scroll = false,
  collections,
  limit,
}: {
  products: Product[];
  emptyMessage?: { title: string; description: string };
  /** Quando true, renderiza como um carrossel horizontal (arrastável no mobile) em vez de um grid. */
  scroll?: boolean;
  /** Usadas para casar a marca do produto com o logo cadastrado em "Marcas e coleções" no admin. */
  collections?: Collection[];
  /** Limita quantos cards aparecem no grid (usado na home): mostra `mobile` sempre e revela
   * o restante até `desktop` só a partir do breakpoint sm. Abaixo do grid entra um botão
   * "Ver todos" levando para a coleção completa, sem limite. */
  limit?: { mobile: number; desktop: number };
}) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-12 text-center">
        <p className="font-heading text-2xl font-semibold text-brand-ink">{emptyMessage?.title ?? "Nenhum modelo disponível no momento."}</p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-brand-ink/55">{emptyMessage?.description ?? "Novos modelos chegam em breve. Volte mais tarde para conferir as novidades."}</p>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b)));

  if (scroll) {
    return (
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pl-16 pr-5 sm:-mx-8 sm:gap-5 sm:px-8 lg:-mx-10 lg:px-10">
        {sortedProducts.map((product) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]">
            <ProductCard product={product} collections={collections} />
          </div>
        ))}
      </div>
    );
  }

  const displayProducts = limit ? sortedProducts.slice(0, limit.desktop) : sortedProducts;
  const showViewAll = limit ? sortedProducts.length > limit.mobile : false;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4">
        {displayProducts.map((product, index) => (
          <div key={product.id} className={limit && index >= limit.mobile ? "hidden sm:block" : undefined}>
            <ProductCard product={product} collections={collections} />
          </div>
        ))}
      </div>
      {showViewAll && (
        <div className="mt-8 flex justify-center sm:mt-10">
          <Link href="/produtos" className="btn-brand px-8 py-3.5 text-[12px]">
            Ver todos
          </Link>
        </div>
      )}
    </>
  );
}
