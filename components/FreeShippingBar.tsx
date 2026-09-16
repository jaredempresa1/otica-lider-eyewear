"use client";

import { CheckCircle2 } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 500;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FreeShippingBar({ subtotal, dark = false }: { subtotal: number; dark?: boolean }) {
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const reached = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className={reached ? "free-shipping-reached" : ""} aria-live="polite">
      <div className="flex items-center gap-2">
        <div className={`h-3 flex-1 overflow-hidden rounded-full ${dark ? "bg-brand-paper/15" : "bg-brand-ink/10"}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#a7ddc0] to-[#34a36f] transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {reached && <CheckCircle2 size={20} className="shrink-0 text-[#22a06b]" aria-hidden="true" />}
      </div>
      <p className="mt-2.5 text-center font-body text-[14px] leading-5 text-[#22a06b]">
        {reached ? (
          <span className="font-bold">Sucesso! Você tem frete grátis</span>
        ) : (
          <>
            <span className="font-bold">Ganhe frete grátis</span> com mais <span className="font-bold">{formatBRL(remaining)}</span>
          </>
        )}
      </p>
    </div>
  );
}

export { FREE_SHIPPING_THRESHOLD };
