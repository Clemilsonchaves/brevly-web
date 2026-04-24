
# brevly-web

Frontend do projeto de encurtamento de URLs.

## ✨ Funcionalidades
- Criar links curtos e personalizados
- Listar, copiar e deletar links
- Exportar todos os links em CSV
- Verificar status do backend

## 🚀 Tecnologias Utilizadas
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **pnpm**
- **Node.js**
- **Vercel** (deploy)

## 📦 Integração com Backend
Consome a API [brevly-api](../brevly-api) nos seguintes endpoints:
- `GET /health` — status do backend
- `POST /links` — criar link
- `GET /links` — listar links
- `DELETE /links/:shortCode` — deletar link
- `GET /links/export` — exportar CSV

## 🛠️ Como rodar localmente
```bash
pnpm install
pnpm run dev
```

## 📋 Requisitos
- Node.js 18+
- pnpm

## 🌐 Deploy
- **Vercel** (recomendado para Next.js)

## ⚙️ Variáveis de ambiente
Crie um arquivo `.env.local`:
```
NEXT_PUBLIC_API_URL=https://brevly-api.vercel.app
```

## 📄 Licença
MIT
