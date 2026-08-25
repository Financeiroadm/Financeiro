// Substitui o window.storage (exclusivo do Claude) por chamadas à nossa própria
// API (/api/storage), que por sua vez fala com o banco de dados (Vercel KV).
// Mantém a mesma "forma" de uso (get/set assíncronos) para não precisar reescrever
// toda a lógica do painel — só trocar de onde os dados vêm.

export async function storageGet(key) {
  const res = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
  if (!res.ok) {
    throw new Error(`chave "${key}" não encontrada`);
  }
  return res.json(); // { key, value }
}

export async function storageSet(key, value) {
  const res = await fetch("/api/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    throw new Error(`erro ao salvar a chave "${key}"`);
  }
  return res.json();
}
