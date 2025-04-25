# Image Node.js adn pnpm
FROM node:18-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm

# install depends
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Etapa de build
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

# Superbase API's URL AND KEY
ENV NEXT_PUBLIC_SUPABASE_URL= 
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=
ENV SUPABASE_URL=
ENV SUPABASE_ANON_KEY=

# Build app Next.js
RUN pnpm build

# final
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

# Copy app's conf
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env

# Expose ports
EXPOSE 3000

CMD ["node", "server.js"]
