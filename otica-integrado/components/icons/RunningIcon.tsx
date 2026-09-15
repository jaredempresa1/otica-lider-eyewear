/** Bonequinho correndo — usado no filtro "Óculos esportivo". Desenho simples e
 * deliberado: 1 cabeça, 1 tronco, 2 braços, 2 pernas — nada mais, pra não sair
 * ambíguo (tipo perna a mais) em tamanho pequeno. */
export default function RunningIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="9.3" cy="4.6" r="1.9" fill="currentColor" stroke="none" />
      <path d="M9.5 8 11 13" />
      <path d="M9.5 8 7 7 5.5 9" />
      <path d="M9.5 8 12 9.5 13.5 8" />
      <path d="M11 13 14 14.5 16 12.5" />
      <path d="M11 13 8 16 6 19" />
    </svg>
  );
}
