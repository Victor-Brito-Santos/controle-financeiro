import { projectId, publicAnonKey } from "./supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-db571421`;

export async function fetchAppState(): Promise<any | null> {
  const res = await fetch(`${BASE_URL}/state`, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  if (!res.ok) throw new Error(`Não foi possível carregar os dados salvos (${res.status})`);
  const json = await res.json();
  return json.value ?? null;
}

export async function saveAppState(state: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${BASE_URL}/state`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error(`Não foi possível salvar os dados (${res.status})`);
}
