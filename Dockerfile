FROM node:22-alpine

WORKDIR /app

# Instala pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia os arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala as dependências
RUN pnpm install         

# Copia o restante do código
COPY . .

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando padrão para desenvolvimento
CMD ["pnpm", "run", "dev"]
