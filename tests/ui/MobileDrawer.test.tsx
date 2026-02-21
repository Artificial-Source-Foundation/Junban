import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileDrawer } from "../../src/ui/components/MobileDrawer.js";

describe("MobileDrawer", () => {
  afterEach(() => {
    // Reset body overflow
    document.body.style.overflow = "";
  });

  it("renders children when open", () => {
    render(
      <MobileDrawer open={true} onClose={vi.fn()}>
        <p>Drawer Content</p>
      </MobileDrawer>,
    );
    expect(screen.getByText("Drawer Content")).toBeDefined();
  });

  it("renders children when closed (but hidden)", () => {
    render(
      <MobileDrawer open={false} onClose={vi.fn()}>
        <p>Drawer Content</p>
      </MobileDrawer>,
    );
    // Content is in the DOM but the wrapper is invisible
    expect(screen.getByText("Drawer Content")).toBeDefined();
  });

  it("has translate-x-0 when open", () => {
    render(
      <MobileDrawer open={true} onClose={vi.fn()}>
        <p>Content</p>
      </MobileDrawer>,
    );
    const drawer = screen.getByRole("dialog");
    expect(drawer.className).toContain("translate-x-0");
  });

  it("has -translate-x-full when closed", () => {
    render(
      <MobileDrawer open={false} onClose={vi.fn()}>
        <p>Content</p>
      </MobileDrawer>,
    );
    const drawer = screen.getByRole("dialog", { hidden: true });
    expect(drawer.className).toContain("-translate-x-full");
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <MobileDrawer open={true} onClose={onClose}>
        <p>Content</p>
      </MobileDrawer>,
    );
    // Click the backdrop (first child div of the root)
    const backdrop = container.firstElementChild!.firstElementChild!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <MobileDrawer open={true} onClose={onClose}>
        <p>Content</p>
      </MobileDrawer>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll when open", () => {
    render(
      <MobileDrawer open={true} onClose={vi.fn()}>
        <p>Content</p>
      </MobileDrawer>,
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(
      <MobileDrawer open={true} onClose={vi.fn()}>
        <p>Content</p>
      </MobileDrawer>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <MobileDrawer open={false} onClose={vi.fn()}>
        <p>Content</p>
      </MobileDrawer>,
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("traps focus within drawer when open", () => {
    render(
      <MobileDrawer open={true} onClose={vi.fn()}>
        <button data-testid="btn-a">A</button>
        <button data-testid="btn-b">B</button>
      </MobileDrawer>,
    );
    const btnA = screen.getByTestId("btn-a");
    const btnB = screen.getByTestId("btn-b");

    // Focus should be on first focusable element
    expect(document.activeElement).toBe(btnA);

    // Tab from last element should wrap to first
    btnB.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(btnA);

    // Shift+Tab from first should wrap to last
    btnA.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(btnB);
  });

  it("restores focus when drawer closes", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <MobileDrawer open={true} onClose={vi.fn()}>
        <button>Inside</button>
      </MobileDrawer>,
    );

    // Focus moved into drawer
    expect(document.activeElement).not.toBe(trigger);

    // Close drawer — focus should return
    rerender(
      <MobileDrawer open={false} onClose={vi.fn()}>
        <button>Inside</button>
      </MobileDrawer>,
    );
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
