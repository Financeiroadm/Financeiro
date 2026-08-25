// Protege o site inteiro com usuário/senha (autenticação HTTP Basic).
// Quando alguém acessa o site, o navegador mostra uma janelinha nativa pedindo
// usuário e senha, antes de deixar ver qualquer coisa.
//
// O usuário e a senha ficam configurados como variáveis de ambiente na Vercel
// (Settings > Environment Variables) — nunca escreva a senha real aqui no código.
//   SITE_USER     -> nome de usuário (ex: ccib)
//   SITE_PASSWORD -> a senha de acesso

export default function middleware(request) {
  const authHeader = request.headers.get("authorization");

  const usuarioEsperado = process.env.SITE_USER || "ccib";
  const senhaEsperada = process.env.SITE_PASSWORD;

  if (authHeader) {
    const [, base64] = authHeader.split(" ");
    try {
      const [usuario, senha] = atob(base64).split(":");
      if (usuario === usuarioEsperado && senha === senhaEsperada) {
        return; // credenciais corretas — deixa passar
      }
    } catch (e) {
      // formato inválido do cabeçalho — cai para o 401 abaixo
    }
  }

  return new Response("Autenticação necessária", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CCIB Financeiro"',
    },
  });
}
