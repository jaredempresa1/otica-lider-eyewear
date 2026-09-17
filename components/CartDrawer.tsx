"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { checkShipping, cleanCep, isValidCep, ShippingResult } from "@/lib/shipping";
import { CHECKOUT_CEP_KEY } from "@/lib/checkoutCep";
import FreeShippingBar from "@/components/FreeShippingBar";

type CartDrawerContextValue = {
  open: () => void;
  close: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer precisa estar dentro de CartDrawerProvider");
  return ctx;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  function open() {
    setIsMounted(true);
  }

  function close() {
    setIsVisible(false);
    window.setTimeout(() => setIsMounted(false), 320);
  }

  useEffect(() => {
    if (!isMounted) return;
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  return (
    <CartDrawerContext.Provider value={{ open, close }}>
      {children}
      {isMounted && <CartDrawer isVisible={isVisible} onClose={close} />}
    </CartDrawerContext.Provider>
  );
}

function CartDrawer({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [cep, setCep] = useState("");
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [checkingShipping, setCheckingShipping] = useState(false);
  // Apenas visual: marca qual forma de entrega aparece selecionada na pré-visualização.
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);

  // Guarda o CEP digitado aqui para a etapa de Entrega continuar de onde o
  // cliente parou, em vez de voltar para o CEP salvo na conta.
  useEffect(() => {
    try {
      if (isValidCep(cep)) window.sessionStorage.setItem(CHECKOUT_CEP_KEY, cleanCep(cep));
      else window.sessionStorage.removeItem(CHECKOUT_CEP_KEY);
    } catch {
      // sessionStorage indisponível (navegação privada): segue sem guardar.
    }
  }, [cep]);

  useEffect(() => {
    if (!isValidCep(cep)) {
      setShipping(null);
      setCheckingShipping(false);
      return;
    }
    let cancelled = false;
    setCheckingShipping(true);
    const timer = window.setTimeout(() => {
      checkShipping(cep, items).then((result) => {
        if (!cancelled) {
          setShipping(result);
          setCheckingShipping(false);
        }
      });
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cep, items]);

  function handleCheckout() {
    onClose();
    router.push("/sacola");
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-end bg-black/50 transition-opacity duration-300 ease-premium-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`flex h-full w-full max-w-sm flex-col bg-brand-paper shadow-2xl transition-transform duration-300 ease-premium-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 bg-brand-ink px-5 py-4">
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-brand-paper/80 transition-colors hover:text-brand-gold">
            <X size={20} />
          </button>
          <span className="font-body text-sm font-bold uppercase tracking-[0.14em] text-brand-paper">Carrinho de compras</span>
        </div>

        {/* Uma única área de rolagem: produtos + resumo rolam juntos */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <ShoppingBag size={32} strokeWidth={1.5} className="text-brand-ink/30" />
              <p className="font-body text-sm text-brand-ink/60">Seu carrinho está vazio.</p>
              <button type="button" onClick={onClose} className="mt-2 rounded-full border border-brand-ink px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper">
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={`${item.productId}-${item.colorName}`} className="relative flex gap-3 border-b border-brand-ink/10 pb-4 last:border-none">
                  {/* Card inteiro clicável: camada por baixo dos controles */}
                  <Link
                    href={`/produtos/${item.slug}`}
                    onClick={onClose}
                    aria-label={`Ver ${item.name}`}
                    className="absolute inset-0 z-0 rounded-xl transition-colors hover:bg-brand-ink/[0.03]"
                  />
                  {item.image && (
                    <div className="pointer-events-none relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-sage/40">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2 mix-blend-multiply" sizes="80px" />
                    </div>
                  )}
                  <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-body text-sm font-semibold leading-snug text-brand-ink">{item.name}</p>
                      <button type="button" onClick={() => removeItem(item.productId, item.colorName)} aria-label="Remover item" className="pointer-events-auto shrink-0 text-brand-ink/40 transition-colors hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="font-body text-sm font-semibold text-brand-ink">{formatBRL(item.price)}</p>
                    <div className="pointer-events-auto mt-1 flex w-fit items-center gap-3 rounded-full border border-brand-ink/15 bg-brand-paper px-3 py-1.5">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.colorName, item.quantity - 1)} aria-label="Diminuir quantidade" className="text-brand-ink/60 transition-colors hover:text-brand-gold">
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[1ch] text-center font-body text-sm text-brand-ink">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.colorName, item.quantity + 1)} aria-label="Aumentar quantidade" className="text-brand-ink/60 transition-colors hover:text-brand-gold">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          </div>

        {items.length > 0 && (
          <div className="border-t border-brand-ink/10 px-5 py-4">
            <FreeShippingBar subtotal={subtotal} />

            {!isValidCep(cep) ? (
              <>
                <label htmlFor="cart-drawer-cep" className="mt-3 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-ink/50">
                  Calcular frete
                </label>
                <input
                  id="cart-drawer-cep"
                  type="text"
                  inputMode="numeric"
                  placeholder="Digite seu CEP"
                  value={cep}
                  onChange={(event) => setCep(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-brand-ink/15 bg-white px-3 py-2 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold"
                />
              </>
            ) : (
              <>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-brand-ink/10 pt-3">
                  <span className="font-body text-[13px] text-brand-ink/70">
                    Entregas para o CEP: <strong className="font-bold text-brand-ink">{cep}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCep("")}
                    className="shrink-0 rounded-md border border-brand-ink/25 px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:border-brand-ink"
                  >
                    Alterar CEP
                  </button>
                </div>

                <p className="mt-4 flex items-center gap-2 font-body text-[13px] text-brand-ink/60">
                  <Truck size={16} className="shrink-0" /> Formas de entrega
                </p>

                {checkingShipping ? (
                  <p className="mt-2 font-body text-[12px] text-brand-ink/60">Calculando frete…</p>
                ) : shipping?.freeShipping ? (
                  <div className="mt-2 overflow-hidden rounded-xl border-2 border-brand-ink bg-white">
                    <div className="flex items-stretch">
                      <span className="flex w-11 shrink-0 items-center justify-center bg-brand-ink text-brand-paper"><Check size={16} /></span>
                      <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0 flex-1 font-body">
                          <span className="block text-[13px] font-semibold text-brand-ink">{shipping.serviceName || "Entrega padrão"}</span>
                          <span className="mt-0.5 block text-[11px] text-brand-ink/50">Chega em até {shipping.deliveryTime || 3} dias úteis</span>
                        </div>
                        <span className="shrink-0 font-body text-[14px] font-bold text-[#22a06b]">Grátis</span>
                      </div>
                    </div>
                  </div>
                ) : shipping?.options && shipping.options.length > 0 ? (
                  <div className="mt-2 overflow-hidden rounded-xl border border-brand-ink/12 bg-white">
                    {shipping.options.map((option, index) => {
                      const optionId = String(option.id ?? option.name);
                      const selected = (selectedShipping ?? shipping.serviceName) === option.name;
                      return (
                        <label
                          key={optionId}
                          className={`flex cursor-pointer items-stretch ${index > 0 ? "border-t border-brand-ink/10" : ""} ${selected ? "border-2 border-brand-ink" : ""}`}
                        >
                          <input
                            type="radio"
                            name="cart-drawer-shipping"
                            className="sr-only"
                            checked={selected}
                            onChange={() => setSelectedShipping(option.name)}
                          />
                          <span className={`flex w-11 shrink-0 items-center justify-center ${selected ? "bg-brand-ink text-brand-paper" : "bg-white"}`}>
                            {selected ? <Check size={16} /> : <span className="h-4 w-4 rounded-full border border-brand-ink/25 bg-brand-cream/60" />}
                          </span>
                          <span className="flex flex-1 items-center gap-3 px-3 py-2.5">
                            <span className="min-w-0 flex-1 font-body">
                              <span className="block text-[13px] font-semibold text-brand-ink">{option.name}</span>
                              <span className="mt-0.5 block text-[11px] text-brand-ink/50">Chega em até {option.deliveryTime} dias úteis</span>
                            </span>
                            <span className="shrink-0 font-body text-[14px] font-bold text-brand-ink">{formatBRL(option.price)}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 font-body text-[12px] text-brand-ink/60">Prazo de entrega a confirmar pelo WhatsApp.</p>
                )}
              </>
            )}

            <div className="mt-3 flex items-center justify-between font-body text-[13px] text-brand-ink/70">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between font-body text-[13px] text-brand-ink/70">
              <span>Desconto</span>
              <span>{formatBRL(0)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-brand-ink/10 pt-2.5 font-body text-base font-bold text-brand-ink">
              <span>Total</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <p className="mt-1 text-right font-body text-[12px] text-brand-gold">Ou até 10x de {formatBRL(subtotal / 10)} sem juros</p>
            <button type="button" onClick={onClose} className="mt-4 w-full rounded-full border border-brand-ink px-5 py-3.5 text-center font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper">
              Continuar comprando
            </button>
            <button type="button" onClick={handleCheckout} className="mt-2.5 w-full rounded-full bg-brand-ink px-5 py-3.5 text-center font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-brand-paper transition-colors hover:bg-brand-gold">
              Finalizar compra
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
