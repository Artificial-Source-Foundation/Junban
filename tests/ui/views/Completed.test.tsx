import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock lucide-react
vi.mock("lucide-react", () => ({
  CheckCircle2: (props: any) => <svg data-testid="check-icon" {...props} />,
  ClipboardList: (props: any) => <svg data-testid="clipboard-icon" {...props} />,
}));

import { Completed } from "../../../src/ui/views/Completed.js";
import type { Task, Project } from "../../../src/core/types.js";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Test task",
    status: "completed",
    priority: null,
    dueDate: null,
    dueTime: false,
    projectId: null,
    parentId: null,
    tags: [],
    sortOrder: 0,
    recurrence: null,
    description: null,
    completedAt: "2026-02-17T10:00:00.000Z",
    createdAt: "2026-02-16T10:00:00.000Z",
    updatedAt: "2026-02-17T10:00:00.000Z",
    ...overrides,
  } as Task;
}

describe("Completed", () => {
  it("renders completed tasks", () => {
    const tasks = [makeTask({ id: "t1", title: "Done task" })];
    render(<Completed tasks={tasks} projects={[]} />);
    expect(screen.getByText("Done task")).toBeTruthy();
  });

  it("shows empty state when no completed tasks", () => {
    render(<Completed tasks={[]} projects={[]} />);
    expect(screen.getByText("No completed tasks yet")).toBeTruthy();
  });

  it("calls onSelectTask when task row is clicked", () => {
    const onSelectTask = vi.fn();
    const tasks = [makeTask({ id: "t1", title: "Done task" })];
    render(<Completed tasks={tasks} projects={[]} onSelectTask={onSelectTask} />);

    fireEvent.click(screen.getByText("Done task"));
    expect(onSelectTask).toHaveBeenCalledWith("t1");
  });

  it("calls onSelectTask on Enter key", () => {
    const onSelectTask = vi.fn();
    const tasks = [makeTask({ id: "t1", title: "Done task" })];
    render(<Completed tasks={tasks} projects={[]} onSelectTask={onSelectTask} />);

    const row = screen.getByText("Done task").closest("[role='button']")!;
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onSelectTask).toHaveBeenCalledWith("t1");
  });

  it("task rows have role=button when onSelectTask is provided", () => {
    const tasks = [makeTask({ id: "t1", title: "Done task" })];
    render(<Completed tasks={tasks} projects={[]} onSelectTask={() => {}} />);

    const row = screen.getByText("Done task").closest("[role='button']");
    expect(row).toBeTruthy();
  });

  it("task rows do not have role=button without onSelectTask", () => {
    const tasks = [makeTask({ id: "t1", title: "Done task" })];
    render(<Completed tasks={tasks} projects={[]} />);

    const row = screen.getByText("Done task").parentElement;
    expect(row?.getAttribute("role")).toBeNull();
  });

  it("displays project name for tasks with projectId", () => {
    const projects: Project[] = [
      { id: "p1", name: "Work", color: "#ff0000", createdAt: "", updatedAt: "" },
    ];
    const tasks = [makeTask({ id: "t1", title: "Work task", projectId: "p1" })];
    render(<Completed tasks={tasks} projects={projects} />);
    // "Work" appears in both the filter dropdown <option> and the task row badge
    const workElements = screen.getAllByText("Work");
    expect(workElements.length).toBeGreaterThanOrEqual(2);
  });
});
