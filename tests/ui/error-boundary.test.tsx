import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../../src/ui/components/ErrorBoundary.js";

function ThrowingComponent({ error }: { error: Error }) {
  throw error;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for expected error boundary logs
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("boom")} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("displays error message", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test error message")} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Test error message")).toBeDefined();
  });

  it("resets on Try Again click", () => {
    let shouldThrow = true;

    function MaybeThrow() {
      if (shouldThrow) throw new Error("boom");
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();

    shouldThrow = false;
    fireEvent.click(screen.getByText("Try Again"));

    expect(screen.getByText("Recovered")).toBeDefined();
  });
});
