"use client";

import { passwordStrength } from "@/lib/passwordStrength";

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const strength = passwordStrength(password);
  const segments = 4;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${index <= strength.score ? strength.color : "bg-brand-ink/10"}`}
          />
        ))}
      </div>
      <p className={`mt-1 font-body text-xs font-semibold ${strength.meetsMinimum ? "text-brand-ink/60" : "text-red-600"}`}>
        Força da senha: {strength.label}
        {!strength.meetsMinimum && " — use pelo menos 6 caracteres."}
      </p>
    </div>
  );
}
