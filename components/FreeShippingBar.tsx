"use client";

/**
 * Barra de progresso de frete grátis nacional (mínimo R$500 no carrinho).
 * Usada tanto na página do produto (mostra o progresso considerando o
 * carrinho atual + este produto, mesmo com a sacola vazia) quanto na sacola
 * (progresso real do subtotal). Dispara uma animação de destaque no exato
 * momento em que o valor cruza os R$500.
 */
import { useEffect, useRef, useState } from "react";
import { Truck } from "lucide-react";

const FREE_SHIPPING_GOAL = 500;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FreeShippingBar({
  subtotal,
  context = "product",
  variant = "light",
  className = "",
}: {
  subtotal: number;
  context?: "product" | "cart";
  variant?: "light" | "dark";
  className?: string;
}) {
  const progress = Math.min(100, Math.max(0, (subtotal / FREE_SHIPPING_GOAL) * 100));
  const achieved = subtotal >= FREE_SHIPPING_GOAL;
  const remaining = Math.max(0, FREE_SHIPPING_GOAL - subtotal);

  const [celebrate, setCelebrate] = useState(false);
  const wasAchieved = useRef(achieved);

  useEffect(() => {
    if (achieved && !wasAchieved.current) {
      setCelebrate(true);
      const timeout = setTimeout(() => setCelebrate(false), 1100);
      wasAchieved.current = true;
      return () => clearTimeout(timeout);
    }
    wasAchieved.current = achieved;
  }, [achieved]);

  const achievedText =
    context === "cart"
      ? "Seu pedido tem frete grátis para todo o Brasil"
      : "Você garantiu frete grátis para todo o Brasil";

  const isDark = variant === "dark";

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors duration-300 ${
        isDark
          ? achieved
            ? "border-brand-gold/50 bg-brand-gold/15"
            : "border-brand-paper/15 bg-brand-paper/5"
          : achieved
            ? "border-brand-gold/40 bg-brand-gold/10"
            : "border-brand-ink/10 bg-brand-paper"
      } ${celebrate ? "free-shipping-celebrate" : ""} ${className}`}
    >
      <div className="flex items-center gap-2">
        <Truck
          size={16}
          strokeWidth={2}
          className={`shrink-0 ${achieved ? "text-brand-gold" : isDark ? "text-brand-paper/60" : "text-brand-ink/45"} ${celebrate ? "free-shipping-truck" : ""}`}
        />
        <p
          className={`truncate whitespace-nowrap font-body text-[11.5px] font-semibold uppercase tracking-[0.06em] sm:text-[12px] ${
            isDark ? "text-brand-paper" : "text-brand-ink"
          }`}
        >
          {achieved ? achievedText : `Faltam ${formatBRL(remaining)} para frete grátis no Brasil todo`}
        </p>
      </div>

      <div className={`mt-2.5 h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-brand-paper/15" : "bg-brand-ink/10"}`}>
        <div
          className="h-full rounded-full bg-brand-gold transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={`mt-1.5 flex items-center justify-between font-body text-[10px] ${isDark ? "text-brand-paper/50" : "text-brand-ink/45"}`}>
        <span>{formatBRL(Math.min(subtotal, FREE_SHIPPING_GOAL))}</span>
        <span>{formatBRL(FREE_SHIPPING_GOAL)}</span>
      </div>
    </div>
  );
}
