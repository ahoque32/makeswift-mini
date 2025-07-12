// Example usage:
// initBuilderCommunication(iframe, 'https://host.example.com');
// onHostMessage<{ foo: string }>('UPDATE_FOO', ({ foo }) => { ... });
// sendToHost({ type: 'UPDATE_BAR', payload: { bar: 123 } });

let iframeRef: HTMLIFrameElement | null = null;
let allowedOrigin: string = '';
let isHandshaked = false;
const handlers = new Map<string, (payload: any) => void>();

function handleMessage(event: MessageEvent) {
  if (event.origin !== allowedOrigin) return;

  let data;
  try {
    data = JSON.parse(event.data);
  } catch {
    return;
  }

  if (typeof data !== 'object' || data == null) return;

  const { type, payload } = data;

  if (type === 'HANDSHAKE_ACK') {
    isHandshaked = true;
    return;
  }

  if (!isHandshaked) return;

  const handler = handlers.get(type);
  if (handler) handler(payload);
}

function sendHandshake() {
  if (iframeRef?.contentWindow) {
    iframeRef.contentWindow.postMessage(JSON.stringify({ type: 'HANDSHAKE_INIT' }), allowedOrigin);
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
    console.warn('Handshake not complete');
    return;
  }
  if (iframeRef?.contentWindow) {
    iframeRef.contentWindow.postMessage(JSON.stringify(msg), allowedOrigin);
  }
}

export function onHostMessage<T>(type: string, handler: (payload: T) => void): void {
  handlers.set(type, handler);
} 