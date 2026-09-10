import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ótica Líder Eyewear",
    short_name: "Ótica Líder",
    description: "Ótica Líder Eyewear",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#fc4f01",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
