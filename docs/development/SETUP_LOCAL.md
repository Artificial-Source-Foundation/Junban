# Local Development Setup

Step-by-step guide to get ASF Docket running on your machine.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22+ | [nodejs.org](https://nodejs.org/) or `nvm install 22` |
| pnpm | 10+ | `npm install -g pnpm` or `corepack enable` |
| Git | 2.x | [git-scm.com](https://git-scm.com/) |

### Optional (for desktop app)

| Tool | Version | Install |
|------|---------|---------|
| Rust | latest stable | [rustup.rs](https://rustup.rs/) |
| Tauri CLI | 2.x | `cargo install tauri-cli` |

Rust and Tauri are only needed if you want to build the desktop app. The web UI runs without them.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/asf-org/docket.git
cd docket
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

The defaults work out of the box. Edit `.env` if you want to change:
- `DB_PATH` — where the SQLite database is stored (default: `./data/docket.db`)
- `STORAGE_MODE` — `sqlite` (default) or `markdown`
- `LOG_LEVEL` — `debug`, `info`, `warn`, `error`

### 4. Set Up the Database

```bash
mkdir -p data
pnpm db:migrate
```

This creates the SQLite database and runs all migrations.

### 5. Run the Dev Server

```bash
pnpm dev
```

The app is now running at `http://localhost:5173` with hot module replacement (HMR).

### 6. Create Your First Task

Open the app in your browser. You should see the inbox view. Type a task in the input field:

```
buy milk tomorrow at 3pm p1 #groceries +shopping
```

Press Enter. The task is created with:
- Title: "buy milk"
- Due: tomorrow at 3:00 PM
- Priority: P1 (highest)
- Tag: groceries
- Project: shopping (auto-created)

## Using the CLI

The CLI companion shares the same database as the web UI.

```bash
# Add a task
pnpm cli add "review PR by Friday p2 #dev"

# List tasks
pnpm cli list
pnpm cli list --today
pnpm cli list --project=work

# Complete a task
pnpm cli done <task-id>

# Edit a task
pnpm cli edit <task-id> --priority=1

# Delete a task
pnpm cli delete <task-id>
```

## Development Commands

```bash
pnpm dev             # Start dev server with HMR
pnpm build           # Build for production
pnpm start           # Preview production build
pnpm test            # Run tests
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Run tests with coverage
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix lint issues
pnpm typecheck       # TypeScript type checking
pnpm check           # Run lint + typecheck + test (all at once)
pnpm db:generate     # Generate a new migration after schema change
pnpm db:migrate      # Apply pending migrations
pnpm cli             # Run CLI companion
```

## Building the Desktop App (Optional)

Requires Rust and Tauri CLI (see [Prerequisites](#prerequisites)).

```bash
# Development
cargo tauri dev

# Build distributable
cargo tauri build
```

Produces platform-specific installers in `src-tauri/target/release/bundle/`.

## Working with Plugins

### Installing a Plugin

Place plugin directories in `plugins/`:

```bash
plugins/
└── my-plugin/
    ├── manifest.json
    └── index.ts
```

Restart the dev server. The plugin appears in Settings > Plugins.

### Creating a Plugin

See [Plugin API](../plugins/API.md) for the full API reference and [Plugin Examples](../plugins/EXAMPLES.md) for walkthroughs.

Quick start:

```bash
mkdir -p plugins/my-plugin
```

Create `plugins/my-plugin/manifest.json`:
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Does something cool",
  "main": "index.ts",
  "minDocketVersion": "1.0.0",
  "permissions": ["commands"]
}
```

Create `plugins/my-plugin/index.ts`:
```typescript
import { Plugin } from "@asf-docket/plugin-api";

export default class MyPlugin extends Plugin {
  async onLoad() {
    this.app.commands.register({
      id: "my-plugin:hello",
      name: "Say Hello",
      callback: () => alert("Hello!"),
    });
  }

  async onUnload() {}
}
```

## Troubleshooting

### Database errors on startup

```bash
# Delete the database and re-migrate
rm -rf data/
mkdir -p data
pnpm db:migrate
```

### Port already in use

Edit `PORT` in `.env` or kill the process using port 5173:
```bash
lsof -i :5173 | grep LISTEN
kill <PID>
```

### pnpm install fails

```bash
# Clear pnpm cache and retry
pnpm store prune
rm -rf node_modules
pnpm install
```

### TypeScript errors after pulling

```bash
# Regenerate types
pnpm typecheck
# If schema changed, re-migrate
pnpm db:migrate
```
