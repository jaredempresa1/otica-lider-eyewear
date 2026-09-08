import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

function formatWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 12) return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  return value;
}

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");

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
          <ul className="mt-4 space-y-3 font-body text-sm text-brand-paper/70"><li><Link href="/" className="underline decoration-brand-paper/30 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">Início</Link></li><li><Link href="/produtos" className="underline decoration-brand-paper/30 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">Coleção</Link></li><li><Link href="/sacola" className="underline decoration-brand-paper/30 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">Minha sacola</Link></li></ul>
        </div>
        <div>
          <h4 className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-paper/45">A experiência Líder</h4>
          <ul className="mt-4 space-y-3 font-body text-sm leading-5 text-brand-paper/70"><li>Nota fiscal em todas as compras</li><li>Troca garantida — não gostou, a gente resolve</li><li>Frete grátis para João Pessoa e Região</li></ul>
        </div>
        <div className="border-t border-brand-paper/10 pt-6 font-body text-sm leading-6 text-brand-paper/60 sm:col-span-3">
          <div className="mb-5">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-paper/45">Central de atendimento ao cliente</p>
            {whatsappDigits && <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-brand-paper transition-colors hover:text-[#25D366]"><MessageCircle size={18} fill="currentColor" className="text-[#25D366]" /> {formatWhatsAppNumber(whatsappNumber)}</a>}
          </div>
          <p><span className="font-semibold text-brand-paper/80">Endereço:</span> R. Gal Joaquim Barbosa Cordeiro de Farias, 31 B - Centro, Goiana - PE, 55900-000</p>
          <a href="https://www.instagram.com/oticaliderpe" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-brand-paper/75 transition-colors hover:text-brand-gold"><Instagram size={16} /> <span>Instagram: <strong className="font-semibold text-brand-paper">@oticaliderpe</strong></span></a>
        </div>
      </div>
      <div className="border-t border-brand-paper/10 px-5 py-5 text-center font-body text-[10px] text-brand-paper/35">© {new Date().getFullYear()} Ótica Líder Eyewear. Todos os direitos reservados. <span className="mx-1">·</span> <span className="whitespace-nowrap">CNPJ: 04.786.494/0001-32</span></div>
    </footer>
  );
}
