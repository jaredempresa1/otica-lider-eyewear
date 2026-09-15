function formatWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 12) return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  return value;
}

/** Glifo oficial do WhatsApp (fone + balão), não o ícone genérico de balão de
 * conversa do lucide-react. */
function WhatsAppGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.02 3C9.4 3 4 8.37 4 15c0 2.36.68 4.56 1.86 6.42L4 29l7.77-1.83A11.9 11.9 0 0 0 16.02 27C22.63 27 28 21.63 28 15S22.63 3 16.02 3Zm0 21.9c-2.02 0-3.9-.58-5.48-1.58l-.39-.24-4.6 1.08 1.1-4.48-.26-.4A9.83 9.83 0 0 1 6.1 15c0-5.47 4.45-9.9 9.92-9.9 5.46 0 9.9 4.43 9.9 9.9s-4.44 9.9-9.9 9.9Z" />
      <path d="M21.53 17.58c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.15-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.87-.77-1.45-1.72-1.62-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.58-.9-2.16-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.19 2.06 3.14 5 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.19-.55-.34Z" />
    </svg>
  );
}

export default function FloatingWhatsApp() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return (
    <a href={`https://wa.me/${digits}?text=${encodeURIComponent("Olá! Gostaria de falar com a Ótica Líder.")}`} target="_blank" rel="noreferrer" aria-label="Falar com a Ótica Líder pelo WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:scale-105 sm:bottom-6 sm:right-6">
      <WhatsAppGlyph size={25} />
      <span className="sr-only">WhatsApp {formatWhatsAppNumber(number)}</span>
    </a>
  );
}
