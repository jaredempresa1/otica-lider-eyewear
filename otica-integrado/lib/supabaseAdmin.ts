import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a chave de SERVIÇO (Service Role).
 *
 * ⚠️ Só pode ser importado por código que roda no servidor (rotas em
 * app/api/**), NUNCA em componentes de cliente — essa chave ignora todas
 * as políticas de RLS do banco.
 *
 * É usado exclusivamente para guardar e renovar sozinho o token de acesso
 * do Melhor Envio (tabela melhor_envio_tokens), que não tem nenhuma
 * política pública de leitura/escrita — só a chave de serviço consegue
 * acessá-la.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseAdminConfig = Boolean(supabaseUrl && serviceRoleKey);

if (!hasSupabaseAdminConfig) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY não configurada: a renovação automática do token do Melhor Envio ficará desativada até essa variável ser preenchida.",
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-role-key",
  { auth: { persistSession: false } },
);
