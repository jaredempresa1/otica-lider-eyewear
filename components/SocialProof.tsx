"use client";

import { useEffect, useRef, useState } from "react";

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
  const sentinelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [statActive, setStatActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = useCountUp(STATS_TARGET, statActive);

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

  // Detecta qual dos 3 "trechos" de rolagem está no centro da tela e troca o card ativo.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = sentinelRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1) setActiveIndex(index);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sentinelRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-brand-ink" style={{ height: `${CARDS.length * 100}vh` }}>
      {/* Faixas invisíveis: uma por card, é o que "avança" o conteúdo conforme o usuário rola. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {CARDS.map((card, index) => (
          <div
            key={card.key}
            ref={(el) => {
              sentinelRefs.current[index] = el;
            }}
            style={{ height: "100vh" }}
          />
        ))}
      </div>

      {/* Conteúdo grudado (sticky) na tela enquanto o usuário rola pela faixa acima. */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-5">
        <div className="mx-auto w-full max-w-3xl">
          <div className="text-center">
            <p className="font-heading text-[clamp(2rem,9vw,3.25rem)] font-semibold leading-none tracking-[-0.03em] text-brand-paper">+ de {count.toLocaleString("pt-BR")}</p>
            <p className="mt-2 font-body text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold">{STATS_LABEL}</p>
          </div>

          {/* Bloco de imagem + texto: limitado a ~40vh (mobile) / ~46vh (desktop) para a seção nunca ocupar a tela inteira. */}
          <div className="relative mt-5 h-[40vh] w-full overflow-hidden rounded-[1.25rem] sm:mt-6 sm:h-[46vh]">
            {CARDS.map((card, index) => (
              <div
                key={card.key}
                className={`absolute inset-0 flex flex-col transition-opacity duration-700 ease-out motion-reduce:transition-none sm:grid sm:grid-cols-2 ${index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <div className="h-[60%] w-full overflow-hidden sm:h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-center bg-brand-ink px-5 py-3 sm:px-8">
                  <h3 className="font-heading text-xl font-semibold text-brand-paper sm:text-2xl">{card.title}</h3>
                  <p className="mt-2 line-clamp-3 font-body text-sm leading-6 text-brand-paper/70 sm:line-clamp-5 sm:text-[15px]">{card.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
            {CARDS.map((card, index) => (
              <span key={card.key} className={`h-1.5 w-6 rounded-full transition-colors motion-reduce:transition-none ${index === activeIndex ? "bg-brand-gold" : "bg-brand-paper/25"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
