import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/types/product";

export default function CollectionTiles({ collections }: { collections: Collection[] }) {
  if (!collections || collections.length === 0) return null;

  return (
    // On mobile/tablet this behaves like a normal 2-column grid (unchanged).
    // On desktop (lg) it becomes a centered flex-wrap row: each tile has the
    // same width a 3-column grid would give it, but because the row is
    // centered, a dangling last row (1 or 2 leftover tiles) sits centered
    // under the row above instead of stuck to the left.
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:flex-wrap lg:justify-center lg:gap-5">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/produtos?colecao=${encodeURIComponent(collection.slug)}`}
          className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-ink shadow-card transition-transform duration-200 active:scale-[0.98] sm:aspect-[21/9] lg:aspect-[3/1] lg:w-[calc((100%-2.5rem)/3)]"
        >
          {collection.image_url ? (
            <Image
              src={collection.image_url}
              alt={collection.name}
              fill
              className="object-cover object-center opacity-80 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-brand-moss/60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/10 to-transparent" />
          <span className="absolute bottom-3 left-3 font-heading text-sm font-semibold tracking-[-0.01em] text-brand-paper sm:bottom-4 sm:left-5 sm:text-lg">
            {collection.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
