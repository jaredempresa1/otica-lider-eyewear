"use client";

/**
 * Direção visual: sacola com visual claro e clean (fundo branco/creme,
 * listras finas entre itens), no mesmo espírito do drawer "Minha sacola".
 * O dourado da marca continua marcando seleção e conversão.
 */
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, CreditCard, Lock, Minus, Plus, QrCode, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import CepLookupModal from "@/components/CepLookupModal";

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
  const [showCepLookup, setShowCepLookup] = useState(false);
  const skipNextClearRef = useRef(false);
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
        skipNextClearRef.current = true;
        setCep(saved.cep);
        setAddress({ logradouro: saved.logradouro, numero: saved.numero, complemento: saved.complemento, bairro: saved.bairro, cidade: saved.cidade, estado: saved.estado });
      }
    });
  }, []);

  // Assim que o CEP muda, limpamos TODO o endereço na hora (rua, número,
  // complemento, bairro, cidade) — não espera a busca terminar, assim nunca
  // fica sobrando informação do CEP anterior na tela. Só depois disso
  // buscamos o endereço novo (ViaCEP) e conferimos se o CEP realmente
  // existe. Se não existir, avisamos.
  useEffect(() => {
    // Exceção: quando o CEP acabou de ser preenchido automaticamente com o
    // endereço já salvo na conta (no carregamento da página), não faz
    // sentido limpar o que acabamos de carregar.
    if (skipNextClearRef.current) {
      skipNextClearRef.current = false;
      return;
    }

    setCepInvalid(false);
    setAddress((current) => ({ ...current, logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }));

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
    <>
      <div className="flex items-center justify-between bg-black px-4 py-3 sm:px-8">
        <span className="font-body text-sm font-black uppercase tracking-[-0.03em] text-white sm:text-base">Ótica Líder</span>
        <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-white sm:text-xs">
          Site seguro <Lock size={13} strokeWidth={2} />
        </span>
      </div>
      <main className="section-shell bg-white py-5 sm:py-10">
      <Link href="/produtos" className="mb-4 inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55 transition-colors hover:text-brand-gold sm:mb-6">
        <ArrowLeft size={15} /> Continuar comprando
      </Link>

      <div className="mx-auto mt-2 grid max-w-6xl gap-5 lg:grid-cols-[1fr_390px] lg:gap-8">
        <section>
          <div className="flex items-end justify-between border-b border-brand-ink/10 pb-3">
            <div>
              <p className="eyebrow text-[10px]">Seu pedido</p>
              <h1 className="mt-1 font-heading text-3xl font-semibold uppercase tracking-[-0.04em] text-brand-ink sm:text-4xl">Sacola</h1>
            </div>
            <span className="font-body text-[13px] text-brand-ink/50">{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
          </div>

          <ul className="divide-y divide-brand-ink/8">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <li key={`${item.productId}-${item.colorName}`} onClick={() => router.push(`/produtos/${item.slug}`)} className="group grid cursor-pointer grid-cols-[4.5rem_minmax(0,1fr)_auto] items-start gap-3 py-4 transition-opacity hover:opacity-80 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:gap-5 sm:py-5">
                  <Link href={`/produtos/${item.slug}`} onClick={(event) => event.stopPropagation()} className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7] sm:h-28 sm:w-28" aria-label={`Voltar para ${item.name}`}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 80px, 112px" className="object-contain p-2 mix-blend-multiply" />
                    ) : <div className="flex h-full items-center justify-center font-body text-[10px] uppercase tracking-[0.1em] text-brand-ink/35">Sem foto</div>}
                  </Link>
                  <div className="flex min-w-0 flex-col justify-between gap-3 py-0.5">
                    <div>
                      <p className="font-body text-[12px] font-bold uppercase leading-snug text-brand-ink sm:text-[15px]">{item.name}</p>
                      <p className="mt-1 font-body text-[11px] uppercase tracking-[0.04em] text-brand-ink/55 sm:text-[13px]">Cor: {item.colorName}</p>
                      <p className="mt-1 font-body text-[12px] font-semibold text-brand-ink sm:hidden">{formatBRL(itemTotal)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-brand-ink/15 p-0.5">
                        <button onClick={(event) => { event.stopPropagation(); updateQuantity(item.productId, item.colorName, item.quantity - 1); }} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand-sage" aria-label="Diminuir quantidade"><Minus size={13} /></button>
                        <span className="w-6 text-center font-body text-[13px] font-semibold text-brand-ink">{item.quantity}</span>
                        <button onClick={(event) => { event.stopPropagation(); updateQuantity(item.productId, item.colorName, item.quantity + 1); }} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand-sage" aria-label="Aumentar quantidade"><Plus size={13} /></button>
                      </div>
                      <button onClick={(event) => { event.stopPropagation(); removeItem(item.productId, item.colorName); }} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink/35 transition-colors hover:bg-brand-ink/5 hover:text-brand-gold" aria-label={`Remover ${item.name}`}><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="hidden min-w-0 self-start text-right font-body sm:block">
                    <span className="block text-[15px] font-semibold text-brand-ink">{formatBRL(itemTotal)}</span>
                    <span className="mt-1 block text-[12px] leading-4 text-brand-ink/45">ou até 10x de {formatBRL(itemTotal / 10)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="h-fit rounded-xl border border-brand-ink/10 bg-white p-4 shadow-[0_3px_18px_rgba(0,0,0,0.06)] sm:p-6 lg:sticky lg:top-28">
          <h2 className="font-heading text-xl font-semibold tracking-[-0.02em] text-brand-ink">Resumo do pedido</h2>

          <div className="mt-4 space-y-3 border-b border-brand-ink/8 pb-5 font-body text-[13px] text-brand-ink">
            <div className="flex items-center justify-between"><span className="text-brand-ink/60">Subtotal ({totalItems})</span><span>{formatBRL(grossSubtotal)}</span></div>
            {offerDiscount > 0 && <div className="flex items-center justify-between text-red-600"><span>Desconto em ofertas</span><span>- {formatBRL(offerDiscount)}</span></div>}
            <div className="pt-2">
              <label htmlFor="coupon" className="block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">Cupom de primeira compra</label>
              <div className="mt-2 flex gap-2">
              <input id="coupon" value={couponInput} onChange={(event) => setCouponInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") handleApplyCoupon(); }} placeholder="Digite seu cupom" className="min-w-0 flex-1 rounded-md border border-brand-ink/15 bg-white px-3 py-2.5 font-body text-[12px] uppercase text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
                <button type="button" onClick={handleApplyCoupon} className="rounded-md bg-black px-3 font-body text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-gold">Aplicar</button>
              </div>
              {couponMessage && <p className={`mt-2 font-body text-[12px] leading-5 ${couponDiscount > 0 ? "text-brand-gold" : "text-brand-ink/50"}`} role="status">{couponMessage}</p>}
              <div className="mt-4"><FreeShippingBar subtotal={subtotal} /></div>
            </div>
            {couponDiscount > 0 && <div className="flex items-center justify-between font-semibold text-brand-gold"><span>Cupom ({appliedCoupon})</span><span>- {formatBRL(couponDiscount)}</span></div>}
            <div className="pt-1">
		            <div className="flex items-center justify-between">
		              <span className="text-brand-ink/60">Frete</span>
		              <span>{isFreeShipping ? "Frete grátis" : shipping?.price != null ? formatBRL(shipping.price) : "A combinar"}</span>
		            </div>
              <label className="mt-4 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60" htmlFor="cep">Calcule pelo CEP</label>
              <input id="cep" type="text" inputMode="numeric" placeholder="00000-000" value={cep} onChange={(event) => setCep(event.target.value)} className="mt-2 w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
              <button type="button" onClick={() => setShowCepLookup(true)} className="mt-1.5 font-body text-[12px] font-semibold text-brand-gold underline decoration-brand-gold/40 underline-offset-4 hover:text-brand-ink">Não sei meu CEP</button>
              {loggedIn && <p className="mt-1.5 font-body text-[11px] leading-4 text-brand-ink/45">Preenchido automaticamente com o endereço da sua conta.</p>}
              {cepInvalid && <p className="mt-2 font-body text-[13px] font-semibold leading-5 text-red-600">CEP inválido. Confira o número e tente de novo.</p>}
              {!cepInvalid && (checkingShipping || checkingAddress) && <p className="mt-2 font-body text-[13px] leading-5 text-brand-ink/50 sm:text-[14px]">Calculando frete para esse CEP…</p>}
	              {!cepInvalid && !checkingShipping && !checkingAddress && shipping && (
	                <div className="mt-2 font-body text-[13px] leading-5 text-brand-ink sm:text-[14px]">
		                  {isFreeShipping ? (
		                    <p className="font-semibold text-brand-gold">Frete grátis para {shipping.regionLabel || "sua região"} · até {shipping.deliveryTime || 3} dias úteis.</p>
		                  ) : shipping?.price != null ? (
		                    <>
		                      <p className="font-semibold">{formatBRL(shipping.price)} para {shipping.regionLabel || "seu CEP"}</p>
		                      {shipping.options && shipping.options.length > 1 && (
		                        <label className="mt-1.5 block">
		                          <span className="sr-only">Escolha o tipo de frete</span>
		                          <select value={shipping.options.find((option) => option.name === shipping.serviceName)?.id ?? shipping.serviceName ?? ""} onChange={(event) => handleShippingOption(event.target.value)} className="w-full rounded-xl border border-brand-ink/15 bg-brand-cream/50 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none focus:border-brand-gold">
	                            {shipping.options.map((option) => <option key={`${option.id}-${option.name}`} value={option.id ?? option.name}>{option.name} — {formatBRL(option.price)} · entrega estimada em até {option.deliveryTime} dias úteis após a postagem</option>)}
	                          </select>
	                        </label>
	                      )}
	                      {shipping.options?.length === 1 && <p className="mt-1.5 text-brand-ink/70">{shipping.serviceName || "Frete"} · entrega estimada em até {shipping.deliveryTime} dias úteis após a postagem.</p>}
	                    </>
	                  ) : <p className="text-brand-ink/70">{shipping?.error || "Prazo de entrega a confirmar pelo WhatsApp."}</p>}
                </div>
              )}

              {isValidCep(cep) && !cepInvalid && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <input value={address.logradouro} onChange={(event) => setAddress((current) => ({ ...current, logradouro: event.target.value }))} placeholder="Rua" className="col-span-2 rounded-xl border border-brand-ink/15 bg-brand-cream/50 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
                  <input value={address.numero} onChange={(event) => setAddress((current) => ({ ...current, numero: event.target.value }))} placeholder="Número" className="rounded-xl border border-brand-ink/15 bg-brand-cream/50 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
                  <input value={address.complemento} onChange={(event) => setAddress((current) => ({ ...current, complemento: event.target.value }))} placeholder="Complemento (opcional)" className="rounded-xl border border-brand-ink/15 bg-brand-cream/50 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
                  <input value={address.bairro} onChange={(event) => setAddress((current) => ({ ...current, bairro: event.target.value }))} placeholder="Bairro" className="rounded-xl border border-brand-ink/15 bg-brand-cream/50 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
                  <input value={address.cidade ? `${address.cidade}${address.estado ? ` - ${address.estado}` : ""}` : ""} readOnly placeholder="Cidade" className="rounded-xl border border-brand-ink/10 bg-brand-ink/5 px-3 py-2.5 font-body text-[13px] text-brand-ink/60 outline-none" />
                </div>
              )}
            </div>
          </div>

          <fieldset className="mt-5 border-b border-brand-ink/8 pb-5">
            <legend className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">Forma de pagamento</legend>
            <div className="mt-3 grid gap-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payment.method === "pix" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/12 bg-brand-cream/30 hover:border-brand-ink/25"}`}>
                <input className="sr-only" type="radio" name="payment-method" value="pix" checked={payment.method === "pix"} onChange={() => selectPaymentMethod("pix")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${payment.method === "pix" ? "bg-brand-gold text-white" : "bg-brand-ink/8 text-brand-ink/60"}`}><QrCode size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block font-body text-[15px] font-semibold text-brand-ink">Pix</span><span className="mt-0.5 block font-body text-[13px] text-brand-ink/55">Pagamento à vista</span></span>
                {payment.method === "pix" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payment.method === "card" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/12 bg-brand-cream/30 hover:border-brand-ink/25"}`}>
                <input className="sr-only" type="radio" name="payment-method" value="card" checked={payment.method === "card"} onChange={() => selectPaymentMethod("card")} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${payment.method === "card" ? "bg-brand-gold text-white" : "bg-brand-ink/8 text-brand-ink/60"}`}><CreditCard size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block font-body text-[15px] font-semibold text-brand-ink">Cartão de crédito</span><span className="mt-0.5 block font-body text-[13px] text-brand-ink/55">Parcele em até 10x sem juros</span></span>
                {payment.method === "card" && <Check size={17} className="text-brand-gold" aria-hidden="true" />}
              </label>
            </div>

            {payment.method === "card" && (
              <div className="mt-3 rounded-xl bg-brand-cream/50 p-3">
                <label htmlFor="installments" className="block font-body text-[12px] font-semibold uppercase tracking-[0.13em] text-brand-ink/60">Escolha as parcelas</label>
                <select id="installments" value={payment.installments} onChange={(event) => handleInstallments(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-brand-ink/15 bg-white px-3 py-2.5 font-body text-[15px] text-brand-ink outline-none focus:border-brand-gold">
                  {INSTALLMENT_OPTIONS.map((installments) => <option key={installments} value={installments}>{installments}x de {formatBRL(discountedSubtotal / installments)} sem juros</option>)}
                </select>
              </div>
            )}
          </fieldset>

          <div className="mt-5 flex items-end justify-between gap-4"><span className="font-body text-[13px] text-brand-ink/70">Total do pedido</span><span className="text-right font-heading text-[25px] font-semibold text-brand-ink">{formatBRL(discountedSubtotal + (shipping?.price || 0))}</span></div>
          <div className="mt-2 rounded-xl bg-brand-cream/60 px-3 py-2.5 font-body text-[12px] leading-5 text-brand-ink/75" aria-live="polite">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/50">Pagamento escolhido</span>
            {payment.method === "pix" ? "Pix à vista" : `Cartão de crédito · ${payment.installments}x de ${formatBRL(installmentValue)} sem juros`}
          </div>
          <button onClick={handleCheckout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#079447] px-5 py-3.5 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:bg-[#057c3b] active:scale-[0.97]">Enviar pedido pelo WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="mt-3 text-center font-body text-[10px] leading-4 text-brand-ink/60">Seu pedido será enviado já organizado, com a forma de pagamento escolhida. A equipe costuma responder em até 1 minuto.</p>
          <AbandonedCartSignup items={items} />
        </aside>
      </div>
      {showCepLookup && <CepLookupModal onClose={() => setShowCepLookup(false)} onSelectCep={setCep} />}
      </main>
    </>
  );
}
