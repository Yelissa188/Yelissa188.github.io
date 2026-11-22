import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { parseEther, parseUnits } from 'viem';
import { BASE_CHAIN_ID, BASE_USDC, BTC_ADDRESS, CoinChoice, PAYEE } from './config';

const qrPalette = { dark: '#211a15', light: '#ffffff' };

export default function StaticPaymentPanel({ coin }: { coin: CoinChoice }) {
  const address = coin === 'BTC' ? BTC_ADDRESS : PAYEE;
  const [qr, setQr] = useState('');
  const [copyState, setCopyState] = useState('Copy address');
  const [amount, setAmount] = useState(coin === 'ETH' ? '0.003' : '10');
  const isBitcoin = coin === 'BTC';
  const isUsdc = coin === 'USDC';

  useEffect(() => {
    setCopyState('Copy address');
    setQr('');
    if (!address) return;
    let mounted = true;
    // Address-only QR works with more wallet scanners than EIP-681 token URIs.
    QRCode.toDataURL(address, { width: 560, margin: 3, errorCorrectionLevel: 'M', color: qrPalette })
      .then(result => { if (mounted) setQr(result); }).catch(() => {});
    return () => { mounted = false; };
  }, [address]);

  const parsedAmount = useMemo(() => {
    if (isBitcoin || !address) return null;
    const clean = amount.trim();
    if (clean.length > 30 || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(clean)) return null;
    try {
      const units = isUsdc ? parseUnits(clean, 6) : parseEther(clean);
      return units > 0n ? units : null;
    } catch { return null; }
  }, [amount, isBitcoin, isUsdc, address]);

  const metamaskLink = !isBitcoin && PAYEE && parsedAmount
    ? isUsdc
      ? `https://link.metamask.io/send/${BASE_USDC}@${BASE_CHAIN_ID}/transfer?address=${PAYEE}&uint256=${parsedAmount.toString()}`
      : `https://link.metamask.io/send/${PAYEE}@${BASE_CHAIN_ID}?value=${parsedAmount.toString()}`
    : '';

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopyState('Copied ✓');
    } catch {
      setCopyState('Select the address below');
    }
  }

  if (!address) return <div className="setup-note">Receiver address is unavailable. Please do not send funds.</div>;

  return <div className="payment-inner">
    <div className="qr-section">
      <div className="qr-box">
        {qr
          ? <img src={qr} width="240" height="240" alt={`${coin} public receiving address QR code on ${isBitcoin ? 'Bitcoin' : 'Base'} Mainnet`} />
          : <div className="qr-placeholder">Preparing QR code…</div>}
      </div>
      <div className="qr-actions">
        <button className="subtle-button" type="button" onClick={copyAddress}>{copyState}</button>
        {qr && <a className="subtle-button" href={qr} download={`solovled-${coin.toLowerCase()}-${isBitcoin ? 'bitcoin' : 'base'}-qr.png`}>Download QR</a>}
      </div>
      <p className="qr-caption">Scan with your wallet, or save this QR image for later.</p>
    </div>
    <div className="wallet-info">
      <span className="small-label">{isBitcoin ? 'BITCOIN MAINNET' : isUsdc ? 'USDC · BASE MAINNET' : 'ETH · BASE MAINNET'}</span>
      <p className="wallet-instruction">Choose <strong>{coin}</strong> in your own wallet, then scan this QR code or paste the receiving address. The site never connects to your wallet.</p>
      <div className="address-label">RECIPIENT ADDRESS</div>
      <div className="address-field" tabIndex={0} aria-label={`Full ${coin} recipient address`}>{address}</div>
      {isBitcoin
        ? <p className="fine-print">Send BTC only via the Bitcoin network. Do not use an EVM or other network.</p>
        : <>
          <div className="network-notice">
            <strong>Network: Base Mainnet (8453)</strong>
            <span>{isUsdc ? 'Token: native Circle USDC. Not USDbC or Ethereum-mainnet USDC.' : 'Asset: native ETH on Base, not Ethereum Mainnet.'}</span>
          </div>
          {isUsdc && <div className="token-reference"><span>USDC token contract for verification</span><code>{BASE_USDC}</code></div>}
          <div className="wallet-shortcut">
            <label htmlFor={`support-${coin}-amount`}>Optional: prefill an amount in MetaMask</label>
            <div className="shortcut-row">
              <div className="shortcut-input"><input id={`support-${coin}-amount`} value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" autoComplete="off" aria-label={`${coin} amount for optional MetaMask shortcut`} /><span>{coin}</span></div>
              {metamaskLink
                ? <a className="wallet-open-link" href={metamaskLink} target="_blank" rel="noopener noreferrer">Open MetaMask ↗</a>
                : <span className="wallet-open-link disabled" aria-disabled="true">Enter an amount</span>}
            </div>
            <p className="fine-print">Optional mobile shortcut. It opens MetaMask's send flow with recipient and amount prefilled; you still review and confirm there. No website connection or token approval. If the link isn't supported, use the QR or Copy address instead.</p>
          </div>
        </>}
    </div>
  </div>;
}
