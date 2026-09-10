export function trackProductClick(product: { id: string; slug: string; name: string }) {
  if (typeof window === "undefined") return;
  void fetch("/api/product-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
    keepalive: true,
  }).catch(() => undefined);
}
