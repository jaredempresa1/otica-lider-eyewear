"use client";

/** Direção visual: controles maiores e a logo oficial destacada, preservando o cabeçalho creme, verde e dourado da marca. */
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingCart, X, Tag, Flame, Star, User, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useAuthModal } from "./AuthModal";
import { useCartDrawer } from "./CartDrawer";
import { useSideMenu } from "./SideMenuContext";
import { supabase } from "@/lib/supabaseClient";
import { QUICK_FILTERS } from "@/lib/filters";
import FaceIcon, { FaceShape } from "./icons/FaceIcon";
import RunningIcon from "./icons/RunningIcon";
import BikeIcon from "./icons/BikeIcon";
import SearchSuggestions from "./SearchSuggestions";

// Mesma ordem da referência: Ofertas, Mais vendidos, Em destaque.
const QUICK_FILTER_ORDER = ["ofertas", "mais-vendidos", "destaques"];
const NAV_QUICK_FILTERS = QUICK_FILTERS.filter((filter) => QUICK_FILTER_ORDER.includes(filter.value)).sort(
  (a, b) => QUICK_FILTER_ORDER.indexOf(a.value) - QUICK_FILTER_ORDER.indexOf(b.value)
);

const QUICK_FILTER_ICONS: Record<string, React.ReactNode> = {
  "mais-vendidos": <Flame size={18} className="shrink-0 text-brand-gold" />,
  destaques: <Star size={18} className="shrink-0 text-brand-gold" />,
  ofertas: <Tag size={18} className="shrink-0 text-brand-gold" />,
};

const NAV_GENDER_LINKS: { href: string; label: string; shape: FaceShape }[] = [
  { href: "/produtos?genero=masculino", label: "Óculos de sol masculino", shape: "masculino" },
  { href: "/produtos?genero=feminino", label: "Óculos de sol feminino", shape: "feminino" },
  { href: "/produtos?genero=infantil", label: "Óculos infantil", shape: "infantil" },
];

const SPORT_LINK = { href: "/produtos?esportivo=1", label: "Óculos esportivo" };

const SEARCH_PLACEHOLDER = "O que você está procurando";

/** Glifo oficial do WhatsApp (fone + balão), igual ao usado no botão flutuante. */
function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.37 4 15c0 2.36.68 4.56 1.86 6.42L4 29l7.77-1.83A11.9 11.9 0 0 0 16.02 27C22.63 27 28 21.63 28 15S22.63 3 16.02 3Zm0 21.9c-2.02 0-3.9-.58-5.48-1.58l-.39-.24-4.6 1.08 1.1-4.48-.26-.4A9.83 9.83 0 0 1 6.1 15c0-5.47 4.45-9.9 9.92-9.9 5.46 0 9.9 4.43 9.9 9.9s-4.44 9.9-9.9 9.9Z" />
      <path d="M21.53 17.58c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.15-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.87-.77-1.45-1.72-1.62-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.58-.9-2.16-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.19 2.06 3.14 5 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.19-.55-.34Z" />
    </svg>
  );
}

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { openLogin, openSignup } = useAuthModal();
  const { open: openCart } = useCartDrawer();
  const { isMounted: menuMounted, isVisible: menuVisible, open: openMenuBase, close: closeMenuBase } = useSideMenu();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session?.user));
    return () => subscription.subscription.unsubscribe();
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [drawerSearchValue, setDrawerSearchValue] = useState("");
  const menuOpen = menuMounted;

  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const attendanceHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Gostaria de falar com a Ótica Líder Brasil.")}`
    : undefined;

  function openMenu() {
    openMenuBase();
  }

  function closeMenu() {
    closeMenuBase();
    setDrawerSearchValue("");
  }

  useEffect(() => {
    if (!menuMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuMounted]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos");
    setSearchOpen(false);
    setSearchValue("");
  }

  function submitDrawerSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = drawerSearchValue.trim();
    router.push(query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos");
    closeMenu();
  }

  return (
    <header className="relative border-b border-brand-ink/10">
      {/* Camada de fundo separada: o blur precisa ficar aqui (e não no <header>) para não
          virar "containing block" dos elementos fixed (menu) e absolute — isso é o que fazia
          o menu abrir cortado/atrás do restante da página. */}
      <div className="absolute inset-0 -z-10 bg-brand-cream/95 backdrop-blur-md" aria-hidden="true" />
      <div className="section-shell flex h-[72px] items-center justify-between gap-1.5 sm:h-[80px] sm:gap-5">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink transition-colors hover:border-brand-gold sm:h-12 sm:w-12"
          onClick={() => (menuOpen ? closeMenu() : openMenu())}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={19} strokeWidth={1.8} className="sm:hidden" /> : <Menu size={21} strokeWidth={1.8} className="sm:hidden" />}
          {menuOpen ? <X size={22} strokeWidth={1.8} className="hidden sm:block" /> : <Menu size={22} strokeWidth={1.8} className="hidden sm:block" />}
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
                aria-label="Pesquisar óculos"
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
            className={`flex h-full w-full max-w-[320px] flex-col overflow-hidden bg-brand-paper shadow-2xl transition-transform duration-300 ease-premium-out ${
              menuVisible ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <span className="font-body text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-ink/45">Menu</span>
              <button type="button" onClick={closeMenu} aria-label="Fechar menu" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink">
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-5 pb-4">
                <form onSubmit={submitDrawerSearch} className="relative">
                  <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/45" aria-hidden="true" />
                  <input
                    value={drawerSearchValue}
                    onChange={(event) => setDrawerSearchValue(event.target.value)}
                    placeholder={SEARCH_PLACEHOLDER}
                    aria-label={SEARCH_PLACEHOLDER}
                    className="input-premium h-11 w-full rounded-full py-2.5 pl-11 pr-4 text-sm"
                  />
                </form>
                <SearchSuggestions query={drawerSearchValue} onNavigate={closeMenu} />
              </div>

              <div className="flex flex-col divide-y divide-brand-ink/8 border-t border-brand-ink/10 font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-ink">
                <Link href="/" onClick={closeMenu} className="flex items-center justify-between px-5 py-4">
                  Início <ChevronRight size={16} className="shrink-0 text-brand-ink/30" />
                </Link>
                <Link href="/produtos" onClick={closeMenu} className="flex items-center justify-between px-5 py-4">
                  Coleção completa <ChevronRight size={16} className="shrink-0 text-brand-ink/30" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    openCart();
                  }}
                  className="flex items-center justify-between px-5 py-4 text-left"
                >
                  Meu carrinho {totalItems > 0 ? `(${totalItems})` : ""} <ChevronRight size={16} className="shrink-0 text-brand-ink/30" />
                </button>
              </div>

              <div className="border-t border-brand-ink/10 px-5 pb-2 pt-4">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">Categorias</p>
              </div>
              <div className="flex flex-col divide-y divide-brand-ink/8 font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-ink">
                {NAV_QUICK_FILTERS.map((filter) => (
                  <Link key={filter.value} href={`/produtos?ordenar=${filter.value}`} onClick={closeMenu} className="flex items-center justify-between gap-2.5 px-5 py-4">
                    <span className="flex items-center gap-2.5">{QUICK_FILTER_ICONS[filter.value]} {filter.label}</span>
                    <ChevronRight size={16} className="shrink-0 text-brand-ink/30" />
                  </Link>
                ))}
                {NAV_GENDER_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu} className="flex items-center justify-between gap-2.5 px-5 py-4">
                    <span className="flex items-center gap-2.5"><FaceIcon shape={item.shape} className="h-5 w-5 shrink-0 text-brand-gold" /> {item.label}</span>
                    <ChevronRight size={16} className="shrink-0 text-brand-ink/30" />
                  </Link>
                ))}
                <Link href={SPORT_LINK.href} onClick={closeMenu} className="flex items-center justify-between gap-2.5 px-5 py-4">
                  <span className="flex items-center gap-2.5">
                    <span className="flex shrink-0 items-center -space-x-1"><RunningIcon className="h-5 w-5 text-brand-gold" /><BikeIcon className="h-5 w-5 text-brand-gold" /></span> {SPORT_LINK.label}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-brand-ink/30" />
                </Link>
              </div>
            </div>

            <div className="flex shrink-0 flex-col divide-y divide-brand-paper/10 border-t border-brand-paper/10 bg-brand-ink font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-paper">
              {loggedIn ? (
                <Link href="/conta" onClick={closeMenu} className="flex items-center justify-between px-5 py-4">
                  <span className="flex items-center gap-2.5"><User size={17} strokeWidth={1.8} className="text-brand-gold" /> Minha conta</span>
                  <ChevronRight size={16} className="shrink-0 text-brand-paper/30" />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      openLogin();
                    }}
                    className="flex items-center justify-between px-5 py-4 text-left"
                  >
                    Entrar <ChevronRight size={16} className="shrink-0 text-brand-paper/30" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      openSignup();
                    }}
                    className="flex items-center justify-between px-5 py-4 text-left"
                  >
                    Cadastrar conta <ChevronRight size={16} className="shrink-0 text-brand-paper/30" />
                  </button>
                </>
              )}
              {attendanceHref && (
                <a href={attendanceHref} target="_blank" rel="noreferrer" onClick={closeMenu} className="flex items-center justify-between px-5 py-4">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppGlyph size={14} /></span>
                    Atendimento
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-brand-paper/30" />
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
