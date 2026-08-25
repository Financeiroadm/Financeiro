# Painel de Associados — CCIB

Painel financeiro da CCIB (Câmara de Comércio Índia-Brasil): controle de associados,
renovações, observações e histórico de pagamentos.

## Como colocar no ar (Vercel)

### 1. Subir o código para o GitHub
1. Crie um repositório novo no GitHub (pode ser privado).
2. Suba esta pasta inteira para o repositório (`git init`, `git add .`, `git commit -m "painel ccib"`, `git remote add origin ...`, `git push`).

### 2. Importar na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login (dá pra usar a conta do GitHub).
2. Clique em **"Add New" → "Project"**.
3. Selecione o repositório que você acabou de criar.
4. A Vercel já detecta que é um projeto Vite automaticamente — não precisa mudar nada nas configurações de build.
5. Clique em **"Deploy"**.

Nesse ponto o site já vai estar no ar, mas **os dados ainda não salvam** — falta conectar o banco de dados (próximo passo).

### 3. Conectar o banco de dados (Upstash Redis)
Isso é o que faz **todo o time ver os mesmos dados**, salvos de verdade.

1. Dentro do seu projeto na Vercel, vá na aba **"Storage"**.
2. Clique em **"Marketplace Database Providers"** e escolha **"Upstash"** (Redis).
3. Siga o assistente pra criar o banco (é gratuito para esse volume de uso) e conectar ao projeto.
4. A Vercel vai configurar sozinha as variáveis de ambiente (`UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`) — você não precisa copiar nada manualmente.
5. Depois de conectar, vá em **"Deployments"** e clique em **"Redeploy"** no último deploy (pra ele já subir enxergando o banco de dados).

Pronto — agora é só acessar a URL que a Vercel deu pro projeto (algo como `seu-projeto.vercel.app`) e o painel deve carregar e salvar normalmente, compartilhado entre todos que acessarem o link.

## Rodando localmente (opcional, para desenvolvimento)

```bash
npm install
npm run dev
```

Isso abre o site em `http://localhost:5173`. As chamadas de `/api/storage` só funcionam quando rodando na Vercel (ou usando `vercel dev`, que simula o ambiente da Vercel localmente).

## Estrutura do projeto

```
├── api/
│   └── storage.js      # função serverless: lê/grava no banco (Upstash Redis)
├── src/
│   ├── App.jsx          # o painel inteiro (associados, renovações, relatórios...)
│   ├── lib/storage.js   # chama a API acima (get/set)
│   └── main.jsx         # ponto de entrada do React
├── index.html
├── package.json
└── vite.config.js
```
