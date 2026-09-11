/** Bonequinho correndo — usado no filtro "Óculos esportivo" no lugar do "S". */
export default function RunningIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="14.2" cy="4.4" r="1.9" fill="currentColor" stroke="none" />
      <path d="M9.8 9.2 12.4 7l2.2 2.6 3.1 1.3" />
      <path d="M12.4 7 10.6 12.4l-4 2.2" />
      <path d="M10.6 12.4l3 1.4 1 5.6" />
      <path d="M13.6 13.8 17 15.4l1.6 4.4" />
      <path d="M6.2 20.2 9.6 14.6" />
    </svg>
  );
}
