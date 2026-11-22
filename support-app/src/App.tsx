import { useEffect, useState } from 'react';
import { CHOICES, CoinChoice } from './config';
import StaticPaymentPanel from './StaticPaymentPanel';

export default function App() {
  const [choice, setChoice] = useState<CoinChoice>('BTC');
  const [darkMode, setDarkMode] = useState(false);
  const selected = CHOICES.find(item => item.key === choice)!;
  const publicContactEmail = 'yelissa188@outlook.com';

  useEffect(() => {
    // Tally's standard embed script makes the inline iframe height responsive.
    // The frame also has a direct src fallback when that script is unavailable.
    const scriptUrl = 'https://tally.so/widgets/embed.js';
    const tallyWindow = window as Window & { Tally?: { loadEmbeds: () => void } };
    const iframe = document.getElementById('solovled-waitlist-embed') as HTMLIFrameElement | null;
    const loadFallback = () => {
      if (iframe && !iframe.getAttribute('src')) {
        iframe.src = iframe.dataset.tallySrc || '';
      }
    };
    const loadFrame = () => {
      tallyWindow.Tally?.loadEmbeds();
      loadFallback();
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (existing) {
      if (tallyWindow.Tally) loadFrame();
      else existing.addEventListener('load', loadFrame, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = loadFrame;
      script.onerror = loadFallback;
      document.body.appendChild(script);
    }
  }, []);

  return <div className={darkMode ? 'site-shell theme-dark' : 'site-shell'}>
    <div className="paper-page">
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
        </section>

        <section className="support-feature" aria-labelledby="support-heading">
          <div className="support-feature-top">
            <span className="support-overline"><span className="support-status-dot" aria-hidden="true" /> INDEPENDENT WORK · OPEN SUPPORT</span>
            <span className="support-edition">SOLOVLED / 001</span>
          </div>
          <div className="support-feature-heading">
            <h2 id="support-heading">Support My Work<span className="support-heading-dot">.</span></h2>
            <p>If something here has resonated with you, a small contribution helps independent writing and creative work continue. Choose what feels right.</p>
          </div>

          <div className="support-payment-area">
            <div className="currency-picker" role="group" aria-label="Choose how to support Solovled">
              {CHOICES.map(item =>
                <button type="button" key={item.key} aria-pressed={choice === item.key} onClick={() => setChoice(item.key)}
                  className={choice === item.key ? 'currency selected' : 'currency'}>
                  <strong>{item.key}</strong><span>{item.network}</span>
                </button>
              )}
            </div>
            <div className="currency-description">
              <div>
                <span className="small-label">RECEIVING DETAILS · NO WALLET CONNECTION</span>
                <h3>{selected.label}</h3>
              </div>
              <span className="network-caption">{selected.network}</span>
            </div>
            <StaticPaymentPanel key={choice} coin={choice} />
          </div>
          <div className="closing-note">
            <span className="closing-symbol" aria-hidden="true">✳</span>
            <p>One-time voluntary support, not a subscription. No login, wallet connection, signature or token approval is requested by this website. Confirm the asset, complete receiving address and network in your wallet before sending. Crypto transfers are irreversible.</p>
          </div>
        </section>

        <section className="waitlist-essay" aria-labelledby="waitlist-heading">
          <div className="waitlist-eyebrow">EARLY ACCESS</div>
          <h2 id="waitlist-heading">Be the first to know.</h2>
          <p>I'm slowly building what's next. Leave your email and an optional note if you'd like to hear when Solovled's future membership opens.</p>
          <div className="waitlist-embed-shell">
            <iframe
              id="solovled-waitlist-embed"
              title="Solovled Early Access Waitlist: email, optional message and launch notification consent"
              data-tally-src="https://tally.so/embed/J1ORbK?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              loading="lazy"
              width="100%"
              height="740"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              scrolling="no"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', border: 0, display: 'block' }}
            />
          </div>
          <p className="waitlist-fineprint">Free to join · One-time launch notification · No payment required</p>
          <p className="waitlist-fallback">Form not showing? <a href="https://tally.so/r/J1ORbK" target="_blank" rel="noopener noreferrer">Open the accessible form</a>.</p>
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
  </div>;
}
