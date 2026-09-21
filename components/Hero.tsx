"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeroSlide } from "@/types/product";

/** Slides padrão, usados se ainda não houver nenhum slide cadastrado no admin
 * (tabela hero_slides vazia) — assim a home nunca fica sem carrossel. */
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    media_type: "image",
    image_url: "/hero-feminino-urbano.jpg",
    image_url_desktop: "/hero-feminino-urbano-desktop.jpg",
    alt_text: "Mulher usando óculos de sol em cenário urbano",
    eyebrow: "Feminino",
    title: "Urbano",
    focus: "center 30%",
  },
  {
    id: "default-2",
    media_type: "image",
    image_url: "/hero-ciclista-final.jpg",
    image_url_desktop: "/hero-ciclista-desktop.jpg",
    alt_text: "Ciclista usando óculos de sol esportivo em trilha ao ar livre",
    eyebrow: "Ciclismo",
    title: "Esportivo",
    focus: "center 32%",
  },
  {
    id: "default-3",
    media_type: "image",
    image_url: "/hero-corredora-final.jpg",
    image_url_desktop: "/hero-corredora-desktop.jpg",
    alt_text: "Corredora usando óculos de sol esportivo com lente espelhada",
    eyebrow: "Corrida",
    title: "Esportivo",
    focus: "center 42%",
  },
  {
    id: "default-4",
    media_type: "image",
    image_url: "/hero-masculino-praia.jpg",
    image_url_desktop: "/hero-masculino-praia-desktop.jpg",
    alt_text: "Homem usando óculos de sol à beira da piscina",
    eyebrow: "Masculino",
    title: "Verão",
    focus: "center 35%",
  },
  {
    id: "default-5",
    media_type: "image",
    image_url: "/hero-feminino-praia.jpg",
    image_url_desktop: "/hero-feminino-praia-desktop.jpg",
    alt_text: "Mulher usando óculos de sol estilo editorial na praia",
    eyebrow: "Feminino",
    title: "Editorial",
    focus: "center 45%",
  },
  {
    id: "default-6",
    media_type: "image",
    image_url: "/hero-infantil-final.jpg",
    image_url_desktop: "/hero-infantil-desktop.jpg",
    alt_text: "Crianças usando óculos de sol brincando ao ar livre",
    eyebrow: "Infantil",
    title: "Diversão",
    focus: "center 38%",
  },
];

const INTERVAL_MS = 3000;
/** Distância mínima do arrasto (em px) pra contar como um swipe de verdade e não um toque sem querer. */
const SWIPE_THRESHOLD = 40;

export default function Hero({ slides }: { slides?: HeroSlide[] }) {
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  // Se a lista de slides mudar (ex.: veio do servidor depois da 1ª renderização
  // ou o admin salvou algo novo), garante que o índice ativo continua válido.
  useEffect(() => {
    setActive((current) => (current >= activeSlides.length ? 0 : current));
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % activeSlides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  function goTo(direction: 1 | -1) {
    setActive((current) => (current + direction + activeSlides.length) % activeSlides.length);
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
      {/* Mobile/tablet: proporção 4:5, igual à foto pedida no admin — assim a imagem cabe inteira, sem cortar embaixo. Desktop (lg+): vira 16:9 exato com as fotos widescreen. */}
      <div
        className="relative aspect-[4/5] max-h-[560px] w-full touch-pan-y overflow-hidden bg-brand-ink lg:aspect-video lg:max-h-none lg:rounded-[1.5rem]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeSlides.map((slide, index) => {
          const isVideo = slide.media_type === "video" && slide.video_url;
          const alt = slide.alt_text || slide.title || "";
          const slideMedia = (
            <div
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: index === active ? 1 : 0 }}
              aria-hidden={index !== active}
            >
              {isVideo ? (
                // Vídeo: mesma fonte usada no mobile e no desktop, cobrindo a área com object-cover.
                <video
                  src={slide.video_url}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: slide.focus || "center" }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                  poster={slide.image_url || undefined}
                />
              ) : (
                <>
                  {/* Versão mobile/tablet — foto vertical original, sem alterações */}
                  <Image
                    src={slide.image_url}
                    alt={alt}
                    fill
                    priority={index === 0}
                    className="object-cover lg:hidden"
                    style={{ objectPosition: slide.focus || "center" }}
                    sizes="100vw"
                  />

                  {/* Versão desktop — foto widescreen 16:9 (cai pra mesma foto se não houver versão desktop) */}
                  <Image
                    src={slide.image_url_desktop || slide.image_url}
                    alt={alt}
                    fill
                    priority={index === 0}
                    className="hidden object-cover lg:block"
                    sizes="1152px"
                  />
                </>
              )}

              {/* Leve escurecida na base só pra manter os indicadores legíveis. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          );

          return slide.href ? (
            <Link
              key={slide.id}
              href={slide.href}
              className="absolute inset-0"
              style={{ pointerEvents: index === active ? "auto" : "none" }}
              aria-hidden={index !== active}
              tabIndex={index === active ? 0 : -1}
              aria-label={slide.title || alt || "Ver mais"}
            >
              {slideMedia}
            </Link>
          ) : (
            <div key={slide.id} className="contents" style={{ pointerEvents: "none" }}>
              {slideMedia}
            </div>
          );
        })}

        {/* Indicadores de posição no carrossel — clicáveis, com área de toque confortável no mobile. */}
        <div className="absolute inset-x-0 bottom-1.5 flex justify-center gap-0.5">
          {activeSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ir para o slide ${index + 1}`}
              aria-current={index === active}
              className="flex items-center justify-center p-2.5"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-500 ${
                  index === active ? "w-7 bg-brand-paper" : "w-2 bg-brand-paper/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
