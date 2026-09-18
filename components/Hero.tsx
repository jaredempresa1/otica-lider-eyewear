"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  /** Posição do foco (rosto/óculos) dentro da foto vertical original. */
  focus: string;
};

const SLIDES: Slide[] = [
  {
    image: "/hero-feminino-urbano.jpg",
    alt: "Mulher usando óculos de sol em cenário urbano",
    eyebrow: "Feminino",
    title: "Urbano",
    focus: "center 30%",
  },
  {
    image: "/hero-ciclista-final.jpg",
    alt: "Ciclista usando óculos de sol esportivo em trilha ao ar livre",
    eyebrow: "Ciclismo",
    title: "Esportivo",
    focus: "center 32%",
  },
  {
    image: "/hero-corredora-final.jpg",
    alt: "Corredora usando óculos de sol esportivo com lente espelhada",
    eyebrow: "Corrida",
    title: "Esportivo",
    focus: "center 42%",
  },
  {
    image: "/hero-masculino-praia.jpg",
    alt: "Homem usando óculos de sol à beira da piscina",
    eyebrow: "Masculino",
    title: "Verão",
    focus: "center 35%",
  },
  {
    image: "/hero-feminino-praia.jpg",
    alt: "Mulher usando óculos de sol estilo editorial na praia",
    eyebrow: "Feminino",
    title: "Editorial",
    focus: "center 45%",
  },
  {
    image: "/hero-infantil-final.jpg",
    alt: "Crianças usando óculos de sol brincando ao ar livre",
    eyebrow: "Infantil",
    title: "Diversão",
    focus: "center 38%",
  },
];

const INTERVAL_MS = 2000;

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full lg:mx-auto lg:max-w-6xl lg:px-6 lg:pt-6">
      <div className="relative h-[420px] w-full overflow-hidden bg-brand-ink sm:h-[480px] lg:h-[560px] lg:rounded-[1.5rem] xl:h-[620px]">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.image}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: index === active ? 1 : 0 }}
            aria-hidden={index !== active}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover"
              style={{ objectPosition: slide.focus }}
              sizes="100vw"
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
