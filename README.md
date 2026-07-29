# Zicket

Privacy-first event ticketing. **Host Freely. Attend Silently.**

Browse and buy tickets without handing over an identity: alongside ordinary
wallet-bound tickets, Zicket issues **anonymous tickets** that carry no owner
on-chain at all — just a commitment only the holder can open.

The contracts are live on **Starknet Sepolia**; see
[On-chain layer](#on-chain-layer-starknet--cairo).

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs without a chain configured — listings simply stay unpublished
until `NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS` is set. See
[Environment](#environment-1) for the full list.

| Area | Stack |
| --- | --- |
| App | Next.js 16, React 19, Tailwind v4 |
| Data | Drizzle ORM + Neon Postgres |
| Chain | Cairo contracts on Starknet, via starknet.js |

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

### Sepolia — live deployment

Deployed 2026-07-29. Canonical record: [`deployments/sepolia.json`](deployments/sepolia.json).

| Contract | Address | Explorer |
| --- | --- | --- |
| `ZicketEvents` | `0x7b318fc47e158025e02cb41c6b6ae74d214e1d5b8c58241b09f8b0b452b8cbb` | [Voyager](https://sepolia.voyager.online/contract/0x7b318fc47e158025e02cb41c6b6ae74d214e1d5b8c58241b09f8b0b452b8cbb) |
| `ZUSD` payment token (18dp) | `0x785ab439b53aa6452deaa13a8bbaca43004284e6c3bebadf07f8ebb73333f15` | [Voyager](https://sepolia.voyager.online/contract/0x785ab439b53aa6452deaa13a8bbaca43004284e6c3bebadf07f8ebb73333f15) |

| | |
| --- | --- |
| `ZicketEvents` class hash | `0x7389d6d0d3eb5d56d385941bb3562b74f386ef1cb04155662b6bb2a192e809d` |
| `ZUSD` class hash | `0x257e94e709dacfa2091a4ffa8fb8744d2a3c572429abf04d94202dc15681720` |
| Deployer / fee recipient | `0x6b4ff7d3d4ec97092b655ca7569598583e6e7c236ea37c23cc2664725687994` |
| Platform fee | 250 bps (2.5%) |
| RPC | `https://api.cartridge.gg/x/starknet/sepolia` |

Point the app at it:

```bash
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_STARKNET_RPC_URL=https://api.cartridge.gg/x/starknet/sepolia
NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS=0x7b318fc47e158025e02cb41c6b6ae74d214e1d5b8c58241b09f8b0b452b8cbb
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x785ab439b53aa6452deaa13a8bbaca43004284e6c3bebadf07f8ebb73333f15
```

starknet.js 8.x speaks JSON-RPC 0.9.0 — pick an endpoint that serves it. Cartridge
does; some public Sepolia endpoints have moved to 0.10.x or shut down entirely.

Redeploying:

```bash
NEXT_PUBLIC_STARKNET_NETWORK=sepolia \
NEXT_PUBLIC_STARKNET_RPC_URL=https://api.cartridge.gg/x/starknet/sepolia \
ZICKET_DEPLOY_MOCK_TOKEN=1 pnpm chain:deploy
```

`ZICKET_DEPLOY_MOCK_TOKEN=1` is required off devnet: deploying the mock ERC-20 is
opt-in so a real payment token cannot be replaced by accident. On Sepolia the mock
is deliberate — its `mint` is permissionless, so it doubles as a faucet and any
wallet can self-serve test funds:

```bash
starkli invoke 0x785ab439b53aa6452deaa13a8bbaca43004284e6c3bebadf07f8ebb73333f15 \
  mint <your-address> u256:1000000000000000000000
```

Buying on Sepolia needs a real wallet (Argent X or Braavos) plus a little STRK for
fees; the devnet burner is not available off devnet.

The e2e harnesses provision their own buyer wallets on non-devnet networks —
generated keys are cached in `.env.local` as `ZICKET_E2E_BUYER_KEYS`, funded with
STRK from the deployer and counterfactually deployed. Both suites pass against
live Sepolia (20 contract assertions, 32 full-stack).

Event ids restart at 1 for every deployment, so a listing's `onchain_event_id` is
stored alongside the `onchain_contract_address` that issued it. Point the app at a
different deployment and previously published listings correctly read as
unpublished rather than resolving to some unrelated event.

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_STARKNET_NETWORK` | `devnet` \| `sepolia` \| `mainnet` |
| `NEXT_PUBLIC_STARKNET_RPC_URL` | RPC the browser reads from |
| `NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS` | Deployed `ZicketEvents` |
| `NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS` | ERC-20 used for payment |
| `NEXT_PUBLIC_TOKEN_USD_PRICE` | USD → token conversion for listed prices |
| `STARKNET_ADMIN_ADDRESS` / `STARKNET_ADMIN_PRIVATE_KEY` | Server relayer that publishes listings |

Wallet connection lives on the ticket page: the purchase button becomes
**Connect Wallet** until a wallet is connected. On `devnet` that menu also offers
a predeployed burner account, so the flow can be exercised without a browser
extension. On Sepolia and mainnet a real wallet (Argent X or Braavos) is required.

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

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm db:push` / `db:generate` / `db:migrate` / `db:seed` | Drizzle |
| `pnpm contracts:build` / `contracts:test` | scarb + snforge (36 tests) |
| `pnpm chain:devnet` | starknet-devnet in Docker on :5050 |
| `pnpm chain:deploy` | Declare + deploy, writes `deployments/` and `.env.local` |
| `pnpm chain:e2e` | 20 assertions straight against the contracts |
| `pnpm chain:flow` | 32 assertions through the running app |
