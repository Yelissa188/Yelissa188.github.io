# Solovled Support · GitHub Pages (draft)

A standalone, editorial-style one-time crypto support page for Solovled. This app lives under `support-app/` so the temporary Solovled homepage stays independent. The intended published URL is `https://yelissa188.github.io/support/`. Earlier quant reports are archived in the `draft/quant-reports-2026-11-22` branch, not published from `master`.

## Visual direction (reference screenshot supplied 2026-11-22)

- Clean, narrow personal-publication column, ivory rounded canvas on a quiet gray backdrop, serif brand and headings, sans-serif body, generous reading whitespace. **No decorative images**.
- A real light/dark switch in the header.
- One "Leave a little support" button opens a centered, minimalist payment-card dialog rather than putting a large payment panel in the article body.
- The BTC QR image appears **only inside the payment dialog** when Bitcoin is selected.
- Dialog supports Escape, outside click, focus containment/restoration and keeps transaction state mounted when closed; intentionally uses a wallet-compatible overlay rather than the browser top-layer native dialog, so RainbowKit's own connection popup can appear above it.
- Footer: [Instagram `@solovled_188`](https://www.instagram.com/solovled_188/), confirmed public email [yelissa188@outlook.com](mailto:yelissa188@outlook.com), and [Substack](https://solovled188.substack.com/). The Outlook address was explicitly approved for public use and is now linked through `mailto:`.

## Early access waitlist (published Tally form)

- Public form: https://tally.so/r/J1ORbK (form ID `J1ORbK`, workspace `My workspace`).
- Form published on 2026-11-22 with required email, optional note, explicitly required unticked launch-notification consent, CAPTCHA, and English thank-you page.
- An editorial text link in `App.tsx` points to the actual live Tally form. The site itself remains in draft and does not accept form data directly.
- Free Tally self-email notification is enabled. By default it is sent to the **Tally form creator's account email**, which has not been inspected or confirmed here. It is **not necessarily** the public footer contact `yelissa188@outlook.com`. Custom destination/subject/body were rejected as Pro-only.
- Free plan may not apply the previously configured advanced visual styling to the published form.
- Before announcing broadly: submit one authorized test entry, check Tally submissions and the notification email receipt, and inspect privacy/consent text. No paid subscription or automatic launch emails are created by this form.
- Never store readers' addresses or messages in the public GitHub repository.

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
5. For branch-based GitHub Pages publishing, copy the contents of `support-app/dist/` into the repository's top-level `support/` folder. Preserve the current Solovled root `index.html`. Historical `data-analysis/` and `strategy-portfolios/` are archived in the quant draft branch; do not restore them to the public homepage.
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
- [ ] Confirm phone reading and taps, modal keyboard navigation, layered RainbowKit wallet popup and typography.
- [x] Explicitly approved public email configured in footer (`mailto:yelissa188@outlook.com`).
- [ ] Verify Outlook link from the built page on desktop/mobile.

Status: **Draft / not deployed / not payment-verified**.
