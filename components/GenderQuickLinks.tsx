import Image from "next/image";
import Link from "next/link";

const ITEMS = [
  { label: "Óculos Masculino", image: "/gender-masculino.jpg", href: "/produtos?genero=masculino" },
  { label: "Óculos Feminino", image: "/gender-feminino.jpg", href: "/produtos?genero=feminino" },
];

/** Faixa curta com dois "photo-links" circulares (foto + texto por cima, tipo
 * destaque de rede social), um levando pra coleção masculina e outro pra
 * feminina. Sem margem lateral no mobile (empilhado), lado a lado no desktop. */
export default function GenderQuickLinks() {
  return (
    <section className="mx-auto w-full max-w-7xl px-0 py-3 sm:px-8 sm:py-5 lg:px-10">
      <div className="flex flex-col divide-y divide-brand-ink/10 border-y border-brand-ink/10 sm:flex-row sm:justify-center sm:gap-10 sm:divide-y-0 sm:divide-x-0 sm:border-none">
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="group flex flex-1 items-center justify-center gap-0 py-3 sm:flex-none sm:py-2">
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand-gold shadow-card transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20">
              <Image src={item.image} alt={item.label} fill className="object-cover object-top" sizes="80px" />
              <span className="absolute inset-0 bg-black/30" />
              <span className="relative z-10 px-1.5 text-center font-body text-[9.5px] font-bold uppercase leading-[1.1] tracking-[0.02em] text-white drop-shadow sm:text-[11px]">
                {item.label}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
