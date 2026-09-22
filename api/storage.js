// Função serverless da Vercel: guarda os dados do painel no Upstash Redis (banco de dados
// compartilhado por todos que acessarem o site — é o que faz o time todo ver os mesmos dados).
//
// Antes de funcionar, é preciso adicionar a integração "Upstash Redis" ao projeto pela
// Vercel Marketplace (Storage > Marketplace Database Providers > Upstash). Dependendo do
// fluxo que a Vercel usa no momento da instalação, as variáveis de ambiente criadas
// automaticamente podem se chamar UPSTASH_REDIS_REST_URL/TOKEN (nome clássico) OU
// KV_REST_API_URL/TOKEN (nome mais novo do marketplace) — os valores são equivalentes,
// então aceitamos os dois nomes aqui para funcionar em qualquer um dos dois casos.
//
// IMPORTANTE: o cliente do Upstash, por padrão, tenta "adivinhar" se o valor salvo é um
// JSON e devolve ele já interpretado (automaticDeserialization). Como o site (src/lib/storage.js)
// já manda o valor como texto (JSON.stringify) e espera receber de volta esse mesmo texto para
// poder fazer JSON.parse, esse comportamento automático causava um descompasso: o texto salvo
// virava um objeto já pronto, o JSON.parse do site falhava silenciosamente, e a página voltava a
// usar os dados antigos da planilha a cada carregamento — apagando na prática as edições feitas.
// Por isso desligamos essa "mágica" (automaticDeserialization: false) e guardamos/lemos sempre
// como texto puro, igual ao que o site manda e espera.

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  automaticDeserialization: false,
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

    // Garante que o que vai para o Redis é sempre texto puro (string), não importa
    // se quem chamou já mandou string ou um objeto/array.
    const valorParaSalvar = typeof value === "string" ? value : JSON.stringify(value);

    await redis.set(key, valorParaSalvar);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "método não permitido" });
}
