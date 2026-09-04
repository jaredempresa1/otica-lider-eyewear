import Image from "next/image";
import Link from "next/link";

// As 3 fotos do mosaico (arquivos reais em /public):
// 1) hero-praia-curtindo.jpg — foto principal (tile grande): casal curtindo a praia
// 2) hero-ciclista-profissional.jpg — ciclista pedalando, óculos de sol no rosto
// 3) hero-mulher-praia-correndo.jpg — mulher em atividade esportiva usando óculos de sol
const HERO_PHOTOS = [
  { src: "/hero-praia-curtindo.jpg", alt: "Casal curtindo a praia usando óculos de sol" },
  { src: "/hero-ciclista-profissional.jpg", alt: "Ciclista profissional pedalando com óculos de sol" },
  { src: "/hero-mulher-praia-correndo.jpg", alt: "Mulher praticando esporte usando óculos de sol" },
];

export default function Hero() {
  return (
    <section className="section-shell pb-12 pt-8 sm:pb-20 sm:pt-14">
      <div className="relative grid min-h-[460px] overflow-hidden rounded-[2rem] bg-brand-ink sm:min-h-[500px] lg:grid-cols-[1fr_0.85fr]">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border border-brand-sage/20" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-brand-gold/20" />

        <div className="relative z-10 flex flex-col justify-end px-6 pb-8 pt-16 sm:px-12 sm:pb-12 lg:justify-center lg:py-16">
          <p className="eyebrow text-brand-gold">Desde 1999 · Paraíba e Pernambuco</p>
          <h1 className="mt-5 max-w-xl font-heading text-[2.1rem] font-medium leading-[0.98] tracking-[-0.04em] text-brand-paper sm:text-6xl lg:text-[4.2rem]">
            Óculos para viver ao ar livre.
          </h1>
          <p className="mt-6 max-w-md font-body text-sm leading-6 text-brand-paper/65 sm:text-base">
            Proteção e estilo para o sol da praia, o pedal e a corrida.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/produtos" className="rounded-full bg-brand-gold px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-paper transition-all duration-200 hover:bg-brand-paper hover:text-brand-ink active:scale-[0.97]">
              Explorar coleção
            </Link>
            <span className="font-body text-[10px] uppercase tracking-[0.16em] text-brand-paper/45">
              Frete grátis · João Pessoa e Goiana
            </span>
          </div>
        </div>

        {/* Mosaico com 3 fotos: uma maior em cima (praia) + duas quadradas lado a lado embaixo
            (ciclismo + esporte). Cada foto usa uma proporção próxima da proporção real do
            arquivo, então o object-cover não precisa cortar quase nada — e sem "contain"
            não sobra borda vazia ao redor da imagem. */}
        <div className="relative flex flex-col gap-2 p-2 sm:gap-3 sm:p-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.4rem] bg-brand-sage sm:aspect-[16/10]">
            <Image
              src={HERO_PHOTOS[0].src}
              alt={HERO_PHOTOS[0].alt}
              fill
              priority
              className="object-cover object-[50%_30%] mix-blend-multiply opacity-90 transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 1024px) 96vw, 55vw"
            />
            <span className="absolute right-3 top-3 rounded-full border border-brand-paper/60 px-3 py-1.5 text-center font-body text-[8px] font-semibold uppercase leading-3 tracking-[0.12em] text-brand-paper sm:right-4 sm:top-4 sm:text-[9px]">
              Coleção 2026
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-[1.4rem] bg-brand-sage">
              <Image
                src={HERO_PHOTOS[1].src}
                alt={HERO_PHOTOS[1].alt}
                fill
                className="object-cover object-center mix-blend-multiply opacity-90 transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 48vw, 27vw"
              />
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-[1.4rem] bg-brand-sage">
              <Image
                src={HERO_PHOTOS[2].src}
                alt={HERO_PHOTOS[2].alt}
                fill
                className="object-cover object-top mix-blend-multiply opacity-90 transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 48vw, 27vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
