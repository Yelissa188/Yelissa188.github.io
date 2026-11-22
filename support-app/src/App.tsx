import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseAbi, parseEther, parseUnits } from 'viem';
import { BASE_USDC, BTC_ADDRESS, CHOICES, CoinChoice, PAYEE } from './config';

const transferAbi = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);

function shorten(value: string) {
  return value.length > 20 ? value.slice(0, 10) + '…' + value.slice(-8) : value;
}

function readableError(error: unknown) {
  if (error instanceof Error) {
    const text = error.message.split('\n')[0];
    return text.length > 180 ? text.slice(0, 180) + '…' : text;
  }
  return 'The wallet could not complete this request.';
}

function parseDonation(raw: string, coin: 'USDC' | 'ETH'): bigint {
  const value = raw.trim();
  if (value.length > 30 || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    throw new Error('Enter a valid positive amount, using a dot for decimals.');
  }
  const amount = coin === 'USDC' ? parseUnits(value, 6) : parseEther(value);
  if (amount <= 0n) throw new Error('The amount must be greater than zero.');
  return amount;
}

function BitcoinPanel() {
  const [qr, setQr] = useState<string>('');
  const [copyState, setCopyState] = useState('Copy address');
  useEffect(() => {
    let valid = true;
    QRCode.toDataURL(BTC_ADDRESS, {
      width: 440,
      margin: 3,
      errorCorrectionLevel: 'M',
      color: { dark: '#211a15', light: '#ffffff' },
    }).then(result => { if (valid) setQr(result); }).catch(() => {});
    return () => { valid = false; };
  }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(BTC_ADDRESS);
      setCopyState('Copied');
    } catch {
      setCopyState('Select the address below to copy');
    }
  }

  return <div className="payment-inner">
    <div className="qr-section">
      <div className="qr-box">{qr ? <img src={qr} width="220" height="220" alt="Bitcoin mainnet wallet address QR code" /> : <div className="qr-placeholder">Preparing QR code…</div>}</div>
      <div className="qr-actions">
        <button className="subtle-button" type="button" onClick={copyAddress}>{copyState}</button>
        {qr && <a className="subtle-button" href={qr} download="solovled-bitcoin-address.png">Save QR image</a>}
      </div>
    </div>
    <div className="wallet-info">
      <span className="small-label">Bitcoin · Mainnet</span>
      <p>Scan this code in a Bitcoin wallet, or paste the address into your wallet's Send screen.</p>
      <div className="address-field" tabIndex={0}>{BTC_ADDRESS}</div>
      <p className="fine-print">BTC only. Confirm the full recipient address and Bitcoin network before sending. Transfers cannot be reversed.</p>
    </div>
  </div>;
}

function EvMPayment({ coin }: { coin: 'USDC' | 'ETH' }) {
  // Suggestions are denominated in the selected token, NOT USD.
  const suggested = coin === 'USDC' ? ['5', '10', '25', '50'] : ['0.001', '0.003', '0.01', '0.025'];
  const [amount, setAmount] = useState(coin === 'USDC' ? '10' : '0.003');
  const targetChain = base;
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [notice, setNotice] = useState('');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync, isPending: sendingEth } = useSendTransaction();
  const { writeContractAsync, isPending: sendingUsdc } = useWriteContract();
  const { data: receipt, isLoading: awaitingReceipt, isError: receiptError } = useWaitForTransactionReceipt({
    chainId: targetChain.id,
    hash: transactionHash,
    query: { enabled: Boolean(transactionHash) },
  });

  const parsedAmount = useMemo(() => {
    try { return { result: parseDonation(amount, coin), error: '' }; }
    catch (error) { return { result: null, error: readableError(error) }; }
  }, [amount, coin]);

  const ready = Boolean(PAYEE && isConnected && address && parsedAmount.result);
  const busy = sendingEth || sendingUsdc || awaitingReceipt;
  const success = receipt?.status === 'success';
  const failure = receipt?.status === 'reverted' || receiptError;

  async function initiate() {
    if (!PAYEE || !address || !ready || !parsedAmount.result || busy) return;
    setNotice('');
    setTransactionHash(undefined);
    try {
      if (chainId !== targetChain.id) await switchChainAsync({ chainId: targetChain.id });
      const hash = coin === 'USDC'
        ? await writeContractAsync({
            address: BASE_USDC,
            abi: transferAbi,
            functionName: 'transfer',
            args: [PAYEE, parsedAmount.result],
            chainId: base.id,
          })
        : await sendTransactionAsync({
            to: PAYEE,
            value: parsedAmount.result,
            chainId: base.id,
          });
      setTransactionHash(hash);
    } catch (error) {
      setNotice(readableError(error));
    }
  }

  return <div className="evm-panel">
    <div className="amount-column">
      <span className="small-label">Choose an amount · {coin} units</span>
      <div className="amount-options">{suggested.map(value =>
        <button key={value} type="button" className={amount === value ? 'amount active' : 'amount'} onClick={() => { setAmount(value); setTransactionHash(undefined); setNotice(''); }}>{value}</button>
      )}</div>
      <label className="custom-label" htmlFor="gift-amount">Or enter your own amount</label>
      <div className="input-wrap"><input id="gift-amount" inputMode="decimal" autoComplete="off" value={amount} onChange={e => { setAmount(e.target.value); setTransactionHash(undefined); setNotice(''); }} aria-describedby="gift-help" /><span>{coin}</span></div>
      <p className="fine-print" id="gift-help">Amounts are in {coin}, not USD. Base ETH is required for the network fee. One-time only, no recurring charges.</p>
    </div>
    <div className="pay-column">
      <div className="detail-row"><span>Network</span><strong>Base · Chain 8453</strong></div>
      <div className="detail-row"><span>Asset</span><strong>{coin === 'USDC' ? 'Native USDC (Circle)' : 'ETH (Base)'}</strong></div>
      <div className="detail-row"><span>Recipient</span><strong>{PAYEE ? shorten(PAYEE) : 'Not configured yet'}</strong></div>
      {coin === 'USDC' && <div className="detail-row"><span>Token contract</span><strong title={BASE_USDC}>{shorten(BASE_USDC)}</strong></div>}
      {PAYEE ? <div className="full-address">{PAYEE}</div> : <div className="setup-note">Receiver address is invalid. Payments are disabled.</div>}
      <div className="wallet-connect"><ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} /></div>
      {parsedAmount.error && <p role="alert" className="error-text">{parsedAmount.error}</p>}
      <button className="primary-button" type="button" onClick={initiate} disabled={!ready || busy || Boolean(transactionHash)}>
        {busy ? (awaitingReceipt ? 'Waiting for on-chain confirmation…' : 'Open your wallet to confirm…') : `Review ${amount || '0'} ${coin} in wallet`}
      </button>
      <p className="fine-print">Your wallet will display the final amount, network fee, recipient and transaction for approval. No allowance or unlimited token approval is requested.</p>
      {notice && <p role="alert" className="error-text">{notice}</p>}
      {transactionHash && <div className="tx-result" role="status">
        {success ? 'Transaction confirmed on ' + targetChain.name + '.' : failure ? 'The on-chain transfer did not confirm successfully.' : 'Transaction submitted. Waiting for confirmation.'}
        <a href={`https://basescan.org/tx/${transactionHash}`} target="_blank" rel="noreferrer noopener">View transaction in block explorer ↗</a>
      </div>}
    </div>
  </div>;
}

export default function App({ walletEnabled }: { walletEnabled: boolean }) {
  const [choice, setChoice] = useState<CoinChoice>('BTC');
  const selected = CHOICES.find(item => item.key === choice)!;
  return <main className="page-shell">
    <header className="top-nav">
      <a className="wordmark" href="https://solovled188.substack.com/" target="_blank" rel="noreferrer">SOLOVLED<span className="wordmark-dot">.</span></a>
      <span className="nav-subtitle">INDEPENDENT WORK · OPEN SUPPORT</span>
    </header>
    <div className="editorial-layout">
      <section className="intro-panel">
        <span className="eyebrow">A NOTE FROM SOLOVLED <span className="ornament">✦</span></span>
        <h1>A little support keeps independent work moving<span className="period">.</span></h1>
        <p className="lede">An independent space for writing, research, thoughtful conversations, and creative experiments.</p>
        <div className="hairline" />
        <p>If something you have read or explored here has stayed with you, this is a quiet way to support the work.</p>
        <p>No membership. No subscription. Just a voluntary gesture, from one curious mind to another.</p>
        <div className="signature">With gratitude,<br/><em>Solovled</em></div>
        <div className="side-index"><span>01 / SUPPORT</span><span>02 / PAYMENT</span><span>03 / A NOTE</span></div>
      </section>
      <section className="support-panel">
        <div className="panel-heading"><span className="small-label">01 — WAYS TO SUPPORT</span><h2>Choose what feels right.</h2><p>Choose a currency and send a one-time contribution. The amount is always yours to decide.</p></div>
        <div className="currency-picker" role="group" aria-label="Choose currency">{CHOICES.map(item =>
          <button type="button" key={item.key} aria-pressed={choice === item.key} onClick={() => setChoice(item.key)} className={choice === item.key ? 'currency selected' : 'currency'}>
            <strong>{item.key}</strong><span>{item.network}</span>
          </button>
        )}</div>
        <div className="currency-description"><span className="small-label">02 — PAYMENT DETAILS</span><h3>{selected.label}</h3><span className="network-caption">{selected.network}</span></div>
        {choice === 'BTC'
          ? <BitcoinPanel />
          : walletEnabled ? <EvMPayment key={choice} coin={choice} />
          : <div className="setup-note wallet-pending"><h3>Wallet payments are being prepared.</h3><p>The EVM wallet connector needs the public Reown Project ID and the confirmed receiving address before it can be enabled. No payment can be initiated here yet.</p></div>}
        <div className="closing-note"><span className="small-label">03 — BEFORE SENDING</span><p>This page is for one-time, voluntary support only. It does not sell access to private content or create a recurring subscription. Crypto transfers are irreversible: verify your network and the complete destination address in your own wallet.</p></div>
      </section>
    </div>
    <footer><span>© SOLOVLED · INDEPENDENT THOUGHTS & DIGITAL EXPERIMENTS</span><a href="https://solovled188.substack.com/" target="_blank" rel="noreferrer">BACK TO WRITING ↗</a></footer>
  </main>;
}
