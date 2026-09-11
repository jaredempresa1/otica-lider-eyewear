/** Bonequinho de bicicleta — usado ao lado do corredor no filtro "Óculos esportivo". */
export default function BikeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="17.5" r="3.2" />
      <circle cx="18" cy="17.5" r="3.2" />
      <path d="M6 17.5 10 9.5 14.2 9.5 18 17.5" />
      <path d="M10 9.5 13 17.5" />
      <path d="M14.2 9.5 16.6 5.5" />
      <path d="M15.6 5.5 18.6 5.5" />
      <circle cx="10" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
