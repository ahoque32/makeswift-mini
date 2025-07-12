"use client";

import { useState, useEffect } from "react";
import { renderComponent, type Component } from "./runtime/runtime";
import { SAMPLE_DATA } from "./runtime/sample-data";
import { Overlay } from "./Overlay";

export function Host() {
  const [data, setData] = useState<Component>(SAMPLE_DATA);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'updateData') {
        setData(event.data.payload);
      } else if (event.data.type === 'enableEditMode') {
        setEditMode(true);
      }
    };

    window.addEventListener('message', handleMessage);
    window.parent.postMessage({type: 'ready'}, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {renderComponent(data, editMode)}
      {editMode && <Overlay />}
    </div>
  );
}
