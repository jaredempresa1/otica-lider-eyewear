"use client";

/** Direção visual: controles maiores e a logo oficial destacada, preservando o cabeçalho creme, verde e dourado da marca. */
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingCart, SlidersHorizontal, X, Tag, Flame, Star, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartContext";
import { useAuthModal } from "./AuthModal";
import { supabase } from "@/lib/supabaseClient";
import { QUICK_FILTERS } from "@/lib/filters";
import FaceIcon, { FaceShape } from "./icons/FaceIcon";
import RunningIcon from "./icons/RunningIcon";
import BikeIcon from "./icons/BikeIcon";

// Os mesmos atalhos do menu mobile ("Filtrar por"), reaproveitados no dropdown de desktop.
const NAV_QUICK_FILTERS = QUICK_FILTERS.filter((filter) => ["mais-vendidos", "destaques", "ofertas"].includes(filter.value));

const QUICK_FILTER_ICONS: Record<string, React.ReactNode> = {
  "mais-vendidos": <Flame size={14} className="shrink-0 text-brand-gold" />,
  destaques: <Star size={14} className="shrink-0 text-brand-gold" />,
  ofertas: <Tag size={14} className="shrink-0 text-brand-gold" />,
};

const NAV_GENDER_LINKS: { href: string; label: string; shape: FaceShape }[] = [
  { href: "/produtos?genero=masculino", label: "Óculos de sol masculino", shape: "masculino" },
  { href: "/produtos?genero=feminino", label: "Óculos de sol feminino", shape: "feminino" },
  { href: "/produtos?genero=infantil", label: "Óculos infantil", shape: "infantil" },
];

const SPORT_LINK = { href: "/produtos?esportivo=1", label: "Óculos esportivo" };

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { openLogin } = useAuthModal();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session?.user));
    return () => subscription.subscription.unsubscribe();
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!filterMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) setFilterMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFilterMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterMenuOpen]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos");
    setSearchOpen(false);
    setSearchValue("");
  }

  return (
    <header className="border-b border-brand-ink/10 bg-brand-cream/95 backdrop-blur-md">
      <div className="section-shell flex h-[72px] items-center justify-between gap-1.5 sm:h-[80px] sm:gap-5">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink sm:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={19} strokeWidth={1.8} /> : <Menu size={21} strokeWidth={1.8} />}
        </button>

        <Link href="/" className="group flex min-w-0 shrink items-center" onClick={closeMenu} aria-label="Ótica Líder Eyewear — início">
          <Image
            src="/logo.png"
            alt="Ótica Líder Eyewear"
            width={496}
            height={198}
            priority
            className="h-16 w-auto max-w-[255px] object-contain object-left sm:h-[5.25rem] sm:max-w-[360px]"
          />
        </Link>

        <nav className="hidden h-full items-center gap-8 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-ink/65 sm:flex">
          <Link href="/" className="transition-colors hover:text-brand-gold">
            Início
          </Link>
          <Link href="/produtos" className="transition-colors hover:text-brand-gold">
            Coleção
          </Link>

          <div ref={filterMenuRef} className="relative flex h-full items-center">
            <button
              type="button"
              onClick={() => setFilterMenuOpen((value) => !value)}
              className="flex items-center gap-1.5 transition-colors hover:text-brand-gold"
              aria-expanded={filterMenuOpen}
              aria-haspopup="true"
            >
              <SlidersHorizontal size={14} strokeWidth={1.8} />
              Filtrar
            </button>

            {filterMenuOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-brand-ink/10 bg-brand-paper p-3 normal-case shadow-soft">
                <p className="px-2 pb-2 pt-1 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink/40">
                  Filtros rápidos
                </p>
                <div className="flex flex-col">
                  {NAV_QUICK_FILTERS.map((filter) => (
                    <Link
                      key={filter.value}
                      href={`/produtos?ordenar=${filter.value}`}
                      onClick={() => setFilterMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2 py-2 font-body text-[13px] font-medium normal-case tracking-normal text-brand-ink/75 transition-colors hover:bg-brand-gold/10 hover:text-brand-ink"
                    >
                      {QUICK_FILTER_ICONS[filter.value]} {filter.label}
                    </Link>
                  ))}
                </div>
                <div className="my-2 border-t border-brand-ink/8" />
                <div className="flex flex-col">
                  {NAV_GENDER_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setFilterMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2 py-2 font-body text-[13px] font-medium normal-case tracking-normal text-brand-ink/75 transition-colors hover:bg-brand-gold/10 hover:text-brand-ink"
                    >
                      <FaceIcon shape={item.shape} className="h-5 w-5 shrink-0 text-brand-gold" /> {item.label}
                    </Link>
                  ))}
                  <Link
                    href={SPORT_LINK.href}
                    onClick={() => setFilterMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-2 py-2 font-body text-[13px] font-medium normal-case tracking-normal text-brand-ink/75 transition-colors hover:bg-brand-gold/10 hover:text-brand-ink"
                  >
                    <span className="flex shrink-0 items-center -space-x-1"><RunningIcon className="h-5 w-5 text-brand-gold" /><BikeIcon className="h-5 w-5 text-brand-gold" /></span> {SPORT_LINK.label}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {loggedIn ? (
            <Link
              href="/conta"
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink transition-colors hover:border-brand-gold sm:flex"
              aria-label="Minha conta"
            >
              <User size={18} strokeWidth={1.8} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink transition-colors hover:border-brand-gold sm:flex"
              aria-label="Entrar ou criar conta"
            >
              <User size={18} strokeWidth={1.8} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink transition-colors hover:border-brand-gold sm:h-12 sm:w-12"
            aria-label={searchOpen ? "Fechar pesquisa" : "Pesquisar óculos"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={18} strokeWidth={1.8} /> : <Search size={18} strokeWidth={1.8} />}
          </button>

          <Link
            href="/sacola"
            className="relative flex h-10 shrink-0 items-center gap-1 rounded-full border border-brand-ink/10 px-2.5 text-brand-ink transition-colors hover:border-brand-gold sm:h-12 sm:gap-2.5 sm:px-5"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart size={18} strokeWidth={1.8} className="sm:hidden" />
            <ShoppingCart size={22} strokeWidth={1.8} className="hidden sm:block" />
            <span className="hidden font-body text-[12px] font-semibold uppercase tracking-[0.15em] sm:inline">
              Carrinho
            </span>
            {totalItems > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-paper sm:h-6 sm:min-w-6 sm:text-[11px]">
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
              Meu carrinho {totalItems > 0 ? `(${totalItems})` : ""}
            </Link>
            {loggedIn ? (
              <Link href="/conta" onClick={closeMenu} className="flex items-center gap-2.5">
                <User size={18} strokeWidth={1.8} className="shrink-0 text-brand-gold" /> Minha conta
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openLogin();
                }}
                className="flex items-center gap-2.5 text-left"
              >
                <User size={18} strokeWidth={1.8} className="shrink-0 text-brand-gold" /> Entrar ou cadastrar
              </button>
            )}

            <div className="mt-1 border-t border-brand-ink/10 pt-5">
              <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">
                Filtrar por
              </p>
              <div className="flex flex-col gap-4">
                {NAV_QUICK_FILTERS.map((filter) => (
                  <Link key={filter.value} href={`/produtos?ordenar=${filter.value}`} onClick={closeMenu} className="flex items-center gap-2.5">
                    {QUICK_FILTER_ICONS[filter.value]} {filter.label}
                  </Link>
                ))}
                {NAV_GENDER_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu} className="flex items-center gap-2.5">
                    <FaceIcon shape={item.shape} className="h-5 w-5 shrink-0 text-brand-gold" /> {item.label}
                  </Link>
                ))}
                <Link href={SPORT_LINK.href} onClick={closeMenu} className="flex items-center gap-2.5">
                  <span className="flex shrink-0 items-center -space-x-1"><RunningIcon className="h-5 w-5 text-brand-gold" /><BikeIcon className="h-5 w-5 text-brand-gold" /></span> {SPORT_LINK.label}
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
