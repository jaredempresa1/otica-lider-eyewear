"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = {
  image: string;
  /** Versão widescreen (16:9) usada só no desktop. */
  imageDesktop: string;
  alt: string;
  eyebrow: string;
  title: string;
  /** Posição do foco (rosto/óculos) dentro da foto vertical original (mobile). */
  focus: string;
};

const SLIDES: Slide[] = [
  {
    image: "/hero-feminino-urbano.jpg",
    imageDesktop: "/hero-feminino-urbano-desktop.jpg",
    alt: "Mulher usando óculos de sol em cenário urbano",
    eyebrow: "Feminino",
    title: "Urbano",
    focus: "center 30%",
  },
  {
    image: "/hero-ciclista-final.jpg",
    imageDesktop: "/hero-ciclista-desktop.jpg",
    alt: "Ciclista usando óculos de sol esportivo em trilha ao ar livre",
    eyebrow: "Ciclismo",
    title: "Esportivo",
    focus: "center 32%",
  },
  {
    image: "/hero-corredora-final.jpg",
    imageDesktop: "/hero-corredora-desktop.jpg",
    alt: "Corredora usando óculos de sol esportivo com lente espelhada",
    eyebrow: "Corrida",
    title: "Esportivo",
    focus: "center 42%",
  },
  {
    image: "/hero-masculino-praia.jpg",
    imageDesktop: "/hero-masculino-praia-desktop.jpg",
    alt: "Homem usando óculos de sol à beira da piscina",
    eyebrow: "Masculino",
    title: "Verão",
    focus: "center 35%",
  },
  {
    image: "/hero-feminino-praia.jpg",
    imageDesktop: "/hero-feminino-praia-desktop.jpg",
    alt: "Mulher usando óculos de sol estilo editorial na praia",
    eyebrow: "Feminino",
    title: "Editorial",
    focus: "center 45%",
  },
  {
    image: "/hero-infantil-final.jpg",
    imageDesktop: "/hero-infantil-desktop.jpg",
    alt: "Crianças usando óculos de sol brincando ao ar livre",
    eyebrow: "Infantil",
    title: "Diversão",
    focus: "center 38%",
  },
];

const INTERVAL_MS = 2000;
/** Distância mínima do arrasto (em px) pra contar como um swipe de verdade e não um toque sem querer. */
const SWIPE_THRESHOLD = 40;

export default function Hero() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  function goTo(direction: 1 | -1) {
    setActive((current) => (current + direction + SLIDES.length) % SLIDES.length);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = event.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (touchDeltaX.current > SWIPE_THRESHOLD) goTo(-1);
    else if (touchDeltaX.current < -SWIPE_THRESHOLD) goTo(1);
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  return (
    <section className="w-full lg:mx-auto lg:max-w-6xl lg:px-6 lg:pt-6">
      {/* Mobile/tablet: mantém a altura fixa e o enquadramento original. Desktop (lg+): vira 16:9 exato com as fotos widescreen. */}
      <div
        className="relative h-[420px] w-full touch-pan-y overflow-hidden bg-brand-ink sm:h-[480px] lg:aspect-video lg:h-auto lg:rounded-[1.5rem]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDES.map((slide, index) => (
          <div
            key={slide.image}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: index === active ? 1 : 0 }}
            aria-hidden={index !== active}
          >
            {/* Versão mobile/tablet — foto vertical original, sem alterações */}
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover lg:hidden"
              style={{ objectPosition: slide.focus }}
              sizes="100vw"
            />

            {/* Versão desktop — foto widescreen 16:9 */}
            <Image
              src={slide.imageDesktop}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="hidden object-cover lg:block"
              sizes="1152px"
            />

            {/* Leve escurecida na base só pra manter os indicadores legíveis. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ))}

        {/* Indicadores discretos de posição no carrossel */}
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {SLIDES.map((slide, index) => (
            <span
              key={slide.image}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === active ? "w-4 bg-brand-paper" : "w-1.5 bg-brand-paper/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
