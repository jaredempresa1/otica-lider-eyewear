/**
 * Limite simples de requisições por IP, guardado em memória (sem precisar
 * de nenhum serviço externo pago, tipo Redis).
 *
 * Limitação conhecida: como a Vercel roda cada rota em instâncias
 * "serverless" que podem reiniciar ou se multiplicar, esse contador não é
 * perfeito (um mesmo IP pode, em teoria, cair em instâncias diferentes e
 * escapar um pouco do limite). Ainda assim, ele já bloqueia a grande
 * maioria dos scripts simples de spam, que é o problema real que estamos
 * resolvendo aqui. Se um dia isso não for mais suficiente, o próximo passo
 * seria um serviço dedicado de rate limit (ex.: Upstash Redis).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Evita que o Map cresça pra sempre: limpa entradas expiradas de vez em
// quando, aproveitando uma chamada normal de rate limit.
function cleanup(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "desconhecido";
}

/**
 * Retorna true se a requisição pode seguir, false se estourou o limite.
 * `scope` identifica a rota (ex.: "leads", "shipping") pra cada uma ter seu
 * próprio contador.
 */
export function isRateLimited(
  request: Request,
  scope: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): boolean {
  const now = Date.now();
  cleanup(now);

  const ip = getClientIp(request);
  const key = `${scope}:${ip}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
