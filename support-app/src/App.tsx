import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<HTMLButtonElement>(null);
  const selected = CHOICES.find(item => item.key === choice)!;

  useEffect(() => {
    if (!modalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const page = pageRef.current;
    page?.setAttribute('inert', '');
    const animationFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLButtonElement>('.modal-dismiss')?.focus();
    });
    return () => {
      window.cancelAnimationFrame(animationFrame);
      page?.removeAttribute('inert');
      document.body.style.overflow = originalOverflow;
      launchRef.current?.focus();
    };
  }, [modalOpen]);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setModalOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])') || []
    ).filter(element => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Public contact email explicitly approved for display in the footer.
  const publicContactEmail = 'yelissa188@outlook.com';

  return <div className={darkMode ? 'site-shell theme-dark' : 'site-shell'}>
    <div className="paper-page" ref={pageRef}>
      <header className="folio-header">
        <a className="folio-name" href="https://solovled188.substack.com/" target="_blank" rel="noopener noreferrer" aria-label="Solovled writing on Substack">Solovled</a>
        <button className="theme-toggle" type="button" aria-label={darkMode ? 'Use light appearance' : 'Use dark appearance'} aria-pressed={darkMode} onClick={() => setDarkMode(value => !value)}>
          <span aria-hidden="true">{darkMode ? '☼' : '☾'}</span>
        </button>
      </header>

      <main className="folio-main">
        <section className="personal-intro" aria-labelledby="intro-heading">
          <h1 id="intro-heading">Writing, questions &amp; everything in between.</h1>
          <p>Solovled is an independent space for <strong>writing, thoughtful conversations, research, and creative experiments.</strong></p>
          <p>Some ideas begin as a question. Others become long conversations, notes, or pieces of writing. This is where they can take their own shape, without needing to fit into a single category.</p>
          <p className="italic-note">A small corner of the internet for curious minds and unfinished thoughts.</p>
        </section>

        <section className="support-essay" aria-labelledby="support-heading">
          <h2 id="support-heading">Support My Work</h2>
          <p>If something you have read here has stayed with you, you can support the independent work behind it. It is entirely voluntary, and there is no subscription or commitment.</p>
          <button ref={launchRef} className="support-trigger" type="button" onClick={() => setModalOpen(true)}>Leave a little support <span aria-hidden="true">↗</span></button>
          <p className="support-fineprint">One-time crypto contribution · BTC, USDC or ETH</p>
        </section>

        <div className="author-signoff">
          <span className="signoff-name">Solovled</span>
          <span className="signoff-description">Writing, conversations &amp; digital experiments.</span>
        </div>
      </main>

      <footer className="folio-footer">
        <nav className="social-links" aria-label="Follow and contact Solovled">
          <a href="https://www.instagram.com/solovled_188/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={`mailto:${publicContactEmail}`} aria-label={`Email Solovled at ${publicContactEmail}`}>Email</a>
          <a href="https://solovled188.substack.com/" target="_blank" rel="noopener noreferrer">Substack</a>
        </nav>
        <div className="copyright">© 2026 Solovled. All rights reserved.</div>
      </footer>
    </div>

    <div className={modalOpen ? 'payment-overlay is-open' : 'payment-overlay'}
      aria-hidden={!modalOpen}
      onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
      <div ref={dialogRef} className="support-dialog" role="dialog" aria-modal="true"
        aria-labelledby="payment-modal-title" tabIndex={-1} onKeyDown={handleDialogKeyDown}>
        <div className="modal-card">
        <div className="modal-topline">
          <span className="small-label">SOLOVLED / ONE-TIME SUPPORT</span>
          <button className="modal-dismiss" type="button" aria-label="Close payment options" onClick={() => setModalOpen(false)}>×</button>
        </div>
        <div className="modal-intro">
          <h2 id="payment-modal-title">A little support.</h2>
          <p>Choose what feels right. Your contribution is voluntary and always one-time.</p>
        </div>
        <div className="currency-picker" role="group" aria-label="Choose payment currency">
          {CHOICES.map(item => <button type="button" key={item.key} aria-pressed={choice === item.key}
            onClick={() => setChoice(item.key)}
            className={choice === item.key ? 'currency selected' : 'currency'}>
            <strong>{item.key}</strong><span>{item.network}</span>
          </button>)}
        </div>
        <div className="currency-description">
          <h3>{selected.label}</h3><span className="network-caption">{selected.network}</span>
        </div>
        {choice === 'BTC'
          ? <BitcoinPanel />
          : walletEnabled
            ? <EvMPayment key={choice} coin={choice} />
            : <div className="setup-note wallet-pending"><h3>Wallet connection is being prepared.</h3><p>Digital wallet payments are temporarily unavailable.</p></div>}
        <div className="closing-note"><p>Check the network, amount, and complete receiving address in your wallet before sending. Crypto transfers cannot be reversed. Support does not grant membership or paid-content access.</p></div>
        </div>
      </div>
    </div>
  </div>;
}
