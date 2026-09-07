import Image from "next/image";
import Link from "next/link";

type PromoBannerData = {
  image_url: string;
  href?: string | null;
  alt_text?: string | null;
};

export default function PromoBanner({ banner }: { banner: PromoBannerData | null }) {
  if (!banner?.image_url) return null;

  const content = (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-ink shadow-card lg:mx-auto lg:max-w-5xl">
      <Image src={banner.image_url} alt={banner.alt_text || "Novidade da Ótica Líder"} fill className="object-cover" sizes="100vw" />
    </div>
  );

  return (
    <section className="section-shell py-2 sm:py-4">
      {banner.href ? <Link href={banner.href} aria-label={banner.alt_text || "Ver novidade"}>{content}</Link> : content}
    </section>
  );
}
