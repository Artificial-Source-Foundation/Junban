import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AlertsTab } from "../../../src/ui/views/settings/AlertsTab.js";
import { SettingsProvider } from "../../../src/ui/context/SettingsContext.js";

const settingsApiMocks = vi.hoisted(() => ({
  getAllSettings: vi.fn().mockResolvedValue({}),
  setAppSetting: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../src/ui/api/settings.js", () => settingsApiMocks);
vi.mock("../../../src/ui/api/index.js", () => ({
  api: {
    getAppSetting: vi.fn().mockResolvedValue(null),
    setAppSetting: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("../../../src/ui/themes/manager.js", () => ({
  themeManager: {
    getCurrent: vi.fn().mockReturnValue("system"),
    setTheme: vi.fn(),
    listThemes: vi.fn().mockReturnValue([]),
  },
}));
vi.mock("../../../src/utils/sounds.js", () => ({
  previewSound: vi.fn(),
}));

const mockNotification = {
  permission: "default" as NotificationPermission,
  requestPermission: vi.fn().mockResolvedValue("granted"),
};
Object.defineProperty(window, "Notification", { value: mockNotification, writable: true });

function renderAlertsTab() {
  return render(
    <SettingsProvider>
      <AlertsTab />
    </SettingsProvider>,
  );
}

describe("AlertsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsApiMocks.getAllSettings.mockResolvedValue({});
  });

  it("groups notifications, sound effects, and smart nudges", async () => {
    renderAlertsTab();

    await waitFor(() => {
      expect(screen.getByText("Alerts & Feedback")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sound Effects" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Smart Nudges" })).toBeInTheDocument();
  });
});
