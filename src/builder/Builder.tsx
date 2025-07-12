"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLE_DATA } from "../host/runtime/sample-data";
import type { Component } from "../host/runtime/runtime";
import { COMPONENT_TYPE } from "../host/runtime/runtime";
import { Header } from "./components/Header";
import { NumberPanel } from "./components/NumberPanel";
import { TextPanel } from "./components/TextPanel";

export function Builder() {
  const [data, setData] = useState<Component>(SAMPLE_DATA);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      console.log('Builder received message:', event.data);

      if (event.data.type === 'ready') {
        setIsLoaded(true);
      } else if (event.data.type === 'selectComponent') {
        setSelectedKey(event.data.id);
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

  useEffect(() => {
    if (isLoaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'enableEditMode' }, '*');
    }
  }, [isLoaded]);

  function findComponent(node: Component, key: string): Component | null {
    if (node.key === key) return node;

    if (node.type === COMPONENT_TYPE.Box && node.props.children) {
      for (const child of node.props.children) {
        const found = findComponent(child, key);
        if (found) return found;
      }
    }

    return null;
  }

  const updateProp = (key: string, prop: string, value: string | number) => {
    setData((prev) => {
      const newData = structuredClone(prev);
      const comp = findComponent(newData, key);
      if (comp) {
        // @ts-expect-error
        comp.props[prop] = value;
      }
      return newData;
    });
  };

  const selectedComponent = selectedKey ? findComponent(data, selectedKey) : null;

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
          {selectedComponent ? (
            <>
              const key = selectedKey!;
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <h2 className="text-md text-gray-500">{selectedComponent.type}</h2>
              </div>
              <div className="flex flex-col gap-3 p-3">
                {selectedComponent.type === 'Text' ? (
                  <>
                    <TextPanel label="Text" value={selectedComponent.props.text ?? 'Insert a text'} onChange={(v) => updateProp(selectedKey!, 'text', v)} />
                    <TextPanel label="Color" value={selectedComponent.props.color ?? ''} onChange={(v) => updateProp(selectedKey!, 'color', v)} />
                    <NumberPanel label="Font size" value={selectedComponent.props.fontSize ?? 16} onChange={(v) => updateProp(selectedKey!, 'fontSize', v)} />
                    <NumberPanel label="Font weight" value={selectedComponent.props.fontWeight ?? 400} onChange={(v) => updateProp(selectedKey!, 'fontWeight', v)} />
                  </>
                ) : (
                  <>
                    <TextPanel label="Background Color" value={selectedComponent.props.backgroundColor ?? ''} onChange={(v) => updateProp(selectedKey!, 'backgroundColor', v)} />
                    <NumberPanel label="Padding" value={selectedComponent.props.padding ?? 0} onChange={(v) => updateProp(selectedKey!, 'padding', v)} />
                    <NumberPanel label="Width" value={selectedComponent.props.width ?? 0} onChange={(v) => updateProp(selectedKey!, 'width', v)} />
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-100 p-3 border-b border-gray-300">
              <h2 className="text-md text-gray-500">Select a component</h2>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
