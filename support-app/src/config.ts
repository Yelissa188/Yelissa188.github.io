import { isAddress } from 'viem';

export const BTC_ADDRESS = 'bc1qlqs9q8akk45le4yu2dgxdlmv78r8kcmslkr398';
export const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const BASE_CHAIN_ID = 8453 as const;

// NEVER accept the payee address from a query string, connected wallet, or user input.
const configuredPayee = (import.meta.env.VITE_SUPPORT_RECEIVER || '').trim();
export const PAYEE = isAddress(configuredPayee) ? configuredPayee : null;
export const PROJECT_ID = (import.meta.env.VITE_REOWN_PROJECT_ID || '').trim();
export const CHOICES = [
  { key: 'BTC', label: 'Bitcoin', network: 'Bitcoin Mainnet', type: 'bitcoin' },
  { key: 'USDC', label: 'USDC', network: 'Base', type: 'erc20' },
  { key: 'ETH', label: 'ETH', network: 'Base', type: 'native' },
] as const;
export type CoinChoice = (typeof CHOICES)[number]['key'];
