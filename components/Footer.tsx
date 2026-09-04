import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-brand-ink text-brand-paper sm:mt-20">
      <div className="section-shell grid gap-10 py-12 sm:grid-cols-[1.3fr_0.7fr_1fr] sm:py-16">
        <div>
          <p className="font-heading text-2xl font-semibold tracking-[-0.03em] text-brand-paper">Ótica Líder</p>
          <p className="mt-1 font-body text-[9px] font-semibold uppercase tracking-[0.26em] text-brand-gold">Eyewear</p>
          <p className="mt-6 max-w-xs font-body text-sm leading-6 text-brand-paper/55">25 anos de experiência cuidando da visão das pessoas. Curadoria de óculos de sol para todo o Brasil.</p>
        </div>
        <div>
          <h4 className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-paper/45">Navegação</h4>
          <ul className="mt-4 space-y-3 font-body text-sm text-brand-paper/70"><li><Link href="/" className="transition-colors hover:text-brand-gold">Início</Link></li><li><Link href="/produtos" className="transition-colors hover:text-brand-gold">Coleção</Link></li><li><Link href="/sacola" className="transition-colors hover:text-brand-gold">Minha sacola</Link></li></ul>
        </div>
        <div>
          <h4 className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-paper/45">A experiência Líder</h4>
          <ul className="mt-4 space-y-3 font-body text-sm leading-5 text-brand-paper/70"><li>Nota fiscal em todas as compras</li><li>Troca garantida — não gostou, a gente resolve</li><li>Frete grátis para João Pessoa e Região Metropolitana</li></ul>
        </div>
      </div>
      <div className="border-t border-brand-paper/10 px-5 py-5 text-center font-body text-[10px] text-brand-paper/35">© {new Date().getFullYear()} Ótica Líder Eyewear. Todos os direitos reservados.</div>
    </footer>
  );
}
