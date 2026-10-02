"use client";

import { useState } from "react";
import { ArrowRight, Check, AlertTriangle } from "lucide-react";

export default function DebuggingLab() {
  const [fixed, setFixed] = useState(false);
  const inputs = ["alex@example.com", " ALEX@EXAMPLE.COM "];
  const keys = inputs.map((email) =>
    fixed ? email.trim().toLowerCase() : email,
  );
  const duplicates = keys.length - new Set(keys).size;
  return (
    <div className="pf-debug-lab">
      <div className="pf-debug-tabs" aria-label="Choose implementation">
        <button
          type="button"
          aria-pressed={!fixed}
          onClick={() => setFixed(false)}
        >
          Original comparison
        </button>
        <button
          type="button"
          aria-pressed={fixed}
          onClick={() => setFixed(true)}
        >
          Normalize first
        </button>
      </div>
      <div className="pf-debug-grid">
        <div>
          <p className="pf-mono">THE SAME EMAIL / TWO INPUTS</p>
          <pre>{inputs.map((value) => JSON.stringify(value)).join("\n")}</pre>
          <p className="pf-mono">COMPARISON KEYS</p>
          <pre>{keys.map((value) => JSON.stringify(value)).join("\n")}</pre>
        </div>
        <div
          className={`pf-debug-outcome ${fixed ? "pf-debug-outcome--fixed" : ""}`}
        >
          {fixed ? (
            <Check size={30} aria-hidden="true" />
          ) : (
            <AlertTriangle size={30} aria-hidden="true" />
          )}
          <h3>
            {duplicates === 1 ? "Duplicate detected." : "Duplicate missed."}
          </h3>
          <p>
            {fixed
              ? "Trimming whitespace and normalizing case before comparison identifies the repeated address."
              : "Comparing the raw strings treats these addresses as different contacts."}
          </p>
          <code>{fixed ? "email.trim().toLowerCase()" : "email"}</code>
        </div>
      </div>
      <p className="pf-small">
        This demonstration runs in the browser. The import example above applies
        the same rule on the server.
      </p>
      <a href="#import" className="pf-text-link">
        Try the duplicate sample in the API{" "}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
