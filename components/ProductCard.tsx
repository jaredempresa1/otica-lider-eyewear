"use client";

/** Direção visual: card com fundo branco (as fotos dos óculos não têm fundo), sem CTA — o clique inteiro do card leva para a página do produto, onde o cliente escolhe cor e adiciona ao carrinho. */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Collection, Product, ProductColor } from "@/types/product";
import { findBrandLogo } from "@/lib/brandLogo";
import { isProductSoldOut } from "@/lib/productStatus";
import { calculateDiscountPercent } from "@/lib/pricing";
import { trackProductClick } from "@/lib/productAnalytics";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ product, collections }: { product: Product; collections?: Collection[] }) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [imageStatus, setImageStatus] = useState<"loading" | "retry-unoptimized" | "failed">("loading");
  const colors = [...(product.colors ?? [])].sort((a, b) => Number(Boolean(a.sold_out)) - Number(Boolean(b.sold_out)));
  const selectedColor: ProductColor | undefined = colors[selectedColorIndex];
  const selectedColorImages = selectedColor?.images?.filter(Boolean) ?? [];
  const mainImage = selectedColorImages[0] || selectedColor?.image_url || product.images?.[0];
  const secondaryImage = selectedColorImages[1] || (selectedColorImages.length === 0 ? product.images?.[1] : undefined);
  const hasDiscount = Boolean(product.compare_at_price && product.compare_at_price > product.price);
  const discountPercent = calculateDiscountPercent(product.price, product.compare_at_price);
  const colorSoldOut = Boolean(selectedColor?.sold_out);
  const productSoldOut = isProductSoldOut(product);
  const madeToOrder = Boolean(product.made_to_order);
  const displayBrand = product.brand?.trim() || product.name;
  const displayModel = product.brand?.trim() ? product.model?.trim() : "";
  // Casa a marca do produto com uma coleção de mesmo nome cadastrada em
  // "Marcas e coleções" no admin, e usa a imagem dela como logo ao lado do
  // nome. Se não existir coleção correspondente, some sem quebrar o layout.
  const brandLogo = findBrandLogo(product, collections);
  const productLabel = `${product.brand?.trim() ? `${product.brand.trim()} ` : ""}${product.model?.trim() || product.name}`.trim();

  // Reseta o estado da imagem sempre que o produto troca de cor (nova foto).
  useEffect(() => {
    setImageStatus("loading");
  }, [mainImage]);

  function selectColor(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedColorIndex(index);
  }

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[1.18] w-full overflow-hidden rounded-[1.25rem] bg-brand-paper">
        <Link href={`/produtos/${product.slug}`} onClick={() => trackProductClick(product)} className="absolute inset-0 z-10" aria-label={`Ver detalhes de ${productLabel}`} />
        {mainImage && imageStatus !== "failed" ? (
          <div className="absolute inset-0 p-2 sm:p-3">
            <div className="relative h-full w-full">
              <Image
                key={`${mainImage}-${imageStatus}`}
                src={mainImage}
                alt={`${product.name}${selectedColor?.name ? ` na cor ${selectedColor.name}` : ""}`}
                fill
                unoptimized={imageStatus === "retry-unoptimized"}
                className="object-contain transition-opacity duration-300 lg:group-hover:opacity-0"
                sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
                onError={() => setImageStatus((current) => (current === "loading" ? "retry-unoptimized" : "failed"))}
              />
              {secondaryImage && <Image src={secondaryImage} alt={`${product.name}${selectedColor?.name ? ` na cor ${selectedColor.name}` : ""}, segunda foto`} fill unoptimized className="pointer-events-none absolute inset-0 object-contain opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100" sizes="(max-width: 1024px) 30vw, 22vw" />}
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-body text-xs uppercase tracking-[0.12em] text-brand-ink/35">Sem foto</div>
        )}
        {productSoldOut && !madeToOrder && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <span className="-rotate-12 rounded-lg border-2 border-brand-ink/70 bg-brand-paper/90 px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink/80 shadow-card backdrop-blur-sm">Esgotado</span>
          </div>
        )}
      </div>

      <Link href={`/produtos/${product.slug}`} onClick={() => trackProductClick(product)} className="mt-4 block">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            {brandLogo && (
              <img
                src={brandLogo}
                alt=""
                aria-hidden="true"
                className="h-7 w-7 shrink-0 object-contain"
              />
            )}
            <h3 className="truncate font-heading text-[17px] font-semibold tracking-[-0.02em] text-brand-ink sm:text-[19px]">{displayBrand}{displayModel && <span className="font-heading font-semibold text-brand-ink"> · {displayModel}</span>}</h3>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 font-body">
            <div>
              <div className="flex items-baseline gap-2 whitespace-nowrap">
                <span className={`text-base font-semibold ${hasDiscount ? "text-brand-gold" : "text-brand-ink"}`}>{formatBRL(product.price)}</span>
                {hasDiscount && <span className="text-[11px] text-brand-ink/40 line-through sm:text-[12px]">{formatBRL(product.compare_at_price as number)}</span>}
                {discountPercent !== null && <span className="text-[11px] font-bold text-red-600 sm:text-[12px]">{discountPercent}% OFF</span>}
              </div>
              {product.installments?.enabled && product.installments.count > 0 && product.installments.amount > 0 && <span className="mt-1 block text-[12px] font-medium leading-5 text-brand-ink">ou até {product.installments.count}x de {formatBRL(product.installments.amount)}</span>}
            </div>
          </div>
        </div>
      </Link>

      {colors.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5" aria-label={`Cores disponíveis de ${product.name}`}>
          {colors.slice(0, 6).map((color, index) => (
            <button
              key={`${color.name}-${index}`}
              type="button"
              onClick={(event) => selectColor(event, index)}
              title={color.sold_out ? `${color.name} · Esgotada` : `Ver ${color.name}`}
              aria-label={color.sold_out ? `${product.name} na cor ${color.name} está esgotada` : `Ver ${product.name} na cor ${color.name}`}
              aria-pressed={selectedColorIndex === index}
              className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-90 ${selectedColorIndex === index ? "ring-2 ring-brand-ink ring-offset-1 ring-offset-brand-paper" : "hover:scale-110"} ${color.sold_out ? "opacity-50" : ""}`}
            >
              <span className="relative block h-5 w-5 overflow-hidden rounded-full border border-brand-paper shadow-[0_0_0_1px_rgba(30,33,29,0.2)]">
                <span className="absolute inset-0" style={{ backgroundColor: color.hex }} />
                {color.sold_out && <span className="absolute left-1/2 top-1/2 h-[150%] w-[1.5px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />}
              </span>
            </button>
          ))}
          {colors.length > 6 && <span className="ml-1 font-body text-[11px] text-brand-ink/45">+{colors.length - 6}</span>}
          {selectedColor?.name && <span className="ml-1 truncate font-body text-[11px] text-brand-ink/50">{selectedColor.name}{colorSoldOut ? " · Esgotada" : ""}</span>}
        </div>
      )}
    </article>
  );
}
