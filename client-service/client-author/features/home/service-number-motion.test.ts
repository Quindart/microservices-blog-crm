import { describe, expect, it } from "vitest";
import { getServiceNumberMotion } from "./service-number-motion";

describe("getServiceNumberMotion", () => {
  it("reveals service numbers upward with a stagger based on their order", () => {
    const first = getServiceNumberMotion(0, false);
    const third = getServiceNumberMotion(2, false);

    expect(first).toEqual({
      initial: { opacity: 0, y: 24, scale: 0.85 },
      visible: { opacity: 1, y: 0, scale: 1 },
      hover: { scale: 1.08, color: "#9bc0ff" },
      transition: { duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
    });
    expect(third.transition.delay).toBe(0.36);
  });

  it("removes displacement, scaling, and timing when reduced motion is requested", () => {
    expect(getServiceNumberMotion(2, true)).toEqual({
      initial: { opacity: 1, y: 0, scale: 1 },
      visible: { opacity: 1, y: 0, scale: 1 },
      hover: { scale: 1, color: "#70a6ff" },
      transition: { duration: 0, delay: 0, ease: [0.22, 1, 0.36, 1] },
    });
  });
});
