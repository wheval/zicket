This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Drizzle + Neon)

This project is set up to use **Drizzle ORM** with **Neon Postgres**.

- **Connection**: `src/index.ts` (Neon HTTP driver)
- **Schema**: `src/db/schema.ts`
- **Drizzle config**: `drizzle.config.ts`

### Environment

Set the following environment variable:

- **DATABASE_URL**: Neon connection string (Postgres URL)

### Create tables

After setting `DATABASE_URL`, run one of:

- **Push schema (fast iteration)**: `pnpm db:push`
- **Migrations workflow**:
  - Generate: `pnpm db:generate`
  - Apply: `pnpm db:migrate`

### Demo data

Seed your Neon DB from `lib/mock_data.ts`:

- `pnpm db:seed`

The seeded events are rebased onto the current date so every demo listing is
still upcoming — a listing whose sale window has closed cannot be published
on-chain or bought.

## On-chain layer (Starknet / Cairo)

Ticketing runs on a pair of Cairo contracts in `contracts/`:

| Contract | Role |
| --- | --- |
| `ZicketEvents` | Events, ticketing, escrow, refunds, check-in |
| `MockERC20` | Payment token for local development |

### Two kinds of ticket

- **Public** — bound to the buyer's address, one per wallet, transferable.
- **Anonymous** — the buyer computes `commitment = poseidon(secret, nullifier)`
  in the browser and only the commitment reaches the chain. The ticket has no
  owner. Check-in reveals the preimage and burns
  `nullifier_hash = poseidon(nullifier)` so a ticket cannot be used twice.

  The secret never leaves the browser: it is written to `localStorage` *before*
  the transaction is signed, because it is the only proof of ownership and
  exists nowhere else. Losing it loses the ticket — by design.

### Local end-to-end

```bash
pnpm chain:devnet     # starknet-devnet in Docker on :5050
pnpm contracts:build  # scarb build
pnpm contracts:test   # snforge — 36 tests
pnpm chain:deploy     # declare + deploy, writes deployments/ and .env.local
pnpm chain:e2e        # 20 assertions straight against the contracts
pnpm chain:flow       # 32 assertions through the running Next.js app
```

`pnpm chain:deploy` writes `NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS`,
`NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS` and the relayer credentials into
`.env.local`. Restarting devnet resets chain state, so re-run the deploy.

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_STARKNET_NETWORK` | `devnet` \| `sepolia` \| `mainnet` |
| `NEXT_PUBLIC_STARKNET_RPC_URL` | RPC the browser reads from |
| `NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS` | Deployed `ZicketEvents` |
| `NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS` | ERC-20 used for payment |
| `NEXT_PUBLIC_TOKEN_USD_PRICE` | USD → token conversion for listed prices |
| `STARKNET_ADMIN_ADDRESS` / `STARKNET_ADMIN_PRIVATE_KEY` | Server relayer that publishes listings |

On `devnet` the wallet menu also offers a predeployed burner account, so the
purchase flow can be exercised without a browser extension.

### API

| Route | Purpose |
| --- | --- |
| `GET /api/chain/config` | Public chain configuration |
| `GET /api/chain/events/[id]` | On-chain state, including `saleOpen` |
| `POST /api/chain/events/[id]` | Publishes the listing via the relayer |
| `GET /api/chain/purchases?ticketId=` | Purchases recorded for a listing |
| `POST /api/chain/purchases` | Verifies a tx on-chain, then records it |

`POST /api/chain/purchases` takes only a transaction hash; every other field is
read back from the receipt, so a client cannot fabricate a ticket. Anonymous
purchases are stored without a buyer address or email — recording either would
defeat the commitment scheme.

### Running Postgres locally

`@neondatabase/serverless` speaks HTTP, so a plain Postgres container needs a
proxy in front of it:

```bash
docker run -d --name zicket-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=zicket -p 5433:5432 postgres:16-alpine

docker run -d --name zicket-neon-proxy -p 4444:4444 \
  -e PG_CONNECTION_STRING=postgres://postgres:postgres@host.docker.internal:5433/zicket \
  ghcr.io/timowilhelm/local-neon-http-proxy:main
```

Then set `NEON_HTTP_ENDPOINT=http://localhost:4444/sql` alongside
`DATABASE_URL`. Against a real Neon database, leave `NEON_HTTP_ENDPOINT` unset.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
