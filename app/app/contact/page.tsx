"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { normalizePublicOfferId } from "@/lib/public-offers";
import { recordEngagement } from "@/lib/engagement";
import { PUBLIC_PRIMARY_ACTION, PUBLIC_VARIANT } from "@/lib/public-journey";
import { PROJECT_MESSAGE_MAX_LENGTH } from "@/lib/validation";

type StartingPoint = "" | "website-fix" | "managed-automation";

type FormState = {
  message: string;
  name: string;
  email: string;
  company: string;
  service: StartingPoint;
};

const initial: FormState = {
  message: "",
  name: "",
  email: "",
  company: "",
  service: "",
};

function ContactForm() {
  const params = useSearchParams();
  const [data, setData] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const error = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const offer = normalizePublicOfferId(params.get("offer") || params.get("offering"));
    setData((current) => ({
      ...current,
      service:
        offer === "website-improvement"
          ? "website-fix"
          : offer === "ai-operator"
            ? "managed-automation"
            : current.service,
    }));
  }, [params]);

  useEffect(() => {
    if (status === "error") error.current?.focus();
    if (status === "success") heading.current?.focus();
  }, [status]);

  const set = (key: keyof FormState, value: string) => {
    setData((current) => ({ ...current, [key]: value }));
    if (status === "error") setStatus("idle");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    recordEngagement({
      event: "intake_submit",
      route: "contact",
      element: "conversation_form",
      variant: PUBLIC_VARIANT,
    });

    const body = new FormData();
    body.append("name", data.name);
    body.append("email", data.email);
    body.append("company", data.company);
    body.append("message", data.message);
    if (data.service) {
      body.append("service", data.service === "website-fix" ? "Website Fix" : "Managed Automation");
    }

    try {
      const response = await fetch("/api/projects", { method: "POST", body });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || "We could not send your message. Please try again.");
      }
      setStatus("success");
      recordEngagement({
        event: "intake_success",
        route: "contact",
        element: "conversation_form",
        variant: PUBLIC_VARIANT,
      });
    } catch (submissionError) {
      setErrorMessage(submissionError instanceof Error ? submissionError.message : "We could not send your message. Please try again.");
      setStatus("error");
      recordEngagement({
        event: "intake_error",
        route: "contact",
        element: "conversation_form",
        variant: PUBLIC_VARIANT,
      });
    }
  };

  const input = "mt-2 min-h-12 w-full rounded-xl border border-[var(--public-ink)]/20 bg-white px-4 py-3 outline-none focus:border-[var(--public-green)] focus:ring-2 focus:ring-[var(--public-green)]/20";

  if (status === "success") {
    return (
      <main id="main-content" className="grid min-h-[72vh] place-items-center bg-[var(--public-cream)] px-5 text-[var(--public-ink)]">
        <section className="max-w-xl text-center">
          <Check className="mx-auto h-12 w-12 text-[var(--public-green)]" aria-hidden="true" />
          <h1 ref={heading} tabIndex={-1} className="mt-6 font-playfair text-4xl font-black outline-none">
            Thanks for reaching out.
          </h1>
          <p className="mt-4 leading-7 text-[#50675e]">
            I&apos;ll read what you sent and follow up with a practical next step.
          </p>
          <Link href="/work" className="public-explore mt-6">See selected work</Link>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero bg-[#18372e] text-white">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">{PUBLIC_PRIMARY_ACTION.label}</p>
          <h1 className="mt-5 font-playfair text-5xl font-black">Bring the technical problem as it is.</h1>
          <p className="mt-5 max-w-2xl text-[#dce8dd]">
            Tell me what you are building, what is getting in the way, or what you
            want to understand better. A polished brief is not required.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <form onSubmit={submit} className="public-intake-form rounded-2xl border border-[var(--public-ink)]/10 bg-white/70 p-6 sm:p-8">
          <h2 ref={heading} tabIndex={-1} className="font-playfair text-3xl font-black leading-tight outline-none sm:text-4xl">
            What are you building or trying to fix?
          </h2>
          <p className="mt-4 leading-7 text-[var(--public-muted)]">
            A few sentences about the situation, the desired result, or the question
            you are trying to answer is enough to begin.
          </p>

          <div className="mt-8 grid gap-6">
            <label className="font-semibold" htmlFor="message">
              Your message
              <textarea
                id="message"
                required
                minLength={10}
                maxLength={PROJECT_MESSAGE_MAX_LENGTH}
                className={`${input} min-h-40`}
                value={data.message}
                onChange={(event) => set("message", event.target.value)}
              />
              <span className="mt-2 block text-sm font-normal text-[#50675e]">No technical vocabulary required.</span>
            </label>

            <fieldset>
              <legend className="font-semibold">
                Is there a useful starting point?
                <span className="ml-1 font-normal text-[#50675e]">(optional)</span>
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  ["", "Not sure yet"],
                  ["website-fix", "Website work"],
                  ["managed-automation", "Automation"],
                ].map(([value, label]) => (
                  <label key={label} className="rounded-xl border border-[var(--public-ink)]/15 bg-white p-4">
                    <input
                      type="radio"
                      name="service"
                      value={value}
                      className="mr-2"
                      checked={data.service === value}
                      onChange={() => set("service", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="font-semibold" htmlFor="name">
                Your name
                <input id="name" required autoComplete="name" className={input} value={data.name} onChange={(event) => set("name", event.target.value)} />
              </label>
              <label className="font-semibold" htmlFor="email">
                Your email
                <input id="email" required type="email" autoComplete="email" className={input} value={data.email} onChange={(event) => set("email", event.target.value)} />
              </label>
              <label className="font-semibold sm:col-span-2" htmlFor="company">
                Company or project name <span className="font-normal text-[#50675e]">(optional)</span>
                <input id="company" autoComplete="organization" className={input} value={data.company} onChange={(event) => set("company", event.target.value)} />
              </label>
            </div>
          </div>

          {status === "error" && (
            <p ref={error} tabIndex={-1} role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-800">
              {errorMessage}
            </p>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-[var(--public-ink)]/10 pt-7">
            <Link href="/work" className="public-explore">Review selected work</Link>
            <button type="submit" disabled={status === "sending"} className="public-button inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white disabled:opacity-60">
              {status === "sending" ? "Sending…" : PUBLIC_PRIMARY_ACTION.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<main id="main-content" className="grid min-h-[60vh] place-items-center bg-[var(--public-cream)]">Loading…</main>}>
      <ContactForm />
    </Suspense>
  );
}
