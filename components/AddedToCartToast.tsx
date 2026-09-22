"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const AUTO_DISMISS_MS = 4000;

export default function AddedToCartToast() {
  const { lastAddedItem, dismissLastAdded } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAddedItem) return;
    setVisible(true);
    const hideTimer = window.setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    // Some tempo depois do fade-out pra realmente desmontar (evita "piscar" o card vazio).
    const clearTimer = window.setTimeout(() => dismissLastAdded(), AUTO_DISMISS_MS + 300);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAddedItem?.addedAt]);

  function handleClose() {
    setVisible(false);
    window.setTimeout(() => dismissLastAdded(), 300);
  }

  if (!lastAddedItem) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[76px] z-[95] flex justify-center px-4 sm:top-[92px]" aria-live="polite">
      <div
        className={`pointer-events-auto w-full max-w-sm rounded-2xl bg-brand-paper p-4 shadow-2xl ring-1 ring-brand-ink/10 transition-all duration-300 ease-premium-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-start gap-3">
          {lastAddedItem.image ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-sage/20">
              <Image src={lastAddedItem.image} alt={lastAddedItem.name} fill className="object-contain p-1" sizes="56px" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate font-body text-[13px] font-semibold text-brand-ink">{lastAddedItem.name}</p>
            <p className="mt-0.5 font-body text-xs text-brand-ink/55">
              {lastAddedItem.quantity}x {formatBRL(lastAddedItem.price)}
            </p>
            <p className="mt-1.5 font-body text-[13px] font-bold text-brand-moss">Adicionado ao carrinho!</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar aviso"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-ink/5 hover:text-brand-ink"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
