"use client";

const FREE_SHIPPING_THRESHOLD = 500;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FreeShippingBar({ subtotal, dark = false }: { subtotal: number; dark?: boolean }) {
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const reached = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className={`rounded-xl border px-3 py-3 ${dark ? "border-brand-paper/15 bg-brand-paper/10 text-brand-paper" : "border-brand-gold/25 bg-brand-paper text-brand-ink"} ${reached ? "free-shipping-reached" : ""}`} aria-live="polite">
      <div className="flex items-center justify-between gap-3 font-body text-[11px] font-semibold uppercase tracking-[0.1em]">
        <span>{reached ? "Frete grátis liberado" : `Frete grátis a partir de ${formatBRL(FREE_SHIPPING_THRESHOLD)}`}</span>
        <span className={dark ? "text-brand-gold" : "text-brand-gold"}>{progress}%</span>
      </div>
      <div className={`mt-2 h-2 overflow-hidden rounded-full ${dark ? "bg-brand-paper/15" : "bg-brand-ink/10"}`}>
        <div className="h-full rounded-full bg-brand-gold transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <p className={`mt-2 font-body text-[11px] leading-4 ${dark ? "text-brand-paper/70" : "text-brand-ink/60"}`}>
        {reached ? "Seu pedido já ganhou frete grátis." : `Faltam ${formatBRL(remaining)} para liberar o frete grátis.`}
      </p>
    </div>
  );
}

export { FREE_SHIPPING_THRESHOLD };
