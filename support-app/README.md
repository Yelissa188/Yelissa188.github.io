# Solovled Support · GitHub Pages (draft)

A standalone, editorial-style one-time crypto support page for Solovled. This app lives under `support-app/` so the existing Quant Reports homepage is unaffected. The intended published URL is `https://yelissa188.github.io/support/`.

## Included payment options

- **Bitcoin**: Bitcoin mainnet receive address, locally generated QR code, copy and save as PNG (no wallet connection needed).
- **USDC on Base**: official Circle native USDC ERC-20 transfer, **not** bridged USDbC.
- **ETH on Base**: native ETH transfer.
- Currency selector, suggested/freeform amounts, user wallet approval, real Base transaction receipt, and Basescan link.
- No smart-contract deployment, no backend, no admin keys, no automatic subscriptions, no ERC-20 allowances.

## Setup (do not deploy a payable version until verified)

1. Obtain a **new public EVM receiving address** (`0x...`) for Solovled. Verify it in MetaMask and ensure it belongs to the intended receiving account. Never share a seed phrase or private key.
2. Create a free Reown/WalletConnect project at <https://cloud.reown.com/> and register the eventual Pages origin (`https://yelissa188.github.io`). You only need to share the **public** Project ID.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPPORT_RECEIVER` and `VITE_REOWN_PROJECT_ID`. Vite VITE_ variables are embedded into the public build, so **never place secrets in them**.
4. Run `npm install`, `npm run dev`, and `npm run build`. Use Node 20+.
5. For branch-based GitHub Pages publishing, copy the contents of `support-app/dist/` into the repository's top-level `support/` folder. Preserve existing root `index.html`, `data-analysis/`, and `strategy-portfolios/`.
6. Publish only after desktop/mobile checks and explicit recipient verification. The QR string, token contract, amount, network and confirmed transaction must be tested with a small real amount.

**Important:** The draft PR does **not** change GitHub Pages source settings or start any payments. The code has intentionally blank public `VITE_SUPPORT_RECEIVER` and `VITE_REOWN_PROJECT_ID`. In this state, EVM sending stays disabled and the editorial page/BTC QR still render.

## Configured chain and token

- Base mainnet chain ID: `8453`.
- Circle-native USDC on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (6 decimals).
- Base ETH: native, 18 decimals.
- BTC: `bc1qlqs9q8akk45le4yu2dgxdlmv78r8kcmslkr398` on Bitcoin mainnet.

Circle contract documentation: <https://www.circle.com/multi-chain-usdc/base>.
RainbowKit: <https://rainbowkit.com/docs/installation>.
Wagmi write transactions: <https://wagmi.sh/react/guides/write-to-contract>.

## Constraints and pending validation

- RainbowKit requires a public Reown/WalletConnect Project ID for full wallet support (mobile WalletConnect included).
- The **connected wallet belongs to the contributor**; the receiving address is the fixed, separately verified `VITE_SUPPORT_RECEIVER`, never the connected address or a URL parameter.
- The app does not exchange currencies, bridge chains, calculate USD-to-ETH exchange rates, or verify donations from third-party wallets.
- Suggested amounts mean **units of the selected token**, not USD. ETH suggestions use small fractional amounts (for example `0.001 ETH`), while USDC suggestions use whole USDC units.
- End-to-end wallet transactions, chain switching, builds and public Pages deployment still require validation against a real environment before enabling checkout.

## Testing checklist

- [ ] `npm run build` succeeds with installed dependencies.
- [ ] Existing GitHub Pages homepage remains unchanged.
- [ ] BTC QR decodes to the exact given mainnet address; saving and copying work on mobile.
- [ ] Receiver and Project ID have been verified and configured.
- [ ] MetaMask mobile and desktop connect/switch to Base reliably.
- [ ] Confirm displayed amount, chain ID 8453, fixed receiver, native USDC contract.
- [ ] Test small USDC transfer and Base ETH transfer separately, inspect receipt and destination on Basescan.
- [ ] Test errors for insufficient funds, wallet rejection, wrong network, invalid amount, no wallet.
- [ ] Confirm phone reading and taps, footer links and typography.

Status: **Draft / not deployed / not payment-verified**.
