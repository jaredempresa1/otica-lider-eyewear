"use client";

import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/types/product";

/** Faixa de marcas passando automaticamente, sem legenda e sem título — inspirada em
 * vitrines como a do Mercadão dos Óculos. A lista é duplicada (2x) e a faixa desliza
 * de 0% a -50%; como as duas metades são idênticas, o loop fica perfeitamente contínuo. */
export default function BrandMarquee({ collections }: { collections: Collection[] }) {
  if (!collections || collections.length === 0) return null;

  const track = [...collections, ...collections];

  return (
    <div className="group/marquee overflow-hidden">
      <div className="animate-marquee flex w-max items-center gap-8 py-2 group-hover/marquee:[animation-play-state:paused] sm:gap-14">
        {track.map((collection, index) => (
          <Link
            key={`${collection.id}-${index}`}
            href={`/produtos?colecao=${encodeURIComponent(collection.slug)}`}
            aria-label={collection.name}
            className="relative block h-14 w-28 shrink-0 opacity-80 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0 sm:h-20 sm:w-40"
          >
            {collection.image_url ? (
              <Image
                src={collection.image_url}
                alt={collection.name}
                fill
                className="object-contain object-center"
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
    </div>
  );
}
