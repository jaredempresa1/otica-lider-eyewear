import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guia de Rostos — Ótica Líder Brasil",
  description: "Descubra o formato do seu rosto e veja quais estilos de óculos de sol combinam mais com você.",
};

type FrameExample = {
  /** Nome de exemplo (não é necessariamente um produto real do catálogo, só ilustrativo). */
  name: string;
  /** Forma da lente, usada para desenhar o ícone ilustrativo. */
  shape: "retangular" | "redonda" | "aviador" | "gatinho" | "quadrada" | "oval";
};

type FaceShape = {
  slug: string;
  title: string;
  description: string;
  matchIntro: string;
  matchText: string;
  examples: [FrameExample, FrameExample, FrameExample];
};

const FACE_SHAPES: FaceShape[] = [
  {
    slug: "oval",
    title: "Rosto Oval",
    description: "O rosto oval tem traços equilibrados e suaves, com a testa um pouco mais larga que o queixo.",
    matchIntro: "Óculos que combinam:",
    matchText: "praticamente todos os formatos se adaptam bem, mas modelos retangulares ou levemente arredondados valorizam ainda mais essa estrutura.",
    examples: [
      { name: "Estilo retangular", shape: "retangular" },
      { name: "Estilo arredondado", shape: "redonda" },
      { name: "Estilo aviador", shape: "aviador" },
    ],
  },
  {
    slug: "redondo",
    title: "Rosto Redondo",
    description: "O rosto redondo tem bochechas mais cheias, com largura e altura semelhantes e ângulos pouco marcados.",
    matchIntro: "Óculos que combinam:",
    matchText: "armações mais retas ou geométricas ajudam a criar contraste visual. Modelos quadrados e retangulares são boas escolhas.",
    examples: [
      { name: "Estilo quadrado", shape: "quadrada" },
      { name: "Estilo retangular", shape: "retangular" },
      { name: "Estilo geométrico", shape: "oval" },
    ],
  },
  {
    slug: "quadrado",
    title: "Rosto Quadrado",
    description: "Rostos quadrados têm mandíbula marcante, testa larga e proporções lineares.",
    matchIntro: "Óculos que combinam:",
    matchText: "modelos arredondados, ovais ou com cantos suavizados criam um contraste interessante com as linhas retas do rosto.",
    examples: [
      { name: "Estilo redondo", shape: "redonda" },
      { name: "Estilo oval", shape: "oval" },
      { name: "Estilo gatinho suave", shape: "gatinho" },
    ],
  },
  {
    slug: "triangular",
    title: "Rosto Triangular",
    description: "O rosto triangular é mais estreito na parte inferior, com a testa geralmente mais ampla.",
    matchIntro: "Óculos que combinam:",
    matchText: "armações com detalhes na parte superior, como o modelo aviador, ajudam a equilibrar as proporções.",
    examples: [
      { name: "Estilo aviador", shape: "aviador" },
      { name: "Estilo redondo", shape: "redonda" },
      { name: "Estilo oval", shape: "oval" },
    ],
  },
  {
    slug: "coracao",
    title: "Rosto Coração",
    description: "O rosto coração tem a testa mais larga e o queixo afinado, num contorno delicado.",
    matchIntro: "Óculos que combinam:",
    matchText: "modelos mais leves e arredondados na parte de baixo, como o gatinho suave ou o redondo, equilibram bem essa proporção.",
    examples: [
      { name: "Estilo gatinho suave", shape: "gatinho" },
      { name: "Estilo redondo", shape: "redonda" },
      { name: "Estilo oval", shape: "oval" },
    ],
  },
];

/** Ícone ilustrativo simples de um par de óculos, desenhado em SVG (não é foto de produto). */
function GlassesIcon({ shape }: { shape: FrameExample["shape"] }) {
  const lens =
    shape === "retangular" ? { rx: 4, w: 30, h: 20 } :
    shape === "quadrada" ? { rx: 2, w: 28, h: 24 } :
    shape === "redonda" ? { rx: 14, w: 26, h: 26 } :
    shape === "oval" ? { rx: 13, w: 30, h: 22 } :
    shape === "aviador" ? { rx: 12, w: 28, h: 26 } :
    { rx: 16, w: 28, h: 22 }; // gatinho

  const tilt = shape === "gatinho" ? -8 : shape === "aviador" ? 4 : 0;

  return (
    <svg viewBox="0 0 110 60" className="h-14 w-24 sm:h-16 sm:w-28" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round">
        <line x1="50" y1="24" x2="60" y2="24" />
        <line x1="4" y1="18" x2="14" y2="24" />
        <line x1="106" y1="18" x2="96" y2="24" />
        <g transform={`translate(14,30) rotate(${tilt})`}>
          <rect x={-lens.w / 2} y={-lens.h / 2} width={lens.w} height={lens.h} rx={lens.rx} fill="currentColor" fillOpacity="0.12" />
        </g>
        <g transform={`translate(96,30) rotate(${-tilt})`}>
          <rect x={-lens.w / 2} y={-lens.h / 2} width={lens.w} height={lens.h} rx={lens.rx} fill="currentColor" fillOpacity="0.12" />
        </g>
      </g>
    </svg>
  );
}

export default function GuiaDeRostosPage() {
  return (
    <main className="section-shell py-10 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-5xl">Guia de Rostos</h1>
        <p className="mt-3 font-body text-base font-semibold text-brand-ink">Qual é o seu formato de rosto?</p>
        <p className="mt-2 font-body text-sm leading-6 text-brand-ink/60">Descubra seu tipo facial e veja quais estilos de óculos combinam melhor com você.</p>
      </div>

      <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-14 sm:gap-20">
        {FACE_SHAPES.map((shape) => (
          <section key={shape.slug} id={shape.slug} className="scroll-mt-24 border-t border-brand-ink/10 pt-10 first:border-t-0 first:pt-0">
            <h2 className="font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">{shape.title}</h2>
            <p className="mt-3 font-body text-sm leading-6 text-brand-ink/70">{shape.description}</p>
            <p className="mt-3 font-body text-sm leading-6 text-brand-ink/70">
              <strong className="text-brand-ink">{shape.matchIntro}</strong> {shape.matchText}
            </p>

            <p className="mt-8 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">Exemplos de estilo</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {shape.examples.map((example) => (
                <div key={example.name} className="flex flex-col items-center gap-2 rounded-2xl border border-brand-ink/10 bg-brand-paper px-2 py-5 text-brand-ink/70">
                  <GlassesIcon shape={example.shape} />
                  <span className="text-center font-body text-[11px] leading-tight text-brand-ink/60">{example.name}</span>
                </div>
              ))}
            </div>

            <Link href="/produtos" className="btn-brand mt-8 inline-flex px-6 py-3 text-[11px]">
              Ver coleção completa
            </Link>
          </section>
        ))}
      </div>
    </main>
  );
}
