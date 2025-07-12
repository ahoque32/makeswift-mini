"use client";

import { useState, useEffect } from "react";
import { renderComponent, type Component } from "./runtime/runtime";
import { SAMPLE_DATA } from "./runtime/sample-data";

export function Host() {
  const [data, setData] = useState<Component>(SAMPLE_DATA);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'updateData') {
        setData(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    window.parent.postMessage({type: 'ready'}, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return renderComponent(data);
}
