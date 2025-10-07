FROM oven/bun:1
WORKDIR /app
COPY package.json ./
COPY bun.lockb* ./
RUN bun install
COPY . .
EXPOSE 4000
CMD ["bun", "run", "start"]
