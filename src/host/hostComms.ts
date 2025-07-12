// Example usage:
// initHostCommunication('https://builder.example.com');
// onBuilderMessage<{ bar: number }>('UPDATE_BAR', ({ bar }) => { ... });
// sendToBuilder({ type: 'UPDATE_FOO', payload: { foo: 'hello' } });

let allowedOrigin: string = '';
let isHandshaked = false;
const handlers = new Map<string, (payload: any) => void>();

function handleMessage(event: MessageEvent) {
  if (event.origin !== allowedOrigin) {
    console.debug('[Host] Ignored message: origin mismatch', event.origin, allowedOrigin);
    return;
  }

  let data;
  try {
    data = JSON.parse(event.data);
    console.debug('[Host] Parsed incoming message:', data);
  } catch (e) {
    console.debug('[Host] Failed to parse message:', e);
    return;
  }

  if (typeof data !== 'object' || data == null) return;

  const { type, payload } = data;

  if (type === 'HANDSHAKE_INIT') {
    console.debug('[Host] Received HANDSHAKE_INIT from builder');
    sendAck();
    isHandshaked = true;
    return;
  }

  if (!isHandshaked) {
    console.debug('[Host] Ignored message: handshake not complete');
    return;
  }

  const handler = handlers.get(type);
  if (handler) {
    console.debug('[Host] Handling message type:', type);
    handler(payload);
  }
}

function sendAck() {
  console.debug('[Host] Sending HANDSHAKE_ACK to builder');
  window.parent.postMessage(JSON.stringify({ type: 'HANDSHAKE_ACK' }), allowedOrigin);
}

export function initHostCommunication(allowedBuilderOrigin: string) {
  allowedOrigin = allowedBuilderOrigin;
  window.addEventListener('message', handleMessage);
}

export function sendToBuilder(msg: any): void {
  if (!isHandshaked) {
    console.warn('[Host] Handshake not complete - message blocked:', msg);
    return;
  }
  console.debug('[Host] Sending message to builder:', msg);
  window.parent.postMessage(JSON.stringify(msg), allowedOrigin);
}

export function onBuilderMessage<T>(type: string, handler: (payload: T) => void): void {
  handlers.set(type, handler);
} 