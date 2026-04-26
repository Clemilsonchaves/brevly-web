<<<<<<< HEAD
FROM node:20
=======
FROM node:20-alpine
>>>>>>> 8e57e8d2 (Commit inicial repositório limpo)

WORKDIR /app

COPY package*.json ./
<<<<<<< HEAD
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
=======
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

CMD ["pnpm", "start"]
>>>>>>> 8e57e8d2 (Commit inicial repositório limpo)
