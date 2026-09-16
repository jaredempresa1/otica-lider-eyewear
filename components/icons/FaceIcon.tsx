/** Ícones de rosto em linha fina para as categorias de gênero (masculino,
 * feminino, infantil), usados no lugar de emoji e no lugar do ícone de
 * óculos — que fica reservado para as categorias de tipo de armação. */
export type FaceShape = "masculino" | "feminino" | "infantil";

function ShapeSvg({ shape }: { shape: FaceShape }) {
  const common = { fill: "none", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (shape) {
    case "masculino":
      return (
        <svg viewBox="0 0 32 32" {...common} stroke="currentColor" className="h-full w-full">
          {/* Cabelo curto reto no topo + rosto oval + mandíbula marcada. */}
          <path d="M9.5 12.5c0-4 2.9-6.8 6.5-6.8s6.5 2.8 6.5 6.8" />
          <path d="M9.4 12c1.8.3 11.6.3 13.2 0" />
          <path d="M9.6 12.8v3.4c0 4.6 3 8.3 6.4 8.3s6.4-3.7 6.4-8.3v-3.4" />
          <path d="M12.2 18.4c1.1.9 2.5 1.4 3.8 1.4s2.7-.5 3.8-1.4" />
        </svg>
      );
    case "feminino":
      return (
        <svg viewBox="0 0 32 32" {...common} stroke="currentColor" className="h-full w-full">
          {/* Cabelo longo e ondulado emoldurando o rosto até os ombros */}
          <path d="M9.2 15.2c-.7-5.6 2.7-9.8 6.8-9.8s7.5 4.2 6.8 9.8" />
          <path d="M9.7 14.8c-1.5 2.1-2.1 4.9-1.7 7.7.3 2 1 3.7 1.9 5.1" />
          <path d="M22.3 14.8c1.5 2.1 2.1 4.9 1.7 7.7-.3 2-1 3.7-1.9 5.1" />
          <path d="M11.3 16.2c-.7 1.8-.9 3.8-.5 5.7" />
          <path d="M20.7 16.2c.7 1.8.9 3.8.5 5.7" />
          {/* Rosto oval */}
          <path d="M10.6 14.8v3.2c0 4.6 2.5 8.4 5.4 8.4s5.4-3.8 5.4-8.4v-3.2" />
          {/* Repartição central do cabelo */}
          <path d="M16 6v3.2" />
          {/* Sorriso delicado */}
          <path d="M13.6 20.6c.7.7 1.6 1.1 2.4 1.1s1.7-.4 2.4-1.1" />
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
