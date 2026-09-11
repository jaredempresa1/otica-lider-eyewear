/** Ícones de óculos desenhados em linha fina, no lugar de emojis, para representar
 * cada seção de filtro (gênero e tipo de armação) com a mesma identidade visual da marca. */
export type GlassesShape =
  | "gatinho"
  | "retangular"
  | "aviador"
  | "redondo"
  | "quadrado"
  | "geometrico"
  | "oval"
  | "masculino"
  | "feminino"
  | "unissex"
  | "infantil"
  | "todos";

/** Cada variante é desenhada à mão (não gerada por fórmula) pra parecer um
 * ícone de verdade, não duas elipses genéricas. viewBox comum: 0 0 64 32. */
function ShapeSvg({ shape }: { shape: GlassesShape }) {
  const common = { fill: "none", strokeWidth: 2.1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (shape) {
    case "gatinho":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <path d="M4 15c0-6 4.8-9.5 11-9.5 5.6 0 9 3 10.4 6.8" />
          <path d="M25.4 12.3c1-.4 2.2-.6 3.6-.6s2.6.2 3.6.6" />
          <path d="M32.6 12.3c1.4-3.8 4.8-6.8 10.4-6.8 6.2 0 11 3.5 11 9.5 0 5-3.6 8.7-9 8.7-4.8 0-8.3-3-9.3-7.3-.3-1.4-.4-2.2-.4-2.2" />
          <path d="M4 15c0 5 3.6 8.7 9 8.7 4.9 0 8.4-3.1 9.3-7.5.3-1.6.4-2.4.4-2.4" />
          <path d="M2 12.5 4 15" />
          <path d="M62 12.5 60 15" />
        </svg>
      );
    case "retangular":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <rect x="4" y="9" width="22" height="13" rx="3" />
          <rect x="38" y="9" width="22" height="13" rx="3" />
          <path d="M26 13.5c2-1.2 8-1.2 10 0" />
          <path d="M2 12 4 13.5" />
          <path d="M62 12 60 13.5" />
        </svg>
      );
    case "aviador":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <path d="M6 13c0-3 2.4-5 6.6-5 5.2 0 9 2.6 10.2 7.3 1 4-1 8.4-6 8.4-5.4 0-8.4-3.7-9.8-7.4C6.3 15 6 14 6 13Z" />
          <path d="M58 13c0-3-2.4-5-6.6-5-5.2 0-9 2.6-10.2 7.3-1 4 1 8.4 6 8.4 5.4 0 8.4-3.7 9.8-7.4.7-1.3 1-2.3 1-3.3Z" />
          <path d="M22.8 15.3c2-1.4 7.2-1.4 9.2-1" />
          <path d="M4 10.5c1-1.4 2-1.8 2-1.8" />
          <path d="M60 10.5c-1-1.4-2-1.8-2-1.8" />
        </svg>
      );
    case "redondo":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <circle cx="15" cy="16" r="10.5" />
          <circle cx="49" cy="16" r="10.5" />
          <path d="M25.5 14.5c2.2-1.6 8.2-1.6 10.4 0" />
          <path d="M2 13.5 4.5 16" />
          <path d="M62 13.5 59.5 16" />
        </svg>
      );
    case "quadrado":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <rect x="4.5" y="6" width="21" height="20" rx="2.5" />
          <rect x="38.5" y="6" width="21" height="20" rx="2.5" />
          <path d="M25.5 14c2.2-1.2 8.2-1.2 10.4 0" />
          <path d="M2 11 4.5 13" />
          <path d="M62 11 59.5 13" />
        </svg>
      );
    case "geometrico":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <path d="M15 5.5 25 12l-3.8 12.5H8.8L5 12z" />
          <path d="M49 5.5 59 12l-3.8 12.5H41.8L38 12z" />
          <path d="M25.5 13.5c2.2-1.2 8.2-1.2 10.4 0" />
          <path d="M2 11 5 12" />
          <path d="M62 11 59 12" />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <ellipse cx="15" cy="16" rx="10.5" ry="8.5" />
          <ellipse cx="49" cy="16" rx="10.5" ry="8.5" />
          <path d="M25.5 15c2.2-1.4 8.2-1.4 10.4 0" />
          <path d="M2 13 4.7 16" />
          <path d="M62 13 59.3 16" />
        </svg>
      );
    case "masculino":
      // Armação retangular forte, traço mais grosso — silhueta clássica masculina.
      return (
        <svg viewBox="0 0 64 32" fill="none" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" className="h-full w-full">
          <rect x="4" y="8" width="23" height="15" rx="2.5" />
          <rect x="37" y="8" width="23" height="15" rx="2.5" />
          <path d="M27 14.5c2.3-1.3 7.7-1.3 10 0" />
          <path d="M1.5 11 4 12.5" />
          <path d="M62.5 11 60 12.5" />
        </svg>
      );
    case "feminino":
      // Cat-eye delicado com haste fina — silhueta clássica feminina.
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <path d="M4.5 16.5c-.4-5.3 3.6-8.7 9-8.7 4.8 0 7.9 2.4 9.2 6" />
          <path d="M22.7 13.8c.9 3.9-1.9 8.7-7.4 9.2-5.4.5-9.8-3.2-10.2-8.5" />
          <path d="M26.5 13.2c2-1 6-1 8 0" />
          <path d="M59.5 16.5c.4-5.3-3.6-8.7-9-8.7-4.8 0-7.9 2.4-9.2 6" />
          <path d="M41.3 13.8c-.9 3.9 1.9 8.7 7.4 9.2 5.4.5 9.8-3.2 10.2-8.5" />
          <path d="M2 13.5 4.5 16.5" />
          <path d="M62 13.5 59.5 16.5" />
        </svg>
      );
    case "unissex":
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <rect x="4.5" y="7.5" width="21" height="16" rx="4" />
          <rect x="38.5" y="7.5" width="21" height="16" rx="4" />
          <path d="M25.5 14.2c2.2-1.1 8.2-1.1 10.4 0" />
          <path d="M2 11.5 4.5 13.5" />
          <path d="M62 11.5 59.5 13.5" />
        </svg>
      );
    case "infantil":
      // Lentes pequenas e bem arredondadas — proporção lúdica de armação infantil.
      return (
        <svg viewBox="0 0 64 32" {...common} strokeWidth={2.4} stroke="currentColor" className="h-full w-full">
          <circle cx="17" cy="17" r="8.5" />
          <circle cx="47" cy="17" r="8.5" />
          <path d="M25.5 15.5c2-1 8-1 10 0" />
          <path d="M6 12.5 8.5 15" />
          <path d="M58 12.5 55.5 15" />
        </svg>
      );
    case "todos":
      // Duas lentes de formatos levemente distintos, sugerindo "todos os estilos".
      return (
        <svg viewBox="0 0 64 32" {...common} stroke="currentColor" className="h-full w-full">
          <circle cx="15.5" cy="16" r="10" />
          <rect x="38" y="7" width="22" height="18" rx="3" />
          <path d="M25.5 14.5c2.2-1.2 8.2-1.2 10.5 0" />
          <path d="M2 13 5 15.5" />
          <path d="M62 11 59.5 13" />
        </svg>
      );
    default:
      return null;
  }
}

export default function GlassesIcon({ shape, className = "" }: { shape: GlassesShape; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true">
      <ShapeSvg shape={shape} />
    </span>
  );
}
