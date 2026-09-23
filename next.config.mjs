/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.sunglasshut.com",
      },
    ],
    // Desligado por completo: a otimização de imagem da Vercel (gerar variações de
    // tamanho sob demanda) é um recurso pago à parte — mesmo reduzindo os tamanhos
    // gerados, um catálogo que cresce (9 → ~150 produtos) tende a estourar a cota
    // gratuita de novo. Como as fotos já são comprimidas no navegador antes do
    // upload (ver lib/imageCompression.ts, máx. 1600px), servir a imagem original
    // direto do Supabase, sem essa otimização extra, custa zero pra sempre — não
    // volta a dar erro 402 independente de quantos produtos o site tiver.
    unoptimized: true,
  },
  // Cabeçalhos de segurança padrão de mercado — não mudam nada visual nem
  // de comportamento do site, só instruem o navegador a se proteger contra
  // alguns tipos comuns de ataque (o site ser carregado escondido dentro de
  // outro site, MIME sniffing, vazamento de URL em referrers, etc.).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
