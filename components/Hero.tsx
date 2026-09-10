import Image from "next/image";
import Link from "next/link";

/** Direção visual: fotografia editorial de óculos em destaque, em diálogo com o verde-musgo e dourado proprietários da marca. */
// Foto única do hero (arquivo real em /public): trio em still-life esportivo/praia usando óculos de sol
const HERO_PHOTO = { src: "/hero-trio-oculos.png", alt: "Trio usando óculos de sol em contextos de ciclismo, praia e corrida" };

export default function Hero() {
  return (
    <section className="section-shell pb-12 pt-8 sm:pb-20 sm:pt-14">
      {/* Tipografia ajustada: reforçar as três frases de apoio solicitadas sem alterar o restante da composição. */}
      <div className="relative grid overflow-hidden rounded-[2rem] bg-brand-ink sm:min-h-[500px] lg:grid-cols-[1fr_0.85fr]">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border border-brand-sage/20" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-brand-gold/20" />

        <div className="relative z-10 flex flex-col items-center justify-end px-6 pb-6 pt-7 text-center sm:items-start sm:px-12 sm:pb-12 sm:pt-16 sm:text-left lg:justify-center lg:py-16">
          <p className="eyebrow text-[13px] leading-6 text-brand-gold sm:text-[14px]"><span className="block sm:inline">Desde 1999</span><span className="hidden sm:inline"> · </span><span className="block sm:inline">Paraíba e Pernambuco</span></p>
          <h1 className="mt-3 max-w-xl font-heading text-[2.1rem] font-medium leading-[0.98] tracking-[-0.04em] text-brand-paper sm:mt-5 sm:text-6xl lg:text-[4.2rem]">
            Melhores Escolhas do Verão
          </h1>
          <p className="mt-3 max-w-md font-body text-base leading-6 text-brand-paper/65 sm:mt-6 sm:text-lg">
            Proteção e estilo para curtir a praia e praticar esportes.
          </p>
          <div className="mt-4 inline-flex w-fit flex-col gap-1 rounded-2xl border border-brand-gold/30 bg-brand-paper/[0.06] px-7 py-3.5 backdrop-blur-sm sm:mt-5 sm:px-5">
            <span className="whitespace-nowrap font-heading text-xl font-semibold leading-tight tracking-[-0.01em] text-brand-paper sm:text-2xl">
              Do Acessível ao Premium
            </span>
            <span className="whitespace-nowrap font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-gold sm:text-base">
              Óculos a partir de R$ 180,00
            </span>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:mt-8 sm:justify-start">
            <Link href="/produtos" className="rounded-full bg-brand-gold px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-paper transition-all duration-200 hover:bg-brand-paper hover:text-brand-ink active:scale-[0.97]">
              Explorar coleção
            </Link>
            <span className="font-body text-[12px] uppercase tracking-[0.16em] text-brand-paper/45 sm:text-[13px]"><span className="block sm:inline">Frete grátis</span><span className="hidden sm:inline"> · </span><span className="block sm:inline">João Pessoa e Região</span></span>
          </div>
        </div>

        {/* Foto única do hero: composição já pronta (ciclismo + casal na praia + corrida)
            em uma imagem só, o que ocupa bem menos altura no mobile do que o mosaico anterior. */}
        <div className="relative flex items-center p-2 sm:p-3 lg:h-full">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.4rem] bg-brand-sage sm:aspect-[16/10]">
            <Image
              src={HERO_PHOTO.src}
              alt={HERO_PHOTO.alt}
              fill
              priority
              className="object-cover object-center mix-blend-multiply opacity-90 transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 1024px) 96vw, 55vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
