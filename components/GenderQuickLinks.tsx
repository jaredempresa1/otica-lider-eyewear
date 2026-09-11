import Link from "next/link";
import { Glasses } from "lucide-react";

const ITEMS = [
  { label: "Óculos masculino", href: "/produtos?genero=masculino", tone: "bg-brand-ink" },
  { label: "Óculos feminino", href: "/produtos?genero=feminino", tone: "bg-brand-moss" },
];

export default function GenderQuickLinks() {
  return (
    <section className="mx-auto w-full max-w-7xl px-0 py-3 sm:px-8 sm:py-5 lg:px-10">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex min-h-[126px] items-center justify-between overflow-hidden px-6 py-5 text-brand-paper shadow-card transition-transform duration-200 active:scale-[0.99] sm:min-h-[150px] sm:px-8 lg:min-h-[190px] lg:px-10 ${item.tone}`}
          >
            <span className="relative z-10 max-w-[13rem] font-heading text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{item.label}</span>
            <Glasses className="relative z-10 h-12 w-12 shrink-0 text-brand-gold transition-transform duration-200 group-hover:scale-110 sm:h-16 sm:w-16" strokeWidth={1.25} aria-hidden="true" />
            <span className="absolute -right-8 -top-10 h-44 w-44 rounded-full border border-brand-paper/10" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
