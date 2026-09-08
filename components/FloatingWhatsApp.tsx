import { MessageCircle } from "lucide-react";

function formatWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 12) return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  return value;
}

export default function FloatingWhatsApp() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return (
    <a href={`https://wa.me/${digits}?text=${encodeURIComponent("Olá! Gostaria de falar com a Ótica Líder.")}`} target="_blank" rel="noreferrer" aria-label="Falar com a Ótica Líder pelo WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:scale-105 sm:bottom-6 sm:right-6">
      <MessageCircle size={23} fill="currentColor" strokeWidth={1.5} />
      <span className="sr-only">WhatsApp {formatWhatsAppNumber(number)}</span>
    </a>
  );
}
