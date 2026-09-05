"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { normalizePublicOfferId } from "@/lib/public-offers";
import { recordEngagement } from "@/lib/engagement";
import { visionIntakeV1Schema, visionIntakeMessage, type VisionIntakeV1 } from "@/lib/vision-intake";

import { PROJECT_MESSAGE_MAX_LENGTH } from "@/lib/validation";

type State = Omit<VisionIntakeV1, "version"> & {
  name: string;
  email: string;
  company: string;
};
const initial: State = {
  situation: "",
  repeatedPattern: "",
  pastContext: "",
  priorStrategies: "",
  strategyPurpose: "",
  preferences: "",
  petPeeves: "",
  currentFeelingOther: "",
  desiredOutcome: "",
  possibility: "",
  pream: "",
  desiredFeelingOther: "",
  sharedPurpose: "",
  offer: null,
  name: "",
  email: "",
  company: "",
};
const currentFeelings = [
  "stuck",
  "frustrated",
  "overwhelmed",
  "uncertain",
  "restless",
  "hopeful",
] as const;
const desiredFeelings = [
  "clear",
  "confident",
  "relieved",
  "in-control",
  "energized",
  "proud",
] as const;

const reviewFields: [keyof State, string, number][] = [
  ["situation", "Happening now", 1],
  ["repeatedPattern", "What keeps happening", 1],
  ["pastContext", "Past context", 1],
  ["priorStrategies", "What you tried and how it went", 2],
  ["strategyPurpose", "What those attempts were meant to accomplish", 2],
  ["preferences", "How you would like this to work", 2],
  ["petPeeves", "Frustrations and things to avoid", 2],
  ["currentFeeling", "Current feeling", 2],
  ["currentFeelingOther", "Current feeling in your words", 2],
  ["desiredOutcome", "The change you want", 3],
  ["possibility", "Possibilities, hopes, and worries", 3],
  ["pream", "The future you picture", 3],
  ["desiredFeeling", "Desired feeling", 3],
  ["desiredFeelingOther", "Desired feeling in your words", 3],
];

function ContactIntake() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<State>(initial);
  const [status, setStatus] = useState<
    "idle" | "sending" | "error" | "success"
  >("idle");
  const purposeEdited = useRef(false);
  const [errorMessage, setErrorMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const error = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const offer = normalizePublicOfferId(
      params.get("offer") || params.get("offering"),
    );
    setData((v) => ({
      ...v,
      offer:
        offer === "website-improvement"
          ? "website-fix"
          : offer === "ai-operator"
            ? "managed-automation"
            : null,
    }));
  }, [params]);
  useEffect(() => {
    heading.current?.focus();
    recordEngagement({
      event: "intake_step_view",
      route: "contact",
      element: `step_${step}`,
      variant: "match-crib-v1",
    });
  }, [step]);
  useEffect(() => {
    if (status === "error") error.current?.focus();
  }, [status]);
  const set = (key: keyof State, value: string | null) => {
    if (key === "sharedPurpose") purposeEdited.current = true;
    setData((v) => ({
      ...v, [key]: value,
      ...(key === "desiredOutcome" && !purposeEdited.current ? { sharedPurpose: value || "" } : {}),
    }));
    if (status === "error") setStatus("idle");
  };
  const advance = (event: FormEvent) => {
    event.preventDefault();
    recordEngagement({
      event: "intake_step_complete",
      route: "contact",
      element: `step_${step}`,
      variant: "match-crib-v1",
    });
    setStep((v) => Math.min(4, v + 1));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const { name, email, company, ...context } = data;
    const parsed = visionIntakeV1Schema.safeParse({ version: 1, ...context });
    if (!parsed.success) {
      const field = String(parsed.error.issues[0].path[0]);
      const target = reviewFields.find(([key]) => key === field)?.[2] || 4;
      setStep(target);
      setErrorMessage("Please check your answers. Required answers need a little more detail; keep each answer within its character limit.");
      setStatus("error");
      return;
    }
    if (visionIntakeMessage(parsed.data).trim().length > PROJECT_MESSAGE_MAX_LENGTH) {
      setErrorMessage("Your answers together are too long to send. Please shorten a few answers using the edit links. Your answers are still here.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    recordEngagement({
      event: "intake_submit",
      route: "contact",
      element: "guided_intake",
      variant: "match-crib-v1",
    });
    const body = new FormData();
    body.append("name", name);
    body.append("email", email);
    body.append("company", company);
    body.append("intakeContext", JSON.stringify({ version: 1, ...context }));
    if (context.offer)
      body.append(
        "service",
        context.offer === "website-fix" ? "Website Fix" : "Managed Automation",
      );
    try {
      const response = await fetch("/api/projects", { method: "POST", body });
      if (!response.ok) throw new Error();
      setStatus("success");
      recordEngagement({
        event: "intake_success",
        route: "contact",
        element: "guided_intake",
        variant: "match-crib-v1",
      });
    } catch {
      setErrorMessage("We could not send your vision. Your answers are still here. Please try again.");
      setStatus("error");
      recordEngagement({
        event: "intake_error",
        route: "contact",
        element: "guided_intake",
        variant: "match-crib-v1",
      });
    }
  };
  const input =
    "mt-2 min-h-12 w-full rounded-xl border border-[var(--public-ink)]/20 bg-white px-4 py-3 outline-none focus:border-[var(--public-green)] focus:ring-2 focus:ring-[var(--public-green)]/20";
  if (status === "success")
    return (
      <main
        id="main-content"
        className="grid min-h-[72vh] place-items-center bg-[var(--public-cream)] px-5 text-[var(--public-ink)]"
      >
        <section className="max-w-xl text-center">
          <Check className="mx-auto h-12 w-12 text-[var(--public-green)]" />
          <h1 className="mt-6 font-playfair text-4xl font-black">
            Thank you for sharing it.
          </h1>
          <p className="mt-4 leading-7 text-[#50675e]">
            A person will read what you shared and follow up about a possible
            next step. No work, purchase, publication, or authority began
            automatically.
          </p>
        </section>
      </main>
    );
  const titles = [
    "What is happening?",
    "What have you tried?",
    "What would better look and feel like?",
    "Does this sound right?",
  ];
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="bg-[#18372e] text-white">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Share your vision
          </p>
          <h1 className="mt-5 font-playfair text-5xl font-black">
            We’ll listen before suggesting a path.
          </h1>
          <p className="mt-5 max-w-2xl text-[#dce8dd]">
            You do not need a technical brief or a chosen service. Browse all
            four steps first if you like; this starts a conversation only.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div
          role="progressbar"
          aria-label="Vision intake progress"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step}
        >
          <p className="text-sm font-bold">Step {step} of 4</p>
          <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
            {[1, 2, 3, 4].map((number) => (
              <span
                key={number}
                className={`h-1 rounded-full ${number <= step ? "bg-[var(--public-green)]" : "bg-[var(--public-ink)]/15"}`}
              />
            ))}
          </div>
        </div>
        <nav aria-label="Vision intake steps">
          <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
            {titles.map((title, index) => {
              const number = index + 1;
              return (
                <li key={title} className="min-w-0">
                  <button
                    type="button"
                    title={title}
                    aria-label={`Step ${number}: ${title}`}
                    aria-current={step === number ? "step" : undefined}
                    onClick={() => setStep(number)}
                    className={`block min-h-11 w-full whitespace-normal rounded-lg px-1 py-2 text-left text-xs leading-5 sm:text-sm ${step === number ? "font-bold text-[var(--public-ink)]" : "text-[#50675e] hover:text-[var(--public-green)]"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="mr-1 font-bold text-[var(--public-green)]"
                    >
                      {number}.
                    </span>
                    <span aria-hidden="true">{title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <form onSubmit={step === 4 ? submit : advance} className="mt-7">
          <h2
            ref={heading}
            tabIndex={-1}
            className="font-playfair text-4xl font-black outline-none"
          >
            {titles[step - 1]}
          </h2>
          {step === 1 && (
            <div className="mt-8 grid gap-6">
              <p className="rounded-xl bg-[#e4eee6] p-4">
                We’ll understand what is happening before suggesting a path.
              </p>
              <label className="font-semibold">
                The idea or situation
                <textarea
                  required
                  minLength={10}
                  className={input}
                  maxLength={1200}
                  value={data.situation}
                  onChange={(e) => set("situation", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                What keeps happening?
                <textarea
                  required
                  minLength={5}
                  className={input}
                  maxLength={800}
                  value={data.repeatedPattern}
                  onChange={(e) => set("repeatedPattern", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                Relevant past context{" "}
                <span className="font-normal text-[#50675e]">(optional)</span>
                <textarea
                  className={input}
                  maxLength={800}
                  value={data.pastContext}
                  onChange={(e) => set("pastContext", e.target.value)}
                />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="mt-8 grid gap-6">
              <label className="font-semibold">
                What have you tried? How did it go? (optional)
                <textarea
                  className={input}
                  maxLength={1000}
                  value={data.priorStrategies}
                  onChange={(e) => set("priorStrategies", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                What were you hoping those attempts would fix? (optional)
                <textarea
                  className={input}
                  maxLength={800}
                  value={data.strategyPurpose}
                  onChange={(e) => set("strategyPurpose", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                How would you like this to work? (optional)
                <textarea
                  className={input}
                  maxLength={800}
                  value={data.preferences}
                  onChange={(e) => set("preferences", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                What frustrates you most? What should we avoid? (optional)
                <textarea className={input} maxLength={800} value={data.petPeeves}
                  onChange={(e) => set("petPeeves", e.target.value)} />
              </label>
              <fieldset>
                <legend className="font-semibold">
                  How does it feel now?{" "}
                  <span className="font-normal text-[#50675e]">(optional)</span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentFeelings.map((v) => (
                    <label key={v} className="rounded-full border px-3 py-2">
                      <input
                        type="radio"
                        name="currentFeeling"
                        className="mr-2"
                        checked={data.currentFeeling === v}
                        onChange={() => set("currentFeeling", v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
                <label className="mt-4 block font-semibold">
                  Or describe it yourself
                  <input
                    className={input}
                    maxLength={80}
                  value={data.currentFeelingOther}
                    onChange={(e) => set("currentFeelingOther", e.target.value)}
                  />
                </label>
              </fieldset>
            </div>
          )}
          {step === 3 && (
            <div className="mt-8 grid gap-6">
              <label className="font-semibold">
                What needs to be different?
                <textarea
                  required
                  minLength={10}
                  className={input}
                  maxLength={1200}
                  value={data.desiredOutcome}
                  onChange={(e) => set("desiredOutcome", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                What might happen next? What do you hope for or worry about?{" "}
                <span className="font-normal text-[#50675e]">(optional)</span>
                <textarea
                  className={input}
                  maxLength={800}
                  value={data.possibility}
                  onChange={(e) => set("possibility", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                The future you can already picture{" "}
                <span className="block font-normal text-[#50675e]">
                  Optional. Describe the scene or experience that feels possible
                  even though it is not real yet.
                </span>
                <textarea
                  className={input}
                  maxLength={800}
                  value={data.pream}
                  onChange={(e) => set("pream", e.target.value)}
                />
              </label>
              <fieldset>
                <legend className="font-semibold">
                  How should better feel?{" "}
                  <span className="font-normal text-[#50675e]">(optional)</span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {desiredFeelings.map((v) => (
                    <label key={v} className="rounded-full border px-3 py-2">
                      <input
                        type="radio"
                        name="desiredFeeling"
                        className="mr-2"
                        checked={data.desiredFeeling === v}
                        onChange={() => set("desiredFeeling", v)}
                      />
                      {v.replace("-", " ")}
                    </label>
                  ))}
                </div>
                <label className="mt-4 block font-semibold">
                  Or describe it yourself
                  <input
                    className={input}
                    maxLength={80}
                  value={data.desiredFeelingOther}
                    onChange={(e) => set("desiredFeelingOther", e.target.value)}
                  />
                </label>
              </fieldset>
            </div>
          )}
          {step === 4 && (
            <div className="mt-8 grid gap-8">
              <section className="rounded-2xl border bg-white p-6">
                <h3 className="font-playfair text-2xl font-black">
                  What we heard
                </h3>
                <dl className="mt-4 divide-y divide-[var(--public-ink)]/15">
                  {reviewFields.map(([key, label, editingStep]) => data[key] ? (
                    <div key={key} className={`py-4 ${key === "desiredOutcome" ? "rounded-xl bg-[#e4eee6] px-4" : ""}`}>
                      <dt className="flex items-start justify-between gap-4 font-bold">
                        {label}
                        <button type="button" onClick={() => setStep(editingStep)}
                          className="min-h-11 shrink-0 px-2 text-sm text-[var(--public-green)] underline"
                          aria-label={`Edit ${label}`}>Edit</button>
                      </dt>
                      <dd className="whitespace-pre-wrap break-words text-[#50675e]">{data[key]}</dd>
                    </div>
                  ) : null)}
                </dl>
              </section>
              <section>
                <h3 className="font-playfair text-2xl font-black">
                  What you can expect from us
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[#50675e]">
                  <li>We start with what needs to change.</li>
                  <li>You will see what is included before work begins.</li>
                  <li>We begin with one useful piece.</li>
                  <li>Nothing starts until you say yes.</li>
                </ul>
              </section>
              <label className="font-semibold">
                The change you want us to work toward
                <span className="mt-2 block font-normal text-[#50675e]">A person will confirm the scope with you before work begins.</span>
                <textarea
                  required
                  minLength={10}
                  className={input}
                  maxLength={1200}
                  value={data.sharedPurpose}
                  onChange={(e) => set("sharedPurpose", e.target.value)}
                />
              </label>
              <fieldset>
                <legend className="font-semibold">
                  Do either of these sound like the place to start?{" "}
                  <span className="font-normal text-[#50675e]">(optional)</span>
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    [null, "No service selected"],
                    ["website-fix", "Website Fix"],
                    ["managed-automation", "Managed Automation"],
                  ].map(([v, l]) => (
                    <label key={l} className="rounded-xl border bg-white p-4">
                      <input
                        type="radio"
                        name="offer"
                        className="mr-2"
                        checked={data.offer === v}
                        onChange={() => set("offer", v)}
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="font-semibold">
                  Name
                  <input
                    required
                    autoComplete="name"
                    className={input}
                    value={data.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </label>
                <label className="font-semibold">
                  Email
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    className={input}
                    value={data.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </label>
                <label className="font-semibold sm:col-span-2">
                  Company{" "}
                  <span className="font-normal text-[#50675e]">(optional)</span>
                  <input
                    autoComplete="organization"
                    className={input}
                    value={data.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}
          {status === "error" && (
            <p
              ref={error}
              tabIndex={-1}
              role="alert"
              className="mt-8 rounded-xl bg-red-50 p-4 text-red-800"
            >
              {errorMessage}
            </p>
          )}
          <div className="mt-10 flex items-center justify-between border-t pt-7">
            {step > 1 ? (
              <button
                type="button"
                className="min-h-12 px-2 font-bold text-[var(--public-green)] underline"
                onClick={() => setStep((v) => v - 1)}
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              disabled={status === "sending"}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white disabled:opacity-60"
            >
              {step === 4
                ? status === "sending"
                  ? "Sending…"
                  : "Share Your Vision"
                : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="grid min-h-[60vh] place-items-center bg-[var(--public-cream)]"
        >
          Loading…
        </main>
      }
    >
      <ContactIntake />
    </Suspense>
  );
}
