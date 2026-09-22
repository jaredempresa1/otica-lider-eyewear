"use client";

/**
 * Direção visual: sacola com visual claro e clean (fundo branco/creme,
 * listras finas entre itens), no mesmo espírito do drawer "Minha sacola".
 * O dourado da marca continua marcando seleção e conversão.
 */
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronDown, ChevronRight, CreditCard, Lock, MapPin, Minus, Plus, QrCode, ShoppingCart, Tag, Trash2, Truck, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { checkShipping, cleanCep, isValidCep, ShippingResult } from "@/lib/shipping";
import { CHECKOUT_CEP_KEY } from "@/lib/checkoutCep";
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
  const [couponBoxOpen, setCouponBoxOpen] = useState(false);
  const [address, setAddress] = useState<Omit<SavedAddress, "cep">>(EMPTY_ADDRESS);
  const [loggedIn, setLoggedIn] = useState(false);
  const [cepInvalid, setCepInvalid] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [deliveryName, setDeliveryName] = useState("");
  const [deliverySurname, setDeliverySurname] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [payerName, setPayerName] = useState("");
  const [payerSurname, setPayerSurname] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [payerCep, setPayerCep] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"entrega" | "pagamento">("entrega");
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [addressEditing, setAddressEditing] = useState(true);
  const [showCepLookupFor, setShowCepLookupFor] = useState<"entrega" | "payer" | null>(null);
  const skipNextClearRef = useRef(false);
  const drawerCepRef = useRef<string | null>(null);
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

  // O cliente pode ter consultado um CEP na pré-visualização do carrinho.
  // Nesse caso ele continua valendo aqui, em vez de ser trocado pelo CEP
  // salvo na conta.
  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(CHECKOUT_CEP_KEY);
      if (stored && isValidCep(stored)) {
        drawerCepRef.current = stored;
        setCep(stored);
      }
    } catch {
      // sessionStorage indisponível: segue com o CEP da conta.
    }
  }, []);

  // Se o cliente já tem conta, carrega o CEP + endereço salvos da última
  // compra automaticamente — igual à Renner, à Amazon etc.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setLoggedIn(true);
      const saved = await getMyAddress();
      if (!saved) return;
      // Veio um CEP diferente do carrinho? Ele tem prioridade: o endereço
      // certo será buscado pelo próprio CEP (ViaCEP).
      if (drawerCepRef.current && cleanCep(drawerCepRef.current) !== cleanCep(saved.cep)) return;
      skipNextClearRef.current = true;
      setCep(saved.cep);
      setAddress({ logradouro: saved.logradouro, numero: saved.numero, complemento: saved.complemento, bairro: saved.bairro, cidade: saved.cidade, estado: saved.estado });
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
    setAddressEditing(true);
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
        setAddressEditing(false);
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

  const REQUIRED_MESSAGE = "Esse campo deve ser preenchido.";

  function validateContactAndDelivery(): boolean {
    const errors: Record<string, string> = {};
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());

    if (!contactEmail.trim()) errors.contactEmail = REQUIRED_MESSAGE;
    else if (!emailValid) errors.contactEmail = "Digite um e-mail em um formato válido.";

    if (!deliveryName.trim()) errors.deliveryName = REQUIRED_MESSAGE;
    if (!deliverySurname.trim()) errors.deliverySurname = REQUIRED_MESSAGE;
    if (!deliveryPhone.trim()) errors.deliveryPhone = REQUIRED_MESSAGE;
    if (!isValidCep(cep) || cepInvalid) errors.cep = "Digite um CEP válido.";
    if (!address.numero.trim() && isValidCep(cep) && !cepInvalid) errors.numero = REQUIRED_MESSAGE;
    if (!documentNumber.trim()) errors.documentNumber = REQUIRED_MESSAGE;

    if (!sameAsDelivery) {
      if (!payerName.trim()) errors.payerName = REQUIRED_MESSAGE;
      if (!payerSurname.trim()) errors.payerSurname = REQUIRED_MESSAGE;
      if (!payerPhone.trim()) errors.payerPhone = REQUIRED_MESSAGE;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinueToPayment() {
    if (!validateContactAndDelivery()) return;
    setOrderDetailsOpen(false);
    setStep("pagamento");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCheckout() {
    if (!validateContactAndDelivery()) return;

			const message = buildWhatsAppOrderMessage(
				items,
				cep,
				shipping ?? { valid: false, freeShipping: false, regionLabel: null, source: "invalid" },
				payment,
				appliedCoupon ? { code: appliedCoupon, discount: couponDiscount } : undefined,
				address,
				{
					name: deliveryName,
					surname: deliverySurname,
					phone: deliveryPhone,
					email: contactEmail,
					document: documentNumber,
					payer: sameAsDelivery ? undefined : { name: payerName, surname: payerSurname, phone: payerPhone },
				},
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

  const orderSummaryDetails = (
    <>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={`${item.productId}-${item.colorName}`} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]">
              {item.image && <Image src={item.image} alt={item.name} fill sizes="48px" className="object-contain p-0.5" />}
            </div>
            <div className="min-w-0 flex-1 font-body text-[13px] leading-snug text-brand-ink">
              <p className="truncate font-semibold">{item.name}</p>
              <p className="text-brand-ink/50">{item.colorName} × {item.quantity}</p>
            </div>
            <span className="shrink-0 font-body text-[13px] font-semibold text-brand-ink">{formatBRL(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1.5 border-t border-brand-ink/8 pt-3 font-body text-[13px] text-brand-ink">
        <div className="flex items-center justify-between"><span className="text-brand-ink/60">Subtotal</span><span>{formatBRL(grossSubtotal)}</span></div>
        {offerDiscount > 0 && <div className="flex items-center justify-between text-red-600"><span>Desconto em ofertas</span><span>- {formatBRL(offerDiscount)}</span></div>}
        {couponDiscount > 0 && <div className="flex items-center justify-between text-brand-gold"><span>Cupom ({appliedCoupon})</span><span>- {formatBRL(couponDiscount)}</span></div>}
        <div className="flex items-center justify-between"><span className="text-brand-ink/60">Custo de frete</span><span>{isFreeShipping ? "Grátis" : shipping?.price != null ? formatBRL(shipping.price) : "A calcular"}</span></div>
        <div className="flex items-center justify-between pt-1.5 font-bold"><span>Total</span><span>{formatBRL(discountedSubtotal + (shipping?.price || 0))}</span></div>
      </div>
    </>
  );

  const couponWidget = !couponBoxOpen ? (
    <button
      type="button"
      onClick={() => setCouponBoxOpen(true)}
      aria-expanded={couponBoxOpen}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-ink/25 py-3 font-body text-[13px] font-semibold text-brand-ink transition-colors hover:border-brand-ink"
    >
      <Tag size={15} className="shrink-0" />
      Tem cupom de desconto?
    </button>
  ) : (
    <div>
      <div className="flex items-center gap-1.5 rounded-full border border-brand-ink/25 bg-white p-1.5 pl-4">
        <input
          id="coupon"
          value={couponInput}
          onChange={(event) => setCouponInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") handleApplyCoupon(); }}
          placeholder="Código do cupom"
          autoFocus
          className="min-w-0 flex-1 border-none bg-transparent font-body text-[13px] uppercase text-brand-ink outline-none ring-0 placeholder:normal-case placeholder:text-brand-ink/40 focus:outline-none focus:ring-0 focus-visible:outline-none"
        />
        <button type="button" onClick={handleApplyCoupon} className="flex shrink-0 items-center gap-1 rounded-full bg-brand-ink px-4 py-2.5 font-body text-[12px] font-semibold text-white transition-colors hover:bg-brand-gold">
          Aplicar <ChevronRight size={14} />
        </button>
      </div>
      {couponMessage && <p className={`mt-2 px-2 font-body text-[12px] leading-5 ${couponDiscount > 0 ? "text-brand-gold" : "text-brand-ink/50"}`} role="status">{couponMessage}</p>}
    </div>
  );

  return (
    <>
      <main className="section-shell bg-brand-cream/30 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-md lg:max-w-5xl">
          <div className="flex justify-end pb-2">
            <span className="flex items-center gap-1 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-ink/40">
              Site seguro <Lock size={11} strokeWidth={2} />
            </span>
          </div>

          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
            <div>
              {/* Resumo/valor do pedido + detalhes recolhíveis (apenas mobile — no desktop vira a barra lateral) */}
              <div className="border-b border-brand-ink/10 lg:hidden">
                <button
                  type="button"
                  onClick={() => setOrderDetailsOpen((value) => !value)}
                  aria-expanded={orderDetailsOpen}
                  className="flex w-full items-center justify-between py-3.5"
                >
                  <span className="flex items-center gap-1.5 font-body text-[13px] font-semibold text-brand-ink/70">
                    <ChevronDown size={16} className={`transition-transform duration-300 ease-premium-out ${orderDetailsOpen ? "rotate-180" : ""}`} />
                    {orderDetailsOpen ? "Ocultar detalhes" : "Ver detalhes do pedido"}
                  </span>
                  <span className="font-heading text-[17px] font-semibold text-brand-ink">{formatBRL(discountedSubtotal + (shipping?.price || 0))}</span>
                </button>

                {orderDetailsOpen && <div className="border-t border-brand-ink/8 py-4">{orderSummaryDetails}</div>}
              </div>

              {/* Stepper: Carrinho -> Entrega -> Pagamento */}
              <div className="mt-5 flex items-center gap-1.5 px-1 lg:mt-0">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-ink text-brand-paper"><Check size={15} /></span>
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-ink/60">Carrinho</span>
                </div>
                <span className="mb-4 h-px flex-1 bg-brand-ink/15" />
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "entrega" ? "bg-brand-ink text-brand-paper" : "bg-brand-ink/10 text-brand-ink/50"}`}>
                    {step === "pagamento" ? <Check size={15} /> : <Truck size={15} />}
                  </span>
                  <span className={`font-body text-[10px] font-semibold uppercase tracking-[0.08em] ${step === "entrega" ? "text-brand-ink" : "text-brand-ink/50"}`}>Entrega</span>
                </div>
                <span className="mb-4 h-px flex-1 bg-brand-ink/15" />
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "pagamento" ? "bg-brand-ink text-brand-paper" : "bg-brand-ink/10 text-brand-ink/50"}`}><Wallet size={15} /></span>
                  <span className={`font-body text-[10px] font-semibold uppercase tracking-[0.08em] ${step === "pagamento" ? "text-brand-ink" : "text-brand-ink/50"}`}>Pagamento</span>
                </div>
              </div>

              {step === "entrega" && (
                <div className="mt-5">
                  {/* Cupom (apenas mobile — no desktop aparece na barra lateral) */}
                  <div className="lg:hidden">{couponWidget}</div>

                  <div className="mt-4 lg:mt-0"><FreeShippingBar subtotal={subtotal} /></div>

                  {/* Dados de contato */}
                  <div className="mt-5 border-t border-brand-ink/8 pt-4">
                    <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">Dados de contato</p>
                    <input
                  id="contact-email"
                  type="email"
                  placeholder="E-mail"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  className={`mt-2 w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.contactEmail ? "border-red-500" : "border-brand-ink/15"}`}
                />
                {fieldErrors.contactEmail && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.contactEmail}</p>}
                <label className="mt-2.5 flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={newsletterOptIn} onChange={(event) => setNewsletterOptIn(event.target.checked)} className="h-4 w-4 rounded border-brand-ink/25 text-brand-gold focus:ring-brand-gold" />
                  <span className="font-body text-[12px] text-brand-ink/60">Receber ofertas e novidades por e-mail</span>
                </label>
              </div>

              {/* Dados para entrega */}
              <div className="mt-5 border-t border-brand-ink/8 pt-4">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">Dados para entrega</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <input placeholder="Nome" value={deliveryName} onChange={(event) => setDeliveryName(event.target.value)} className={`w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.deliveryName ? "border-red-500" : "border-brand-ink/15"}`} />
                    {fieldErrors.deliveryName && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.deliveryName}</p>}
                  </div>
                  <div>
                    <input placeholder="Sobrenome" value={deliverySurname} onChange={(event) => setDeliverySurname(event.target.value)} className={`w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.deliverySurname ? "border-red-500" : "border-brand-ink/15"}`} />
                    {fieldErrors.deliverySurname && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.deliverySurname}</p>}
                  </div>
                </div>
                <input placeholder="Telefone com DDD" value={deliveryPhone} onChange={(event) => setDeliveryPhone(event.target.value)} className={`mt-2 w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.deliveryPhone ? "border-red-500" : "border-brand-ink/15"}`} />
                {fieldErrors.deliveryPhone && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.deliveryPhone}</p>}

                {(!isValidCep(cep) || addressEditing) && (
                  <>
                    <label className="mt-3 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60" htmlFor="cep">Endereço de entrega</label>
                    <input id="cep" type="text" inputMode="numeric" placeholder="CEP" value={cep} onChange={(event) => setCep(event.target.value)} className={`mt-2 w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.cep ? "border-red-500" : "border-brand-ink/15"}`} />
                    <button type="button" onClick={() => setShowCepLookupFor("entrega")} className="mt-1.5 font-body text-[12px] font-semibold text-brand-gold underline decoration-brand-gold/40 underline-offset-4 hover:text-brand-ink">Não sei meu CEP</button>
                    {fieldErrors.cep && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.cep}</p>}
                    {loggedIn && <p className="mt-1.5 font-body text-[11px] leading-4 text-brand-ink/45">Preenchido automaticamente com o endereço da sua conta.</p>}
                    {cepInvalid && <p className="mt-2 font-body text-[13px] font-semibold leading-5 text-red-600">CEP inválido. Confira o número e tente de novo.</p>}
                    {!cepInvalid && (checkingShipping || checkingAddress) && <p className="mt-2 font-body text-[13px] leading-5 text-brand-ink/50">Calculando frete para esse CEP…</p>}
                  </>
                )}

                {isValidCep(cep) && !cepInvalid && !addressEditing && address.logradouro && (
                  <div className="mt-3 flex items-start justify-between gap-2 rounded-xl border border-brand-ink/12 bg-brand-cream/40 px-3 py-3">
                    <div className="flex items-start gap-2">
                      <MapPin size={17} className="mt-0.5 shrink-0 text-brand-ink/50" />
                      <div className="font-body text-[13px] leading-5 text-brand-ink">
                        <p>{address.logradouro}</p>
                        <p className="font-semibold">CEP {cep} - {address.bairro}</p>
                        <p>{address.cidade} - {address.estado}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setAddressEditing(true)} className="shrink-0 font-body text-[12px] font-semibold text-brand-gold hover:text-brand-ink">Alterar</button>
                  </div>
                )}

                {isValidCep(cep) && !cepInvalid && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <input value={address.numero} onChange={(event) => setAddress((current) => ({ ...current, numero: event.target.value }))} placeholder="Número" className={`w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.numero ? "border-red-500" : "border-brand-ink/15"}`} />
                      {fieldErrors.numero && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.numero}</p>}
                    </div>
                    <input value={address.complemento} onChange={(event) => setAddress((current) => ({ ...current, complemento: event.target.value }))} placeholder="Apto, Bloco, Referência (opcional)" className="w-full rounded-xl border border-brand-ink/15 bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
                  </div>
                )}
              </div>

              {/* Entrega: opções de frete (PAC/SEDEX via Melhor Envio) */}
              {isValidCep(cep) && !cepInvalid && !checkingShipping && shipping && (
                <div className="mt-5 border-t border-brand-ink/8 pt-4">
                  <p className="font-heading text-[20px] font-bold text-brand-ink">Entrega</p>

                  {isFreeShipping ? (
                    <div className="mt-3 overflow-hidden rounded-xl border-2 border-brand-ink bg-white">
                      <div className="flex items-stretch">
                        <span className="flex w-12 shrink-0 items-center justify-center bg-brand-ink text-brand-paper"><Check size={17} /></span>
                        <div className="flex flex-1 items-center gap-3 px-3 py-3">
                          <div className="min-w-0 flex-1 font-body">
                            <span className="block text-[14px] font-semibold text-brand-ink">{shipping.serviceName || "Entrega padrão"}</span>
                            <span className="mt-0.5 block text-[12px] text-brand-ink/50">Chega em até {shipping.deliveryTime || 3} dias úteis</span>
                          </div>
                          <span className="shrink-0 font-body text-[15px] font-bold text-[#22a06b]">Grátis</span>
                        </div>
                      </div>
                    </div>
                  ) : shipping.options && shipping.options.length > 0 ? (
                    <>
                      <p className="mt-3 flex items-center gap-2 font-body text-[13px] text-brand-ink/60">
                        <Truck size={16} className="shrink-0" /> Envio em domicílio
                      </p>
                      <div className="mt-2 overflow-hidden rounded-xl border border-brand-ink/12 bg-white">
                        {shipping.options.map((option, index) => {
                          const optionId = String(option.id ?? option.name);
                          const selected = option.name === shipping.serviceName;
                          return (
                            <label
                              key={optionId}
                              className={`flex cursor-pointer items-stretch ${index > 0 ? "border-t border-brand-ink/10" : ""} ${selected ? "border-2 border-brand-ink" : ""}`}
                            >
                              <input type="radio" name="shipping-option" className="sr-only" checked={selected} onChange={() => handleShippingOption(optionId)} />
                              <span className={`flex w-12 shrink-0 items-center justify-center ${selected ? "bg-brand-ink text-brand-paper" : "bg-white"}`}>
                                {selected ? <Check size={17} /> : <span className="h-5 w-5 rounded-full border border-brand-ink/25 bg-brand-cream/60" />}
                              </span>
                              <span className="flex flex-1 items-center gap-3 px-3 py-3">
                                <span className="min-w-0 flex-1 font-body">
                                  <span className="block text-[14px] font-semibold text-brand-ink">{option.name}</span>
                                  <span className="mt-0.5 block text-[12px] text-brand-ink/50">Chega em até {option.deliveryTime} dias úteis</span>
                                </span>
                                <span className="shrink-0 font-body text-[15px] font-bold text-brand-ink">{formatBRL(option.price)}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 font-body text-[13px] text-brand-ink/60">{shipping.error || "Prazo de entrega a confirmar pelo WhatsApp."}</p>
                  )}
                </div>
              )}

              {/* Dados para nota fiscal */}
              <div className="mt-5 border-t border-brand-ink/8 pt-4">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">Dados para nota fiscal</p>
                <label className="mt-2 block font-body text-[11px] text-brand-ink/50" htmlFor="pais">País</label>
                <select id="pais" defaultValue="BR" disabled className="mt-1 w-full rounded-xl border border-brand-ink/15 bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none focus:border-brand-gold">
                  <option value="BR">Brasil</option>
                </select>
                <input
                  placeholder="CPF ou CNPJ"
                  value={documentNumber}
                  onChange={(event) => setDocumentNumber(event.target.value)}
                  className={`mt-2 w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.documentNumber ? "border-red-500" : "border-brand-ink/15"}`}
                />
                {fieldErrors.documentNumber && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.documentNumber}</p>}

                <label className="mt-3 flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={sameAsDelivery}
                    onChange={(event) => setSameAsDelivery(event.target.checked)}
                    className="h-4 w-4 rounded border-brand-ink/25 text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="font-body text-[13px] text-brand-ink/75">Usar as mesmas informações da entrega</span>
                </label>

                {!sameAsDelivery && (
                  <div className="mt-3">
                    <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">Dados de quem vai fazer o pagamento</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <input placeholder="Nome" value={payerName} onChange={(event) => setPayerName(event.target.value)} className={`w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.payerName ? "border-red-500" : "border-brand-ink/15"}`} />
                        {fieldErrors.payerName && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.payerName}</p>}
                      </div>
                      <div>
                        <input placeholder="Sobrenome" value={payerSurname} onChange={(event) => setPayerSurname(event.target.value)} className={`w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.payerSurname ? "border-red-500" : "border-brand-ink/15"}`} />
                        {fieldErrors.payerSurname && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.payerSurname}</p>}
                      </div>
                    </div>
                    <input placeholder="Telefone com DDD" value={payerPhone} onChange={(event) => setPayerPhone(event.target.value)} className={`mt-2 w-full rounded-xl border bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold ${fieldErrors.payerPhone ? "border-red-500" : "border-brand-ink/15"}`} />
                    {fieldErrors.payerPhone && <p className="mt-1.5 font-body text-[12px] font-semibold text-red-600">{fieldErrors.payerPhone}</p>}
                    <input placeholder="CEP" value={payerCep} onChange={(event) => setPayerCep(event.target.value)} className="mt-2 w-full rounded-xl border border-brand-ink/15 bg-white/70 px-3 py-2.5 font-body text-[13px] text-brand-ink outline-none placeholder:text-brand-ink/35 focus:border-brand-gold" />
                    <button type="button" onClick={() => setShowCepLookupFor("payer")} className="mt-1.5 font-body text-[12px] font-semibold text-brand-gold underline decoration-brand-gold/40 underline-offset-4 hover:text-brand-ink">Não sei meu CEP</button>
                  </div>
                )}
              </div>

              <button type="button" onClick={handleContinueToPayment} className="mt-5 w-full rounded-full bg-brand-ink px-5 py-3.5 text-center font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-brand-paper transition-colors hover:bg-brand-gold">
                Continuar para pagamento
              </button>
            </div>
          )}

          {step === "pagamento" && (
            <div className="mt-5">
              <button type="button" onClick={() => setStep("entrega")} className="font-body text-[12px] font-semibold text-brand-ink/60 hover:text-brand-gold">← Voltar para entrega</button>

              <fieldset className="mt-4">
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
                  <div className="mt-3 rounded-xl bg-white/70 p-3">
                    <label htmlFor="installments" className="block font-body text-[12px] font-semibold uppercase tracking-[0.13em] text-brand-ink/60">Escolha as parcelas</label>
                    <select id="installments" value={payment.installments} onChange={(event) => handleInstallments(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-brand-ink/15 bg-white px-3 py-2.5 font-body text-[15px] text-brand-ink outline-none focus:border-brand-gold">
                      {INSTALLMENT_OPTIONS.map((installments) => <option key={installments} value={installments}>{installments}x de {formatBRL(discountedSubtotal / installments)} sem juros</option>)}
                    </select>
                  </div>
                )}
              </fieldset>

              <div className="mt-5 flex items-end justify-between gap-4 border-t border-brand-ink/8 pt-4"><span className="font-body text-[13px] text-brand-ink/70">Total do pedido</span><span className="text-right font-heading text-[25px] font-semibold text-brand-ink">{formatBRL(discountedSubtotal + (shipping?.price || 0))}</span></div>
              <div className="mt-2 rounded-xl bg-brand-cream/60 px-3 py-2.5 font-body text-[12px] leading-5 text-brand-ink/75" aria-live="polite">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/50">Pagamento escolhido</span>
                {payment.method === "pix" ? "Pix à vista" : `Cartão de crédito · ${payment.installments}x de ${formatBRL(installmentValue)} sem juros`}
              </div>
              <button onClick={handleCheckout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#079447] px-5 py-3.5 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:bg-[#057c3b] active:scale-[0.97]">Enviar pedido pelo WhatsApp <span aria-hidden="true">↗</span></button>
              <Link href="/produtos" className="mt-3 block text-center font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink/70 transition-colors hover:text-brand-gold">
                Comprar mais produtos
              </Link>
              <p className="mt-3 text-center font-body text-[10px] leading-4 text-brand-ink/60">Seu pedido será enviado já organizado, com a forma de pagamento escolhida. A equipe costuma responder em até 1 minuto.</p>
              <AbandonedCartSignup items={items} />
            </div>
          )}
            </div>

            <aside className="hidden lg:sticky lg:top-6 lg:block">
              <div className="rounded-xl border border-brand-ink/10 bg-white p-4 shadow-[0_3px_18px_rgba(0,0,0,0.05)]">
                {orderSummaryDetails}
              </div>
              {step === "entrega" && <div className="mt-4">{couponWidget}</div>}
            </aside>
          </div>
        </div>
      </main>

      {showCepLookupFor && (
        <CepLookupModal
          onClose={() => setShowCepLookupFor(null)}
          onSelectCep={(value) => {
            if (showCepLookupFor === "payer") setPayerCep(value);
            else setCep(value);
            setShowCepLookupFor(null);
          }}
        />
      )}
    </>
  );
}
