"use client";

import { useState } from "react";
import { Check, CreditCard, QrCode, X } from "lucide-react";
import { PaymentSelection } from "@/lib/whatsapp";

const INSTALLMENT_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Só é usado no fluxo de "sob encomenda": antes de abrir o WhatsApp,
 * deixamos o cliente escolher Pix ou cartão (e as parcelas) para a
 * mensagem já sair pronta com a forma de pagamento desejada — evita a
 * ida e volta de perguntar isso depois pelo chat.
 */
export default function PaymentMethodModal({
  productName,
  total,
  onConfirm,
  onClose,
}: {
  productName: string;
  total: number;
  onConfirm: (payment: PaymentSelection) => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<PaymentSelection["method"]>("pix");
  const [installments, setInstallments] = useState(10);
  const installmentValue = total / installments;

  function handleConfirm() {
    onConfirm({ method, installments: method === "card" ? installments : 1 });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Forma de pagamento — ${productName}`}>
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] bg-brand-ink text-brand-paper shadow-soft">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-brand-paper/25 text-brand-paper transition-colors hover:bg-brand-paper/10"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        <div className="p-7 sm:p-9">
          <h2 className="pr-8 font-heading text-xl font-semibold leading-tight sm:text-2xl">Como você quer pagar?</h2>
          <p className="mt-2 truncate font-body text-[13px] text-brand-paper/60">{productName}</p>
          <p className="mt-1 font-heading text-lg font-semibold">{formatBRL(total)}</p>

          <fieldset className="mt-6">
            <legend className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-paper/80">Forma de pagamento</legend>
            <div className="mt-3 grid gap-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${method === "pix" ? "border-brand-gold bg-brand-gold/15" : "border-brand-paper/15 bg-brand-paper/5 hover:border-brand-paper/35"}`}>
                <input className="sr-only" type="radio" name="made-to-order-payment-method" value="pix" checked={method === "pix"} onChange={() => setMethod("pix")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${method === "pix" ? "bg-brand-gold text-brand-ink" : "bg-brand-paper/10 text-brand-paper/75"}`}><QrCode size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-[15px] font-semibold text-brand-paper">Pix</span>
                  <span className="mt-0.5 block font-body text-[13px] text-brand-paper/70">Pagamento à vista</span>
                </span>
                {method === "pix" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${method === "card" ? "border-brand-gold bg-brand-gold/15" : "border-brand-paper/15 bg-brand-paper/5 hover:border-brand-paper/35"}`}>
                <input className="sr-only" type="radio" name="made-to-order-payment-method" value="card" checked={method === "card"} onChange={() => setMethod("card")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${method === "card" ? "bg-brand-gold text-brand-ink" : "bg-brand-paper/10 text-brand-paper/75"}`}><CreditCard size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-[15px] font-semibold text-brand-paper">Cartão de crédito</span>
                  <span className="mt-0.5 block font-body text-[13px] text-brand-paper/70">Parcele em até 10x sem juros</span>
                </span>
                {method === "card" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
            </div>

            {method === "card" && (
              <div className="mt-3 rounded-xl bg-brand-paper/10 p-3">
                <label htmlFor="made-to-order-installments" className="block font-body text-[12px] font-semibold uppercase tracking-[0.13em] text-brand-paper/80">Escolha as parcelas</label>
                <select
                  id="made-to-order-installments"
                  value={installments}
                  onChange={(event) => setInstallments(Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-brand-paper/20 bg-brand-ink px-3 py-2.5 font-body text-[15px] text-brand-paper outline-none focus:border-brand-gold"
                >
                  {INSTALLMENT_OPTIONS.map((count) => (
                    <option key={count} value={count}>{count}x de {formatBRL(total / count)} sem juros</option>
                  ))}
                </select>
              </div>
            )}
          </fieldset>

          <div className="mt-5 rounded-xl bg-brand-paper/10 px-3 py-2.5 font-body text-[12px] leading-5 text-brand-paper">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-paper/80">Pagamento escolhido</span>
            {method === "pix" ? "Pix à vista" : `Cartão de crédito · ${installments}x de ${formatBRL(installmentValue)} sem juros`}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-3.5 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-paper transition-all duration-200 hover:bg-brand-paper hover:text-brand-ink active:scale-[0.97]"
          >
            Continuar no WhatsApp <span aria-hidden="true">↗</span>
          </button>
          <p className="mt-3 text-center font-body text-[11px] leading-4 text-brand-paper/60">A mensagem já sai pronta com a forma de pagamento escolhida.</p>
        </div>
      </div>
    </div>
  );
}
