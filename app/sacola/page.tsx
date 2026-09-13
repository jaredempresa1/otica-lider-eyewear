"use client";

/**
 * Direção visual: a sacola mantém o painel escuro e sofisticado da Ótica Líder,
 * usando o dourado para evidenciar escolhas de pagamento e conversão.
 */
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, CreditCard, Minus, Plus, QrCode, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { checkShipping, isValidCep, ShippingResult } from "@/lib/shipping";
import { buildWhatsAppLink, buildWhatsAppOrderMessage, PaymentSelection } from "@/lib/whatsapp";
import { FIRST_PURCHASE_COUPON, FIRST_PURCHASE_MINIMUM, getCouponDiscount, normalizeCoupon } from "@/lib/coupon";
import AbandonedCartSignup from "@/components/AbandonedCartSignup";
import FreeShippingBar from "@/components/FreeShippingBar";
import { supabase } from "@/lib/supabaseClient";
import { EMPTY_ADDRESS, getMyAddress, saveMyAddress, SavedAddress } from "@/lib/address";
import { lookupCep } from "@/lib/viacep";

const INSTALLMENT_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SacolaPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const router = useRouter();
  const [cep, setCep] = useState("");
  const [payment, setPayment] = useState<PaymentSelection>({ method: "pix", installments: 10 });
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [address, setAddress] = useState<Omit<SavedAddress, "cep">>(EMPTY_ADDRESS);
  const [loggedIn, setLoggedIn] = useState(false);
  const [cepInvalid, setCepInvalid] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState(false);
  const isFreeShipping = shipping?.freeShipping === true;
  const couponDiscount = getCouponDiscount(appliedCoupon, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const installmentValue = discountedSubtotal / payment.installments;

  // Preço "de" x "por": some óculos estão em oferta (compareAtPrice > price).
  // O subtotal do resumo mostra o valor cheio, e a diferença some como
  // desconto — bem parecido com o que aparece no resumo de qualquer loja.
  const grossSubtotal = items.reduce((sum, item) => {
    const unitGross = item.compareAtPrice && item.compareAtPrice > item.price ? item.compareAtPrice : item.price;
    return sum + unitGross * item.quantity;
  }, 0);
  const offerDiscount = Math.max(0, grossSubtotal - subtotal);

  // Se o cliente já tem conta, carrega o CEP + endereço salvos da última
  // compra automaticamente — igual à Renner, à Amazon etc.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setLoggedIn(true);
      const saved = await getMyAddress();
      if (saved) {
        setCep(saved.cep);
        setAddress({ logradouro: saved.logradouro, numero: saved.numero, complemento: saved.complemento, bairro: saved.bairro, cidade: saved.cidade, estado: saved.estado });
      }
    });
  }, []);

  // Assim que o CEP muda, limpamos rua/bairro/cidade NA HORA (não espera a
  // busca terminar) — assim nunca fica sobrando informação do CEP anterior
  // na tela. Só depois disso buscamos o endereço novo (ViaCEP) e conferimos
  // se o CEP realmente existe. Se não existir, avisamos e bloqueamos o
  // pedido: number/complemento continuam como o cliente digitou, já que não
  // têm nada a ver com o CEP em si.
  useEffect(() => {
    setCepInvalid(false);
    setAddress((current) => ({ ...current, logradouro: "", bairro: "", cidade: "", estado: "" }));

    if (!isValidCep(cep)) return;

    let cancelled = false;
    setCheckingAddress(true);
    lookupCep(cep).then((result) => {
      if (cancelled) return;
      setCheckingAddress(false);
      if (result.exists === false) {
        setCepInvalid(true);
        return;
      }
      if (result.address) {
        setAddress((current) => ({ ...current, logradouro: result.address!.logradouro, bairro: result.address!.bairro, cidade: result.address!.cidade, estado: result.address!.estado }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cep]);

  // Assim que o cliente termina de digitar o CEP (8 dígitos), esperamos
  // meio segundo (pra não disparar uma chamada a cada tecla) e então
  // consultamos a API de geocodificação + a área de frete grátis.
  useEffect(() => {
    if (!isValidCep(cep) || cepInvalid) {
      setShipping(null);
      setCheckingShipping(false);
      return;
    }

    let cancelled = false;
    setCheckingShipping(true);

    const timer = setTimeout(() => {
	    checkShipping(cep, items).then((result) => {
        if (!cancelled) {
          setShipping(result);
          setCheckingShipping(false);
        }
      });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
	  }, [cep, items, cepInvalid]);

  function selectPaymentMethod(method: PaymentSelection["method"]) {
    setPayment((current) => ({ ...current, method }));
  }

	function handleInstallments(installments: number) {
	  setPayment({ method: "card", installments });
	}

	function handleShippingOption(optionId: string) {
	  const option = shipping?.options?.find((item) => String(item.id ?? item.name) === optionId);
	  if (!option) return;
	  setShipping((current) => current ? {
	    ...current,
	    price: option.price,
	    deliveryTime: option.deliveryTime,
	    serviceName: option.name,
	  } : current);
	}

  function handleCheckout() {
			const message = buildWhatsAppOrderMessage(
				items,
				cep,
				shipping ?? { valid: false, freeShipping: false, regionLabel: null, source: "invalid" },
				payment,
				appliedCoupon ? { code: appliedCoupon, discount: couponDiscount } : undefined,
				address,
			);
	    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");

	    // Se o cliente estiver logado, guarda o endereço usado nesta compra —
	    // assim ele já vem pronto da próxima vez, sem precisar redigitar.
	    if (loggedIn && isValidCep(cep)) {
	      saveMyAddress({ cep, ...address });
	    }
  }

  function handleApplyCoupon() {
    const normalized = normalizeCoupon(couponInput);
    if (normalized !== FIRST_PURCHASE_COUPON) {
      setAppliedCoupon("");
      setCouponMessage("Esse cupom não é válido. Confira o código e tente novamente.");
      return;
    }
    if (subtotal <= FIRST_PURCHASE_MINIMUM) {
      setAppliedCoupon("");
      setCouponMessage("Esse cupom é válido apenas para compras acima de R$ 400.");
      return;
    }
    setAppliedCoupon(normalized);
    setCouponMessage("Cupom aplicado: você economizou R$ 50 na primeira compra.");
  }

  if (items.length === 0) {
    return (
      <main className="section-shell py-16 sm:py-24">
        <div className="mx-auto max-w-lg rounded-[1.5rem] bg-brand-paper px-6 py-14 text-center shadow-card sm:px-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-moss">
            <ShoppingCart size={25} strokeWidth={1.5} />
          </span>
          <p className="eyebrow mt-6">Sua seleção</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] text-brand-ink">Seu carrinho está vazio</h1>
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
              <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.04em] text-brand-ink">Meu carrinho</h1>
            </div>
            <span className="font-body text-[13px] text-brand-ink/50">{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
          </div>

          <ul className="space-y-4">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <li key={`${item.productId}-${item.colorName}`} onClick={() => router.push(`/produtos/${item.slug}`)} className="group mx-0 grid cursor-pointer grid-cols-[6rem_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-3 shadow-card transition-transform hover:-translate-y-0.5 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:gap-5 sm:p-4">
                  <Link href={`/produtos/${item.slug}`} onClick={(event) => event.stopPropagation()} className="relative h-24 w-24 overflow-hidden rounded-2xl bg-brand-sage/60 sm:h-36 sm:w-32" aria-label={`Voltar para ${item.name}`}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 96px, 128px" className="object-contain p-2 mix-blend-multiply" />
                    ) : <div className="flex h-full items-center justify-center font-body text-[10px] uppercase tracking-[0.1em] text-brand-ink/35">Sem foto</div>}
                  </Link>
                  <div className="flex min-w-0 flex-col justify-between gap-3 py-1">
                    <div>
                      <p className="font-heading text-[19px] font-semibold tracking-[-0.02em] text-brand-ink">{item.name}</p>
                      <p className="mt-1 font-body text-[13px] text-brand-ink/55">Cor: {item.colorName}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-brand-ink/15 p-1">
                        <button onClick={(event) => { event.stopPropagation(); updateQuantity(item.productId, item.colorName, item.quantity - 1); }} className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Diminuir quantidade"><Minus size={14} /></button>
                        <span className="w-7 text-center font-body text-[13px] font-semibold">{item.quantity}</span>
                        <button onClick={(event) => { event.stopPropagation(); updateQuantity(item.productId, item.colorName, item.quantity + 1); }} className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-sage" aria-label="Aumentar quantidade"><Plus size={14} /></button>
                      </div>
                      <button onClick={(event) => { event.stopPropagation(); removeItem(item.productId, item.colorName); }} className="flex items-center gap-1.5 font-body text-[11px] uppercase tracking-[0.12em] text-brand-ink/40 transition-colors hover:text-brand-gold" aria-label={`Remover ${item.name}`}><Trash2 size={14} /> <span className="hidden sm:inline">Remover</span></button>
                    </div>
                  </div>
                  <div className="min-w-0 self-start pt-1 text-right font-body">
                    <span className="block text-[17px] font-semibold text-brand-ink">{formatBRL(itemTotal)}</span>
                    <span className="mt-1 block text-[12px] leading-4 text-brand-ink">ou até 10x de {formatBRL(itemTotal / 10)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="h-fit rounded-[1.5rem] bg-brand-ink p-6 text-brand-paper shadow-soft sm:p-8 lg:sticky lg:top-28">
          <h2 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-paper sm:text-4xl">Resumo do pedido</h2>

          <div className="mt-7 space-y-4 border-b border-brand-paper/15 pb-6 font-body text-[16px]">
            <div className="flex items-center justify-between text-brand-paper"><span>Subtotal ({totalItems})</span><span>{formatBRL(grossSubtotal)}</span></div>
            {offerDiscount > 0 && <div className="flex items-center justify-between text-red-400"><span>Desconto em ofertas</span><span>- {formatBRL(offerDiscount)}</span></div>}
            <div className="mt-5">
              <label htmlFor="coupon" className="block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-paper">Cupom de primeira compra</label>
              <div className="mt-2 flex gap-2">
                <input id="coupon" value={couponInput} onChange={(event) => setCouponInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") handleApplyCoupon(); }} placeholder="Digite seu cupom" className="min-w-0 flex-1 rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-3 py-2.5 font-body text-[13px] uppercase text-brand-paper outline-none placeholder:text-brand-paper/45 focus:border-brand-gold" />
                <button type="button" onClick={handleApplyCoupon} className="rounded-xl border border-brand-gold px-3 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink">Aplicar</button>
              </div>
              {couponMessage && <p className={`mt-2 font-body text-[12px] leading-5 ${couponDiscount > 0 ? "text-brand-gold" : "text-brand-paper/70"}`} role="status">{couponMessage}</p>}
              <div className="mt-4"><FreeShippingBar subtotal={subtotal} dark /></div>
            </div>
            {couponDiscount > 0 && <div className="flex items-center justify-between text-brand-gold"><span>Cupom ({appliedCoupon})</span><span>- {formatBRL(couponDiscount)}</span></div>}
            <div>
		            <div className="flex items-center justify-between text-brand-paper">
		              <span>Frete</span>
		              <span>{isFreeShipping ? "Frete grátis" : shipping?.price != null ? formatBRL(shipping.price) : "A combinar"}</span>
		            </div>
              <label className="mt-4 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-paper" htmlFor="cep">Calcule pelo CEP</label>
              <input id="cep" type="text" inputMode="numeric" placeholder="00000-000" value={cep} onChange={(event) => setCep(event.target.value)} className="mt-2 w-full rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-4 py-3 font-body text-[15px] text-brand-paper outline-none placeholder:text-brand-paper/50 focus:border-brand-gold" />
              {loggedIn && <p className="mt-1.5 font-body text-[11px] leading-4 text-brand-paper/55">Preenchido automaticamente com o endereço da sua conta.</p>}
              {cepInvalid && <p className="mt-2 font-body text-[13px] font-semibold leading-5 text-red-400">CEP inválido. Confira o número e tente de novo.</p>}
              {!cepInvalid && (checkingShipping || checkingAddress) && <p className="mt-2 font-body text-[13px] leading-5 text-brand-paper/70 sm:text-[14px]">Calculando frete para esse CEP…</p>}
	              {!cepInvalid && !checkingShipping && !checkingAddress && shipping && (
	                <div className="mt-2 font-body text-[13px] leading-5 text-brand-paper sm:text-[14px]">
		                  {isFreeShipping ? (
		                    <p className="font-semibold text-brand-gold">Frete grátis para {shipping.regionLabel || "sua região"} · até {shipping.deliveryTime || 3} dias úteis.</p>
		                  ) : shipping?.price != null ? (
		                    <>
		                      <p className="font-semibold">{formatBRL(shipping.price)} para {shipping.regionLabel || "seu CEP"}</p>
		                      {shipping.options && shipping.options.length > 1 && (
		                        <label className="mt-1.5 block">
		                          <span className="sr-only">Escolha o tipo de frete</span>
		                          <select value={shipping.options.find((option) => option.name === shipping.serviceName)?.id ?? shipping.serviceName ?? ""} onChange={(event) => handleShippingOption(event.target.value)} className="w-full rounded-xl border border-brand-paper/20 bg-brand-ink px-3 py-2.5 font-body text-[13px] text-brand-paper outline-none focus:border-brand-gold">
	                            {shipping.options.map((option) => <option key={`${option.id}-${option.name}`} value={option.id ?? option.name}>{option.name} — {formatBRL(option.price)} · entrega estimada em até {option.deliveryTime} dias úteis após a postagem</option>)}
	                          </select>
	                        </label>
	                      )}
	                      {shipping.options?.length === 1 && <p className="mt-1.5">{shipping.serviceName || "Frete"} · entrega estimada em até {shipping.deliveryTime} dias úteis após a postagem.</p>}
	                    </>
	                  ) : <p>{shipping?.error || "Prazo de entrega a confirmar pelo WhatsApp."}</p>}
                </div>
              )}

              {isValidCep(cep) && !cepInvalid && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <input value={address.logradouro} onChange={(event) => setAddress((current) => ({ ...current, logradouro: event.target.value }))} placeholder="Rua" className="col-span-2 rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-3 py-2.5 font-body text-[13px] text-brand-paper outline-none placeholder:text-brand-paper/50 focus:border-brand-gold" />
                  <input value={address.numero} onChange={(event) => setAddress((current) => ({ ...current, numero: event.target.value }))} placeholder="Número" className="rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-3 py-2.5 font-body text-[13px] text-brand-paper outline-none placeholder:text-brand-paper/50 focus:border-brand-gold" />
                  <input value={address.complemento} onChange={(event) => setAddress((current) => ({ ...current, complemento: event.target.value }))} placeholder="Complemento (opcional)" className="rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-3 py-2.5 font-body text-[13px] text-brand-paper outline-none placeholder:text-brand-paper/50 focus:border-brand-gold" />
                  <input value={address.bairro} onChange={(event) => setAddress((current) => ({ ...current, bairro: event.target.value }))} placeholder="Bairro" className="rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-3 py-2.5 font-body text-[13px] text-brand-paper outline-none placeholder:text-brand-paper/50 focus:border-brand-gold" />
                  <input value={address.cidade ? `${address.cidade}${address.estado ? ` - ${address.estado}` : ""}` : ""} readOnly placeholder="Cidade" className="rounded-xl border border-brand-paper/10 bg-brand-paper/5 px-3 py-2.5 font-body text-[13px] text-brand-paper/70 outline-none" />
                </div>
              )}
            </div>
          </div>

          <fieldset className="mt-6 border-b border-brand-paper/15 pb-6">
            <legend className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-paper">Forma de pagamento</legend>
            <div className="mt-3 grid gap-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payment.method === "pix" ? "border-brand-gold bg-brand-gold/15" : "border-brand-paper/15 bg-brand-paper/5 hover:border-brand-paper/35"}`}>
                <input className="sr-only" type="radio" name="payment-method" value="pix" checked={payment.method === "pix"} onChange={() => selectPaymentMethod("pix")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${payment.method === "pix" ? "bg-brand-gold text-brand-ink" : "bg-brand-paper/10 text-brand-paper/75"}`}><QrCode size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block font-body text-[15px] font-semibold text-brand-paper">Pix</span><span className="mt-0.5 block font-body text-[13px] text-brand-paper">Pagamento à vista</span></span>
                {payment.method === "pix" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payment.method === "card" ? "border-brand-gold bg-brand-gold/15" : "border-brand-paper/15 bg-brand-paper/5 hover:border-brand-paper/35"}`}>
                <input className="sr-only" type="radio" name="payment-method" value="card" checked={payment.method === "card"} onChange={() => selectPaymentMethod("card")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${payment.method === "card" ? "bg-brand-gold text-brand-ink" : "bg-brand-paper/10 text-brand-paper/75"}`}><CreditCard size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block font-body text-[15px] font-semibold text-brand-paper">Cartão de crédito</span><span className="mt-0.5 block font-body text-[13px] text-brand-paper">Parcele em até 10x sem juros</span></span>
                {payment.method === "card" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
            </div>

            {payment.method === "card" && (
              <div className="mt-3 rounded-xl bg-brand-paper/10 p-3">
                <label htmlFor="installments" className="block font-body text-[12px] font-semibold uppercase tracking-[0.13em] text-brand-paper">Escolha as parcelas</label>
                <select id="installments" value={payment.installments} onChange={(event) => handleInstallments(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-brand-paper/20 bg-brand-ink px-3 py-2.5 font-body text-[15px] text-brand-paper outline-none focus:border-brand-gold">
                  {INSTALLMENT_OPTIONS.map((installments) => <option key={installments} value={installments}>{installments}x de {formatBRL(discountedSubtotal / installments)} sem juros</option>)}
                </select>
              </div>
            )}
          </fieldset>

		          <div className="mt-5 flex items-end justify-between gap-4"><span className="font-body text-[16px] text-brand-paper">Total do pedido</span><span className="text-right font-heading text-[26px] font-semibold text-brand-paper">{formatBRL(discountedSubtotal + (shipping?.price || 0))}</span></div>
          <div className="mt-2 rounded-xl bg-brand-paper/10 px-3 py-2.5 font-body text-[12px] leading-5 text-brand-paper" aria-live="polite">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-paper">Pagamento escolhido</span>
            {payment.method === "pix" ? "Pix à vista" : `Cartão de crédito · ${payment.installments}x de ${formatBRL(installmentValue)} sem juros`}
          </div>
          <button onClick={handleCheckout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-4 font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-brand-paper transition-all duration-200 hover:bg-brand-paper hover:text-brand-ink active:scale-[0.97]">Enviar pedido pelo WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="mt-3 text-center font-body text-[11px] leading-4 text-brand-paper/70">Seu pedido será enviado já organizado, com a forma de pagamento escolhida. A equipe costuma responder em até 1 minuto.</p>
          <AbandonedCartSignup items={items} />
        </aside>
      </div>
    </main>
  );
}
