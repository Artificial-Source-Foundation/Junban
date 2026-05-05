import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";

vi.mock("lucide-react", () => {
  const icon = (name: string) => (props: any) => <svg data-testid={`${name}-icon`} {...props} />;
  return {
    ArrowLeft: icon("arrow-left"),
    ArrowRight: icon("arrow-right"),
    Bell: icon("bell"),
    Calendar: icon("calendar"),
    CalendarOff: icon("calendar-off"),
    Check: icon("check"),
    CheckCircle2: icon("check-circle"),
    ChevronDown: icon("chevron-down"),
    ChevronRight: icon("chevron-right"),
    ChevronUp: icon("chevron-up"),
    Circle: icon("circle"),
    GripVertical: icon("grip"),
    History: icon("history"),
    Inbox: icon("inbox"),
    Link: icon("link"),
    Maximize2: icon("maximize"),
    MessageSquare: icon("message-square"),
    MoreHorizontal: icon("more"),
    Pencil: icon("pencil"),
    PlusCircle: icon("plus-circle"),
    Repeat: icon("repeat"),
    Search: icon("search"),
    Send: icon("send"),
    Trash2: icon("trash"),
    X: icon("x"),
  };
});

vi.mock("../../../src/core/priorities.js", () => ({
  getPriority: (value: number) => ({ value, label: `Priority ${value}`, color: "#4073ff" }),
}));

vi.mock("../../../src/ui/components/DatePicker.js", () => ({
  DatePicker: () => <div data-testid="date-picker" />,
}));

vi.mock("../../../src/ui/components/RecurrencePicker.js", () => ({
  formatRecurrenceLabel: (recurrence: string) => recurrence,
}));

vi.mock("../../../src/utils/color.js", () => ({
  hexToRgba: (_hex: string, alpha: number) => `rgba(64,115,255,${alpha})`,
}));

vi.mock("../../../src/utils/format-date.js", () => ({
  formatTaskTime: () => "10:00 AM",
  toDateKey: (date: Date) => date.toISOString().split("T")[0],
}));

vi.mock("../../../src/ui/views/calendar/useCalendarNavigation.js", () => ({
  getWeekDays: (date: Date, weekStartDay: number) => {
    const days: Date[] = [];
    const start = new Date(date);
    const diff = (start.getDay() - weekStartDay + 7) % 7;
    start.setDate(start.getDate() - diff);
    for (let index = 0; index < 7; index += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      days.push(day);
    }
    return days;
  },
}));

vi.mock("../../../src/ui/context/SettingsContext.js", () => ({
  useGeneralSettings: () => ({
    loaded: true,
    settings: { confirm_delete: "false", time_format: "12h" },
    updateSetting: vi.fn(),
  }),
}));

vi.mock("../../../src/ui/components/chat/MarkdownMessage.js", () => ({
  MarkdownMessage: ({ content }: { content: string }) => <div>{content}</div>,
}));

vi.mock("../../../src/ui/components/SubtaskSection.js", () => ({
  SubtaskSection: () => <div data-testid="subtask-section" />,
}));

vi.mock("../../../src/ui/components/TaskMetadataSidebar.js", () => ({
  TaskMetadataSidebar: () => <div data-testid="metadata-sidebar" />,
}));

vi.mock("../../../src/ui/components/ConfirmDialog.js", () => ({
  ConfirmDialog: () => null,
}));

vi.mock("../../../src/ui/components/EmptyState.js", () => ({
  EmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("../../../src/ui/api/tasks.js", () => ({
  addTaskRelation: vi.fn().mockResolvedValue(undefined),
  getTaskRelations: vi.fn().mockResolvedValue({ blockedBy: [], blocks: [] }),
  removeTaskRelation: vi.fn().mockResolvedValue(undefined),
}));

import { CommandPalette } from "../../../src/ui/components/CommandPalette.js";
import { TaskDetailPanel } from "../../../src/ui/components/TaskDetailPanel.js";
import { TaskItem } from "../../../src/ui/components/TaskItem.js";
import { CalendarDayView } from "../../../src/ui/views/calendar/CalendarDayView.js";
import { CalendarWeekView } from "../../../src/ui/views/calendar/CalendarWeekView.js";
import type { Project, Task } from "../../../src/core/types.js";

Element.prototype.scrollIntoView = vi.fn();

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Accessible task",
    description: "Task notes",
    status: "pending",
    priority: null,
    dueDate: "2026-02-23T00:00:00.000Z",
    dueTime: false,
    completedAt: null,
    projectId: null,
    recurrence: null,
    parentId: null,
    remindAt: null,
    tags: [],
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe(container);
  expect(results.violations).toEqual([]);
}

describe("core component accessibility", () => {
  it("keeps TaskItem free of automated axe violations", async () => {
    const { container } = render(
      <TaskItem task={makeTask()} onToggle={vi.fn()} onSelect={vi.fn()} isSelected={false} />,
    );

    await expectNoAxeViolations(container);
  });

  it("keeps calendar task controls free of automated axe violations", async () => {
    const projects: Project[] = [];
    const { container } = render(
      <>
        <CalendarWeekView
          selectedDate={new Date("2026-02-23")}
          weekStartDay={0}
          tasks={[makeTask({ title: "Week task" })]}
          projects={projects}
          onSelectTask={vi.fn()}
          onToggleTask={vi.fn()}
          onDayClick={vi.fn()}
        />
        <CalendarDayView
          selectedDate={new Date("2026-02-23")}
          tasks={[makeTask({ title: "Day task" })]}
          projects={projects}
          onSelectTask={vi.fn()}
          onToggleTask={vi.fn()}
        />
      </>,
    );

    await expectNoAxeViolations(container);
  });

  it("keeps TaskDetailPanel free of automated axe violations", async () => {
    const { container } = render(
      <TaskDetailPanel task={makeTask()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />,
    );

    await expectNoAxeViolations(container);
  });

  it("keeps CommandPalette free of automated axe violations", async () => {
    const { container } = render(
      <CommandPalette
        isOpen
        onClose={vi.fn()}
        commands={[{ id: "inbox", name: "Go to Inbox", callback: vi.fn() }]}
      />,
    );

    await expectNoAxeViolations(container);
  });
});
