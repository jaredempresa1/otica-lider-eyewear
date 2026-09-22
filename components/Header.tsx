"use client";

/** Direção visual: controles maiores e a logo oficial destacada, preservando o cabeçalho creme, verde e dourado da marca. */
import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, Menu, Search, ShoppingCart, X, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useAuthModal } from "./AuthModal";
import { useCartDrawer } from "./CartDrawer";
import { useSideMenu } from "./SideMenuContext";
import { supabase } from "@/lib/supabaseClient";
import { QUICK_FILTERS } from "@/lib/filters";
import SearchSuggestions from "./SearchSuggestions";

// Ordem no menu: Ofertas, Mais vendidos, Em destaque.
const QUICK_FILTER_ORDER = ["ofertas", "mais-vendidos", "destaques"];
const NAV_QUICK_FILTERS = QUICK_FILTERS.filter((filter) => QUICK_FILTER_ORDER.includes(filter.value)).sort(
  (a, b) => QUICK_FILTER_ORDER.indexOf(a.value) - QUICK_FILTER_ORDER.indexOf(b.value)
);

const NAV_GENDER_LINKS: { href: string; label: string }[] = [
  { href: "/produtos?genero=masculino", label: "Óculos de sol masculino" },
  { href: "/produtos?genero=feminino", label: "Óculos de sol feminino" },
  { href: "/produtos?genero=infantil", label: "Óculos infantil" },
];

const SPORT_LINK = { href: "/produtos?esportivo=1", label: "Óculos esportivo" };

const SEARCH_PLACEHOLDER = "O que você está procurando";

// TROCAR: quando criar o e-mail de contato da loja, escreva ele aqui (ex.: "contato@seudominio.com.br").
// Enquanto não tiver "@", o texto aparece no menu mas não vira link.
const CONTACT_EMAIL = "Emailparacontato";

const INSTAGRAM_URL = "https://www.instagram.com/oticaliderpe";

// id da seção de avaliações na home (ver components/Testimonials.tsx).
const REVIEWS_ANCHOR = "avaliacoes";

/** Mostra o número do WhatsApp como "83 99999-9999" (só números com DDD, sem o 55). */
function formatWhatsappDisplay(digits: string) {
  const national = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  if (national.length === 11) return `${national.slice(0, 2)} ${national.slice(2, 7)}-${national.slice(7)}`;
  if (national.length === 10) return `${national.slice(0, 2)} ${national.slice(2, 6)}-${national.slice(6)}`;
  return national;
}

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
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { openLogin, openSignup } = useAuthModal();
  const { open: openCart } = useCartDrawer();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session?.user));
    return () => subscription.subscription.unsubscribe();
  }, []);
  const { isMounted: menuMounted, isVisible: menuVisible, open: openMenuBase, close: closeMenuBase } = useSideMenu();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [drawerSearchValue, setDrawerSearchValue] = useState("");
  const menuOpen = menuMounted;

  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const attendanceHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Gostaria de falar com a Ótica Líder Brasil.")}`
    : undefined;

  const whatsappDisplay = whatsappNumber ? formatWhatsappDisplay(whatsappNumber) : "";

  function openMenu() {
    openMenuBase();
  }

  function closeMenu() {
    closeMenuBase();
    setDrawerSearchValue("");
  }

  /** Fecha o menu e leva para a seção de avaliações da home (de qualquer página). */
  function goToReviews() {
    closeMenu();
    // Espera a gaveta terminar de fechar: enquanto ela está aberta o scroll da página fica travado.
    window.setTimeout(() => {
      if (pathname === "/") {
        document.getElementById(REVIEWS_ANCHOR)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        router.push(`/#${REVIEWS_ANCHOR}`);
      }
    }, 340);
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

        <Link href="/" className="group flex min-w-0 shrink items-center" onClick={(event) => { closeMenu(); if (pathname === "/produtos" && window.location.search.includes("secao=")) { event.preventDefault(); router.back(); } }} aria-label="Ótica Líder Brasil — início">
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 text-brand-ink outline-none transition-colors hover:border-brand-gold focus:border-brand-ink/10 focus:outline-none focus:ring-0 sm:h-12 sm:w-12"
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
                className="input-premium h-11 w-full rounded-full py-2.5 pl-11 pr-4 text-sm focus:border-brand-ink/15 focus:outline-none focus:ring-0"
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
            aria-label="Menu"
            className={`flex h-full w-full max-w-[420px] flex-col overflow-hidden bg-brand-paper shadow-2xl transition-transform duration-300 ease-premium-out ${
              menuVisible ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Topo: fechar + logo + carrinho */}
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
              <div className="flex min-w-0 items-center gap-4">
                <button type="button" onClick={closeMenu} aria-label="Fechar menu" className="flex h-9 w-9 shrink-0 items-center justify-center text-brand-ink">
                  <X size={24} strokeWidth={1.6} />
                </button>
                <Link href="/" onClick={(event) => { closeMenu(); if (pathname === "/produtos" && window.location.search.includes("secao=")) { event.preventDefault(); router.back(); } }} aria-label="Ótica Líder Brasil — início" className="flex min-w-0 items-center">
                  <Image
                    src="/logo.png"
                    alt="Ótica Líder Brasil"
                    width={496}
                    height={198}
                    className="h-12 w-auto max-w-[200px] object-contain object-left"
                  />
                </Link>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openCart();
                }}
                aria-label="Abrir carrinho"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center text-brand-ink"
              >
                <ShoppingCart size={24} strokeWidth={1.6} />
                {totalItems > 0 && (
                  <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-ink px-1 text-[10px] font-bold text-brand-paper">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-8">
              {/* Pesquisa */}
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

              {/* Primeira linha: entrar e cadastrar lado a lado */}
              <div className="px-5 pb-3">
                {loggedIn ? (
                  <Link
                    href="/conta"
                    onClick={closeMenu}
                    className="flex h-11 items-center justify-center rounded-full border border-brand-ink/20 font-body text-[14px] font-medium text-brand-ink transition-colors hover:border-brand-ink"
                  >
                    Minha conta
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        openLogin();
                      }}
                      className="flex h-11 items-center justify-center rounded-full border border-brand-ink/20 font-body text-[14px] font-medium text-brand-ink transition-colors hover:border-brand-ink"
                    >
                      Entrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        openSignup();
                      }}
                      className="flex h-11 items-center justify-center rounded-full bg-brand-ink font-body text-[14px] font-medium text-brand-paper transition-colors hover:bg-brand-moss"
                    >
                      Cadastrar
                    </button>
                  </div>
                )}
              </div>

              {/* Links principais */}
              <div className="flex flex-col px-5 py-2 font-body text-[15px] text-brand-ink">
                <Link href="/" onClick={closeMenu} className="py-2.5 transition-colors hover:text-brand-gold">
                  Início
                </Link>
                {NAV_QUICK_FILTERS.map((filter) => (
                  <Link key={filter.value} href={`/produtos?ordenar=${filter.value}`} onClick={closeMenu} className="py-2.5 transition-colors hover:text-brand-gold">
                    {filter.label}
                  </Link>
                ))}
                {NAV_GENDER_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu} className="py-2.5 transition-colors hover:text-brand-gold">
                    {item.label}
                  </Link>
                ))}
                <Link href={SPORT_LINK.href} onClick={closeMenu} className="py-2.5 transition-colors hover:text-brand-gold">
                  {SPORT_LINK.label}
                </Link>
                <button type="button" onClick={goToReviews} className="py-2.5 text-left transition-colors hover:text-brand-gold">
                  Avaliações
                </button>
              </div>

              {/* Precisa de ajuda? */}
              <div className="mx-5 mt-2 border-t border-brand-ink/10 pt-5 font-body text-[15px] text-brand-ink">
                <p className="text-[11px] font-bold uppercase tracking-[0.06em]">Precisa de ajuda?</p>
                <div className="mt-2 flex flex-col">
                  {attendanceHref && (
                    <a href={attendanceHref} target="_blank" rel="noreferrer" onClick={closeMenu} className="flex items-center gap-4 py-2.5 transition-colors hover:text-brand-gold">
                      <WhatsAppGlyph size={22} />
                      <span>{whatsappDisplay || "WhatsApp"}</span>
                    </a>
                  )}
                  {CONTACT_EMAIL.includes("@") ? (
                    <a href={`mailto:${CONTACT_EMAIL}`} onClick={closeMenu} className="flex items-center gap-4 py-2.5 transition-colors hover:text-brand-gold">
                      <Mail size={22} strokeWidth={1.5} />
                      <span className="min-w-0 break-all">{CONTACT_EMAIL}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 py-2.5">
                      <Mail size={22} strokeWidth={1.5} />
                      <span className="min-w-0 break-all">{CONTACT_EMAIL}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Siga a Ótica Líder */}
              <div className="mx-5 mt-4 border-t border-brand-ink/10 pt-5 font-body text-[15px] text-brand-ink">
                <p className="text-[11px] font-bold uppercase tracking-[0.06em]">Siga a Ótica Líder</p>
                <div className="mt-2 flex flex-col">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" onClick={closeMenu} className="flex items-center gap-4 py-2.5 transition-colors hover:text-brand-gold">
                    <Instagram size={22} strokeWidth={1.5} />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
