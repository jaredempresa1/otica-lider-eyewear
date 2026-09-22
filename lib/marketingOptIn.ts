/**
 * Sincroniza a preferência "receber novidades e ofertas por e-mail" com a
 * tabela `leads` do Supabase — é essa tabela que aparece na aba "E-mails
 * cadastrados" do admin. Sem isso, marcar a preferência só ficava guardado
 * no perfil do cliente e nunca aparecia pra você.
 */
export async function syncMarketingEmailOptIn(email: string, name: string, optedIn: boolean) {
  try {
    if (optedIn) {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, gender: null }),
      });
    } else {
      await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    }
  } catch {
    // Falha silenciosa: a preferência do cliente já foi salva no perfil dele,
    // que é o que importa pra experiência dele. Se a sincronização com a
    // lista do admin falhar, não vamos travar a conta do cliente por isso.
  }
}
