import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';
import './styles.css';
import App from './App';
import { PROJECT_ID } from './config';

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root')!);
const shell = <React.StrictMode><App walletEnabled={Boolean(PROJECT_ID)} /></React.StrictMode>;

if (PROJECT_ID) {
  const config = getDefaultConfig({
    appName: 'Solovled Support',
    projectId: PROJECT_ID,
    chains: [base, mainnet],
    ssr: false,
  });
  root.render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{shell}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} else {
  // BTC and the editorial page remain usable without a WalletConnect project.
  // EVM payment actions are never rendered without a real project ID.
  root.render(shell);
}
