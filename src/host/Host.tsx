"use client";

import { useEffect } from "react";
import { initHostCommunication, onBuilderMessage, sendToBuilder } from "./hostComms";
import { renderComponent } from "./runtime/runtime";
import { SAMPLE_DATA } from "./runtime/sample-data";

export function Host() {
  useEffect(() => {
    const allowedOrigin = window.location.origin; // Use same origin for local testing
    initHostCommunication(allowedOrigin);

    // Test handler: Log incoming messages from builder and respond
    onBuilderMessage<{ message: string }>('TEST_FROM_BUILDER', (payload) => {
      console.log('Received from builder:', payload.message);

      // Send a test response back
      sendToBuilder({ type: 'TEST_FROM_HOST', payload: { greeting: 'Hello from host!' } });
    });
  }, []);

  return renderComponent(SAMPLE_DATA);
}
