"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Download, Braces } from "lucide-react";
import { importSamples } from "@/lib/portfolio-examples";
import type { ImportPreview } from "@/lib/portfolio-import";

export default function ImportInspector() {
  const [input, setInput] = useState(
    JSON.stringify(importSamples.clean, null, 2),
  );
  const [result, setResult] = useState<ImportPreview | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  function edit(value: string) {
    request.current?.abort();
    request.current = null;
    setPending(false);
    setInput(value);
    setResult(null);
    setStatus(null);
    setError("");
  }
  async function run() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError("");
    setResult(null);
    setStatus(null);
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/examples/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: input,
        signal: controller.signal,
      });
      const data = await response.json();
      if (request.current !== controller) return;
      setStatus(response.status);
      if (
        (response.ok || response.status === 422) &&
        Array.isArray(data.records) &&
        Array.isArray(data.issues)
      )
        setResult(data);
      else
        setError(
          data.error || "The request could not be completed. Try again.",
        );
    } catch {
      if (request.current === controller)
        setError(
          "The server could not be reached. Your input is still here; try again.",
        );
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) setPending(false);
    }
  }
  function download() {
    if (!result?.ok) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result.records, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "validated-contacts.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="pf-import">
      <div className="pf-import-input">
        <div className="pf-panel-label">
          <Braces size={17} aria-hidden="true" />
          <span>01 / Input</span>
          <span className="pf-mono">JSON</span>
        </div>
        <div className="pf-sample-buttons" aria-label="Load sample data">
          {(
            [
              ["clean", "Clean data"],
              ["invalid", "Invalid fields"],
              ["duplicate", "Duplicate emails"],
            ] as const
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => edit(JSON.stringify(importSamples[key], null, 2))}
            >
              {label}
            </button>
          ))}
        </div>
        <label htmlFor="import-json" className="pf-mono">
          Contact records
        </label>
        <textarea
          id="import-json"
          spellCheck={false}
          maxLength={12288}
          value={input}
          onChange={(event) => edit(event.target.value)}
          aria-describedby="import-hint"
        />
        <p id="import-hint" className="pf-small">
          Use fictional data. The server previews up to 25 rows and stores
          nothing.
        </p>
        <button
          type="button"
          className="pf-button pf-button--green"
          onClick={run}
          disabled={pending}
        >
          {pending ? "Checking on the server…" : "Run server validation"}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="pf-import-result" aria-live="polite" aria-busy={pending}>
        <div className="pf-panel-label">
          <span>02 / Server response</span>
          {status !== null && (
            <span
              className={`pf-response-code ${status === 200 ? "pf-response-code--ok" : ""}`}
            >
              HTTP {status}
            </span>
          )}
        </div>
        {error && (
          <p role="alert" className="pf-error">
            {error}
          </p>
        )}
        {!result && !error && (
          <div className="pf-response-empty">
            <Braces size={35} aria-hidden="true" />
            <h3>
              {pending
                ? "Waiting for the API"
                : "A real request. A readable result."}
            </h3>
            <p>
              Choose a sample, edit a field, and run the check. The response
              comes from the Next.js API.
            </p>
          </div>
        )}
        {result && (
          <>
            <h3 className="pf-result-heading">
              {result.ok ? "Ready to use." : "Something needs attention."}
            </h3>
            <p>
              {result.records.length} ready{" "}
              {result.records.length === 1 ? "row" : "rows"} ·{" "}
              {result.issues.length}{" "}
              {result.issues.length === 1 ? "issue" : "issues"}
            </p>
            {result.issues.length > 0 && (
              <ul className="pf-import-issues">
                {result.issues.map((issue, index) => (
                  <li key={index}>
                    <strong>
                      Row {issue.row} / {issue.field}
                    </strong>
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            )}
            {result.records.length > 0 && (
              <ul className="pf-valid-records">
                {result.records.map((record) => (
                  <li key={record.email}>
                    <Check size={16} aria-hidden="true" />
                    <div>
                      <strong>{record.name}</strong>
                      <span>{record.email}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {result.ok && (
              <button
                type="button"
                className="pf-quiet-button"
                onClick={download}
              >
                <Download size={16} aria-hidden="true" /> Download clean JSON
              </button>
            )}
            <details className="pf-response-details">
              <summary>Inspect the JSON response</summary>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
