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
