"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const canRetry = /fetch|network|api|load|data/i.test(error.message);

  return (
    <main
      id="main-content"
      className="grid min-h-[65vh] place-items-center bg-[#f7f4ed] px-5 text-center text-[#183229]"
    >
      <section className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
          Something got in the way
        </p>
        <h1 className="mt-5 font-playfair text-5xl font-black">
          We could not open this page right now.
        </h1>
        <p className="mt-5 leading-7 text-[#50675e]">

          {canRetry
            ? "Try this page again."
            : "You can return to the beginning and keep exploring."}
        </p>
        {canRetry ? (
          <button
            type="button"
            onClick={reset}
            className="mt-8 min-h-12 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white"
          >
            Try Again
          </button>
        ) : (
          <Link
            href="/"
            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white"
          >
            Return Home
          </Link>
        )}
        <p className="mt-5">
          <Link
            href="/contact"
            className="font-semibold text-[#126b4e] underline"
          >
            Share Your Vision instead
          </Link>
        </p>
      </section>
    </main>
  );
}
