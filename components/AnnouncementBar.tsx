"use client";

import { useEffect, useRef } from "react";

const MESSAGES = [
  "Entregamos para todo o Brasil",
  "Frete Grátis - João Pessoa e compras acima de R$500",
  "Parcelamento em até 10x no cartão",
  "Ótica Desde 2001",
];

/** Mesma velocidade da faixa de marcas (BrandMarquee): 0,6 px por frame a 60 fps = 36 px/s.
 * Aqui o cálculo usa o tempo real, então a velocidade é a mesma em qualquer tela. */
const SPEED_PX_PER_SECOND = 36;

/** Quantas vezes a lista de avisos se repete em cada "bloco". Os avisos são poucos, então
 * repetimos para o bloco ficar sempre maior que a tela e o loop nunca mostrar um vazio. */
const COPIES_PER_BLOCK = 3;

/** Faixa de avisos passando continuamente (direita → esquerda), em vez de trocar de aviso.
 * A trilha tem 2 blocos idênticos: quando o 1º sai da tela, voltamos ao início sem pulo. */
export default function AnnouncementBar() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = performance.now();
    let offset = 0;

    function step(now: number) {
      // Limita o salto quando a aba volta de segundo plano.
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      const half = el!.scrollWidth / 2;
      if (half > 0) {
        offset = (offset + SPEED_PX_PER_SECOND * delta) % half;
        el!.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="region"
      aria-label="Avisos da loja"
      className="w-full overflow-hidden bg-black py-2.5 font-body text-[9.5px] font-semibold uppercase tracking-[0.06em] text-white sm:py-2 sm:text-[11px] sm:tracking-[0.16em]"
    >
      {/* Leitores de tela leem os avisos uma vez só; a trilha animada é decorativa. */}
      <span className="sr-only">{MESSAGES.join(". ")}</span>
      <div ref={trackRef} aria-hidden="true" className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1].map((block) => (
          <div key={block} className="flex shrink-0 items-center">
            {Array.from({ length: COPIES_PER_BLOCK }).flatMap((_, copy) =>
              MESSAGES.map((message, index) => (
                <span key={`${block}-${copy}-${index}`} className="flex items-center">
                  <span className="px-5 sm:px-14">{message}</span>
                  <span className="text-[0.7em] opacity-70">•</span>
                </span>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
