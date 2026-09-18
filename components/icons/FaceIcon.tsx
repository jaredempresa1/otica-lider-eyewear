/** Ícones em linha fina para as categorias de gênero (masculino, feminino,
 * infantil), usados no lugar de emoji e no lugar do ícone de óculos — que
 * fica reservado para as categorias de tipo de armação. Masculino e feminino
 * usam os símbolos universais de Marte (♂) e Vênus (♀); infantil usa um
 * rostinho ilustrado. */
export type FaceShape = "masculino" | "feminino" | "infantil";

function ShapeSvg({ shape }: { shape: FaceShape }) {
  const common = { fill: "none", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (shape) {
    case "masculino":
      return (
        <svg viewBox="0 0 32 32" {...common} stroke="currentColor" className="h-full w-full">
          {/* Símbolo de Marte — círculo com seta, referência universal ao masculino */}
          <circle cx="14" cy="18" r="7" />
          <path d="M19 13 25.5 6.5" />
          <path d="M20 6.5h5.5V12" />
        </svg>
      );
    case "feminino":
      return (
        <svg viewBox="0 0 32 32" {...common} stroke="currentColor" className="h-full w-full">
          {/* Símbolo de Vênus — círculo com a cruz, referência universal ao feminino */}
          <circle cx="16" cy="12.5" r="7" />
          <path d="M16 19.5v9" />
          <path d="M11.5 24.5h9" />
        </svg>
      );
    case "infantil":
      return (
        <svg viewBox="0 0 32 32" {...common} stroke="currentColor" className="h-full w-full">
          {/* Rosto bem redondo e pequeno, com uma mechinha de cabelo — proporção infantil. */}
          <path d="M10.2 15.2c0-4.3 2.6-7 5.8-7s5.8 2.7 5.8 7" />
          <path d="M13.6 8.6c.6-1.4 1.6-2.4 2.4-2.4" />
          <path d="M10.4 15.6v1.8c0 3.9 2.5 7 5.6 7s5.6-3.1 5.6-7v-1.8" />
          <circle cx="13.4" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="18.6" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
          <path d="M13.6 19.6c.8.6 1.7.9 2.4.9s1.6-.3 2.4-.9" />
        </svg>
      );
    default:
      return null;
  }
}

export default function FaceIcon({ shape, className = "" }: { shape: FaceShape; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true">
      <ShapeSvg shape={shape} />
    </span>
  );
}
