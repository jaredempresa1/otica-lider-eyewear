export const FIRST_PURCHASE_COUPON = "BEMVINDO50";
export const FIRST_PURCHASE_DISCOUNT = 50;
export const FIRST_PURCHASE_MINIMUM = 400;

export function normalizeCoupon(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function getCouponDiscount(code: string, subtotal: number): number {
  if (normalizeCoupon(code) !== FIRST_PURCHASE_COUPON || subtotal <= FIRST_PURCHASE_MINIMUM) return 0;
  return Math.min(FIRST_PURCHASE_DISCOUNT, subtotal);
}
