import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { isProductSoldOut } from "@/lib/productStatus";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-12 text-center">
        <p className="font-heading text-2xl font-semibold text-brand-ink">Nenhum produto cadastrado ainda.</p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-brand-ink/55">Assim que você cadastrar os modelos no painel, eles aparecerão aqui automaticamente.</p>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b)));

  return <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4">{sortedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
