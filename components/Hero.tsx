import Image from "next/image";
import Link from "next/link";

/** Direção visual: fotografia editorial de óculos em destaque, em diálogo com o verde-musgo e dourado proprietários da marca. */
// As 3 fotos do mosaico (arquivos reais em /public):
// 1) hero-praia-curtindo.jpg — foto principal (tile grande): casal curtindo a praia
// 2) hero-ciclista-profissional.jpg — ciclista pedalando, óculos de sol no rosto
// 3) hero-mulher-praia-correndo.jpg — mulher em atividade esportiva usando óculos de sol
const HERO_PHOTOS = [{ src: "/hero-eyewear.png", alt: "Pessoas usando óculos de sol em um dia ensolarado" }];

export default function Hero() {
  return (
    <section className="section-shell pb-12 pt-8 sm:pb-20 sm:pt-14">
      {/* Tipografia ajustada: reforçar as três frases de apoio solicitadas sem alterar o restante da composição. */}
      <div className="relative min-h-[540px] overflow-hidden rounded-[2rem] bg-brand-ink sm:min-h-[620px]">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border border-brand-sage/20" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-brand-gold/20" />

        <div className="relative z-10 flex min-h-[540px] flex-col justify-end px-6 pb-8 pt-16 sm:min-h-[620px] sm:px-12 sm:pb-12 lg:max-w-[58%] lg:justify-center lg:py-16">
          <p className="eyebrow text-[13px] leading-6 text-brand-gold sm:text-[14px]"><span className="block sm:inline">Desde 1999</span><span className="hidden sm:inline"> · </span><span className="block sm:inline">Paraíba e Pernambuco</span></p>
          <h1 className="mt-5 max-w-xl font-heading text-[2.1rem] font-medium leading-[0.98] tracking-[-0.04em] text-brand-paper sm:text-6xl lg:text-[4.2rem]">
            Melhores Escolhas do Verão
          </h1>
          <p className="mt-6 max-w-md font-body text-base leading-6 text-brand-paper/65 sm:text-lg">
            Proteção e estilo para curtir a praia e praticar esportes.
          </p>
          <div className="mt-5 inline-flex w-fit flex-col gap-1 rounded-2xl border border-brand-gold/30 bg-brand-paper/[0.06] px-5 py-3.5 backdrop-blur-sm">
            <span className="whitespace-nowrap font-heading text-xl font-semibold leading-tight tracking-[-0.01em] text-brand-paper sm:text-2xl">
              Do Acessível ao Premium
            </span>
            <span className="whitespace-nowrap font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-gold sm:text-base">
              Óculos a partir de R$ 180,00
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/produtos" className="rounded-full bg-brand-gold px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-paper transition-all duration-200 hover:bg-brand-paper hover:text-brand-ink active:scale-[0.97]">
              Explorar coleção
            </Link>
            <span className="font-body text-[12px] uppercase tracking-[0.16em] text-brand-paper/45 sm:text-[13px]"><span className="block sm:inline">Frete grátis</span><span className="hidden sm:inline"> · </span><span className="block sm:inline">João Pessoa e Região</span></span>
          </div>
        </div>

        <div className="absolute inset-0">
          <Image src={HERO_PHOTOS[0].src} alt={HERO_PHOTOS[0].alt} fill priority className="object-cover object-center opacity-55 mix-blend-screen" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/75 to-brand-ink/20" />
          <span className="absolute right-5 top-5 rounded-full border border-brand-paper/60 px-3 py-1.5 text-center font-body text-[9px] font-semibold uppercase leading-3 tracking-[0.12em] text-brand-paper sm:right-8 sm:top-8">Coleção 2026</span>
        </div>
      </div>
    </section>
  );
}
