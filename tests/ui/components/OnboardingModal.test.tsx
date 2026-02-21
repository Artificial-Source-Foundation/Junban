import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingModal } from "../../../src/ui/components/OnboardingModal.js";

vi.mock("lucide-react", () => ({
  CheckCircle2: (props: any) => <svg data-testid="icon-check" {...props} />,
  Sparkles: (props: any) => <svg data-testid="icon-sparkles" {...props} />,
  Type: (props: any) => <svg data-testid="icon-type" {...props} />,
}));

describe("OnboardingModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<OnboardingModal open={false} onComplete={vi.fn()} />);
    expect(container.firstElementChild).toBeNull();
  });

  it("renders first step when open", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    expect(screen.getByText("Welcome to Saydo")).toBeDefined();
  });

  it("navigates to next step on Next click", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Natural Language Input")).toBeDefined();
  });

  it("navigates back on Back click", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Next")); // go to step 2
    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByText("Welcome to Saydo")).toBeDefined();
  });

  it("calls onComplete on Skip", () => {
    const onComplete = vi.fn();
    render(<OnboardingModal open={true} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("Skip"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete on Get Started (last step)", () => {
    const onComplete = vi.fn();
    render(<OnboardingModal open={true} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("Next")); // step 2
    fireEvent.click(screen.getByText("Next")); // step 3
    fireEvent.click(screen.getByText("Get Started"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows Skip on first step, Back on subsequent steps", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    expect(screen.getByText("Skip")).toBeDefined();
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Back")).toBeDefined();
  });
});
