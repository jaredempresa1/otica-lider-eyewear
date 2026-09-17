import { Collection, Product } from "@/types/product";

/** Normaliza pra comparação: sem acento, sem espaço/hífen/pontuação, minúsculo.
 * Assim "Ray-Ban", "Ray Ban" e "ray ban" todos viram "rayban" e casam entre si. */
function normalizeBrandName(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Busca, entre as coleções cadastradas em "Marcas e coleções", a que representa
 * a marca do produto, e devolve a imagem dela pra usar como logo. Retorna
 * undefined se o produto não tiver marca ou não existir coleção correspondente. */
export function findBrandLogo(product: Pick<Product, "brand">, collections?: Collection[]): string | undefined {
  const normalizedBrand = normalizeBrandName(product.brand);
  if (!normalizedBrand) return undefined;
  return collections?.find((collection) => normalizeBrandName(collection.name) === normalizedBrand)?.image_url;
}
