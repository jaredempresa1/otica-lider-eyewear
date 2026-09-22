const COLLECTED_KEY = "otica-scratch-collected";
const DECLINED_AT_KEY = "otica-scratch-declined-at";

/** Se recusar ("Não, obrigado"), some por esse tanto de dias antes de tentar de novo. */
const DECLINE_SUPPRESS_DAYS = 7;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Navegador com localStorage bloqueado (modo privado etc.) — sem problema,
    // o popup só pode voltar a aparecer com mais frequência pra essa pessoa.
  }
}

export function hasCollectedCoupon(): boolean {
  return safeGet(COLLECTED_KEY) === "1";
}

export function markCouponCollected() {
  safeSet(COLLECTED_KEY, "1");
}

export function wasRecentlyDeclined(): boolean {
  const raw = safeGet(DECLINED_AT_KEY);
  if (!raw) return false;
  const declinedAt = Number(raw);
  if (!Number.isFinite(declinedAt)) return false;
  const daysSince = (Date.now() - declinedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DECLINE_SUPPRESS_DAYS;
}

export function markDeclined() {
  safeSet(DECLINED_AT_KEY, String(Date.now()));
}
