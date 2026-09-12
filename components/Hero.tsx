import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const HERO_IMAGE_MOBILE = "/hero-eyewear.png";
const HERO_IMAGE_DESKTOP = "/hero-eyewear-desktop.png";

export default function Hero() {
  return (
    <section className="w-full">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-ink sm:aspect-[16/10] lg:aspect-auto lg:h-[440px] xl:h-[500px]">
        {/* Celular: foto em retrato, sem mexer. */}
        <Image
          src={HERO_IMAGE_MOBILE}
          alt="Família com ciclista, criança, casal e corredora usando óculos de sol"
          fill
          priority
          className="object-cover object-top lg:hidden"
          sizes="100vw"
        />

        {/* Desktop: foto já em 16:9, preenche o banner inteiro sem precisar de fundo borrado. */}
        <Image
          src={HERO_IMAGE_DESKTOP}
          alt="Família com ciclista, criança, casal e corredora usando óculos de sol"
          fill
          priority
          className="hidden object-cover object-center lg:block"
          sizes="100vw"
        />

        {/* Escurece a base da foto só o suficiente pra manter a barra de benefícios legível. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent sm:h-36 lg:hidden" />

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
