"use client";

/**
 * Seção "Prova social": número animado (0 → 22.000) disparado por IntersectionObserver
 * + 3 cards (Estilo / Lentes / Qualidade) que ficam "grudados" (sticky) na tela e trocam
 * de conteúdo com fade conforme o usuário rola, no estilo de página de produto da Apple.
 */
import { useEffect, useRef, useState } from "react";

const HAPPY_CUSTOMERS_TARGET = 22000;
const COUNTER_DURATION_MS = 1800;

const SOCIAL_PROOF_CARDS = [
  {
    key: "estilo",
    title: "Estilo",
    image: "/institucional/estilo.jpg",
    text: "Acreditamos que óculos de sol devem deixar de ser só proteção e se tornar expressão da sua personalidade. Enquanto grande parte do mercado ainda entrega armações genéricas e sem graça, aqui você encontra design com identidade, atitude real e uma curadoria pensada com cuidado.",
  },
  {
    key: "lentes",
    title: "Lentes",
    image: "/institucional/lentes.jpg",
    text: "Todas as nossas lentes têm proteção UV400. Você recebe muito mais que um óculos bonito: recebe cuidado de verdade com a sua visão, em qualquer intensidade de sol.",
  },
  {
    key: "qualidade",
    title: "Qualidade",
    image: "/institucional/qualidade.jpg",
    text: "A qualidade é um dos pilares fundamentais dos nossos produtos, e nos orgulhamos de oferecer óculos que são sinônimo de excelência e originalidade.",
  },
] as const;

function AnimatedCounter() {
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setValue(HAPPY_CUSTOMERS_TARGET);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || startedRef.current) return;
          startedRef.current = true;

          const startTime = performance.now();
          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / COUNTER_DURATION_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * HAPPY_CUSTOMERS_TARGET));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} suppressHydrationWarning>
      + de {value.toLocaleString("pt-BR")}
    </span>
  );
}

export default function SocialProof() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let ticking = false;

    function updateActiveIndex() {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
      const index = Math.min(SOCIAL_PROOF_CARDS.length - 1, Math.floor(progress * SOCIAL_PROOF_CARDS.length));
      setActiveIndex(index);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActiveIndex();
        ticking = false;
      });
    }

    updateActiveIndex();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="reveal-on-scroll border-t border-brand-ink/10 bg-brand-cream">
      <div className="section-shell flex flex-col items-center gap-2 pb-10 pt-14 text-center sm:pb-14 sm:pt-20">
        <span
          className="font-heading text-[clamp(2.75rem,12vw,4.5rem)] font-semibold leading-none tracking-[-0.03em] text-[#B68A48]"
          style={{ color: "#B68A48" }}
        >
          <AnimatedCounter />
        </span>
        <p className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-brand-moss sm:text-base">
          clientes satisfeitos desde 2001
        </p>
      </div>

      {/* Faixa alta (3x a viewport): o card interno fica sticky nela e libera o scroll normal ao final. */}
      <div ref={trackRef} className="relative h-[300vh]">
        <div className="sticky top-[20vh] flex h-[55vh] items-center justify-center px-5 sm:top-[22vh] sm:h-[56vh]">
          <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-brand-ink shadow-soft sm:rounded-[2.25rem]">
            {SOCIAL_PROOF_CARDS.map((card, index) => (
              <div
                key={card.key}
                aria-hidden={index !== activeIndex}
                className={`absolute inset-0 grid grid-cols-1 transition-opacity duration-700 ease-premium-out sm:grid-cols-2 ${
                  index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="relative hidden h-full sm:block">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover object-top" />
                </div>

                <div className="absolute inset-0 sm:hidden">
                  <img src={card.image} alt="" aria-hidden="true" className="h-full w-full object-cover object-top opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/85 to-brand-ink/40" />
                </div>

                <div className="relative z-10 flex h-full flex-col justify-center gap-3 px-6 py-8 sm:gap-4 sm:px-10 sm:py-12">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-gold">{card.title}</p>
                  <p className="font-body text-[15px] leading-6 text-brand-paper/90 sm:text-lg sm:leading-8">{card.text}</p>
                </div>
              </div>
            ))}

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
              {SOCIAL_PROOF_CARDS.map((card, index) => (
                <span
                  key={card.key}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === activeIndex ? "w-6 bg-brand-gold" : "w-1.5 bg-brand-paper/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
