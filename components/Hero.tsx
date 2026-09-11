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

        {/* Escurece a base da foto só o suficiente pra manter a barra de benefícios legível. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent sm:h-36" />

        {/* Título e "Desde 1999" ficam presos bem no topo, dentro de um bloco com fundo
            desfocado (mesma linguagem visual da barra "Até 10x no cartão*"), pra nunca
            cair em cima do rosto de quem aparece na foto, em nenhum recorte de tela. */}
        <div className="absolute inset-x-0 top-0 flex justify-center px-4 pt-3 sm:pt-5">
          <div className="w-full max-w-xl rounded-2xl border border-brand-paper/15 bg-brand-ink/55 px-5 py-3 text-center shadow-card backdrop-blur-md sm:max-w-2xl sm:px-8 sm:py-4">
            <h1 className="font-heading text-[1.6rem] font-medium leading-[0.98] tracking-[-0.03em] text-brand-paper drop-shadow-sm sm:text-5xl lg:text-6xl">
              Melhores escolhas do verão
            </h1>
            <p className="eyebrow mt-1.5 text-[12px] font-semibold text-brand-gold sm:mt-2 sm:text-[14px]">Desde 1999</p>
          </div>
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
