"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { checkShipping, isValidCep } from "@/lib/shipping";
import { buildWhatsAppLink, buildWhatsAppOrderMessage } from "@/lib/whatsapp";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SacolaPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const [cep, setCep] = useState("");
  const shipping = isValidCep(cep) ? checkShipping(cep) : null;
  const isFreeShipping = shipping?.freeShipping === true;

  function handleCheckout() {
    const message = buildWhatsAppOrderMessage(
      items,
      cep,
      shipping ?? { valid: false, freeShipping: false, regionLabel: null },
    );
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
  }

  if (items.length === 0) {
    return (
      <main className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-lg rounded-[1.5rem] bg-brand-paper px-6 py-14 text-center shadow-card sm:px-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-moss">
            <ShoppingBag size={25} strokeWidth={1.5} />
          </span>
          <p className="eyebrow mt-6">Sua seleção</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] text-brand-ink">Sua sacola está vazia</h1>
          <p className="mx-auto mt-3 max-w-xs font-body text-sm leading-6 text-brand-ink/60">
            Escolha um modelo para começar a montar seu pedido.
          </p>
          <Link href="/produtos" className="btn-brand mt-8">Explorar coleção</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section-shell py-8 sm:py-14">
      <Link href="/produtos" className="inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/55 transition-colors hover:text-brand-gold">
        <ArrowLeft size={14} /> Continuar comprando
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-12">
        <section>
          <div className="flex items-end justify-between border-b border-brand-ink/10 pb-5">
            <div>
              <p className="eyebrow">Seu pedido</p>
              <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.04em] text-brand-ink">Minha sacola</h1>
            </div>
            <span className="font-body text-xs text-brand-ink/50">{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
          </div>

          <ul className="divide-y divide-brand-ink/10">
            {items.map((item) => (
              <li key={`${item.productId}-${item.colorName}`} className="flex gap-4 py-5 sm:gap-5">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-sage/60 sm:h-36 sm:w-32">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2 mix-blend-multiply" />
                  ) : <div className="flex h-full items-center justify-center font-body text-[9px] uppercase tracking-[0.1em] text-brand-ink/35">Sem foto</div>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1">
                  <div>
                    <p className="font-heading text-lg font-semibold tracking-[-0.02em] text-brand-ink">{item.name}</p>
                    <p className="mt-1 font-body text-xs text-brand-ink/55">Cor: {item.colorName}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-brand-ink/15 p-1">
                      <button onClick={() => updateQuantity(item.productId, item.colorName, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Diminuir quantidade"><Minus size={13} /></button>
                      <span className="w-7 text-center font-body text-xs font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.colorName, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Aumentar quantidade"><Plus size={13} /></button>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.colorName)} className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-[0.12em] text-brand-ink/40 transition-colors hover:text-brand-gold" aria-label={`Remover ${item.name}`}><Trash2 size={13} /> <span className="hidden sm:inline">Remover</span></button>
                  </div>
                </div>
                <span className="shrink-0 self-start pt-1 font-body text-sm font-semibold text-brand-ink">{formatBRL(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="h-fit rounded-[1.5rem] bg-brand-ink p-6 text-brand-paper shadow-soft sm:p-8 lg:sticky lg:top-28">
          <p className="eyebrow text-brand-gold">Resumo do pedido</p>
          <h2 className="mt-3 font-heading text-2xl font-semibold">Tudo certo por aqui?</h2>

          <div className="mt-7 space-y-4 border-b border-brand-paper/15 pb-6 font-body text-sm">
            <div className="flex items-center justify-between text-brand-paper/65"><span>Produtos ({totalItems})</span><span>{formatBRL(subtotal)}</span></div>
            <div>
              <div className="flex items-center justify-between text-brand-paper/65"><span>Frete</span><span>{isFreeShipping ? "Grátis" : "A combinar"}</span></div>
              <label className="mt-4 block font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-paper/45" htmlFor="cep">Calcule pelo CEP</label>
              <input id="cep" type="text" inputMode="numeric" placeholder="00000-000" value={cep} onChange={(event) => setCep(event.target.value)} className="mt-2 w-full rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-4 py-3 font-body text-sm text-brand-paper outline-none placeholder:text-brand-paper/35 focus:border-brand-gold" />
              {shipping && <p className="mt-2 font-body text-[11px] leading-5 text-brand-paper/60">{isFreeShipping ? `Frete grátis para ${shipping.regionLabel}.` : "Para este CEP, combinaremos o frete pelo WhatsApp."}</p>}
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4"><span className="font-body text-sm text-brand-paper/65">Total do pedido</span><span className="text-right font-heading text-2xl font-semibold text-brand-paper">{formatBRL(subtotal)}</span></div>
          <button onClick={handleCheckout} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-4 font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-paper transition-all duration-200 hover:bg-brand-paper hover:text-brand-ink active:scale-[0.97]">Finalizar pelo WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="mt-3 text-center font-body text-[10px] leading-4 text-brand-paper/40">Seu pedido será enviado já organizado para nosso atendimento.</p>
        </aside>
      </div>
    </main>
  );
}
