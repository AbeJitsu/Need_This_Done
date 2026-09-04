"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { normalizePublicOfferId } from "@/lib/public-offers";
import { recordEngagement } from "@/lib/engagement";
import type { VisionIntakeV1 } from "@/lib/vision-intake";

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

function ContactIntake() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<State>(initial);
  const [status, setStatus] = useState<
    "idle" | "sending" | "error" | "success"
  >("idle");
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
    setData((v) => ({ ...v, [key]: value }));
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
    if (step === 3 && !data.sharedPurpose)
      setData((v) => ({
        ...v,
        sharedPurpose: `Create ${v.desiredOutcome.trim()} by addressing ${v.repeatedPattern.trim()}.`,
      }));
    setStep((v) => Math.min(4, v + 1));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      data.situation.trim().length < 10 ||
      data.repeatedPattern.trim().length < 5
    ) {
      setStep(1);
      return;
    }
    if (data.desiredOutcome.trim().length < 10) {
      setStep(3);
      return;
    }
    setStatus("sending");
    recordEngagement({
      event: "intake_submit",
      route: "contact",
      element: "guided_intake",
      variant: "match-crib-v1",
    });
    const { name, email, company, ...context } = data;
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
    "mt-2 min-h-12 w-full rounded-xl border border-[#183229]/20 bg-white px-4 py-3 outline-none focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20";
  if (status === "success")
    return (
      <main
        id="main-content"
        className="grid min-h-[72vh] place-items-center bg-[#f7f4ed] px-5 text-[#183229]"
      >
        <section className="max-w-xl text-center">
          <Check className="mx-auto h-12 w-12 text-[#126b4e]" />
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
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="bg-[#18372e] text-white">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
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
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
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
                className={`h-1 rounded-full ${number <= step ? "bg-[#126b4e]" : "bg-[#183229]/15"}`}
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
                    className={`block min-h-11 w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-lg px-1 py-2 text-left text-xs leading-5 sm:text-sm ${step === number ? "font-bold text-[#183229]" : "text-[#50675e] hover:text-[#126b4e]"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="mr-1 font-bold text-[#126b4e]"
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
                  value={data.situation}
                  onChange={(e) => set("situation", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                The pattern that keeps happening
                <textarea
                  required
                  minLength={5}
                  className={input}
                  value={data.repeatedPattern}
                  onChange={(e) => set("repeatedPattern", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                Relevant past context{" "}
                <span className="font-normal text-[#50675e]">(optional)</span>
                <textarea
                  className={input}
                  value={data.pastContext}
                  onChange={(e) => set("pastContext", e.target.value)}
                />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="mt-8 grid gap-6">
              <label className="font-semibold">
                What have you already tried?
                <textarea
                  className={input}
                  value={data.priorStrategies}
                  onChange={(e) => set("priorStrategies", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                What were you hoping those attempts would fix?
                <textarea
                  className={input}
                  value={data.strategyPurpose}
                  onChange={(e) => set("strategyPurpose", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                What has been especially frustrating, or what do you want to
                avoid?
                <textarea
                  className={input}
                  value={data.preferences}
                  onChange={(e) => set("preferences", e.target.value)}
                />
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
                  value={data.desiredOutcome}
                  onChange={(e) => set("desiredOutcome", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                What becomes possible when this is resolved?{" "}
                <span className="font-normal text-[#50675e]">(optional)</span>
                <textarea
                  className={input}
                  value={data.possibility}
                  onChange={(e) => set("possibility", e.target.value)}
                />
              </label>
              <label className="font-semibold">
                The future you can already picture{" "}
                <span className="block font-normal text-[#50675e]">
                  Optional—describe the scene or experience that feels possible
                  even though it is not real yet.
                </span>
                <textarea
                  className={input}
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
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="font-bold">Happening now</dt>
                    <dd className="whitespace-pre-wrap text-[#50675e]">
                      {data.situation}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">Better looks like</dt>
                    <dd className="whitespace-pre-wrap text-[#50675e]">
                      {data.desiredOutcome}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="mt-4 text-sm font-bold text-[#126b4e] underline"
                  onClick={() => setStep(1)}
                >
                  Edit answers
                </button>
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
                The change we agree to work toward
                <textarea
                  required
                  minLength={10}
                  className={input}
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
              We could not send your vision. Your answers are still here. Please
              try again.
            </p>
          )}
          <div className="mt-10 flex items-center justify-between border-t pt-7">
            {step > 1 ? (
              <button
                type="button"
                className="min-h-12 px-2 font-bold text-[#126b4e] underline"
                onClick={() => setStep((v) => v - 1)}
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              disabled={status === "sending"}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white disabled:opacity-60"
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
          className="grid min-h-[60vh] place-items-center bg-[#f7f4ed]"
        >
          Loading…
        </main>
      }
    >
      <ContactIntake />
    </Suspense>
  );
}
