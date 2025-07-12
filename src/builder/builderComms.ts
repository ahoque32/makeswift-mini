// Example usage:
// initBuilderCommunication(iframe, 'https://host.example.com');
// onHostMessage<{ foo: string }>('UPDATE_FOO', ({ foo }) => { ... });
// sendToHost({ type: 'UPDATE_BAR', payload: { bar: 123 } });

let iframeRef: HTMLIFrameElement | null = null;
let allowedOrigin: string = '';
let isHandshaked = false;
const handlers = new Map<string, (payload: any) => void>();

function handleMessage(event: MessageEvent) {
  if (event.origin !== allowedOrigin) {
    console.log('[Builder] Ignored message: origin mismatch', event.origin, allowedOrigin);
    return;
  }

  let data;
  try {
    data = JSON.parse(event.data);
    console.log('[Builder] Parsed incoming message:', data);
  } catch (e) {
    console.log('[Builder] Failed to parse message:', e);
    return;
  }

  if (typeof data !== 'object' || data == null) return;

  const { type, payload } = data;

  if (type === 'HANDSHAKE_ACK') {
    console.log('[Builder] Received HANDSHAKE_ACK from host');
    isHandshaked = true;
    return;
  }

  if (!isHandshaked) return;

  const handler = handlers.get(type);
  if (handler) handler(payload);
}

function sendHandshake() {
  if (iframeRef?.contentWindow) {
    console.log('[Builder] Sending HANDSHAKE_INIT to host');
    iframeRef.contentWindow.postMessage(JSON.stringify({ type: 'HANDSHAKE_INIT' }), allowedOrigin);
  } else {
    console.log('[Builder] Cannot send HANDSHAKE_INIT: contentWindow not ready');
  }
}

export function initBuilderCommunication(iframe: HTMLIFrameElement, allowedHostOrigin: string) {
  iframeRef = iframe;
  allowedOrigin = allowedHostOrigin;
  window.addEventListener('message', handleMessage);
  sendHandshake();
}

export function sendToHost(msg: any): void {
  if (!isHandshaked) {
    console.warn('[Builder] Handshake not complete - message blocked:', msg);
    return;
  }
  console.log('[Builder] Sending message to host:', msg);
  if (iframeRef?.contentWindow) {
    iframeRef.contentWindow.postMessage(JSON.stringify(msg), allowedOrigin);
  }
}

export function onHostMessage<T>(type: string, handler: (payload: T) => void): void {
  handlers.set(type, handler);
} 