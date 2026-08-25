// Função serverless da Vercel: guarda os dados do painel no Upstash Redis (banco de dados
// compartilhado por todos que acessarem o site — é o que faz o time todo ver os mesmos dados).
//
// Antes de funcionar, é preciso adicionar a integração "Upstash Redis" ao projeto pela
// Vercel Marketplace (Storage > Marketplace Database Providers > Upstash). A Vercel cuida de
// configurar as variáveis de ambiente (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
// automaticamente quando você conecta a integração.

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: "parâmetro 'key' é obrigatório" });

    const value = await redis.get(key);
    if (value === null || value === undefined) {
      return res.status(404).json({ error: "não encontrado" });
    }
    return res.status(200).json({ key, value });
  }

  if (req.method === "POST") {
    const { key, value } = req.body || {};
    if (!key) return res.status(400).json({ error: "campo 'key' é obrigatório" });

    await redis.set(key, value);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "método não permitido" });
}
