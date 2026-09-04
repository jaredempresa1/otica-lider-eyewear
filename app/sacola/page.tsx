"use client";

/**
 * Direção visual: a sacola mantém o painel escuro e sofisticado da Ótica Líder,
 * usando o dourado para evidenciar escolhas de pagamento e conversão.
 */
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Minus, Plus, QrCode, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { checkShipping, isValidCep } from "@/lib/shipping";
import { buildWhatsAppLink, buildWhatsAppOrderMessage, PaymentSelection } from "@/lib/whatsapp";

const INSTALLMENT_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SacolaPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const [cep, setCep] = useState("");
  const [payment, setPayment] = useState<PaymentSelection>({ method: "pix", installments: 10 });
  const shipping = isValidCep(cep) ? checkShipping(cep) : null;
  const isFreeShipping = shipping?.freeShipping === true;
  const installmentValue = subtotal / payment.installments;

  function selectPaymentMethod(method: PaymentSelection["method"]) {
    setPayment((current) => ({ ...current, method }));
  }

  function handleInstallments(installments: number) {
    setPayment({ method: "card", installments });
  }

  function handleCheckout() {
    const message = buildWhatsAppOrderMessage(
      items,
      cep,
      shipping ?? { valid: false, freeShipping: false, regionLabel: null },
      payment,
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
          <p className="mx-auto mt-3 max-w-xs font-body text-[15px] leading-6 text-brand-ink/60">
            Escolha um modelo para começar a montar seu pedido.
          </p>
          <Link href="/produtos" className="btn-brand mt-8">Explorar coleção</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section-shell py-8 sm:py-14">
      <Link href="/produtos" className="inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/55 transition-colors hover:text-brand-gold">
        <ArrowLeft size={15} /> Continuar comprando
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_410px] lg:gap-12">
        <section>
          <div className="flex items-end justify-between border-b border-brand-ink/10 pb-5">
            <div>
              <p className="eyebrow">Seu pedido</p>
              <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.04em] text-brand-ink">Minha sacola</h1>
            </div>
            <span className="font-body text-[13px] text-brand-ink/50">{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
          </div>

          <ul className="divide-y divide-brand-ink/10">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <li key={`${item.productId}-${item.colorName}`} className="flex gap-4 py-5 sm:gap-5">
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-sage/60 sm:h-36 sm:w-32">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2 mix-blend-multiply" />
                    ) : <div className="flex h-full items-center justify-center font-body text-[10px] uppercase tracking-[0.1em] text-brand-ink/35">Sem foto</div>}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1">
                    <div>
                      <p className="font-heading text-[19px] font-semibold tracking-[-0.02em] text-brand-ink">{item.name}</p>
                      <p className="mt-1 font-body text-[13px] text-brand-ink/55">Cor: {item.colorName}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-brand-ink/15 p-1">
                        <button onClick={() => updateQuantity(item.productId, item.colorName, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Diminuir quantidade"><Minus size={14} /></button>
                        <span className="w-7 text-center font-body text-[13px] font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.colorName, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Aumentar quantidade"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.colorName)} className="flex items-center gap-1.5 font-body text-[11px] uppercase tracking-[0.12em] text-brand-ink/40 transition-colors hover:text-brand-gold" aria-label={`Remover ${item.name}`}><Trash2 size={14} /> <span className="hidden sm:inline">Remover</span></button>
                    </div>
                  </div>
                  <div className="shrink-0 self-start pt-1 text-right font-body">
                    <span className="block text-[15px] font-semibold text-brand-ink">{formatBRL(itemTotal)}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-brand-ink/55">ou até 10x de {formatBRL(itemTotal / 10)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="h-fit rounded-[1.5rem] bg-brand-ink p-6 text-brand-paper shadow-soft sm:p-8 lg:sticky lg:top-28">
          <p className="eyebrow text-brand-gold">Resumo do pedido</p>
          <h2 className="mt-3 font-heading text-2xl font-semibold">Tudo certo por aqui?</h2>

          <div className="mt-7 space-y-4 border-b border-brand-paper/15 pb-6 font-body text-[15px]">
            <div className="flex items-center justify-between text-brand-paper/65"><span>Produtos ({totalItems})</span><span>{formatBRL(subtotal)}</span></div>
            <div>
              <div className="flex items-center justify-between text-brand-paper/65"><span>Frete</span><span>{isFreeShipping ? "Grátis" : "A combinar"}</span></div>
              <label className="mt-4 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-paper/45" htmlFor="cep">Calcule pelo CEP</label>
              <input id="cep" type="text" inputMode="numeric" placeholder="00000-000" value={cep} onChange={(event) => setCep(event.target.value)} className="mt-2 w-full rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-4 py-3 font-body text-[15px] text-brand-paper outline-none placeholder:text-brand-paper/35 focus:border-brand-gold" />
              {shipping && <p className="mt-2 font-body text-[12px] leading-5 text-brand-paper/60">{isFreeShipping ? `Frete grátis para ${shipping.regionLabel}.` : "Para este CEP, combinaremos o frete pelo WhatsApp."}</p>}
            </div>
          </div>

          <fieldset className="mt-6 border-b border-brand-paper/15 pb-6">
            <legend className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-paper/55">Forma de pagamento</legend>
            <div className="mt-3 grid gap-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payment.method === "pix" ? "border-brand-gold bg-brand-gold/15" : "border-brand-paper/15 bg-brand-paper/5 hover:border-brand-paper/35"}`}>
                <input className="sr-only" type="radio" name="payment-method" value="pix" checked={payment.method === "pix"} onChange={() => selectPaymentMethod("pix")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${payment.method === "pix" ? "bg-brand-gold text-brand-ink" : "bg-brand-paper/10 text-brand-paper/75"}`}><QrCode size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block font-body text-[14px] font-semibold text-brand-paper">Pix</span><span className="mt-0.5 block font-body text-[12px] text-brand-paper/55">Pagamento à vista</span></span>
                {payment.method === "pix" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payment.method === "card" ? "border-brand-gold bg-brand-gold/15" : "border-brand-paper/15 bg-brand-paper/5 hover:border-brand-paper/35"}`}>
                <input className="sr-only" type="radio" name="payment-method" value="card" checked={payment.method === "card"} onChange={() => selectPaymentMethod("card")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${payment.method === "card" ? "bg-brand-gold text-brand-ink" : "bg-brand-paper/10 text-brand-paper/75"}`}><CreditCard size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block font-body text-[14px] font-semibold text-brand-paper">Cartão de crédito</span><span className="mt-0.5 block font-body text-[12px] text-brand-paper/55">Parcele em até 10x sem juros</span></span>
                {payment.method === "card" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
            </div>

            {payment.method === "card" && (
              <div className="mt-3 rounded-xl bg-brand-paper/10 p-3">
                <label htmlFor="installments" className="block font-body text-[11px] font-semibold uppercase tracking-[0.13em] text-brand-paper/55">Escolha as parcelas</label>
                <select id="installments" value={payment.installments} onChange={(event) => handleInstallments(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-brand-paper/20 bg-brand-ink px-3 py-2.5 font-body text-[14px] text-brand-paper outline-none focus:border-brand-gold">
                  {INSTALLMENT_OPTIONS.map((installments) => <option key={installments} value={installments}>{installments}x de {formatBRL(subtotal / installments)} sem juros</option>)}
                </select>
              </div>
            )}
          </fieldset>

          <div className="mt-5 flex items-end justify-between gap-4"><span className="font-body text-[15px] text-brand-paper/65">Total do pedido</span><span className="text-right font-heading text-2xl font-semibold text-brand-paper">{formatBRL(subtotal)}</span></div>
          <div className="mt-2 rounded-xl bg-brand-paper/10 px-3 py-2.5 font-body text-[12px] leading-5 text-brand-paper/70" aria-live="polite">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-paper/45">Pagamento escolhido</span>
            {payment.method === "pix" ? "Pix à vista" : `Cartão de crédito · ${payment.installments}x de ${formatBRL(installmentValue)} sem juros`}
          </div>
          <button onClick={handleCheckout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-4 font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-brand-paper transition-all duration-200 hover:bg-brand-paper hover:text-brand-ink active:scale-[0.97]">Enviar pedido pelo WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="mt-3 text-center font-body text-[11px] leading-4 text-brand-paper/40">Seu pedido será enviado já organizado, com a forma de pagamento escolhida.</p>
        </aside>
      </div>
    </main>
  );
}

