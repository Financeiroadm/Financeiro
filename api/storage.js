// Função serverless da Vercel: guarda os dados do painel no Upstash Redis (banco de dados
// compartilhado por todos que acessarem o site — é o que faz o time todo ver os mesmos dados).
//
// Antes de funcionar, é preciso adicionar a integração "Upstash Redis" ao projeto pela
// Vercel Marketplace (Storage > Marketplace Database Providers > Upstash). Dependendo do
// fluxo que a Vercel usa no momento da instalação, as variáveis de ambiente criadas
// automaticamente podem se chamar UPSTASH_REDIS_REST_URL/TOKEN (nome clássico) OU
// KV_REST_API_URL/TOKEN (nome mais novo do marketplace) — os valores são equivalentes,
// então aceitamos os dois nomes aqui para funcionar em qualquer um dos dois casos.

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
