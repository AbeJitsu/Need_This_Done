import { describe, expect, it } from "vitest";
import { PUBLIC_CAPABILITIES } from "@/lib/public-capabilities";
import { PUBLIC_OFFERS } from "@/lib/public-offers";

describe("public offer and capability records", () => {
  it("keeps the two public offer fits concise and distinct", () => {
    expect(PUBLIC_OFFERS["website-improvement"].fit).toBe(
      "One website problem getting in the way.",
    );
    expect(PUBLIC_OFFERS["ai-operator"].fit).toBe(
      "One repeated task taking time.",
    );
  });

  it("keeps the capability map complete and end to end", () => {
    expect(PUBLIC_CAPABILITIES).toHaveLength(6);
    expect(PUBLIC_CAPABILITIES.map(({ title }) => title)).toEqual([
      "Frontends people can use",
      "Backends and APIs that keep work moving",
      "Data that stays useful",
      "Connected tools and services",
      "Agents and automations with a review point",
      "Testing, deployment, and evidence",
    ]);

    for (const capability of PUBLIC_CAPABILITIES) {
      expect(capability.description.trim()).not.toBe("");
      expect(capability.examples).toHaveLength(3);
      expect(new Set(capability.examples).size).toBe(3);
      for (const copy of [capability.title, capability.description, ...capability.examples]) {
        expect(copy).not.toMatch(/illustrative|hypothetical|case study|could look like|not customer results/i);
      }
    }
  });
});
