"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLE_DATA } from "../host/runtime/sample-data";
import type { Component } from "../host/runtime/runtime";
import { Header } from "./components/Header";
import { NumberPanel } from "./components/NumberPanel";
import { TextPanel } from "./components/TextPanel";

export function Builder() {
  const [data, setData] = useState<Component>(SAMPLE_DATA);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      console.log('Builder received message:', event.data);

      if (event.data.type === 'ready') {
        setIsLoaded(true);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isLoaded && iframeRef.current?.contentWindow) {
      console.log('Builder sending updateData:', data);
      iframeRef.current.contentWindow.postMessage({ type: 'updateData', payload: data }, '*');
    }
  }, [data, isLoaded]);

  const updateTextProp = (key: string, value: string | number) => {
    setData((prev) => {
      const newData = structuredClone(prev);
      // @ts-expect-error
      newData.props.children[0].props[key] = value;
      return newData;
    });
  };

  // @ts-expect-error -- we know it's a Box with children
  const textProps = data.props.children[0].props;

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
            <TextPanel label="Text" value={textProps.text} onChange={(v) => updateTextProp('text', v)} />
            <TextPanel label="Color" value={textProps.color} onChange={(v) => updateTextProp('color', v)} />
            <NumberPanel label="Font size" value={textProps.fontSize} onChange={(v) => updateTextProp('fontSize', v)} />
            <NumberPanel label="Font weight" value={textProps.fontWeight} onChange={(v) => updateTextProp('fontWeight', v)} />
          </div>
        </aside>
      </main>
    </div>
  );
}
