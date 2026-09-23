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
  const [statActive, setStatActive] = useState(false);
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

  return (
    <section ref={sectionRef} className="bg-[#38040E] px-5 py-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center">
          <p
            className="font-body text-[clamp(2.25rem,10vw,3.5rem)] font-extrabold leading-none tracking-[-0.02em] text-[#9A7B4D]"
            style={{ color: "#9A7B4D" }}
          >
            + de {count.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1.5 font-body text-sm font-bold text-brand-paper/90 sm:text-base">Clientes satisfeitos desde 2001</p>
        </div>

        {/* Fileira horizontal: mostra 2 cards por vez, com um pedaço do próximo visível na borda, igual a um carrossel de produto comum. */}
        <div className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 sm:mt-5">
          {CARDS.map((card) => (
            <div key={card.key} className="w-[46%] shrink-0 sm:w-[30%]">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.image} alt={card.title} className="h-full w-full object-cover object-top" />
              </div>
              <h3 className="mt-2 font-body text-base font-extrabold text-brand-paper sm:text-lg">{card.title}</h3>
              <p className="mt-1 line-clamp-4 font-body text-[12px] leading-5 text-brand-paper/75 sm:text-[13px]">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
