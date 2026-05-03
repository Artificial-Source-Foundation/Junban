# Use the Junban CLI

This guide is for people who want fast, repeatable task operations from the terminal.

## Install or run

The CLI and MCP server are separate entrypoints. This guide covers the user terminal command, `junban`.

Install the latest GitHub release CLI package with:

```bash
npm install -g https://github.com/Artificial-Source/Junban/releases/latest/download/junban-cli.tgz
junban --help
```

This uses the `npm` command as the installer, but it does not require an npm account or a package published to the npm registry. It installs the `junban-cli.tgz` asset from GitHub Releases.

On Linux, you can also install the desktop app and CLI tools together with the release helper:

```bash
curl -fsSL https://raw.githubusercontent.com/Artificial-Source/Junban/main/scripts/install-linux.sh | sh -s -- --with-cli
```

The helper asks about CLI tools when an interactive terminal is available. Non-interactive runs skip that prompt unless you pass `--with-cli` or set `JUNBAN_INSTALL_CLI=1`.

If the package is later published to the npm registry, the shorter registry install will also work:

```bash
npm install -g asf-junban
```

After installing the CLI package, use:

```bash
junban <command>
```

From a source checkout, use:

```bash
pnpm cli -- <command>
```

The executable comes from `src/cli/index.ts` and uses Commander.js command parsing. The packaged binary name is `junban`; the source workflow keeps `pnpm cli` for contributor convenience.

Desktop packages do not add `junban` to your shell `PATH` by themselves; the Linux helper installs it only when you choose the CLI tools option. If you want the standalone CLI to read the same SQLite database as a packaged desktop app, open `Settings -> Data -> Storage` in the app, copy the database path, and pass it as `DB_PATH`:

```bash
DB_PATH="/path/from/settings/junban.db" junban list
```

The current CLI path reads configuration from `process.env`, so if you need non-default values such as `STORAGE_MODE=markdown`, export them in your shell or pass them inline when running the command.

## Add a task

```bash
junban add "buy milk tomorrow p1 #groceries +shopping"
pnpm cli -- add "buy milk tomorrow p1 #groceries +shopping"
```

CLI add uses natural-language parsing and auto-creates a project when `+project-name` is present.

## List tasks

```bash
junban list
junban list --today
pnpm cli -- list
pnpm cli -- list --today
pnpm cli -- list --project work
pnpm cli -- list --tag urgent
pnpm cli -- list --search "review PR"
```

You can also add `--json` to get machine-readable output.

## Complete, update, and delete by ID

```bash
junban done <task-id>
pnpm cli -- done <task-id>
pnpm cli -- done <task-id> --json

pnpm cli -- edit <task-id> --title "buy almond milk"
pnpm cli -- edit <task-id> --priority 1
pnpm cli -- edit <task-id> --due "next friday"
pnpm cli -- edit <task-id> --description "bring change"

pnpm cli -- delete <task-id>
```

`edit` requires at least one field (`--title`, `--priority`, `--due`, or `--description`).

## Common notes

- `--json` output is available on the same core flows (`add`, `list`, `done`, `edit`, `delete`).
- `list` defaults to pending tasks.
- If an ID does not exist, commands fail with `Task not found` output.
- The CLI bootstrap path shares the same service layer as the web app (`bootstrap()`), so it works against the same profile/database configured for the process.

## Agent tool mode

For agents that have terminal control but do not support MCP, the CLI can expose the same registered AI tool surface used by the app and MCP server.

List available tools:

```bash
junban tools
junban tools --json
pnpm cli -- tools --json
```

Run a tool with JSON arguments:

```bash
junban tool create_task --args '{"title":"Review roadmap","priority":2}'
pnpm cli -- tool query_tasks --args '{"status":"pending"}'
```

Add `--json` when you want a stable response envelope around the tool result, including plugin tools that may return plain text:

```bash
junban tool create_task --args '{"title":"Review roadmap","priority":2}' --json
```

For larger payloads, pass a file or stdin:

```bash
junban tool extract_tasks_from_text --args-file ./capture.json
printf '%s' '{"title":"Follow up with Sam"}' | junban tool create_task --args-file -
```

Tool arguments are validated against each registered tool schema before execution. Built-in tools return JSON strings directly; `--json` wraps any tool output in `{ "success": true, "result": ... }` for agents that need a stable parse contract.

## Related docs

- Full CLI reference: [`../reference/backend/CLI.md`](../reference/backend/CLI.md)
- Development setup and profile behavior: [`../guides/SETUP.md`](../guides/SETUP.md)
- Command registration entrypoint: [`../../src/cli/index.ts`](../../src/cli/index.ts)
