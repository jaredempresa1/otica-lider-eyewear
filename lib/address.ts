import { supabase } from "./supabaseClient";

export type SavedAddress = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export const EMPTY_ADDRESS: SavedAddress = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

/** Busca o endereço salvo do cliente logado. Retorna null se não houver conta logada ou endereço salvo ainda. */
export async function getMyAddress(): Promise<SavedAddress | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("enderecos")
    .select("cep, logradouro, numero, complemento, bairro, cidade, estado")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as SavedAddress;
}

/** Salva (cria ou atualiza) o endereço do cliente logado. Não faz nada se ninguém estiver logado. */
export async function saveMyAddress(address: SavedAddress): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { error } = await supabase
    .from("enderecos")
    .upsert({ user_id: userData.user.id, ...address, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  return !error;
}
