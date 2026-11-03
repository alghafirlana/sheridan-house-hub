import { createQrSvg } from './vendor/qr-code.js';

// Works on any GitHub Pages project URL, including /sheridan-game-hub/.
// The full URL is generated in the visitor's browser; nothing is sent to a QR service.
export function initPhoneQr() {
  const small = document.getElementById('heroQrCode');
  const large = document.getElementById('largeQrCode');
  const dialog = document.getElementById('qrDialog');
  const openButton = document.getElementById('expandQr');
  const closeButton = document.getElementById('closeQr');
  if (!small || !large || !dialog || !openButton || !closeButton) return;
  try {
    const targetUrl = new URL('./', window.location.href).href;
    const qr = createQrSvg(targetUrl);
    small.innerHTML = qr;
    large.innerHTML = qr;
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    if (isLocal) {
      const hint=document.getElementById('qrDialogHint');
      if (hint) hint.textContent = 'Local preview only — publish on GitHub Pages for phone scanning.';
      small.title = 'Preview only: publish to GitHub Pages before scanning from a phone.';
    }
    openButton.addEventListener('click', () => dialog.showModal());
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  } catch (error) {
    small.textContent = 'QR unavailable';
    openButton.hidden = true;
    console.error('QR could not be generated:', error);
  }
}
