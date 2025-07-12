// Example usage:
// initHostCommunication('https://builder.example.com');
// onBuilderMessage<{ bar: number }>('UPDATE_BAR', ({ bar }) => { ... });
// sendToBuilder({ type: 'UPDATE_FOO', payload: { foo: 'hello' } });

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

  if (type === 'HANDSHAKE_INIT') {
    sendAck();
    isHandshaked = true;
    return;
  }

  if (!isHandshaked) return;

  const handler = handlers.get(type);
  if (handler) handler(payload);
}

function sendAck() {
  window.parent.postMessage(JSON.stringify({ type: 'HANDSHAKE_ACK' }), allowedOrigin);
}

export function initHostCommunication(allowedBuilderOrigin: string) {
  allowedOrigin = allowedBuilderOrigin;
  window.addEventListener('message', handleMessage);
}

export function sendToBuilder(msg: any): void {
  if (!isHandshaked) {
    console.warn('Handshake not complete');
    return;
  }
  window.parent.postMessage(JSON.stringify(msg), allowedOrigin);
}

export function onBuilderMessage<T>(type: string, handler: (payload: T) => void): void {
  handlers.set(type, handler);
} 