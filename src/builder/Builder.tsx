"use client";

import { useEffect, useRef } from "react";
import { initBuilderCommunication, onHostMessage, sendToHost } from "./builderComms";
import { Header } from "./components/Header";
import { NumberPanel } from "./components/NumberPanel";
import { TextPanel } from "./components/TextPanel";

export function Builder() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const allowedOrigin = window.location.origin; // Use same origin for local testing
      initBuilderCommunication(iframe, allowedOrigin);

      // Test handler: Log incoming messages from host
      onHostMessage<{ greeting: string }>('TEST_FROM_HOST', (payload) => {
        console.log('Received from host:', payload.greeting);
      });
    };

    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    } else {
      iframe.addEventListener('load', handleLoad);
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, []);

  const handleSendTest = () => {
    sendToHost({ type: 'TEST_FROM_BUILDER', payload: { message: 'Hello from builder!' } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 border-t border-gray-300">
        <section className="flex-1 p-6 bg-gray-100 border-r border-gray-300">
          <iframe
            ref={iframeRef}
            src="/host"
            title="Preview"
            className="w-full h-full bg-white border border-gray-300 rounded-lg"
          />
        </section>

        <aside className="w-72 border-gray-300">
          <div className="bg-gray-100 p-3 border-b border-gray-300">
            <h2 className="text-md text-gray-500">Text</h2>
          </div>

          <div className="flex flex-col gap-3 p-3">
            <TextPanel label="Text" value="WHERE BRAND MEETS THE BROWSER" />
            <TextPanel label="Color" value="#ea39a6" />
            <NumberPanel label="Font size" value={48} />
            <NumberPanel label="Font weight" value={900} />
            <button
              onClick={handleSendTest}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Send Test Message to Host
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
