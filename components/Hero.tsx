import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE = "/hero-eyewear.png";

export default function Hero() {
  return (
    <section className="section-shell pb-6 pt-4 sm:pb-14 sm:pt-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-brand-ink">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border border-brand-sage/20" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-brand-gold/20" />
        <div className="relative z-10 grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col items-center px-5 pb-6 pt-9 text-center sm:px-12 sm:pb-10 sm:pt-16 lg:items-start lg:justify-center lg:text-left lg:py-16">
            <p className="eyebrow text-[13px] leading-6 text-brand-gold sm:text-[14px]">Desde 1999 <span className="hidden sm:inline">·</span><span className="block sm:inline"> Paraíba e Pernambuco</span></p>
            <h1 className="mt-3 max-w-xl font-heading text-[2.25rem] font-medium leading-[0.98] tracking-[-0.04em] text-brand-paper sm:text-6xl lg:text-[4rem]">Melhores Escolhas do Verão</h1>
            <p className="mt-3 max-w-md font-body text-base leading-6 text-brand-paper/65 sm:text-lg">Proteção e estilo para curtir a praia e praticar esportes.</p>
            <div className="mt-4 inline-flex w-fit flex-col gap-1 rounded-2xl border border-brand-gold/30 bg-brand-paper/[0.06] px-5 py-3.5">
              <span className="font-heading text-xl font-semibold leading-tight text-brand-paper sm:text-2xl">Do Acessível ao Premium</span>
              <span className="font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-gold sm:text-base">Óculos a partir de R$ 180,00</span>
            </div>
            <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <Link href="/produtos" className="rounded-full bg-[#f4511e] px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-card transition-all hover:bg-[#ff7043] hover:text-white active:scale-[0.97]">Explorar coleção</Link>
              <span className="font-body text-[12px] uppercase tracking-[0.16em] text-brand-paper/45 sm:text-[13px]">Frete grátis <span className="hidden sm:inline">·</span><span className="block sm:inline"> João Pessoa e Região</span></span>
            </div>
          </div>
          <div className="relative mx-4 mb-4 aspect-[16/9] overflow-hidden rounded-[1.4rem] bg-brand-sage sm:mx-8 sm:mb-8 lg:mx-4 lg:my-4 lg:aspect-[16/9] lg:self-center">
            <Image src={HERO_IMAGE} alt="Ciclista, casal na praia e corredora usando óculos de sol" fill priority className="object-contain object-center" sizes="(max-width: 1024px) 92vw, 52vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
