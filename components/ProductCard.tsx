"use client";

/** Direção visual: reforçar a legibilidade de preço, público e parcelamento sem alterar a composição do card. */
import Image from "next/image";
import Link from "next/link";
import { Check, MessageCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Product, ProductColor } from "@/types/product";
import { useCart } from "./CartContext";
import { isProductSoldOut } from "@/lib/productStatus";
import { calculateDiscountPercent } from "@/lib/pricing";
import { buildWhatsAppInquiryMessage, buildWhatsAppMadeToOrderMessage, buildWhatsAppLink, PaymentSelection } from "@/lib/whatsapp";
import PaymentMethodModal from "./PaymentMethodModal";
import { trackProductClick } from "@/lib/productAnalytics";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const colors = [...(product.colors ?? [])].sort((a, b) => Number(Boolean(a.sold_out)) - Number(Boolean(b.sold_out)));
  const selectedColor: ProductColor | undefined = colors[selectedColorIndex];
  const selectedColorImages = selectedColor?.images?.filter(Boolean) ?? [];
  const mainImage = selectedColorImages[0] || selectedColor?.image_url || product.images?.[0];
  const hasDiscount = Boolean(product.compare_at_price && product.compare_at_price > product.price);
  const discountPercent = calculateDiscountPercent(product.price, product.compare_at_price);
  const colorSoldOut = Boolean(selectedColor?.sold_out);
  const productSoldOut = isProductSoldOut(product);
  const madeToOrder = Boolean(product.made_to_order);
  const canBuy = !productSoldOut && !colorSoldOut && !madeToOrder;
  const installmentTotal = product.installments?.enabled && product.installments.count > 0 && product.installments.amount > 0
    ? product.installments.count * product.installments.amount
    : null;
  const displayBrand = product.brand?.trim() || product.name;
  const displayModel = product.brand?.trim() ? product.model?.trim() || product.name : "";
  const productLabel = `${product.brand?.trim() ? `${product.brand.trim()} ` : ""}${product.model?.trim() || product.name}`.trim();

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [added]);

  function selectColor(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedColorIndex(index);
  }

  function handleQuickAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!canBuy) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: productLabel,
      price: product.price,
      image: mainImage || "",
      colorName: selectedColor?.name || "Único",
      quantity: 1,
    });
    setAdded(true);
  }

  function handleQuickInquiry(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    // Sob encomenda: pergunta a forma de pagamento antes de abrir o WhatsApp,
    // pra mensagem já sair pronta com o que o cliente escolheu.
    if (madeToOrder) {
      setShowPaymentModal(true);
      return;
    }
    const message = buildWhatsAppInquiryMessage(
      { brand: product.brand, model: product.model, name: product.name, price: product.price },
      { colorName: !productSoldOut ? selectedColor?.name : undefined, wholeProductSoldOut: productSoldOut }
    );
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
  }

  function handleMadeToOrderPaymentConfirm(payment: PaymentSelection) {
    const message = buildWhatsAppMadeToOrderMessage(
      { brand: product.brand, model: product.model, name: product.name, price: product.price },
      { colorName: selectedColor?.name, leadTime: product.made_to_order_note, payment, cardTotal: installmentTotal ?? product.price }
    );
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
    setShowPaymentModal(false);
  }

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[0.9] w-full overflow-hidden rounded-[1.25rem] bg-brand-sage/60">
        <Link href={`/produtos/${product.slug}`} onClick={() => trackProductClick(product)} className="absolute inset-0 z-10" aria-label={`Ver detalhes de ${productLabel}`} />
        {mainImage ? (
          <Image
            key={mainImage}
            src={mainImage}
            alt={`${product.name}${selectedColor?.name ? ` na cor ${selectedColor.name}` : ""}`}
            fill
            className={`object-contain p-2 mix-blend-multiply transition-opacity duration-300 sm:p-4`}
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-body text-xs uppercase tracking-[0.12em] text-brand-ink/35">Sem foto</div>
        )}
        {productSoldOut && !madeToOrder && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <span className="-rotate-12 rounded-lg border-2 border-brand-ink/70 bg-brand-paper/90 px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink/80 shadow-card backdrop-blur-sm">Esgotado</span>
          </div>
        )}
        <div className="absolute inset-x-3 top-3 z-20 flex items-start gap-1.5">
          <div className="flex flex-col items-start gap-1.5">
            {product.more_sold && <span className="rounded-full bg-brand-paper/90 px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink shadow-card backdrop-blur-sm">Mais vendido</span>}
            {madeToOrder ? (
              <span className="rounded-full bg-brand-gold px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-paper shadow-card">Sob encomenda</span>
            ) : colorSoldOut && !productSoldOut ? (
              <span className="rounded-full bg-brand-ink/90 px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-paper shadow-card">Cor esgotada</span>
            ) : null}
            {hasDiscount && <span className="rounded-full bg-brand-gold px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-paper shadow-card backdrop-blur-sm">Oferta</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={canBuy ? handleQuickAdd : handleQuickInquiry}
          className={`absolute bottom-3 right-3 z-30 flex items-center justify-center gap-1.5 rounded-full shadow-card transition-all duration-200 active:scale-[0.94] ${
            added
              ? "h-11 w-11 bg-brand-moss text-brand-paper sm:h-12 sm:w-12"
              : canBuy
              ? "h-11 w-11 bg-brand-paper text-brand-ink hover:bg-brand-gold hover:text-brand-paper sm:h-12 sm:w-12"
              : "h-9 pl-3 pr-3.5 bg-brand-ink text-brand-paper hover:bg-brand-gold sm:h-10 sm:pl-3.5 sm:pr-4"
          }`}
          aria-label={canBuy ? `Adicionar ${product.name}${selectedColor?.name ? ` na cor ${selectedColor.name}` : ""} à sacola` : madeToOrder ? `Fazer pedido sob encomenda de ${product.name}` : `Pedir informações no WhatsApp sobre ${product.name}${selectedColor?.name && !productSoldOut ? ` na cor ${selectedColor.name}` : ""}`}
          title={canBuy ? "Adicionar à sacola" : madeToOrder ? "Fazer pedido" : "Pedir no WhatsApp"}
        >
          {added ? (
            <Check size={19} strokeWidth={2} />
          ) : canBuy ? (
            <Plus size={20} strokeWidth={1.7} />
          ) : (
            <>
              <MessageCircle size={15} strokeWidth={1.8} />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] sm:text-[11px]">{madeToOrder ? "Fazer pedido" : "Pedir"}</span>
            </>
          )}
        </button>
        {!madeToOrder && !productSoldOut && product.stock === 1 && <span className="absolute bottom-3 left-3 z-20 rounded-full bg-brand-ink/90 px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-paper shadow-card backdrop-blur-sm">Última peça</span>}
      </div>

      <Link href={`/produtos/${product.slug}`} onClick={() => trackProductClick(product)} className="mt-4 block">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[17px] font-semibold tracking-[-0.02em] text-brand-ink sm:text-[19px]">{displayBrand}</h3>
          {displayModel && <p className="mt-0.5 truncate font-body text-[11px] font-medium uppercase tracking-[0.12em] text-brand-ink/55 sm:text-[12px]">{displayModel}</p>}
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 font-body">
            <div>
              {hasDiscount && <span className="block text-[11px] text-brand-ink/40 line-through sm:text-[12px]">{formatBRL(product.compare_at_price as number)}</span>}
              <span className="flex items-baseline gap-1.5">
                <span className={`block text-base font-semibold ${hasDiscount ? "text-brand-gold" : "text-brand-ink"}`}>{formatBRL(product.price)}</span>
                {discountPercent !== null && <span className="text-[11px] font-bold text-red-600 sm:text-[12px]">{discountPercent}% OFF</span>}
              </span>
              {installmentTotal !== null && product.installments && <span className="mt-1 block text-[12px] font-medium leading-5 text-brand-ink"><span className="block">ou até {product.installments.count}x de {formatBRL(product.installments.amount)}</span><span className="block text-[11px] text-brand-ink/65">Total parcelado: {formatBRL(installmentTotal)}</span></span>}
            </div>
          </div>
        </div>
      </Link>

      {colors.length > 0 && (
        <div className="mt-3 flex items-center gap-2" aria-label={`Cores disponíveis de ${product.name}`}>
          {colors.slice(0, 6).map((color, index) => (
            <button
              key={`${color.name}-${index}`}
              type="button"
              onClick={(event) => selectColor(event, index)}
              title={color.sold_out ? `${color.name} · Esgotada` : `Ver ${color.name}`}
              aria-label={color.sold_out ? `${product.name} na cor ${color.name} está esgotada` : `Ver ${product.name} na cor ${color.name}`}
              aria-pressed={selectedColorIndex === index}
              className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-90 ${selectedColorIndex === index ? "scale-110 ring-2 ring-brand-gold ring-offset-2 ring-offset-brand-cream" : "hover:scale-110"} ${color.sold_out ? "opacity-50" : ""}`}
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
      {(selectedColor?.frame_color || selectedColor?.lens_color) && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-body text-[10px] text-brand-ink/50"><span>Armação <strong className="font-semibold text-brand-ink/70">{selectedColor.frame_color || "—"}</strong></span><span>Lentes <strong className="font-semibold text-brand-ink/70">{selectedColor.lens_color || "—"}</strong></span></div>}

      <p className={`mt-2 min-h-[16px] font-body text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${added ? "text-brand-moss" : "text-transparent"}`}>{added ? "Adicionado à sacola" : " "}</p>

      {showPaymentModal && (
        <PaymentMethodModal
          productName={productLabel}
          cashPrice={product.price}
          cardTotal={installmentTotal ?? product.price}
          maxInstallments={product.installments?.enabled && product.installments.count > 0 ? product.installments.count : 1}
          onConfirm={handleMadeToOrderPaymentConfirm}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </article>
  );
}
