"use client";

/** Direção visual: no mobile, escolha de cor e ação de compra ficam próximas da galeria e do preço para reduzir fricção. */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Download, Glasses, MessageCircle, RotateCcw, ShoppingBag, X, ZoomIn, ZoomOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product, ProductColor } from "@/types/product";
import { useCart } from "./CartContext";
import { isProductSoldOut, genderLabel } from "@/lib/productStatus";
import { buildWhatsAppInquiryMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import TryOnModal from "./TryOnModal";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getColorImages(product: Product, color?: ProductColor): string[] {
  const gallery = color?.images?.filter(Boolean) ?? [];
  if (gallery.length > 0) return gallery;
  if (color?.image_url) return [color.image_url];
  return product.images?.filter(Boolean) ?? [];
}

function ProductImagePreview({ src, alt, priority, sizes, onOpen }: { src?: string; alt: string; priority?: boolean; sizes: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="relative h-full w-full overflow-hidden select-none" aria-label="Abrir imagem ampliada do produto">
      {src ? <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-contain p-3 mix-blend-multiply sm:p-7" /> : <div className="flex h-full w-full items-center justify-center font-body text-xs uppercase tracking-[0.12em] text-brand-ink/35">Sem foto</div>}
      {src && <span className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-paper/90 px-3 py-2 font-body text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60 shadow-card backdrop-blur-sm"><ZoomIn size={13} /> Clique para ampliar</span>}
    </button>
  );
}

const ZOOM_SCALE = 2.2;

function ProductLightbox({ images, initialIndex, alt, onClose }: { images: string[]; initialIndex: number; alt: string; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, Math.min(initialIndex, images.length - 1)));
  const [zoomed, setZoomed] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const pointerMoved = useRef(false);
  const justZoomedIn = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && images.length > 1) selectImage((currentIndex + 1) % images.length);
      if (event.key === "ArrowLeft" && images.length > 1) selectImage((currentIndex - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose]);

  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
    resetZoom();
  }, [initialIndex, images.length]);

  function resetZoom() {
    setZoomed(false);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
    justZoomedIn.current = false;
  }

  function selectImage(index: number) {
    setCurrentIndex(index);
    resetZoom();
  }

  function changeImage(direction: number) {
    if (images.length < 2) return;
    selectImage((currentIndex + direction + images.length) % images.length);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerMoved.current = false;
    dragStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
    if (!zoomed) {
      justZoomedIn.current = true;
      setZoomed(true);
      setOffset({ x: 0, y: 0 });
      return;
    }
    justZoomedIn.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) pointerMoved.current = true;
    const rect = event.currentTarget.getBoundingClientRect();
    // Após ampliar em ZOOM_SCALE×, a imagem passa a ocupar ZOOM_SCALE× o
    // tamanho do contêiner. O quanto ela "sobra" pra cada lado é metade
    // dessa diferença — é até aí que dá pra arrastar sem deixar margem sem
    // ver (sem esse cálculo, as bordas da imagem ficavam inacessíveis).
    const limitX = (rect.width * (ZOOM_SCALE - 1)) / 2;
    const limitY = (rect.height * (ZOOM_SCALE - 1)) / 2;
    const nextX = Math.max(-limitX, Math.min(limitX, dragStart.current.offsetX + deltaX));
    const nextY = Math.max(-limitY, Math.min(limitY, dragStart.current.offsetY + deltaY));
    setOffset({ x: nextX, y: nextY });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (justZoomedIn.current) {
      // Esse pointerUp pertence ao mesmo toque que acabou de dar zoom —
      // não deve desfazer o zoom que ele mesmo acabou de ativar.
      justZoomedIn.current = false;
      return;
    }
    // Tocou de novo sem arrastar enquanto já estava com zoom: volta ao normal.
    if (zoomed && !pointerMoved.current) resetZoom();
  }

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-brand-cream/95 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label={`Galeria ampliada de ${alt}`}>
      <div className="flex items-center justify-between gap-4 px-1 pb-3 sm:px-2"><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/55">{currentIndex + 1} de {images.length} fotos</p><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ink text-brand-paper transition-colors hover:bg-brand-gold" aria-label="Fechar galeria"><X size={18} /></button></div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-brand-sage/45">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} style={{ touchAction: "none", cursor: zoomed ? (dragging ? "grabbing" : "zoom-out") : "zoom-in" }}>
          <div className="relative h-full w-full transition-transform duration-200 ease-out" style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoomed ? ZOOM_SCALE : 1})` }}>
            <Image key={images[currentIndex]} src={images[currentIndex]} alt={`${alt}, foto ${currentIndex + 1}`} fill priority className="object-contain p-3 mix-blend-multiply sm:p-10" sizes="100vw" draggable={false} />
          </div>
        </div>
        {!zoomed && images.length > 1 && <><button type="button" onClick={() => changeImage(-1)} className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink shadow-card backdrop-blur-sm transition-colors hover:bg-brand-gold hover:text-brand-paper" aria-label="Foto anterior"><ChevronLeft size={20} /></button><button type="button" onClick={() => changeImage(1)} className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink shadow-card backdrop-blur-sm transition-colors hover:bg-brand-gold hover:text-brand-paper" aria-label="Próxima foto"><ChevronRight size={20} /></button></>}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-paper/95 p-1 shadow-card sm:bottom-4"><button type="button" onClick={() => setZoomed(true)} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Aumentar zoom"><ZoomIn size={16} /></button><button type="button" onClick={() => setZoomed(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Diminuir zoom"><ZoomOut size={16} /></button><button type="button" onClick={resetZoom} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Restaurar zoom"><RotateCcw size={15} /></button></div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mt-4 sm:justify-center">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => selectImage(index)} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-brand-sage/40 transition-colors sm:h-20 sm:w-20 ${currentIndex === index ? "border-brand-gold" : "border-transparent"}`} aria-label={`Abrir foto ${index + 1}`}><Image src={image} alt={`${alt}, miniatura ${index + 1}`} fill className="object-contain p-1 mix-blend-multiply" sizes="80px" /></button>)}</div>
      <p className="pt-2 text-center font-body text-[10px] uppercase tracking-[0.12em] text-brand-ink/45 sm:hidden">Toque na imagem para ampliar ou arrastar. Toque de novo para voltar ao normal.</p>
    </div>
  );
}

function ColorPicker({ colors, selectedColor, onSelect, className = "" }: { colors: ProductColor[]; selectedColor?: ProductColor; onSelect: (color: ProductColor) => void; className?: string }) {
  const colorSoldOut = Boolean(selectedColor?.sold_out);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3"><p className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-ink/55">Cor selecionada</p><span className="font-body text-[15px] font-medium text-brand-ink">{selectedColor?.name || "Único"}{colorSoldOut ? " · Esgotada" : ""}</span></div>
      <div className="mt-4 flex flex-wrap gap-3">{colors.map((color) => <button key={`${color.name}-${color.hex}`} onClick={() => onSelect(color)} title={color.sold_out ? `${color.name} · Esgotada` : `Ver galeria ${color.name}`} aria-label={color.sold_out ? `${color.name} está esgotada` : `Ver fotos do óculos na cor ${color.name}`} className={`relative h-11 w-11 rounded-full border-2 transition-transform duration-200 hover:scale-105 ${selectedColor?.name === color.name ? "border-brand-gold p-1" : "border-transparent"} ${color.sold_out ? "opacity-50" : ""}`}><span className="relative block h-full w-full overflow-hidden rounded-full border border-brand-ink/10"><span className="absolute inset-0" style={{ backgroundColor: color.hex }} />{color.sold_out && <span className="absolute left-1/2 top-1/2 h-[150%] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />}</span></button>)}</div>
      {(colors.length > 1 || colorSoldOut) && <p className="mt-3 font-body text-[12px] leading-5 text-brand-ink/45">{colorSoldOut ? "Essa cor está esgotada no momento. Escolha outra opção disponível ou avise que quer ser avisado quando voltar." : "Ao trocar a cor, todas as fotos e ângulos exibidos mudam para essa variação."}</p>}
      {(selectedColor?.frame_color || selectedColor?.lens_color) && <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-brand-paper p-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/45">Armação</p><p className="mt-1 font-body text-[15px] font-semibold text-brand-ink">{selectedColor.frame_color || "—"}</p></div><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/45">Lentes</p><p className="mt-1 font-body text-[15px] font-semibold text-brand-ink">{selectedColor.lens_color || "—"}</p></div></div>}
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="border-b border-brand-ink/10">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-heading text-lg font-bold text-brand-ink sm:text-xl">{title}</span>
        <ChevronDown size={20} className={`shrink-0 text-brand-ink transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-6 font-body text-[15px] leading-7 text-brand-ink/70">{children}</div>}
    </div>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const sortedColors = [...(product.colors ?? [])].sort((a, b) => Number(Boolean(a.sold_out)) - Number(Boolean(b.sold_out)));
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(sortedColors[0]);
  const initialGallery = getColorImages(product, sortedColors[0]);
  const [activeImage, setActiveImage] = useState(initialGallery[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const hasDiscount = Boolean(product.compare_at_price && product.compare_at_price > product.price);
  const selectedGallery = getColorImages(product, selectedColor);
  const colorSoldOut = Boolean(selectedColor?.sold_out);
  const productSoldOut = isProductSoldOut(product);
  const canBuy = !productSoldOut && !colorSoldOut;
  const displayBrand = product.brand?.trim() || product.name;
  const displayModel = product.brand?.trim() ? product.model?.trim() || product.name : "";
  const productLabel = `${product.brand?.trim() ? `${product.brand.trim()} ` : ""}${product.model?.trim() || product.name}`.trim();

  function openLightbox(image: string) {
    const index = Math.max(0, selectedGallery.indexOf(image));
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function goToGalleryImage(direction: number) {
    if (selectedGallery.length < 2) return;
    const currentIndex = Math.max(0, selectedGallery.indexOf(activeImage));
    const nextIndex = (currentIndex + direction + selectedGallery.length) % selectedGallery.length;
    setActiveImage(selectedGallery[nextIndex]);
  }

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    goToGalleryImage(deltaX < 0 ? 1 : -1);
  }

  function handleColorSelect(color: ProductColor) {
    setSelectedColor(color);
    const gallery = getColorImages(product, color);
    setActiveImage(gallery[0]);
    setLightboxIndex(0);
  }

  function handleAddToCart() {
    if (!canBuy) return;
    addItem({ productId: product.id, slug: product.slug, name: productLabel, price: product.price, image: activeImage || selectedGallery[0] || "", colorName: selectedColor?.name || "Único", quantity: 1 });
    router.push("/sacola");
  }

  function handleWhatsAppInquiry() {
    const message = buildWhatsAppInquiryMessage(
      { brand: product.brand, model: product.model, name: product.name, price: product.price },
      { colorName: !productSoldOut ? selectedColor?.name : undefined, wholeProductSoldOut: productSoldOut }
    );
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
  }

  const specRows: { label: string; value: string }[] = [
    { label: "Material", value: product.specifications?.material?.trim() || "" },
    { label: "Formato", value: product.specifications?.format?.trim() || "" },
    { label: "Gênero", value: genderLabel(product.gender) },
    { label: "Garantia", value: product.specifications?.warranty?.trim() || "" },
    { label: "Tipo de lente", value: product.specifications?.lens_type?.trim() || "" },
    { label: "Conteúdo da embalagem", value: product.specifications?.package_contents?.trim() || "" },
  ].filter((row) => row.value);

  return (
    <main className="section-shell py-8 sm:py-12">
      <button onClick={() => router.back()} className="mb-7 inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/55 transition-colors hover:text-brand-gold"><ArrowLeft size={14} /> Voltar para a coleção</button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <button
            type="button"
            onClick={() => setTryOnOpen(true)}
            className="relative z-10 mb-3 inline-flex items-center gap-2 rounded-full bg-brand-paper px-4 py-2.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink shadow-card transition-colors hover:bg-brand-gold hover:text-brand-paper"
          >
            <Glasses size={15} /> Experimente agora
          </button>
          <div
            className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-brand-sage/60 sm:aspect-[1.08]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <ProductImagePreview src={activeImage} alt={`${productLabel}${selectedColor?.name ? ` na cor ${selectedColor.name}` : ""}`} priority sizes="(max-width: 1024px) 100vw, 55vw" onOpen={() => openLightbox(activeImage || selectedGallery[0] || "")} />
            {product.more_sold && <span className="pointer-events-none absolute left-5 top-5 z-10 rounded-full bg-brand-paper/90 px-4 py-2 font-body text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-ink backdrop-blur-sm">Mais vendido</span>}
            {productSoldOut && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-brand-cream/10">
                <span className="-rotate-12 rounded-xl border-2 border-brand-ink/70 bg-brand-paper/90 px-6 py-2.5 font-body text-sm font-bold uppercase tracking-[0.22em] text-brand-ink/85 shadow-card backdrop-blur-sm">Esgotado</span>
              </div>
            )}
            {selectedGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToGalleryImage(-1)}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink shadow-card backdrop-blur-sm transition-transform hover:scale-105"
                  aria-label="Ver foto anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => goToGalleryImage(1)}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink shadow-card backdrop-blur-sm transition-transform hover:scale-105"
                  aria-label="Ver próxima foto"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {selectedGallery.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">{selectedGallery.map((img, index) => <button key={`${img}-${index}`} onClick={() => setActiveImage(img)} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-brand-sage/40 transition-colors ${activeImage === img ? "border-brand-gold" : "border-transparent"}`} aria-label={`Ver ângulo ${index + 1} de ${product.name}`}><Image src={img} alt={`Ângulo ${index + 1} de ${product.name}`} fill className="object-contain p-1 mix-blend-multiply" sizes="100px" /></button>)}</div>}
          {selectedGallery.length > 0 && <p className="mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/40">{selectedColor?.name ? `Galeria da cor ${selectedColor.name}` : "Galeria do produto"} · {selectedGallery.length} {selectedGallery.length === 1 ? "foto" : "fotos"}</p>}
          {sortedColors.length > 0 && <ColorPicker colors={sortedColors} selectedColor={selectedColor} onSelect={handleColorSelect} className="mt-5 border-t border-brand-ink/10 pt-5 lg:hidden" />}
        </div>

        <div className="flex flex-col justify-center lg:py-8">
          <p className="eyebrow">{product.category || "Eyewear"} · {genderLabel(product.gender)}</p>
          <p className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-[-0.03em] text-brand-ink sm:text-3xl">{displayBrand}</p>
          <h1 className="mt-1 font-body text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink/55 sm:text-sm">{displayModel || "Modelo"}</h1>
          <div className="mt-6 flex flex-col items-start font-body">{hasDiscount && <span className="text-[15px] text-brand-ink/40 line-through">{formatBRL(product.compare_at_price as number)}</span>}<span className={`mt-1 text-[27px] font-semibold ${hasDiscount ? "text-brand-gold" : "text-brand-ink"}`}>{formatBRL(product.price)}</span>{product.installments?.enabled && product.installments.count > 0 && product.installments.amount > 0 && <span className="mt-2 text-[15px] font-medium text-brand-ink">ou até {product.installments.count}x de {formatBRL(product.installments.amount)}</span>}</div>
          <div className="lg:hidden">{canBuy ? <button onClick={handleAddToCart} className="btn-brand mt-5 w-full gap-3"><ShoppingBag size={18} strokeWidth={1.8} /> Adicionar à sacola</button> : <div className="mt-5 space-y-2"><button onClick={handleWhatsAppInquiry} className="btn-brand w-full gap-3 bg-brand-ink hover:bg-brand-gold"><MessageCircle size={18} strokeWidth={1.8} /> Pedir no WhatsApp</button><p className="text-center font-body text-[12px] leading-5 text-brand-ink/45">{productSoldOut ? "Esse modelo está esgotado, mas você pode encomendar e a gente avisa assim que chegar." : "Essa cor está esgotada no momento — fale com a gente para saber sobre reposição ou outra cor."}</p></div>}</div>

          {sortedColors.length > 0 && <ColorPicker colors={sortedColors} selectedColor={selectedColor} onSelect={handleColorSelect} className="mt-8 hidden border-t border-brand-ink/10 pt-6 lg:block" />}

          <div className="mt-7 flex items-center justify-between border-y border-brand-ink/10 py-4 font-body text-[11px] uppercase tracking-[0.12em] text-brand-ink/55"><span>{productSoldOut ? "Esgotado" : colorSoldOut ? "Cor esgotada" : product.stock > 1 ? `${product.stock} unidades disponíveis` : product.stock === 1 ? "Última unidade" : "Fora de estoque"}</span><span>Proteção UV</span></div>
          <div className="hidden lg:block">{canBuy ? (
            <button onClick={handleAddToCart} className="btn-brand mt-7 w-full gap-3"><ShoppingBag size={16} strokeWidth={1.8} /> Adicionar à sacola</button>
          ) : (
            <div className="mt-7 space-y-2">
              <button onClick={handleWhatsAppInquiry} className="btn-brand w-full gap-3 bg-brand-ink hover:bg-brand-gold"><MessageCircle size={16} strokeWidth={1.8} /> Pedir no WhatsApp</button>
              <p className="text-center font-body text-[11px] leading-5 text-brand-ink/45">{productSoldOut ? "Esse modelo está esgotado, mas você pode encomendar e a gente avisa assim que chegar." : "Essa cor está esgotada no momento — fale com a gente para saber sobre reposição ou outra cor."}</p>
            </div>
          )}</div>

          {product.downloads && product.downloads.length > 0 && <div className="mt-8 rounded-2xl bg-brand-paper p-5"><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/55">Materiais do produto</p><div className="mt-3 space-y-2">{product.downloads.map((download) => <a key={`${download.name}-${download.url}`} href={download.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-body text-sm text-brand-gold hover:text-brand-ink"><Download size={15} /> {download.name}</a>)}</div></div>}
        </div>
      </div>

      {(product.description || specRows.length > 0) && (
        <div className="mx-auto mt-10 max-w-3xl border-t border-brand-ink/10 lg:mt-14">
          {product.description && (
            <AccordionItem title="Descrição do produto" defaultOpen>
              <p className="whitespace-pre-line">{product.description}</p>
            </AccordionItem>
          )}
          {specRows.length > 0 && (
            <AccordionItem title="Especificações">
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {specRows.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-brand-ink/5 py-1.5 sm:justify-start sm:gap-2">
                    <dt className="shrink-0 font-semibold text-brand-ink/85">{row.label}:</dt>
                    <dd className="text-right text-brand-ink/70 sm:text-left">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionItem>
          )}
        </div>
      )}

      {lightboxOpen && <ProductLightbox images={selectedGallery} initialIndex={lightboxIndex} alt={`${productLabel}${selectedColor?.name ? ` na cor ${selectedColor.name}` : ""}`} onClose={() => setLightboxOpen(false)} />}
      {tryOnOpen && <TryOnModal productImage={activeImage || selectedGallery[0] || ""} productName={productLabel} onClose={() => setTryOnOpen(false)} />}
    </main>
  );
}
