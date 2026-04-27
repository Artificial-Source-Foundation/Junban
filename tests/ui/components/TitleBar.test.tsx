import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TitleBar } from "../../../src/ui/components/TitleBar.js";

const windowApi = vi.hoisted(() => ({
  minimize: vi.fn().mockResolvedValue(undefined),
  maximize: vi.fn().mockResolvedValue(undefined),
  unmaximize: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  startDragging: vi.fn().mockResolvedValue(undefined),
  isMaximized: vi.fn().mockResolvedValue(false),
  onResized: vi.fn().mockResolvedValue(vi.fn()),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => windowApi,
}));

describe("TitleBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    windowApi.isMaximized.mockResolvedValue(false);
    windowApi.onResized.mockResolvedValue(vi.fn());
  });

  it("renders accessible window controls", async () => {
    render(<TitleBar />);

    expect(screen.getByRole("button", { name: "Minimize window" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Maximize window" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close window" })).toBeInTheDocument();

    await waitFor(() => {
      expect(windowApi.onResized).toHaveBeenCalled();
    });
  });

  it("calls Tauri window APIs from controls", async () => {
    render(<TitleBar />);

    fireEvent.click(screen.getByRole("button", { name: "Minimize window" }));
    fireEvent.click(screen.getByRole("button", { name: "Maximize window" }));
    fireEvent.click(screen.getByRole("button", { name: "Close window" }));

    await waitFor(() => {
      expect(windowApi.minimize).toHaveBeenCalled();
      expect(windowApi.maximize).toHaveBeenCalled();
      expect(windowApi.close).toHaveBeenCalled();
    });
  });

  it("starts dragging from the empty titlebar surface", async () => {
    const { container } = render(<TitleBar />);
    const dragSurface = container.querySelector(".flex-1");
    expect(dragSurface).not.toBeNull();

    fireEvent.mouseDown(dragSurface!, { button: 0 });
    fireEvent.mouseDown(dragSurface!, { button: 2 });

    await waitFor(() => {
      expect(windowApi.startDragging).toHaveBeenCalledTimes(1);
    });
  });

  it("syncs restore state after resize events", async () => {
    let resizeHandler: (() => void) | undefined;
    windowApi.onResized.mockImplementation(async (handler: () => void) => {
      resizeHandler = handler;
      return vi.fn();
    });

    render(<TitleBar />);

    await waitFor(() => {
      expect(windowApi.onResized).toHaveBeenCalled();
    });

    windowApi.isMaximized.mockResolvedValue(true);
    resizeHandler?.();

    expect(await screen.findByRole("button", { name: "Restore window" })).toBeInTheDocument();
  });
});
