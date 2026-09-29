"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/WishlistContext";

/** Botão de coração reutilizável (card do produto e página do produto). */
export default function WishlistButton({ productId, size = 18, className = "" }: { productId: string; size?: number; className?: string }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(productId);
      }}
      aria-label={saved ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={saved}
      className={`flex items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink shadow-sm backdrop-blur transition-transform hover:scale-105 ${className}`}
    >
      <Heart size={size} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} className={saved ? "text-red-500" : "text-brand-ink/70"} />
    </button>
  );
}
