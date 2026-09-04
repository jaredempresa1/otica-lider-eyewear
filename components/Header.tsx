"use client";

/** Direção visual: controles maiores e logotipo destacado, preservando o cabeçalho creme, verde e dourado da marca. */
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";

export default function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-brand-ink/10 bg-brand-cream/95 backdrop-blur-md">
      <div className="section-shell flex h-[80px] items-center justify-between gap-5">
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink sm:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} strokeWidth={1.8} /> : <Menu size={25} strokeWidth={1.8} />}
        </button>

        <Link href="/" className="group flex min-w-0 items-center" onClick={closeMenu} aria-label="Ótica Líder Eyewear — início">
          <span aria-hidden="true" className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand-gold bg-brand-ink sm:h-12 sm:w-12"><span className="h-4 w-7 rounded-full border border-brand-paper/90" /><span className="absolute h-[2px] w-4 bg-brand-gold" /></span>
          <span className="ml-2 leading-none">
            <span className="block font-heading text-[21px] font-semibold tracking-[-0.04em] text-brand-ink">Ótica Líder</span>
            <span className="mt-1 block font-body text-[10px] font-semibold uppercase tracking-[0.19em] text-brand-gold">Eyewear</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-ink/65 sm:flex">
          <Link href="/" className="transition-colors hover:text-brand-gold">
            Início
          </Link>
          <Link href="/produtos" className="transition-colors hover:text-brand-gold">
            Coleção
          </Link>
        </nav>

        <Link
          href="/sacola"
          className="relative flex h-12 items-center gap-2.5 rounded-full border border-brand-ink/10 px-4 text-brand-ink transition-colors hover:border-brand-gold sm:px-5"
          aria-label="Abrir sacola"
        >
          <ShoppingBag size={22} strokeWidth={1.8} />
          <span className="hidden font-body text-[12px] font-semibold uppercase tracking-[0.15em] sm:inline">
            Sacola
          </span>
          {totalItems > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-gold px-1 text-[11px] font-bold text-brand-paper">
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
