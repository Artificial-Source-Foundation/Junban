import type {
  TaskRow,
  ProjectRow,
  TagRow,
  AppSettingRow,
  PluginSettingsRow,
  ChatMessageRow,
  ChatSessionInfo,
  TemplateRow,
  SectionRow,
  TaskCommentRow,
  TaskActivityRow,
  DailyStatRow,
  TaskRelationRow,
  AiMemoryRow,
  MutationResult,
} from "../interface.js";

export type {
  TaskRow,
  ProjectRow,
  TagRow,
  AppSettingRow,
  PluginSettingsRow,
  ChatMessageRow,
  ChatSessionInfo,
  TemplateRow,
  SectionRow,
  TaskCommentRow,
  TaskActivityRow,
  DailyStatRow,
  TaskRelationRow,
  AiMemoryRow,
  MutationResult,
};

/** Entry stored in the task index. */
export interface TaskEntry {
  row: TaskRow;
  filePath: string;
  description: string | null;
}

/** Entry stored in the project index. */
export interface ProjectEntry {
  row: ProjectRow;
  dirPath: string;
}

/** All in-memory indexes used by the markdown backend. */
export interface MarkdownIndexes {
  basePath: string;
  taskIndex: Map<string, TaskEntry>;
  projectIndex: Map<string, ProjectEntry>;
  tagIndex: Map<string, TagRow>;
  taskTagIndex: Map<string, Set<string>>; // taskId -> Set<tagId>
  appSettings: Map<string, AppSettingRow>;
  pluginSettingsMap: Map<string, PluginSettingsRow>;
  pluginPermissions: Map<string, string[]>;
  chatMessages: Map<string, ChatMessageRow[]>; // sessionId -> messages
  templateIndex: Map<string, TemplateRow>;
  sectionIndex: Map<string, SectionRow>;
  taskCommentIndex: Map<string, TaskCommentRow[]>; // taskId -> comments
  taskActivityIndex: Map<string, TaskActivityRow[]>; // taskId -> activities
  dailyStatIndex: Map<string, DailyStatRow>; // date -> stat
  taskRelationList: TaskRelationRow[];
  aiMemoryIndex: Map<string, AiMemoryRow>;
}

export const OK: MutationResult = { changes: 1 };
export const NOOP: MutationResult = { changes: 0 };
