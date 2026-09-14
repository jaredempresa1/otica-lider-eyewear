"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/CartContext";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CartDrawerContext.Provider value={{ open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      {isOpen && <CartDrawer onClose={() => setIsOpen(false)} />}
    </CartDrawerContext.Provider>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  function handleCheckout() {
    onClose();
    router.push("/sacola");
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50" onClick={onClose}>
      <div className="flex h-full w-full max-w-sm flex-col bg-brand-paper shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between bg-brand-ink px-5 py-4">
          <span className="font-body text-sm font-bold uppercase tracking-[0.14em] text-brand-paper">Minha sacola</span>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-brand-paper/80 transition-colors hover:text-brand-gold">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag size={32} strokeWidth={1.5} className="text-brand-ink/30" />
              <p className="font-body text-sm text-brand-ink/60">Sua sacola está vazia.</p>
              <button type="button" onClick={onClose} className="mt-2 rounded-full border border-brand-ink px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper">
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={`${item.productId}-${item.colorName}`} className="flex gap-3 border-b border-brand-ink/10 pb-4 last:border-none">
                  {item.image && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-ink/5">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-body text-sm font-semibold leading-snug text-brand-ink">{item.name}</p>
                      <button type="button" onClick={() => removeItem(item.productId, item.colorName)} aria-label="Remover item" className="shrink-0 text-brand-ink/40 transition-colors hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="font-body text-sm font-semibold text-brand-ink">{formatBRL(item.price)}</p>
                    <div className="mt-1 flex w-fit items-center gap-3 rounded-full border border-brand-ink/15 px-3 py-1.5">
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
            <div className="flex items-center justify-between font-body text-[13px] text-brand-ink/70">
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
  );
}
