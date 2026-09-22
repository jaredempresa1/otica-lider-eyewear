"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Check, Copy, Gift, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { FIRST_PURCHASE_COUPON } from "@/lib/coupon";
import { hasCollectedCoupon, markCouponCollected, markDeclined, wasRecentlyDeclined } from "@/lib/scratchOffer";

type Screen = "closed" | "scratch" | "email" | "success";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Gatilhos de exibição: o que vier primeiro abre o popup.
const DELAY_MS = 7000;
const SCROLL_PERCENT = 30;

// Resolução interna do canvas da raspadinha (a exibição é escalada por CSS).
const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 190;
const BRUSH_RADIUS = 26;
const REVEAL_THRESHOLD = 0.55;

export default function ScratchOfferPopup() {
  const [screen, setScreen] = useState<Screen>("closed");
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [showGiftButton, setShowGiftButton] = useState(false);
  const [suppressed, setSuppressed] = useState(true); // começa suprimido até confirmarmos as regras
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchingRef = useRef(false);
  const hasTriggeredRef = useRef(false);

  // --- Regras de exibição -----------------------------------------------
  // Nunca mais mostra se: já coletou o cupom, ou é um cliente logado
  // (aproximação de "já comprou" — o site ainda não tem histórico de pedidos
  // pra checar isso com precisão).
  useEffect(() => {
    let cancelled = false;
    async function checkEligibility() {
      if (hasCollectedCoupon()) return;
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) return; // cliente logado — não mostra
      setSuppressed(false);
      setShowGiftButton(wasRecentlyDeclined());
    }
    checkEligibility();
    return () => {
      cancelled = true;
    };
  }, []);

  const triggerOpen = useCallback(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    setScreen("scratch");
  }, []);

  // --- Gatilhos: delay, scroll % e exit-intent (desktop) -----------------
  useEffect(() => {
    if (suppressed || wasRecentlyDeclined()) return;

    const delayTimer = window.setTimeout(triggerOpen, DELAY_MS);

    function handleScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = (window.scrollY / scrollable) * 100;
      if (percent >= SCROLL_PERCENT) triggerOpen();
    }

    function handleMouseLeave(event: MouseEvent) {
      if (event.clientY <= 0) triggerOpen();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.clearTimeout(delayTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [suppressed, triggerOpen]);

  // Trava o scroll da página com o popup aberto.
  useEffect(() => {
    if (screen === "closed") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [screen]);

  // --- Canvas da raspadinha ------------------------------------------------
  useEffect(() => {
    if (screen !== "scratch" || scratchRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#d9c496");
    gradient.addColorStop(0.5, "#c7a86a");
    gradient.addColorStop(1, "#d9c496");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "italic 600 26px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Raspe aqui", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }, [screen, scratchRevealed]);

  function getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }

  function scratchAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(canvas, clientX, clientY);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    checkRevealProgress(ctx);
  }

  function checkRevealProgress(ctx: CanvasRenderingContext2D) {
    const { data } = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let transparent = 0;
    let sampled = 0;
    // Amostra 1 a cada 8 pixels — suficiente pra estimar o % sem travar o navegador.
    for (let i = 3; i < data.length; i += 4 * 8) {
      sampled += 1;
      if (data[i] < 40) transparent += 1;
    }
    if (sampled > 0 && transparent / sampled >= REVEAL_THRESHOLD) {
      setScratchRevealed(true);
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    isScratchingRef.current = true;
    scratchAt(event.clientX, event.clientY);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isScratchingRef.current) return;
    scratchAt(event.clientX, event.clientY);
  }

  function handlePointerUp() {
    isScratchingRef.current = false;
  }

  // --- Ações -------------------------------------------------------------
  function handleClose() {
    setScreen("closed");
    markDeclined();
    setShowGiftButton(true);
  }

  function handleCollect() {
    setScreen("email");
  }

  async function handleSubmitEmail(event: FormEvent) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      setEmailError("Digite um e-mail válido.");
      return;
    }
    setEmailError("");
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", email: normalized, gender: null }),
      });
    } catch {
      // Mesmo se a rede falhar, o cupom já existe e funciona — não trava a experiência por isso.
    }
    setSubmitting(false);
    markCouponCollected();
    setShowGiftButton(false);
    setScreen("success");
  }

  function handleCopyCoupon() {
    navigator.clipboard?.writeText(FIRST_PURCHASE_COUPON).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  function reopenFromGiftButton() {
    setScratchRevealed(false);
    setScreen("scratch");
  }

  if (suppressed && !showGiftButton) return null;

  return (
    <>
      {showGiftButton && screen === "closed" && (
        <button
          type="button"
          onClick={reopenFromGiftButton}
          aria-label="Ver oferta de primeira compra"
          className="fixed bottom-5 left-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-white shadow-2xl transition-transform hover:scale-105"
        >
          <Gift size={24} strokeWidth={1.8} />
        </button>
      )}

      {screen !== "closed" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={handleClose}>
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl sm:grid sm:max-w-3xl sm:grid-cols-2"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/80 text-brand-ink backdrop-blur-sm transition-colors hover:bg-white"
            >
              <X size={18} />
            </button>

            {/* Foto — banner no topo (mobile) */}
            <div className="relative h-44 w-full overflow-hidden sm:hidden">
              <Image src="/scratch-offer-model.jpg" alt="" fill unoptimized className="object-cover" sizes="500px" />
            </div>

            {/* Conteúdo */}
            <div className="order-2 flex flex-col px-6 py-8 text-center sm:order-1 sm:px-10 sm:py-10">
              {screen === "scratch" && (
                <>
                  <Image
                    src="/logo.png"
                    alt="Ótica Líder Brasil"
                    width={496}
                    height={198}
                    className="mx-auto h-9 w-auto object-contain sm:h-11"
                  />
                  <p className="mt-4 font-heading text-2xl font-semibold tracking-[-0.01em] text-brand-ink">Tente a sorte</p>
                  <p className="mt-1 font-body text-sm text-brand-ink/60">
                    {scratchRevealed ? "Veja o que você ganhou" : "Raspe abaixo para descobrir seu prêmio"}
                  </p>

                  <div className="relative mx-auto mt-6 h-[136px] w-full max-w-[360px] sm:h-[168px] sm:max-w-[420px]">
                    {/* Cartão-prêmio, sempre presente por baixo da raspadinha */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-brand-ink px-4">
                      <span className="absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" aria-hidden="true" />
                      <span className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-white" aria-hidden="true" />
                      <Gift size={22} className="text-brand-paper" />
                      <p className="font-heading text-base font-bold text-brand-paper">Você ganhou um cupom</p>
                      <p className="font-body text-xs text-brand-paper/70">para sua primeira compra</p>
                    </div>

                    {!scratchRevealed && (
                      <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="absolute inset-0 h-full w-full cursor-pointer rounded-2xl transition-opacity duration-500"
                        style={{ touchAction: "none" }}
                        aria-label="Raspe aqui para revelar seu prêmio"
                      />
                    )}
                  </div>

                  {scratchRevealed && (
                    <button type="button" onClick={handleCollect} className="btn-brand mt-6 w-full py-3.5 text-[13px]">
                      Coletar
                    </button>
                  )}
                  <button type="button" onClick={handleClose} className="mt-4 font-body text-sm text-brand-ink/45 underline underline-offset-4 transition-colors hover:text-brand-ink">
                    Não, obrigado
                  </button>
                </>
              )}

              {screen === "email" && (
                <>
                  <p className="font-heading text-[22px] font-semibold leading-tight tracking-[-0.01em] text-brand-ink">
                    Você ganhou um cupom
                    <br />
                    de primeira compra
                  </p>
                  <form onSubmit={handleSubmitEmail} className="mt-6 flex flex-col gap-3">
                    <input
                      type="email"
                      inputMode="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Seu melhor e-mail"
                      className="w-full rounded-xl border border-brand-ink/15 px-4 py-3.5 text-center font-body text-sm text-brand-ink outline-none placeholder:text-brand-ink/40 focus:border-brand-gold"
                    />
                    {emailError && <p className="font-body text-xs text-red-600">{emailError}</p>}
                    <button type="submit" disabled={submitting} className="btn-brand w-full py-3.5 text-[13px] disabled:opacity-60">
                      {submitting ? "Enviando..." : "Continuar"}
                    </button>
                  </form>
                  <p className="mt-4 font-body text-xs leading-5 text-brand-ink/45">
                    Ao se inscrever, você concorda em receber nossos e-mails. Pode cancelar quando quiser.
                  </p>
                </>
              )}

              {screen === "success" && (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/15">
                    <Check size={26} className="text-brand-gold" />
                  </div>
                  <p className="mt-4 font-heading text-2xl font-semibold tracking-[-0.01em] text-brand-ink">Seu cupom está pronto!</p>
                  <p className="mt-1 font-body text-sm text-brand-ink/60">Use no checkout para garantir seu desconto</p>

                  <div className="relative mx-auto mt-6 w-full max-w-[320px] rounded-2xl border-2 border-dashed border-brand-gold/50 bg-brand-gold/5 px-6 py-5">
                    <span className="absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" aria-hidden="true" />
                    <span className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-white" aria-hidden="true" />
                    <p className="font-heading text-2xl font-bold tracking-[0.08em] text-brand-ink">{FIRST_PURCHASE_COUPON}</p>
                    <button
                      type="button"
                      onClick={handleCopyCoupon}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper transition-colors hover:bg-brand-gold"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>

                  <button type="button" onClick={() => setScreen("closed")} className="btn-brand mt-6 w-full py-3.5 text-[13px]">
                    Continuar comprando
                  </button>
                </>
              )}
            </div>

            {/* Foto — coluna direita (desktop) */}
            <div className="relative order-1 hidden sm:order-2 sm:block">
              <Image src="/scratch-offer-model.jpg" alt="" fill unoptimized className="object-cover" sizes="500px" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
