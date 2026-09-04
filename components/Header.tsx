"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";

export default function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-brand-ink/10 bg-brand-cream/95 backdrop-blur-md">
      <div className="section-shell flex h-[72px] items-center justify-between gap-5">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink sm:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={18} strokeWidth={1.7} /> : <Menu size={19} strokeWidth={1.7} />}
        </button>

        <Link href="/" className="group flex min-w-0 items-center" onClick={closeMenu} aria-label="Ótica Líder Eyewear — início">
          {logoError ? (
            <span className="font-heading text-[18px] font-semibold tracking-[-0.03em] text-brand-ink">Ótica Líder</span>
          ) : (
            <Image
              src="/logo.png"
              alt="Ótica Líder Eyewear"
              width={190}
              height={52}
              priority
              onError={() => setLogoError(true)}
              className="h-10 w-auto max-w-[145px] object-contain object-left sm:max-w-[190px]"
            />
          )}
        </Link>

        <nav className="hidden items-center gap-8 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/65 sm:flex">
          <Link href="/" className="transition-colors hover:text-brand-gold">
            Início
          </Link>
          <Link href="/produtos" className="transition-colors hover:text-brand-gold">
            Coleção
          </Link>
        </nav>

        <Link
          href="/sacola"
          className="relative flex h-10 items-center gap-2 rounded-full border border-brand-ink/10 px-3 text-brand-ink transition-colors hover:border-brand-gold sm:px-4"
          aria-label="Abrir sacola"
        >
          <ShoppingBag size={17} strokeWidth={1.7} />
          <span className="hidden font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:inline">
            Sacola
          </span>
          {totalItems > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-paper">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {menuOpen && (
        <nav className="border-t border-brand-ink/10 bg-brand-paper px-5 py-5 font-body text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink sm:hidden">
          <div className="section-shell flex flex-col gap-5 !px-0">
            <Link href="/" onClick={closeMenu}>
              Início
            </Link>
            <Link href="/produtos" onClick={closeMenu}>
              Coleção completa
            </Link>
            <Link href="/sacola" onClick={closeMenu}>
              Minha sacola {totalItems > 0 ? `(${totalItems})` : ""}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
