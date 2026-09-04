import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { isProductSoldOut } from "@/lib/productStatus";

export default function ProductGrid({
  products,
  emptyMessage,
  scroll = false,
}: {
  products: Product[];
  emptyMessage?: { title: string; description: string };
  /** Quando true, renderiza como um carrossel horizontal (arrastável no mobile) em vez de um grid. */
  scroll?: boolean;
}) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-12 text-center">
        <p className="font-heading text-2xl font-semibold text-brand-ink">{emptyMessage?.title ?? "Nenhum produto cadastrado ainda."}</p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-brand-ink/55">{emptyMessage?.description ?? "Assim que você cadastrar os modelos no painel, eles aparecerão aqui automaticamente."}</p>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b)));

  if (scroll) {
    return (
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:gap-5 sm:px-8 lg:-mx-10 lg:px-10">
        {sortedProducts.map((product) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  return <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4">{sortedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
