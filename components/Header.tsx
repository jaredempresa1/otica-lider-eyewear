"use client";

/** Direção visual: controles maiores e a logo oficial destacada, preservando o cabeçalho creme, verde e dourado da marca. */
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Menu, MessageCircle, Search, ShoppingCart, X, Tag, Flame, Star, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useAuthModal } from "./AuthModal";
import { useCartDrawer } from "./CartDrawer";
import { supabase } from "@/lib/supabaseClient";
import { QUICK_FILTERS } from "@/lib/filters";
import FaceIcon, { FaceShape } from "./icons/FaceIcon";
import RunningIcon from "./icons/RunningIcon";
import BikeIcon from "./icons/BikeIcon";
import SearchSuggestions from "./SearchSuggestions";

// Os mesmos atalhos do menu ("Categorias"), reaproveitados no menu lateral (mobile e desktop).
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

const SEARCH_PLACEHOLDER = "O que você está procurando";

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { openLogin, openSignup } = useAuthModal();
  const { open: openCart } = useCartDrawer();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session?.user));
    return () => subscription.subscription.unsubscribe();
  }, []);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [menuSearchValue, setMenuSearchValue] = useState("");
  const menuOpen = menuMounted;

  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Gostaria de falar com a Ótica Líder Brasil.")}`
    : undefined;

  function openMenu() {
    setMenuMounted(true);
  }

  function closeMenu() {
    setMenuVisible(false);
    setMenuSearchValue("");
    window.setTimeout(() => setMenuMounted(false), 320);
  }

  useEffect(() => {
    if (!menuMounted) return;
    const frame = requestAnimationFrame(() => setMenuVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [menuMounted]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos");
    setSearchOpen(false);
    setSearchValue("");
  }

  function submitMenuSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = menuSearchValue.trim();
    closeMenu();
    router.push(query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos");
  }

  return (
    <header className="relative border-b border-brand-ink/10">
      {/* Camada de fundo separada: o blur precisa ficar aqui (e não no <header>) para não
          virar "containing block" dos elementos fixed (menu) e absolute — isso é o que fazia
          os dois abrirem cortados/atrás do restante da página. */}
      <div className="absolute inset-0 -z-10 bg-brand-cream/95 backdrop-blur-md" aria-hidden="true" />
      <div className="section-shell flex h-[72px] items-center justify-between gap-1.5 sm:h-[80px] sm:gap-5">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink transition-colors hover:border-brand-gold sm:h-12 sm:w-12"
          onClick={() => (menuOpen ? closeMenu() : openMenu())}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={19} strokeWidth={1.8} /> : <Menu size={21} strokeWidth={1.8} />}
        </button>

        <Link href="/" className="group flex min-w-0 shrink items-center" onClick={closeMenu} aria-label="Ótica Líder Brasil — início">
          <Image
            src="/logo.png"
            alt="Ótica Líder Brasil"
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

          <button
            type="button"
            onClick={() => {
              closeMenu();
              openCart();
            }}
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
          </button>
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
                placeholder={SEARCH_PLACEHOLDER}
                aria-label={SEARCH_PLACEHOLDER}
                className="input-premium h-11 w-full rounded-full py-2.5 pl-11 pr-4 text-sm"
              />
            </div>
            <button type="submit" className="btn-brand shrink-0 px-5 py-2.5 text-[11px]">
              Buscar
            </button>
          </form>
          <div className="section-shell !px-0">
            <SearchSuggestions query={searchValue} onNavigate={() => { setSearchOpen(false); setSearchValue(""); }} />
          </div>
        </div>
      )}

      {menuOpen && (
        <div
          className={`fixed inset-0 z-[100] flex justify-start bg-black/50 transition-opacity duration-300 ease-premium-out ${
            menuVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        >
          <nav
            className={`flex h-full w-full max-w-[320px] flex-col overflow-y-auto bg-brand-paper shadow-2xl transition-transform duration-300 ease-premium-out ${
              menuVisible ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <span className="font-heading text-lg font-semibold text-brand-ink">Menu</span>
              <button type="button" onClick={closeMenu} aria-label="Fechar menu" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink">
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* Caixinha de busca no topo do menu — busca em todo o site (produtos, marcas e filtros). */}
            <div className="px-5 pb-4">
              <form onSubmit={submitMenuSearch}>
                <div className="relative">
                  <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/45" aria-hidden="true" />
                  <input
                    value={menuSearchValue}
                    onChange={(event) => setMenuSearchValue(event.target.value)}
                    placeholder={SEARCH_PLACEHOLDER}
                    aria-label={SEARCH_PLACEHOLDER}
                    className="input-premium h-11 w-full rounded-full py-2.5 pl-11 pr-4 text-sm"
                  />
                </div>
              </form>
              <SearchSuggestions query={menuSearchValue} onNavigate={closeMenu} />
            </div>

            <div className="flex flex-col border-t border-brand-ink/10 font-body text-[14px] font-medium text-brand-ink">
              <Link href="/" onClick={closeMenu} className="flex items-center justify-between border-b border-brand-ink/8 px-5 py-4">
                Início <ChevronRight size={16} className="text-brand-ink/30" />
              </Link>
              <Link href="/produtos" onClick={closeMenu} className="flex items-center justify-between border-b border-brand-ink/8 px-5 py-4">
                Coleção completa <ChevronRight size={16} className="text-brand-ink/30" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openCart();
                }}
                className="flex items-center justify-between border-b border-brand-ink/8 px-5 py-4 text-left"
              >
                Meu carrinho {totalItems > 0 ? `(${totalItems})` : ""} <ChevronRight size={16} className="text-brand-ink/30" />
              </button>
            </div>

            <div className="flex-1 px-5 py-5">
              <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">
                Categorias
              </p>
              <div className="flex flex-col gap-4 font-body text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-ink">
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

            {/* Conta e atendimento, fixos na base do menu. */}
            <div className="mt-auto flex flex-col gap-2.5 bg-brand-ink px-5 py-5">
              {loggedIn ? (
                <Link
                  href="/conta"
                  onClick={closeMenu}
                  className="flex items-center gap-2 font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-paper"
                >
                  <User size={16} strokeWidth={1.8} className="text-brand-gold" /> Minha conta
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      openLogin();
                    }}
                    className="rounded-full bg-brand-paper px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      openSignup();
                    }}
                    className="rounded-full border border-brand-paper/40 px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-paper"
                  >
                    Cadastrar conta
                  </button>
                </div>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                  className="flex items-center gap-2 font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-paper/80 transition-colors hover:text-brand-paper"
                >
                  <MessageCircle size={16} strokeWidth={1.8} className="text-[#25D366]" /> Atendimento
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
