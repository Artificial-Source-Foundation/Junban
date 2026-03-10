import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  CheckCircle2: (props: any) => <svg data-testid="icon-check" {...props} />,
  Sparkles: (props: any) => <svg data-testid="icon-sparkles" {...props} />,
  Sun: (props: any) => <svg data-testid="icon-sun" {...props} />,
  Moon: (props: any) => <svg data-testid="icon-moon" {...props} />,
  Snowflake: (props: any) => <svg data-testid="icon-snowflake" {...props} />,
  Minus: (props: any) => <svg data-testid="icon-minus" {...props} />,
  Layers: (props: any) => <svg data-testid="icon-layers" {...props} />,
  Rocket: (props: any) => <svg data-testid="icon-rocket" {...props} />,
  MessageSquare: (props: any) => <svg data-testid="icon-message" {...props} />,
  Lightbulb: (props: any) => <svg data-testid="icon-lightbulb" {...props} />,
  Command: (props: any) => <svg data-testid="icon-command" {...props} />,
  Puzzle: (props: any) => <svg data-testid="icon-puzzle" {...props} />,
  Check: (props: any) => <svg data-testid="icon-check-small" {...props} />,
}));

const mockUpdateSetting = vi.fn();

vi.mock("../../../src/ui/context/SettingsContext.js", () => ({
  useGeneralSettings: () => ({
    settings: { accent_color: "#3b82f6" },
    loaded: true,
    updateSetting: mockUpdateSetting,
  }),
}));

vi.mock("../../../src/ui/themes/manager.js", () => ({
  themeManager: {
    setTheme: vi.fn(),
  },
}));

import { OnboardingModal } from "../../../src/ui/components/OnboardingModal.js";

describe("OnboardingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(<OnboardingModal open={false} onComplete={vi.fn()} />);
    expect(container.firstElementChild).toBeNull();
  });

  it("renders welcome step when open", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    expect(screen.getByText("Welcome to Saydo")).toBeDefined();
  });

  it("navigates to theme step on Get Started click", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(screen.getByText("Pick your look")).toBeDefined();
  });

  it("navigates to preset step from theme step", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Get Started")); // step 0 -> 1
    fireEvent.click(screen.getByText("Next")); // step 1 -> 2
    expect(screen.getByText("How much do you want to see?")).toBeDefined();
  });

  it("navigates back from theme step to welcome", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Get Started")); // step 0 -> 1
    fireEvent.click(screen.getByText("Back")); // step 1 -> 0
    expect(screen.getByText("Welcome to Saydo")).toBeDefined();
  });

  it("shows preset options on step 2", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Get Started")); // 0 -> 1
    fireEvent.click(screen.getByText("Next")); // 1 -> 2
    expect(screen.getByText("Minimal")).toBeDefined();
    expect(screen.getByText("Standard")).toBeDefined();
    expect(screen.getByText("Everything")).toBeDefined();
  });

  it("navigates through AI step to ready step", () => {
    render(<OnboardingModal open={true} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Get Started")); // 0 -> 1
    fireEvent.click(screen.getByText("Next")); // 1 -> 2
    fireEvent.click(screen.getByText("Next")); // 2 -> 3
    expect(screen.getByText("AI Assistant")).toBeDefined();
    fireEvent.click(screen.getByText("Set up later")); // 3 -> 4
    expect(screen.getByText("You're all set!")).toBeDefined();
  });

  it("calls onComplete on Start using Saydo", () => {
    const onComplete = vi.fn();
    render(<OnboardingModal open={true} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("Get Started")); // 0 -> 1
    fireEvent.click(screen.getByText("Next")); // 1 -> 2
    fireEvent.click(screen.getByText("Next")); // 2 -> 3
    fireEvent.click(screen.getByText("Set up later")); // 3 -> 4
    fireEvent.click(screen.getByText("Start using Saydo"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
