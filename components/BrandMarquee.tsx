"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Collection } from "@/types/product";

/** Faixa de marcas passando automaticamente, sem legenda e sem título — inspirada em
 * vitrines como a do Mercadão dos Óculos. A lista é duplicada (2x) para o loop ficar
 * contínuo. No mobile dá pra arrastar com o dedo (scroll nativo do navegador); assim
 * que o dedo solta, a rolagem automática retoma sozinha de onde parou. */
export default function BrandMarquee({ collections }: { collections: Collection[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const frameRef = useRef<number>();

  const track = [...collections, ...collections];

  useEffect(() => {
    const el = trackRef.current;
    if (!el || collections.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SPEED_PX_PER_FRAME = 0.6;

    function step() {
      if (el && !isInteractingRef.current) {
        const half = el.scrollWidth / 2;
        let next = el.scrollLeft + SPEED_PX_PER_FRAME;
        if (half > 0 && next >= half) next -= half;
        el.scrollLeft = next;
      }
      frameRef.current = requestAnimationFrame(step);
    }

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [collections.length]);

  function pause() {
    isInteractingRef.current = true;
  }

  function resume() {
    isInteractingRef.current = false;
  }

  if (!collections || collections.length === 0) return null;

  return (
    <div
      ref={trackRef}
      onPointerDown={pause}
      onPointerUp={resume}
      onPointerCancel={resume}
      onPointerLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onMouseEnter={pause}
      onMouseLeave={resume}
      className="no-scrollbar flex items-center gap-8 overflow-x-auto py-2 sm:gap-14"
    >
      {track.map((collection, index) => (
        <Link
          key={`${collection.id}-${index}`}
          href={`/produtos?colecao=${encodeURIComponent(collection.slug)}`}
          aria-label={collection.name}
          draggable={false}
          className="relative block h-14 w-28 shrink-0 transition-transform duration-200 hover:scale-105 sm:h-20 sm:w-40"
        >
          {collection.image_url ? (
            <Image
              src={collection.image_url}
              alt={collection.name}
              fill
              draggable={false}
              className="pointer-events-none select-none object-contain object-center"
              sizes="160px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-lg bg-brand-ink/5 font-heading text-sm font-semibold text-brand-ink/60">
              {collection.name}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
