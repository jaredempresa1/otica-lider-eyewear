/** Bicicleta — usada ao lado do corredor no filtro "Óculos esportivo". Duas
 * rodas + quadro + guidão, com coordenadas fechadas certinho (nada de linha
 * solta virando "orelha"). */
export default function BikeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="5" cy="17" r="3.2" />
      <circle cx="17" cy="17" r="3.2" />
      <path d="M5 17 9 15 7 9 5 17Z" />
      <path d="M7 9 14 9 9 15" />
      <path d="M14 9 17 17" />
      <path d="M14 9 14 6" />
      <path d="M12 6 16 6" />
      <circle cx="9" cy="15" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
