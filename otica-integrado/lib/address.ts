import { supabase } from "./supabaseClient";

export type SavedAddress = {
  id?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  is_default?: boolean;
};

export const EMPTY_ADDRESS: SavedAddress = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  is_default: false,
};

const ADDRESS_FIELDS = "id, cep, logradouro, numero, complemento, bairro, cidade, estado, is_default, updated_at";

export async function getMyAddresses(): Promise<SavedAddress[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("enderecos")
    .select(ADDRESS_FIELDS)
    .eq("user_id", userData.user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data as SavedAddress[];
}

/** Retorna o endereço padrão, mantendo compatibilidade com o checkout existente. */
export async function getMyAddress(): Promise<SavedAddress | null> {
  const addresses = await getMyAddresses();
  return addresses[0] ?? null;
}

export async function saveMyAddress(address: SavedAddress): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const addresses = await getMyAddresses();
  const shouldBeDefault = address.is_default === true || addresses.length === 0;

  if (shouldBeDefault) {
    await supabase.from("enderecos").update({ is_default: false }).eq("user_id", userData.user.id);
  }

  const payload = {
    user_id: userData.user.id,
    cep: address.cep,
    logradouro: address.logradouro,
    numero: address.numero,
    complemento: address.complemento,
    bairro: address.bairro,
    cidade: address.cidade,
    estado: address.estado,
    is_default: shouldBeDefault,
    updated_at: new Date().toISOString(),
  };

  const query = address.id
    ? supabase.from("enderecos").update(payload).eq("id", address.id).eq("user_id", userData.user.id)
    : supabase.from("enderecos").insert(payload);

  const { error } = await query;
  return !error;
}

export async function setDefaultAddress(id: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { error: clearError } = await supabase.from("enderecos").update({ is_default: false }).eq("user_id", userData.user.id);
  if (clearError) return false;

  const { error } = await supabase.from("enderecos").update({ is_default: true, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userData.user.id);
  return !error;
}

export async function deleteAddress(id: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { error } = await supabase.from("enderecos").delete().eq("id", id).eq("user_id", userData.user.id);
  if (error) return false;

  const remaining = await getMyAddresses();
  if (remaining.length > 0 && !remaining.some((address) => address.is_default)) {
    await setDefaultAddress(remaining[0].id!);
  }
  return true;
}
