import { describe, expect, it } from "vitest";
import {
  getPublicExampleAnchor,
  getPublicExampleHref,
  PUBLIC_EXAMPLES,
  PUBLIC_EXAMPLE_IDS,
  PUBLIC_OFFERS,
  PUBLIC_OFFER_IDS,
} from "@/lib/public-offers";

describe("public offer and example records", () => {
  it("keeps the two public offer fits concise and distinct", () => {
    expect(PUBLIC_OFFERS["website-improvement"].fit).toBe(
      "One website problem getting in the way.",
    );
    expect(PUBLIC_OFFERS["ai-operator"].fit).toBe(
      "One repeated task taking time.",
    );
  });

  it("contains exactly three complete illustrative stories", () => {
    expect(PUBLIC_EXAMPLE_IDS).toHaveLength(3);
    expect(Object.keys(PUBLIC_EXAMPLES)).toEqual([...PUBLIC_EXAMPLE_IDS]);

    for (const exampleId of PUBLIC_EXAMPLE_IDS) {
      const example = PUBLIC_EXAMPLES[exampleId];
      const keys = Object.keys(example).sort();
      const expectedKeys = ["after", "before", "change"];
      if (example.relatedOfferId) expectedKeys.push("relatedOfferId");

      expect(keys).toEqual(expectedKeys.sort());
      for (const copy of [example.before, example.after, example.change]) {
        expect(copy.trim()).not.toBe("");
        expect(copy).not.toMatch(/\$|\b(?:price|priced|total)\b|\b\d+\b/i);
      }
      if (example.relatedOfferId) {
        expect(PUBLIC_OFFER_IDS).toContain(example.relatedOfferId);
      }
    }
  });

  it("derives story anchors from related offer destinations", () => {
    expect(getPublicExampleAnchor("website-fix")).toBe("website-fix");
    expect(getPublicExampleAnchor("managed-automation")).toBe("managed-automation");
    expect(getPublicExampleAnchor("first-step")).toBe("first-step");
    expect(getPublicExampleHref("website-fix")).toBe("/work#website-fix");
    expect(getPublicExampleHref("managed-automation")).toBe("/work#managed-automation");
    expect(getPublicExampleHref("first-step")).toBe("/work#first-step");
  });
});
