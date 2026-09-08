"use client";

/** Direção visual: controles maiores e a logo oficial destacada, preservando o cabeçalho creme, verde e dourado da marca. */
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartContext";

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  function closeMenu() {
    setMenuOpen(false);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos");
    setSearchOpen(false);
    setSearchValue("");
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
          <Image
            src="/logo.png"
            alt="Ótica Líder Eyewear"
            width={230}
            height={72}
            priority
            className="h-12 w-auto max-w-[176px] object-contain object-left sm:h-14 sm:max-w-[230px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-ink/65 sm:flex">
          <Link href="/" className="transition-colors hover:text-brand-gold">
            Início
          </Link>
          <Link href="/produtos" className="transition-colors hover:text-brand-gold">
            Coleção
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink transition-colors hover:border-brand-gold"
            aria-label={searchOpen ? "Fechar pesquisa" : "Pesquisar óculos"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={21} strokeWidth={1.8} /> : <Search size={21} strokeWidth={1.8} />}
          </button>

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
      </div>

      {searchOpen && (
        <div className="border-t border-brand-ink/10 bg-brand-paper px-5 py-4">
          <form onSubmit={submitSearch} className="section-shell flex items-center gap-3 !px-0">
            <div className="relative flex-1">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/45" aria-hidden="true" />
              <input
                autoFocus
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Pesquisar óculos"
                aria-label="Pesquisar óculos"
                className="input-premium h-11 w-full rounded-full py-2.5 pl-11 pr-4 text-sm"
              />
            </div>
            <button type="submit" className="btn-brand shrink-0 px-5 py-2.5 text-[11px]">
              Buscar
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav className="border-t border-brand-ink/10 bg-brand-paper px-5 py-5 font-body text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-ink sm:hidden">
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

            <div className="mt-1 border-t border-brand-ink/10 pt-5">
              <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">
                Filtrar por
              </p>
              <div className="flex flex-col gap-4">
                <Link href="/produtos?genero=masculino" onClick={closeMenu}>
                  Óculos de sol masculino
                </Link>
                <Link href="/produtos?genero=feminino" onClick={closeMenu}>
                  Óculos de sol feminino
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
