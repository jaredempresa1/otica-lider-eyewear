"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
};

const SLIDES: Slide[] = [
  {
    image: "/hero-ciclista-final.jpg",
    alt: "Ciclista usando óculos de sol esportivo em trilha ao ar livre",
    eyebrow: "Ciclismo",
    title: "Esportivo",
  },
  {
    image: "/hero-corredora-final.jpg",
    alt: "Corredora usando óculos de sol esportivo com lente espelhada",
    eyebrow: "Corrida",
    title: "Esportivo",
  },
  {
    image: "/hero-feminino-urbano.jpg",
    alt: "Mulher usando óculos de sol em cenário urbano",
    eyebrow: "Feminino",
    title: "Urbano",
  },
  {
    image: "/hero-feminino-praia.jpg",
    alt: "Mulher usando óculos de sol estilo editorial na praia",
    eyebrow: "Feminino",
    title: "Editorial",
  },
  {
    image: "/hero-masculino-praia.jpg",
    alt: "Homem usando óculos de sol à beira da piscina",
    eyebrow: "Masculino",
    title: "Verão",
  },
  {
    image: "/hero-infantil-final.jpg",
    alt: "Crianças usando óculos de sol brincando ao ar livre",
    eyebrow: "Infantil",
    title: "Diversão",
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
    <section className="w-full">
      <div className="relative h-[240px] w-full overflow-hidden bg-brand-ink sm:h-[300px] lg:h-[360px] xl:h-[400px]">
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
              className="object-cover object-top"
              sizes="100vw"
            />

            {/* Escurece a base da foto só o suficiente pra manter o texto legível. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent sm:h-24" />

            <div className="absolute inset-x-0 bottom-0 px-4 pb-3 sm:px-6 sm:pb-4">
              <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-brand-gold sm:text-xs">
                {slide.eyebrow}
              </p>
              <p className="font-heading text-lg font-semibold text-brand-paper sm:text-xl">
                {slide.title}
              </p>
            </div>
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
