import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  ChevronDown: (props: any) => <svg data-testid="chevron-down" {...props} />,
  ChevronUp: (props: any) => <svg data-testid="chevron-up" {...props} />,
  Globe: (props: any) => <svg data-testid="globe" {...props} />,
  Loader2: (props: any) => <svg data-testid="loader" {...props} />,
}));

vi.mock("../../../src/utils/tauri.js", () => ({
  isTauri: () => true,
}));

// Mutable mock for readOnly to test lock state combinations
let mockReadOnly = false;

vi.mock("../../../src/ui/context/SettingsContext.js", () => ({
  useGeneralSettings: () => ({
    readOnly: mockReadOnly,
  }),
}));

const mockGetStorageInfo = vi.fn();
const mockExportAllData = vi.fn();
const mockImportTasks = vi.fn();
const mockListProjects = vi.fn();
const mockGetDesktopRemoteServerStatus = vi.fn();
const mockGetDesktopRemoteServerConfig = vi.fn();
const mockUpdateDesktopRemoteServerConfig = vi.fn();
const mockStartDesktopRemoteServer = vi.fn();
const mockStopDesktopRemoteServer = vi.fn();

vi.mock("../../../src/ui/api/index.js", () => ({
  api: {
    getStorageInfo: (...args: any[]) => mockGetStorageInfo(...args),
    exportAllData: (...args: any[]) => mockExportAllData(...args),
    importTasks: (...args: any[]) => mockImportTasks(...args),
    listProjects: (...args: any[]) => mockListProjects(...args),
    getDesktopRemoteServerStatus: (...args: any[]) => mockGetDesktopRemoteServerStatus(...args),
    getDesktopRemoteServerConfig: (...args: any[]) => mockGetDesktopRemoteServerConfig(...args),
    updateDesktopRemoteServerConfig: (...args: any[]) =>
      mockUpdateDesktopRemoteServerConfig(...args),
    startDesktopRemoteServer: (...args: any[]) => mockStartDesktopRemoteServer(...args),
    stopDesktopRemoteServer: (...args: any[]) => mockStopDesktopRemoteServer(...args),
  },
}));

vi.mock("../../../src/ui/context/TaskContext.js", () => ({
  useTaskContext: () => ({
    refreshTasks: vi.fn(),
  }),
}));

vi.mock("../../../src/core/export.js", () => ({
  exportJSON: vi.fn().mockReturnValue("{}"),
  exportCSV: vi.fn().mockReturnValue(""),
  exportMarkdown: vi.fn().mockReturnValue(""),
}));

vi.mock("../../../src/core/import.js", () => ({
  parseImport: vi.fn().mockReturnValue({
    tasks: [],
    projects: [],
    tags: [],
    warnings: [],
    format: "junban-json",
  }),
}));

vi.mock("../../../src/ui/views/settings/components.js", () => ({
  SegmentedControl: ({ options, value: _value, onChange }: any) => (
    <div data-testid="segmented-control">
      {options.map((opt: any) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}>
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

import { DataTab } from "../../../src/ui/views/settings/DataTab.js";

describe("DataTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadOnly = false; // Reset for each test
    mockGetStorageInfo.mockResolvedValue({ mode: "sqlite", path: "/data/junban.db" });
    mockExportAllData.mockResolvedValue({ tasks: [], projects: [], tags: [] });
    mockListProjects.mockResolvedValue([]);
    mockGetDesktopRemoteServerStatus.mockResolvedValue({
      available: true,
      running: false,
      port: null,
      localUrl: null,
    });
    mockGetDesktopRemoteServerConfig.mockResolvedValue({
      port: 4823,
      autoStart: false,
      passwordEnabled: false,
      hasPassword: false,
    });
    mockUpdateDesktopRemoteServerConfig.mockResolvedValue({
      port: 4823,
      autoStart: false,
      passwordEnabled: false,
      hasPassword: false,
    });
    mockStartDesktopRemoteServer.mockResolvedValue({
      available: true,
      running: true,
      port: 4823,
      localUrl: "http://127.0.0.1:4823",
    });
    mockStopDesktopRemoteServer.mockResolvedValue({
      available: true,
      running: false,
      port: null,
      localUrl: null,
    });
  });

  it("renders storage info section", async () => {
    render(<DataTab />);
    await waitFor(() => {
      expect(screen.getByText("Storage")).toBeInTheDocument();
    });
  });

  it("displays storage mode and path", async () => {
    render(<DataTab />);
    await waitFor(() => {
      expect(screen.getByText("SQLite")).toBeInTheDocument();
    });
    expect(screen.getByText("/data/junban.db")).toBeInTheDocument();
  });

  it("renders export buttons", async () => {
    render(<DataTab />);
    await waitFor(() => {
      expect(screen.getByText("Export JSON")).toBeInTheDocument();
    });
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.getByText("Export Markdown")).toBeInTheDocument();
  });

  it("renders import section", async () => {
    render(<DataTab />);
    await waitFor(() => {
      expect(screen.getByText("Import")).toBeInTheDocument();
    });
    expect(screen.getByText("Choose File")).toBeInTheDocument();
  });

  it("disables import selection while mutations are blocked", async () => {
    render(<DataTab mutationsBlocked={true} />);

    const chooseFileButton = await screen.findByRole("button", { name: "Choose File" });
    expect(chooseFileButton).toBeDisabled();
    expect(
      screen.getByText(/Import is unavailable while remote access is running/i),
    ).toBeInTheDocument();
  });

  it("disables import selection when readOnly from context is true (regression: combined lock state)", async () => {
    // Regression test: readOnly from context should disable import even when mutationsBlocked prop is false
    mockReadOnly = true;
    render(<DataTab mutationsBlocked={false} />);

    const chooseFileButton = await screen.findByRole("button", { name: "Choose File" });
    expect(chooseFileButton).toBeDisabled();
    expect(
      screen.getByText(/Import is unavailable while remote access is running/i),
    ).toBeInTheDocument();
  });

  it("uses combined lock state: disables import when either mutationsBlocked OR readOnly is true", async () => {
    // Test the combined lock state: mutationsBlocked || readOnly
    mockReadOnly = true;
    render(<DataTab mutationsBlocked={true} />);

    const chooseFileButton = await screen.findByRole("button", { name: "Choose File" });
    expect(chooseFileButton).toBeDisabled();
  });

  it("shows markdown storage description", async () => {
    mockGetStorageInfo.mockResolvedValue({ mode: "markdown", path: "/data/tasks" });
    render(<DataTab />);
    await waitFor(() => {
      expect(screen.getByText("Markdown Files")).toBeInTheDocument();
    });
  });

  it("shows loading state before storage info loads", () => {
    mockGetStorageInfo.mockReturnValue(new Promise(() => {})); // never resolves
    mockGetDesktopRemoteServerStatus.mockReturnValue(new Promise(() => {}));
    mockGetDesktopRemoteServerConfig.mockReturnValue(new Promise(() => {}));
    render(<DataTab />);
    expect(screen.getByText("Loading storage info...")).toBeInTheDocument();
  });

  it("shows Tauri string errors when remote access fails to start", async () => {
    mockStartDesktopRemoteServer.mockRejectedValue(
      "Port 4823 is already in use. Choose another remote access port.",
    );

    render(<DataTab />);

    const startButton = await screen.findByRole("button", { name: "Start remote access" });
    fireEvent.click(startButton);

    expect(
      await screen.findByText("Port 4823 is already in use. Choose another remote access port."),
    ).toBeInTheDocument();
  });
});
