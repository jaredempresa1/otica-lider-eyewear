import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/types/product";

export default function CollectionTiles({ collections }: { collections: Collection[] }) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/produtos?colecao=${encodeURIComponent(collection.slug)}`}
          className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-ink shadow-card transition-transform duration-200 active:scale-[0.98] sm:aspect-[21/9] lg:aspect-[3/1]"
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
