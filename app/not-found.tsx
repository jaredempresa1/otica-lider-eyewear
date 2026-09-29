import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="section-shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Erro 404</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-4xl">
        Ops, esse óculos saiu de vista
      </h1>
      <p className="mt-3 max-w-md font-body text-sm leading-6 text-brand-ink/60">
        A página que você procura não existe mais ou mudou de endereço.
      </p>

      <form action="/produtos" method="GET" className="mt-8 flex w-full max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/45" aria-hidden="true" />
          <input
            name="q"
            placeholder="O que você está procurando"
            aria-label="Buscar óculos"
            className="input-premium h-11 w-full rounded-full py-2.5 pl-11 pr-4 text-sm"
          />
        </div>
        <button type="submit" className="btn-brand shrink-0 px-5 py-2.5 text-[11px]">
          Buscar
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-brand px-6 py-3 text-[11px]">
          Voltar para a página inicial
        </Link>
        <Link href="/produtos" className="rounded-full border border-brand-ink/20 px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-ink transition-colors hover:border-brand-ink">
          Ver coleção completa
        </Link>
      </div>
    </main>
  );
}
