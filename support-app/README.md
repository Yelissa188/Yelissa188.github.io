# Solovled Support · GitHub Pages (draft)

A standalone, editorial-style one-time crypto support page for Solovled. This app lives under `support-app/` so the temporary Solovled homepage stays independent. The intended published URL is `https://yelissa188.github.io/support/`. Earlier quant reports are archived in the `draft/quant-reports-2026-11-22` branch, not published from `master`.

## Included payment options

- **Bitcoin**: Bitcoin mainnet receive address, locally generated QR code, copy and save as PNG (no wallet connection needed).
- **USDC on Base**: official Circle native USDC ERC-20 transfer, **not** bridged USDbC.
- **ETH on Base**: native ETH transfer.
- Currency selector, suggested/freeform amounts, user wallet approval, Base transaction receipts and explorer links.
- No smart-contract deployment, no backend, no admin keys, no automatic subscriptions, no ERC-20 allowances.

## Setup (do not deploy a payable version until verified)

1. The public EVM receiving address is configured in `src/config.ts`: `0x8b62bCC8D10107dbB1Ce9c7b537e212D345949e5` (EIP-55 checksum checked). Verify it is yours by comparing with your wallet before publishing. Never share a seed phrase or private key.
2. The **public** Reown/WalletConnect Project ID `de7e1dc23bcb790ba29acee520f261af` is configured in `src/config.ts`. Confirm that the eventual Pages origin (`https://yelissa188.github.io`) is allowed in your Reown project settings.
3. No `.env.local` is required. The public Project ID and receiver live in `src/config.ts`. Use `VITE_REOWN_PROJECT_ID` only to override the public ID when testing. Vite VITE_ variables are browser-visible; **never place private keys or secrets in them**.
4. Run `npm install`, `npm run dev`, and `npm run build`. Use Node 20+.
5. For branch-based GitHub Pages publishing, copy the contents of `support-app/dist/` into the repository's top-level `support/` folder. Preserve existing root `index.html`, `data-analysis/`, and `strategy-portfolios/`.
6. Publish only after desktop/mobile checks and explicit recipient verification. The QR string, token contract, amount, network and confirmed transaction must be tested with a small real amount.

**Important:** The draft PR does **not** change GitHub Pages source settings or start any payments. The receiver and Reown Project ID are now configured. Wallet and payment flows still require browser/mobile and tiny real-transaction verification before production use.

## Configured chain and token

- Base mainnet chain ID: `8453`.
- Circle-native USDC on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (6 decimals).
- Base ETH: native, 18 decimals, chain ID `8453`.
- BTC: `bc1qlqs9q8akk45le4yu2dgxdlmv78r8kcmslkr398` on Bitcoin mainnet.

Circle contract documentation: <https://www.circle.com/multi-chain-usdc/base>.
RainbowKit: <https://rainbowkit.com/docs/installation>.
Wagmi write transactions: <https://wagmi.sh/react/guides/write-to-contract>.

## Constraints and pending validation

- RainbowKit requires a public Reown/WalletConnect Project ID for full wallet support (mobile WalletConnect included).
- The **connected wallet belongs to the contributor**; the receiving address is the fixed, checksum-validated `SUPPORT_RECEIVER` constant, never the connected address or a URL parameter.
- The app does not exchange currencies, bridge chains, calculate USD-to-ETH exchange rates, or verify donations from third-party wallets.
- Suggested amounts mean **units of the selected token**, not USD. ETH suggestions use small fractional amounts (for example `0.001 ETH`), while USDC suggestions use whole USDC units.
- End-to-end wallet transactions, chain switching, builds and public Pages deployment still require validation against a real environment before enabling checkout.

## Testing checklist

- [ ] `npm run build` succeeds with installed dependencies.
- [ ] Existing GitHub Pages homepage remains unchanged.
- [ ] BTC QR decodes to the exact given mainnet address; saving and copying work on mobile.
- [x] Public Reown Project ID configured in source (domain settings still need verification).
- [ ] Receiver ownership verified in user's MetaMask.
- [ ] MetaMask mobile and desktop connect/switch to Base reliably.
- [ ] Confirm amounts are denominated in token units, chain ID 8453, fixed receiver, and native USDC contract.
- [ ] Test small USDC (Base) and ETH (Base) transfers separately. Inspect receipts and recipients on Basescan.
- [ ] Test errors for insufficient funds, wallet rejection, wrong network, invalid amount, no wallet.
- [ ] Confirm phone reading and taps, footer links and typography.

Status: **Draft / not deployed / not payment-verified**.
