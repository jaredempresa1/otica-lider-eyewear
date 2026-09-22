"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";

const STATS_TARGET = 22000;
const STATS_LABEL = "clientes satisfeitos desde 2001";

const CARDS = [
  {
    key: "estilo",
    title: "Estilo",
    text: "Acreditamos que óculos de sol devem deixar de ser só proteção e se tornar expressão da sua personalidade. Enquanto grande parte do mercado ainda entrega armações genéricas e sem graça, aqui você encontra design com identidade, atitude real e uma curadoria pensada com cuidado.",
    image: "/institucional/estilo.jpg",
  },
  {
    key: "lentes",
    title: "Lentes",
    text: "Todas as nossas lentes têm proteção UV400. Você recebe muito mais que um óculos bonito: recebe cuidado de verdade com a sua visão, em qualquer intensidade de sol.",
    image: "/institucional/lentes.jpg",
  },
  {
    key: "qualidade",
    title: "Qualidade",
    text: "A qualidade é um dos pilares fundamentais dos nossos produtos, e nos orgulhamos de oferecer óculos que são sinônimo de excelência e originalidade.",
    image: "/institucional/qualidade.jpg",
  },
] as const;

/** Sobe de 0 até `target` quando `active` vira true, usando requestAnimationFrame. */
function useCountUp(target: number, active: boolean, duration = 2200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

export default function SocialProof() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [statActive, setStatActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = useCountUp(STATS_TARGET, statActive);
  const touchStartX = useRef<number | null>(null);

  // Dispara o contador só quando a seção entra na tela pela primeira vez.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function goTo(index: number) {
    setActiveIndex((index + CARDS.length) % CARDS.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;
    const distance = touchEndX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 40) return;
    goTo(activeIndex + (distance < 0 ? 1 : -1));
  }

  return (
    <section ref={sectionRef} className="bg-brand-ink px-5 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        {/* Número: fica parado, não faz parte do carrossel */}
        <div className="text-center">
          <p className="font-heading text-[clamp(2.75rem,12vw,4.5rem)] font-bold leading-none tracking-[-0.03em] text-brand-paper">+ de {count.toLocaleString("pt-BR")}</p>
          <p className="mt-2 font-body text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold sm:text-sm">{STATS_LABEL}</p>
        </div>

        {/* Carrossel horizontal: arrasta/swipe pra trocar entre os 3 temas */}
        <div className="relative mt-7 touch-pan-y overflow-hidden rounded-[1.25rem] sm:mt-9" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {CARDS.map((card) => (
              <div key={card.key} className="flex w-full shrink-0 flex-col sm:flex-row">
                <div className="h-[32vh] w-full overflow-hidden sm:h-[38vh] sm:w-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover object-top" />
                </div>
                <div className="flex flex-1 flex-col justify-center bg-brand-ink px-1 py-4 sm:px-8">
                  <h3 className="font-heading text-xl font-semibold text-brand-paper sm:text-2xl">{card.title}</h3>
                  <p className="mt-2 font-body text-sm leading-6 text-brand-paper/70 sm:text-[15px]">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores de bolinha, iguais ao carrossel de produtos que já existe no site */}
        <div className="mt-4 flex justify-center gap-2">
          {CARDS.map((card, index) => (
            <button
              key={card.key}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver tema ${card.title}`}
              className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${index === activeIndex ? "w-6 bg-brand-gold" : "w-1.5 bg-brand-paper/25"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
