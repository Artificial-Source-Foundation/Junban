import { readFile } from "node:fs/promises";
import { stdin } from "node:process";
import type { AppServices } from "../../bootstrap.js";
import { NotFoundError, ValidationError } from "../../core/errors.js";
import { jsonSchemaToZod } from "../../mcp/schema-converter.js";
import { createToolContext } from "../../mcp/context.js";

export interface ListToolsOptions {
  json?: boolean;
}

export interface RunToolOptions {
  args?: string;
  argsFile?: string;
  json?: boolean;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readArgs(options: RunToolOptions): Promise<Record<string, unknown>> {
  const sources = [options.args, options.argsFile].filter(Boolean);
  if (sources.length > 1) {
    throw new ValidationError("Use either --args or --args-file, not both.");
  }

  let input = options.args;
  if (options.argsFile) {
    input = options.argsFile === "-" ? await readStdin() : await readFile(options.argsFile, "utf8");
  }

  if (!input?.trim()) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new ValidationError("Tool arguments must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ValidationError("Tool arguments must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

function validateToolArgs(name: string, args: Record<string, unknown>, services: AppServices) {
  const tool = services.toolRegistry.get(name);
  if (!tool) {
    throw new NotFoundError("Tool", name);
  }

  const schema = jsonSchemaToZod(tool.definition.parameters);
  const result = schema.safeParse(args);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join("; ");
    throw new ValidationError(`Invalid arguments for ${name}: ${message}`);
  }

  return result.data;
}

export async function listTools(
  services: AppServices,
  options: ListToolsOptions = {},
): Promise<void> {
  const tools = services.toolRegistry.getDefinitions().sort((a, b) => a.name.localeCompare(b.name));

  if (options.json) {
    console.log(JSON.stringify(tools, null, 2));
    return;
  }

  for (const tool of tools) {
    console.log(`${tool.name}\n  ${tool.description}`);
  }
}

export async function runTool(
  name: string,
  services: AppServices,
  options: RunToolOptions = {},
): Promise<void> {
  const args = validateToolArgs(name, await readArgs(options), services);
  const result = await services.toolRegistry.execute(name, args, createToolContext(services));
  if (options.json) {
    let parsed: unknown = result;
    try {
      parsed = JSON.parse(result);
    } catch {
      // Plugin tools may return plain text; keep the JSON envelope stable.
    }
    console.log(JSON.stringify({ success: true, result: parsed }));
    return;
  }

  console.log(result);
}
