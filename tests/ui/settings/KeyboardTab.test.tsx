import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  Search: (props: any) => <svg data-testid="search-icon" {...props} />,
}));

const mockGetAll = vi.fn();
const mockSubscribe = vi.fn().mockReturnValue(() => {});
const mockRebind = vi.fn();
const mockResetToDefault = vi.fn();
const mockToJSON = vi.fn().mockReturnValue({});
const mockUpdateSetting = vi.fn();

vi.mock("../../../src/ui/shortcutManagerInstance.js", () => ({
  shortcutManager: {
    getAll: (...args: any[]) => mockGetAll(...args),
    subscribe: (...args: any[]) => mockSubscribe(...args),
    rebind: (...args: any[]) => mockRebind(...args),
    resetToDefault: (...args: any[]) => mockResetToDefault(...args),
    toJSON: (...args: any[]) => mockToJSON(...args),
  },
}));

vi.mock("../../../src/ui/api/index.js", () => ({
  api: {
    setAppSetting: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../../src/ui/context/SettingsContext.js", () => ({
  useGeneralSettings: () => ({
    settings: { feature_chords: "true" },
    updateSetting: mockUpdateSetting,
  }),
}));

import { KeyboardTab } from "../../../src/ui/views/settings/KeyboardTab.js";

describe("KeyboardTab", () => {
  const shortcuts = [
    { id: "new-task", description: "New task", currentKey: "ctrl+n", defaultKey: "ctrl+n" },
    { id: "search", description: "Search", currentKey: "ctrl+k", defaultKey: "ctrl+k" },
    {
      id: "custom",
      description: "Custom action",
      currentKey: "ctrl+shift+x",
      defaultKey: "ctrl+x",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockReturnValue(shortcuts);
  });

  it("renders keyboard behavior controls", () => {
    render(<KeyboardTab />);
    expect(screen.getByText("Keyboard Behavior")).toBeDefined();
    expect(screen.getByText("Keyboard chords")).toBeDefined();
    expect(
      screen.getByText("Jump around the app with multi-key shortcuts like g then i"),
    ).toBeDefined();
  });

  it("toggles keyboard chords from the keyboard tab", () => {
    render(<KeyboardTab />);
    const label = screen.getByText("Keyboard chords");
    const row = label.closest(".flex")!;
    const toggle = row.querySelector("button")!;

    fireEvent.click(toggle);

    expect(mockUpdateSetting).toHaveBeenCalledWith("feature_chords", "false");
  });

  it("renders shortcut list", () => {
    render(<KeyboardTab />);
    expect(screen.getByText("Keyboard Shortcuts")).toBeDefined();
    expect(screen.getByText("New task")).toBeDefined();
    expect(screen.getByText("Search")).toBeDefined();
  });

  it("displays current key bindings", () => {
    render(<KeyboardTab />);
    expect(screen.getByText("ctrl+n")).toBeDefined();
    expect(screen.getByText("ctrl+k")).toBeDefined();
  });

  it("renders Edit buttons for each shortcut", () => {
    render(<KeyboardTab />);
    const editButtons = screen.getAllByText("Edit");
    expect(editButtons.length).toBe(3);
  });

  it("shows Reset button for modified shortcut", () => {
    render(<KeyboardTab />);
    const resetButtons = screen.getAllByText("Reset");
    expect(resetButtons.length).toBe(1); // Only custom has currentKey !== defaultKey
  });

  it("enters recording mode on Edit click", () => {
    render(<KeyboardTab />);
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);
    expect(screen.getByText("Press keys...")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("filters shortcuts by search query", () => {
    render(<KeyboardTab />);
    const input = screen.getByPlaceholderText("Search shortcuts...");
    fireEvent.change(input, { target: { value: "Search" } });
    expect(screen.getByText("Search")).toBeDefined();
    expect(screen.queryByText("New task")).toBeNull();
  });

  it("shows no results message for non-matching search", () => {
    render(<KeyboardTab />);
    const input = screen.getByPlaceholderText("Search shortcuts...");
    fireEvent.change(input, { target: { value: "xyznonexistent" } });
    expect(screen.getByText("No shortcuts match your search.")).toBeDefined();
  });

  it("calls resetToDefault when Reset is clicked", () => {
    render(<KeyboardTab />);
    fireEvent.click(screen.getByText("Reset"));
    expect(mockResetToDefault).toHaveBeenCalledWith("custom");
  });
});
