export type PasswordStrength = {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
  meetsMinimum: boolean;
};

/**
 * Só BLOQUEIA senha com menos de 6 caracteres (aí sim é "fraca" de verdade).
 * A partir de 6 caracteres, a conta já pode ser criada — o resto (letra
 * maiúscula, número, símbolo, 8+ caracteres) é só um indicador visual pra
 * incentivar uma senha melhor, sem impedir ninguém de continuar.
 */
export function passwordStrength(password: string): PasswordStrength {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const typesCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  if (password.length < 6) {
    return { score: 0, label: "Fraca", color: "bg-red-500", meetsMinimum: false };
  }

  // 6-7 caracteres, ou 8+ com pouca variedade: já é permitido, mas ainda "média".
  if (password.length < 8 || typesCount <= 1) {
    return { score: 1, label: "Média", color: "bg-yellow-500", meetsMinimum: true };
  }

  if (typesCount === 2) {
    return { score: 2, label: "Forte", color: "bg-green-600", meetsMinimum: true };
  }

  return { score: 3, label: "Muito forte", color: "bg-green-600", meetsMinimum: true };
}
