import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const HERO_IMAGE = "/hero-eyewear.png";

export default function Hero() {
  return (
    <section className="w-full">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-ink sm:aspect-[16/10] lg:aspect-[21/9]">
        <Image
          src={HERO_IMAGE}
          alt="Família com ciclista, criança, casal e corredora usando óculos de sol"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />

        {/* Escurece topo e base da foto só o suficiente pra manter o texto legível. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent sm:h-40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent sm:h-36" />

        <div className="absolute inset-x-0 top-0 pt-5 text-center sm:pt-8">
          <h1 className="font-heading text-[1.9rem] font-medium leading-[0.98] tracking-[-0.03em] text-brand-paper drop-shadow-sm sm:text-5xl lg:text-6xl">
            Melhores escolhas do verão
          </h1>
          <p className="eyebrow mt-2 text-[12px] text-brand-gold sm:text-[14px]">Desde 1999</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-brand-paper/15 bg-brand-ink/55 backdrop-blur-sm">
          <div className="grid grid-cols-3 divide-x divide-brand-paper/20">
            <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 text-center sm:py-5">
              <span className="font-body text-[11px] font-semibold uppercase leading-tight text-brand-paper/80 sm:text-[13px]">Até 10x</span>
              <span className="font-body text-[11px] font-bold uppercase leading-tight text-brand-gold sm:text-[13px]">no cartão*</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 text-center sm:py-5">
              <span className="font-body text-[11px] font-semibold uppercase leading-tight text-brand-paper/80 sm:text-[13px]">Garantia de</span>
              <span className="font-body text-[11px] font-bold uppercase leading-tight text-brand-gold sm:text-[13px]">6 meses</span>
            </div>
            <Link href="/produtos" className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 text-center transition-colors hover:bg-brand-paper/5 sm:py-5">
              <span className="inline-flex items-center gap-0.5 font-body text-[11px] font-semibold uppercase leading-tight text-brand-paper/80 sm:text-[13px]">
                Do Acessível ao Premium <ChevronRight size={12} className="shrink-0" />
              </span>
              <span className="font-body text-[11px] font-bold uppercase leading-tight text-brand-gold sm:text-[13px]">Óculos a partir de R$ 180,00</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
