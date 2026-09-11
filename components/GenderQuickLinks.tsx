import Image from "next/image";
import Link from "next/link";

const ITEMS = [
  { label: "Óculos Masculino", image: "/gender-masculino.jpg", href: "/produtos?genero=masculino" },
  { label: "Óculos Feminino", image: "/gender-feminino.jpg", href: "/produtos?genero=feminino" },
];

/** Faixa full-bleed com dois "photo-links", masculino e feminino. No mobile
 * ficam empilhados (masculino em cima, feminino embaixo), cada um cobrindo
 * toda a largura da tela com uma altura média. No desktop os dois cobrem
 * juntos a largura inteira, lado a lado. */
export default function GenderQuickLinks() {
  return (
    <section className="w-full py-3 sm:py-5">
      <div className="flex flex-col sm:flex-row">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative block aspect-[16/9] w-full overflow-hidden sm:aspect-[4/5] sm:flex-1"
          >
            <Image
              src={item.image}
              alt={item.label}
              fill
              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center px-4 pb-5 sm:pb-8">
              <span className="rounded-full border border-brand-paper/40 bg-brand-ink/45 px-6 py-2 font-body text-[13px] font-bold uppercase tracking-[0.14em] text-brand-paper shadow-card backdrop-blur-sm transition-colors group-hover:border-brand-gold sm:px-8 sm:py-2.5 sm:text-[15px]">
                {item.label}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
