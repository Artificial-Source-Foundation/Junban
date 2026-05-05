import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { slugify } from "../markdown-utils.js";
import { StorageError } from "../../core/errors.js";
import type { ProjectRow, MutationResult, MarkdownIndexes } from "./types.js";
import { OK, NOOP } from "./types.js";
import { updateTask } from "./task-ops.js";
import { persistSections, writeTextFileAtomic } from "./persistence.js";

export function listProjects(idx: MarkdownIndexes): ProjectRow[] {
  return Array.from(idx.projectIndex.values()).map((e) => e.row);
}

export function getProject(idx: MarkdownIndexes, id: string): ProjectRow[] {
  const entry = idx.projectIndex.get(id);
  return entry ? [entry.row] : [];
}

export function getProjectByName(idx: MarkdownIndexes, name: string): ProjectRow[] {
  for (const entry of idx.projectIndex.values()) {
    if (entry.row.name === name) return [entry.row];
  }
  return [];
}

export function insertProject(idx: MarkdownIndexes, project: ProjectRow): MutationResult {
  const dirName = slugify(project.name) || project.id;
  const dirPath = path.join(idx.basePath, "projects", dirName);

  const meta: Record<string, unknown> = {
    id: project.id,
    color: project.color,
    icon: project.icon,
    parentId: project.parentId,
    isFavorite: project.isFavorite,
    viewStyle: project.viewStyle,
    sortOrder: project.sortOrder,
    archived: project.archived,
    createdAt: project.createdAt,
  };
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    writeTextFileAtomic(path.join(dirPath, "_project.yaml"), YAML.stringify(meta));
  } catch (err) {
    throw new StorageError(`write project ${dirPath}`, err instanceof Error ? err : undefined);
  }

  idx.projectIndex.set(project.id, { row: project, dirPath });
  return OK;
}

export function updateProject(
  idx: MarkdownIndexes,
  id: string,
  data: Partial<ProjectRow>,
): MutationResult {
  const entry = idx.projectIndex.get(id);
  if (!entry) return NOOP;

  const newRow = { ...entry.row, ...data };
  const meta: Record<string, unknown> = {
    id: newRow.id,
    name: newRow.name,
    color: newRow.color,
    icon: newRow.icon,
    parentId: newRow.parentId,
    isFavorite: newRow.isFavorite,
    viewStyle: newRow.viewStyle,
    sortOrder: newRow.sortOrder,
    archived: newRow.archived,
    createdAt: newRow.createdAt,
  };
  writeTextFileAtomic(path.join(entry.dirPath, "_project.yaml"), YAML.stringify(meta));

  idx.projectIndex.set(id, { row: newRow, dirPath: entry.dirPath });
  return OK;
}

export function deleteProject(idx: MarkdownIndexes, id: string): MutationResult {
  const entry = idx.projectIndex.get(id);
  if (!entry) return NOOP;

  // Move project tasks to inbox and clear section membership.
  for (const [taskId, taskEntry] of idx.taskIndex) {
    if (taskEntry.row.projectId === id) {
      updateTask(idx, taskId, { projectId: null, sectionId: null });
    }
  }

  // Promote child projects to the top level instead of deleting them.
  for (const [projectId, projectEntry] of idx.projectIndex) {
    if (projectEntry.row.parentId === id) {
      updateProject(idx, projectId, { parentId: null });
    }
  }

  let sectionsChanged = false;
  for (const [sectionId, section] of [...idx.sectionIndex]) {
    if (section.projectId === id) {
      idx.sectionIndex.delete(sectionId);
      sectionsChanged = true;
    }
  }
  if (sectionsChanged) persistSections(idx);

  // Remove project directory
  try {
    if (fs.existsSync(entry.dirPath)) {
      fs.rmSync(entry.dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    throw new StorageError(
      `delete project ${entry.dirPath}`,
      err instanceof Error ? err : undefined,
    );
  }
  idx.projectIndex.delete(id);
  return OK;
}
