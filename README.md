# Axisor Kanban — API

API da aplicação Kanban (Axisor), construída com **Elysia** e **Bun**.

## Tecnologias principais

- **Elysia** — framework HTTP
- **Bun** — runtime e package manager
- **Drizzle** — ORM + migrations (PostgreSQL)
- **Better Auth** — autenticação
- **OpenAPI** — documentação da API (consumida pelo front via Orval)
- **MinIO** — armazenamento de arquivos (S3-compatible)
- **Redis** — pub/sub para WebSockets e filas
- **BullMQ** — filas (scan de anexos, exclusão em lote)
- **Resend** + **React Email** — envio e templates de e-mail
- **OpenTelemetry** — traces para observabilidade (Grafana/OTLP)

## Fluxo principal da aplicação

```mermaid
flowchart TB
    subgraph Client
        FE[Frontend]
    end

    subgraph API["API (Elysia)"]
        Auth[Better Auth]
        Projects[Projects]
        Labels[Labels]
        Columns[Columns]
        Tasks[Tasks]
        Attachments[Attachments]
        WS[WebSocket /ws]
    end

    subgraph Storage
        PG[(PostgreSQL)]
        S3[(MinIO/S3)]
    end

    subgraph Workers
        Scan[BullMQ: attachment-scan]
        Delete[BullMQ: attachment-delete]
    end

    subgraph Observability
        OTEL[OpenTelemetry]
        Grafana[Grafana]
    end

    FE --> Auth
    FE --> Projects
    FE --> Labels
    FE --> Columns
    FE --> Tasks
    FE --> Attachments
    FE --> WS

    Projects --> PG
    Labels --> PG
    Columns --> PG
    Tasks --> PG
    Attachments --> PG
    Attachments --> S3
    Attachments --> Scan

    Scan --> attachmentScan[attachmentScan]
    attachmentScan --> S3
    Scan --> Redis
    Delete --> S3

    Redis --> WS
    API --> OTEL
    OTEL --> Grafana
```

## Pré-requisitos

- [Bun](https://bun.sh/)
- PostgreSQL 18
- Redis 7
- MinIO (ou outro S3-compatible)

## Setup

1. **Dependências**

   ```bash
   bun install
   ```

2. **Variáveis de ambiente**

   Copie `.env.example` para `.env` e preencha (incluindo `REDIS_URL` se não for `redis://localhost:6379`):

   - `DATABASE_URL`, `POSTGRES_*`, `BETTER_AUTH_*`, `FRONTEND_URL`
   - `RESEND_API_KEY` (Resend)
   - `S3_*` (MinIO: user, password, endpoint, bucket)
   - Opcional: `OTEL_EXPORTER_OTLP_ENDPOINT` e `OTEL_EXPORTER_OTLP_HEADERS` para observabilidade

3. **Banco**

   ```bash
   bun run db:generate
   bun run db:migrate
   bun run db:seed   # opcional
   ```

4. **Subir dependências com Docker**

   ```bash
   docker compose up -d
   ```

   Sobe: PostgreSQL, Redis e MinIO. MinIO console em `http://localhost:9001`.

5. **Rodar a API**

   ```bash
   bun run dev
   ```

   A API sobe em `http://localhost:3333`. Os workers BullMQ (scan e delete de anexos) sobem no mesmo processo.

## Scripts

| Script          | Descrição                          |
|-----------------|------------------------------------|
| `bun run dev`   | Servidor em modo watch              |
| `bun run test`  | Testes (Vitest, e2e)                |
| `db:generate`   | Gera migrations Drizzle             |
| `db:migrate`    | Aplica migrations                   |
| `db:studio`     | Drizzle Studio                      |
| `db:seed`       | Seed do banco                       |

## Testes E2E

Há testes **e2e** (Vitest) cobrindo as rotas da API, **exceto as de attachment** (upload/download/scan):

- **Projects**: create, get, update, delete
- **Labels**: create, get, update, delete
- **Columns**: create, update, delete, reorder
- **Tasks**: create, update, delete, reorder

Rodar:

```bash
bun run test
```

Use `.env.test.local` para variáveis de teste (ex.: `DATABASE_URL` de um banco de testes).

## WebSockets e Redis

- **WebSocket**: endpoint `/ws?projectId=<id>`. Clientes são registrados por `projectId`.
- **Redis**: usado como pub/sub. Quando um worker publica em `notifications` (ex.: resultado do scan de anexo), a API repassa a mensagem para todos os clientes WebSocket daquele projeto.
- **BullMQ**: filas `attachment-scan` e `attachment-delete` usam a mesma `REDIS_URL`.

## Filas (BullMQ)

- **attachment-scan**: após upload, o anexo entra na fila; um worker roda o “scan” (simulado), atualiza status no banco e publica no Redis para o front via WS.
- **attachment-delete**: exclusão em lote de objetos no MinIO por `storageKey`.

## Armazenamento (MinIO)

Upload de anexos vai para MinIO (S3-compatible). Leitura é via **URL pré-assinada** (presign) com expiração (ex.: 1h). O scan simulado não usa antivírus real; veja a seção abaixo para simular vírus e erro.

## E-mail (Resend + React Email)

Envios (ex.: confirmação de e-mail via Better Auth) usam **Resend** com templates em **React Email** (`@react-email/components`). Configure `RESEND_API_KEY` no `.env`.

## Observabilidade (Grafana)

A API usa **OpenTelemetry** (`@elysiajs/opentelemetry`) e envia traces para um coletor OTLP. Configure:

- `OTEL_EXPORTER_OTLP_ENDPOINT` (ex.: endpoint do Grafana Alloy ou Otel Collector)
- `OTEL_EXPORTER_OTLP_HEADERS` (ex.: `Authorization=Bearer ...`)

Assim você visualiza traces e métricas no **Grafana**.

## Simulação de scan de anexos (virus / erro)

O “antivírus” é simulado pelo **nome do arquivo**:

- **Arquivo “infectado”**: use um arquivo cujo nome contenha `virus` ou `vírus`. Ex.: enviar um PDF chamado **`virus.pdf`**.
- **Erro de scan**: use um arquivo cujo nome contenha `error`. Ex.: **`error.pdf`** — o worker vai falhar e o status do anexo ficará como erro.

Qualquer outro nome resulta em status **clean**.

## Documentação de design (Figma)

<!-- Link do Figma com processo de esboço e decisões de UI/UX -->
**Figma (esboço e fluxos):** _[cole aqui o link do Figma]_

---

## Outros pontos

- **CORS**: configurado para `FRONTEND_URL` (ex.: `http://localhost:3000`).
- **OpenAPI**: JSON em `GET /openapi/json`; o front usa **Orval** para gerar cliente e tipos a partir desse spec.
- **Health**: `GET /health` retorna `{ "status": "ok" }`.
