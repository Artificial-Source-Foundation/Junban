import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompletionRing } from "../../../src/ui/components/CompletionRing.js";

describe("CompletionRing", () => {
  it("renders completed/total text", () => {
    render(<CompletionRing completed={3} total={10} />);
    expect(screen.getByText("3/10")).toBeDefined();
  });

  it("has aria-label with completion info", () => {
    render(<CompletionRing completed={5} total={8} />);
    expect(screen.getByLabelText("5 of 8 tasks completed")).toBeDefined();
  });

  it("renders SVG with two circles", () => {
    const { container } = render(<CompletionRing completed={2} total={4} />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });

  it("handles zero total without crashing", () => {
    render(<CompletionRing completed={0} total={0} />);
    expect(screen.getByText("0/0")).toBeDefined();
  });

  it("accepts custom size", () => {
    const { container } = render(<CompletionRing completed={1} total={2} size={48} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("48");
    expect(svg?.getAttribute("height")).toBe("48");
  });
});
