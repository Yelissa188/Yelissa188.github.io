import { isAddress } from 'viem';

// Public receiving addresses. Never store private keys or seed phrases here.
export const BTC_ADDRESS = 'bc1qlqs9q8akk45le4yu2dgxdlmv78r8kcmslkr398';
export const SUPPORT_RECEIVER = '0x8b62bCC8D10107dbB1Ce9c7b537e212D345949e5' as const;
export const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const BASE_CHAIN_ID = 8453 as const;

// Validate EIP-55 checksum. Fail closed on corrupted address.
export const PAYEE = isAddress(SUPPORT_RECEIVER) ? SUPPORT_RECEIVER : null;
export const CHOICES = [
  { key: 'BTC', label: 'Bitcoin', network: 'Bitcoin Mainnet', type: 'bitcoin' },
  { key: 'USDC', label: 'USDC', network: 'Base Mainnet', type: 'erc20' },
  { key: 'ETH', label: 'ETH', network: 'Base Mainnet', type: 'native' },
] as const;
export type CoinChoice = (typeof CHOICES)[number]['key'];
