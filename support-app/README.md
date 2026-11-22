# Solovled Support · GitHub Pages

A standalone, editorial-style one-time crypto support page for Solovled. This app lives under `support-app/` so the minimal Solovled homepage stays independent. The published URL is `https://yelissa188.github.io/support/`. Earlier quant reports are archived in the `draft/quant-reports-2026-11-22` branch, not published from `master`.

## Support operation standard (2026-11-22)

**Public UX:** The Support card stays inline with the editorial layout. No wallet connection, login, signature, dApp approval, Web3 provider request, token approval or on-site transaction broadcasting. These are voluntary one-time contributions.

1. Visitor chooses **BTC** (Bitcoin Mainnet), **USDC** (native Circle USDC, Base Mainnet chain ID 8453), or **ETH** (native ETH on Base Mainnet 8453). No other network/bridged USDC is intended.
2. Each currency shows its own **public recipient address QR** immediately, plus the complete address, **Copy address** and **Download QR** PNG buttons. The QR intentionally holds the address **only** for broad wallet scanning compatibility. On mobile, download or copy the address rather than attempting to scan a code on the same screen.
3. The sender opens **their own wallet**, selects the correct asset and network, scans the code or pastes the full address, enters their chosen amount, and **checks the final details in their wallet** before approving. Site never sends a transaction.
4. **Optional MetaMask mobile shortcut** for USDC/ETH (not BTC): an explicit external link to official `https://link.metamask.io/send/` deep links on Base 8453, with checked amount and recipient. It might be unsupported in a wallet/browser, so the address-only QR/copy path always remains available. The shortcut does **not connect the wallet to this website**, although the wallet can show its own review or security screens.
5. For USDC: verify token is **Circle-native USDC** on Base, contract `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`. Do **not** use bridged USDbC or USDC on Ethereum mainnet.
6. For ETH: explicitly use **ETH on Base mainnet** rather than defaulting to Ethereum mainnet. BTC is Bitcoin mainnet only.
7. Only public addresses and locally generated QR data are used. Never embed user private keys, seeds, or collected email addresses. No automatic network change or signatures. Payment receipt verification is done by the sender in their wallet or trusted explorer.

**Before broad promotion:** Independently decode each QR and confirm its exact corresponding address; check both QR PNG downloads and copy controls on desktop/iOS; test MetaMask optional deep links on a mobile wallet without approving any actual transfer; confirm receiver ownership. The site itself has no view into whether a payment has been completed.

## Visual direction

- Refined ivory rounded canvas, large, obvious but elegant donation card with fine borders and typographic hierarchy. No decorative imagery.
- BTC, USDC and ETH share consistent QR, address and Download QR UI with the same spacious card.
- Light/dark toggle remains functional.
- Footer: [Instagram](https://www.instagram.com/solovled_188/), [yelissa188@outlook.com](mailto:yelissa188@outlook.com), [Substack](https://solovled188.substack.com/).

## Early access waitlist (published Tally form)

- Public form: https://tally.so/r/J1ORbK (form ID `J1ORbK`, workspace `My workspace`).
- Form published on 2026-11-22 with required email, optional note, explicitly required unticked launch-notification consent, CAPTCHA, and English thank-you page.
- The form is **embedded inline** on the public Support page via the official Standard iframe URL `https://tally.so/embed/J1ORbK?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1` and the responsive Tally embed script. Visitors can submit without navigating away. A small direct link remains only as an accessibility/fallback option.
- Form submissions and notifications still go through Tally, not the GitHub Pages host. The embed does not create a separate form or copy visitors' details to the repository.
- Free Tally self-email notification is enabled. By default it is sent to the **Tally form creator's account email**, which has not been inspected or confirmed here. It is **not necessarily** the public footer contact `yelissa188@outlook.com`. Custom destination/subject/body were rejected as Pro-only.
- Free plan may not apply the previously configured advanced visual styling to the published form.
- Before announcing broadly: submit one authorized test entry, check Tally submissions and the notification email receipt, and inspect privacy/consent text. No paid subscription or automatic launch emails are created by this form.
- Never store readers' addresses or messages in the public GitHub repository.

## Included payment methods

- **BTC**: Bitcoin mainnet address and QR, copy/save PNG.
- **USDC on Base**: static recipient QR, copy/save PNG, optional MetaMask transaction-prefill shortcut.
- **ETH on Base**: static recipient QR, copy/save PNG, optional MetaMask transaction-prefill shortcut.
- **No WalletConnect / RainbowKit / Wagmi**: the site never asks visitors to connect, sign, approve tokens or grant account access.

## Deployment and verification

1. The public EVM receiving address is configured in `src/config.ts`: `0x8b62bCC8D10107dbB1Ce9c7b537e212D345949e5` (EIP-55 checksum checked). Verify it is yours by comparing with your wallet before publishing. Never share a seed phrase or private key.
2. No Reown/WalletConnect Project ID is needed. The site uses QR and native wallet deep links only.
3. No `.env.local` or wallet project ID is required. Public receiving addresses live in `src/config.ts`; never place secrets in source code.
4. Run `npm install`, `npm run dev`, and `npm run build`. Use Node 20+.
5. For branch-based GitHub Pages publishing, copy the contents of `support-app/dist/` into the repository's top-level `support/` folder. Preserve the current Solovled root `index.html`. Historical `data-analysis/` and `strategy-portfolios/` are archived in the quant draft branch; do not restore them to the public homepage.
6. The public page has been published. The QR string, token contract, amounts, network, wallet connectivity, and real transaction receipts still require owner testing with a small amount.

**Important:** The website cannot connect a wallet, initiate blockchain requests, or verify incoming transfers. Optional external MetaMask send links are user-initiated and need real-device compatibility testing.

## Configured chain and token

- Base mainnet chain ID: `8453`.
- Circle-native USDC on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (6 decimals).
- Base ETH: native, 18 decimals, chain ID `8453`.
- BTC: `bc1qlqs9q8akk45le4yu2dgxdlmv78r8kcmslkr398` on Bitcoin mainnet.

Circle contract documentation: <https://www.circle.com/multi-chain-usdc/base>.
RainbowKit: <https://rainbowkit.com/docs/installation>.
Wagmi write transactions: <https://wagmi.sh/react/guides/write-to-contract>.

## Constraints and pending validation

- Address-only QR codes intentionally avoid less-portable EIP-681 token transfer URIs.
- MetaMask official send deeplinks are only optional shortcuts, not broad compatibility guarantees. Other wallets should use QR or Copy address.
- Mobile/desktop tests are still needed; do not infer real transfers from the QR or a user clicking a link.
- The two Base assets share one public EVM receiving address; network and native token selection are essential.

## Testing checklist

- [ ] `npm run build` succeeds on the latest revision.
- [ ] BTC, USDC, ETH QR each decode exactly to their corresponding **public receiving address**.
- [ ] Each of the three Download QR PNG controls works on desktop and mobile.
- [ ] Each Copy address action copies the full correct address.
- [ ] USDC/ETH Base-only warnings remain visible at phone widths.
- [ ] Optional MetaMask send links prefill the correct asset, address, network and amount on a real mobile wallet without ever connecting the webpage.
- [ ] User confirms receiving wallet ownership.
- [ ] No wallet connector/transaction-sending scripts exist in production bundles.
- [ ] Home `Hello Solovled` stays intact; the Tally iframe loads and submits successfully at phone and desktop sizes.

Status: **Public support page; external wallet shortcut not device-verified.**
