import { Product, ProductColor } from "@/types/product";

/**
 * Um produto é considerado totalmente esgotado quando:
 * - foi marcado manualmente como esgotado (product.sold_out), ou
 * - o estoque geral chegou a zero, ou
 * - ele tem cores cadastradas e TODAS elas estão marcadas como esgotadas.
 */
export function isProductSoldOut(product: Pick<Product, "sold_out" | "stock" | "colors">): boolean {
  if (product.sold_out) return true;
  if ((product.stock ?? 0) <= 0) return true;
  if (product.colors && product.colors.length > 0 && product.colors.every((color) => color.sold_out)) return true;
  return false;
}

export function isColorSoldOut(color?: ProductColor): boolean {
  return Boolean(color?.sold_out);
}
