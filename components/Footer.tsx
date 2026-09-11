import Link from "next/link";
import { ChevronRight, Instagram, MessageCircle } from "lucide-react";

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
          <ul className="mt-4 space-y-3 font-body text-sm text-brand-paper/70">
            <li>
              <Link href="/" className="inline-flex items-center gap-1 underline decoration-brand-paper/25 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">
                <ChevronRight size={13} className="shrink-0" /> Início
              </Link>
            </li>
            <li>
              <Link href="/produtos" className="inline-flex items-center gap-1 underline decoration-brand-paper/25 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">
                <ChevronRight size={13} className="shrink-0" /> Coleção
              </Link>
            </li>
            <li>
              <Link href="/sacola" className="inline-flex items-center gap-1 underline decoration-brand-paper/25 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">
                <ChevronRight size={13} className="shrink-0" /> Meu carrinho
              </Link>
            </li>
            <li>
              <Link href="/politica-de-garantia" className="inline-flex items-center gap-1 underline decoration-brand-paper/25 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">
                <ChevronRight size={13} className="shrink-0" /> Política de Garantia
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidade" className="inline-flex items-center gap-1 underline decoration-brand-paper/25 underline-offset-4 transition-colors hover:text-brand-gold hover:decoration-brand-gold">
                <ChevronRight size={13} className="shrink-0" /> Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-paper/45">A experiência Líder</h4>
          <ul className="mt-4 space-y-3 font-body text-sm leading-5 text-brand-paper/70"><li>Nota fiscal em todas as compras</li><li>Produtos originais</li><li>Troca garantida</li><li>Frete grátis para João Pessoa e Região, e para compras acima de R$ 500,00</li></ul>
        </div>
        <div className="border-t border-brand-paper/10 pt-6 font-body text-sm leading-6 text-brand-paper/60 sm:col-span-3">
          <div className="mb-2">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-paper/45">Central de atendimento ao cliente</p>
            {whatsappDigits && <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-brand-paper transition-colors hover:text-[#25D366]"><MessageCircle size={18} fill="currentColor" className="text-[#25D366]" /> {formatWhatsAppNumber(whatsappNumber)}</a>}
          </div>
          <a href="https://www.instagram.com/oticaliderpe" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-brand-paper underline decoration-brand-gold/70 underline-offset-4 transition-colors hover:text-brand-gold"><Instagram size={17} /> <span>Instagram: @oticaliderpe</span></a>
          <p className="mt-4"><span className="font-semibold text-brand-paper/80">Endereço:</span> R. Gal Joaquim Barbosa Cordeiro de Farias, 31 B - Centro, Goiana - PE, 55900-000</p>
        </div>
      </div>
      <div className="border-t border-brand-paper/10 px-5 py-5 text-center font-body text-[10px] text-brand-paper/35">
        <span className="whitespace-nowrap">© {new Date().getFullYear()} Ótica Líder Eyewear. Todos os direitos reservados.</span>{" "}
        <span className="mx-1">·</span>{" "}
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <span>CNPJ</span> <span>04.786.494/0001-32</span>
        </span>
      </div>
    </footer>
  );
}
