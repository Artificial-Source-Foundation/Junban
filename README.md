# ASF Docket

**Build the task manager you've always wanted.**

Docket is an open-source, AI-native task manager with an Obsidian-style plugin system. It's local-first, privacy-respecting, and infinitely extensible — not through settings menus, but through plugins anyone can build. No coding experience? Ask Claude or ChatGPT to build a plugin for you. That's the idea.

Think **Todoist's simplicity**, **Obsidian's extensibility**, and **JARVIS-level AI** — all in one open-source package.

An [AI Strategic Forum (ASF)](https://github.com/asf-org) project. **Simple. Smart. Yours.**

<!-- ![Docket Screenshot](docs/assets/screenshot.png) -->

## Why Docket?

There's no good open-source task manager that's popular, extensible, *and* AI-native. The options today:

- **Todoist / TickTick** — nice UI, but closed source, subscription-locked, and their AI integration is terrible. You can't run your own models. You can't extend anything.
- **Obsidian Tasks** — great plugin ecosystem, but it's a notes app with tasks bolted on, not a task manager.
- **Taskwarrior** — powerful, but let's be honest, it's for terminal nerds only.
- **Self-hosted tools** (Vikunja, Planka) — exist, but no plugin ecosystem, no AI, no vibe-coding story.

Docket fills the gap: **a beautiful, minimal task manager where the plugin system is so simple that anyone — even non-developers — can ask an AI to build exactly the features they need.**

## Features

- **Clean and fast** — minimal UI out of the box, no bloat, no configuration walls
- **AI assistant** — a conversational AI that lives in your sidebar, understands your tasks, suggests priorities, auto-schedules your day, and sends reminders. Talk to it like JARVIS.
- **Bring your own model** — OpenAI, Anthropic, OpenRouter, Ollama, LM Studio — use any provider. Run local models for full privacy. Or build your own provider plugin.
- **Voice input** — talk to Docket instead of typing. The AI parses your natural language into structured tasks.
- **Natural language input** — type "buy milk tomorrow at 3pm p1 #groceries +shopping" and it just works
- **Natural language search** — filter tasks by typing "due today p1 #urgent" or "overdue"
- **Sub-tasks** — nested task hierarchy with indent/outdent, cascade completion, tree rendering
- **Focus mode** — distraction-free, keyboard-driven mode for working through tasks one at a time
- **Task templates** — reusable templates with `{{variable}}` substitution for repeatable workflows
- **Plugin ecosystem** — Obsidian-style JS/TS plugins. Pomodoro, Kanban, calendar view, time tracking — if it doesn't exist, vibe-code it.
- **Vibe-code your own plugins** — the plugin API is so simple and well-documented that you can ask Claude or ChatGPT to build a plugin for you. No coding experience required.
- **Local-first** — your data lives on your machine. Zero network calls by default. No accounts, no tracking, no data harvesting.
- **Keyboard-first** — full keyboard navigation for power users
- **CLI companion** — manage tasks from the terminal
- **Themes** — light/dark mode plus custom CSS. Design your own look.
- **No vendor lock-in** — plain SQLite or Markdown files. Export anytime. MIT licensed.

## Quick Start

```bash
# Clone and install
git clone https://github.com/asf-org/docket.git && cd docket
pnpm install

# Configure
cp .env.example .env

# Set up database
mkdir -p data
pnpm db:migrate

# Run
pnpm dev
```

See [docs/development/SETUP_LOCAL.md](docs/development/SETUP_LOCAL.md) for the full guide.

## The Plugin System

Docket's plugin system is inspired by Obsidian and [Pi's extension model](https://github.com/badlogic/pi-mono). Plugins are TypeScript files you drop into a folder. No build step. No config. Auto-discovered on startup.

The API is designed to be **vibe-code friendly** — simple enough that AI tools can generate working plugins on the first try.

```typescript
// plugins/my-plugin/index.ts
import { Plugin } from "@asf-docket/plugin-api";

export default class MyPlugin extends Plugin {
  async onLoad() {
    this.app.commands.register({
      id: "hello",
      name: "Say Hello",
      callback: () => console.log("Hello from my plugin!"),
    });
  }

  async onUnload() {}
}
```

**Want a Pomodoro timer?** Ask Claude to build one. **Need Kanban boards?** Vibe-code it. **Want to sync with Google Calendar?** There's a plugin for that — or you make one in 5 minutes.

See [docs/plugins/API.md](docs/plugins/API.md) for the full API reference and [docs/plugins/EXAMPLES.md](docs/plugins/EXAMPLES.md) for walkthroughs.

## The AI Assistant

Docket's AI isn't a gimmick bolted onto a settings menu. It's a **conversational assistant** that lives in your sidebar:

- **Talk to it naturally**: "I need to finish the report by Friday and review the budget before the meeting tomorrow at 2pm"
- **It understands context**: sees your projects, priorities, and schedule
- **It asks follow-up questions**: "Which project should the report go under? Should I set a reminder?"
- **It suggests priorities**: "You have 3 overdue tasks — want me to reschedule them?"
- **It auto-schedules**: "Here's a suggested plan for your day based on deadlines and priorities"
- **It reminds you**: via the app, Discord bots, Google Calendar — whatever you configure

And you choose the AI: OpenAI, Anthropic, OpenRouter, Ollama, LM Studio — or build your own provider plugin. Run fully local with Ollama for zero data exposure.

## Philosophy

Docket reflects [ASF values](docs/README.md) — **accuracy over speed**, **disclosure over persuasion**, **sources over vibes**:

- **Local-first**: Your data, your machine, your rules. Zero network by default.
- **Open source**: Fully transparent, MIT licensed, community-driven
- **AI-native**: Not an afterthought — AI is a core part of the experience
- **Extensible**: The app is a canvas, not a finished painting. You build what you need.
- **No dark patterns**: No upsells, no tracking, no artificial limitations
- **Honest business model**: Free forever. Optional paid sync hosting for cross-device access (like Obsidian Sync).

## Platform Roadmap

| Phase | Platform | Status |
|-------|----------|--------|
| Now | Desktop (Tauri — Mac, Windows, Linux) | In Development |
| Future | Mobile (native + PWA) | Planned (requires sync service) |
| Future | Web app | Planned (requires sync service) |

## Documentation

```
docs/
├── README.md                        # Vision, design principles, why Docket exists
├── development/                     # Developer guides
│   ├── ARCHITECTURE.md              # Modules, data flow, tech decisions
│   ├── SETUP_LOCAL.md               # Step-by-step local development
│   ├── CONTRIBUTING.md              # How to contribute
│   └── SECURITY.md                  # Threat model, plugin sandboxing
├── plugins/                         # Plugin documentation
│   ├── API.md                       # Plugin API reference
│   └── EXAMPLES.md                  # Example plugin walkthroughs
└── planning/                        # Project planning
    ├── ROADMAP.md                   # Milestones and future plans
    ├── BACKLOG.md                   # All work items, prioritized by area
    └── SPRINTS.md                   # Sprint planning and tracking
```

## Tech Stack

- **Runtime**: Node.js 22+ / TypeScript
- **Desktop**: Tauri (lightweight, cross-platform)
- **Frontend**: React + Tailwind CSS
- **Database**: SQLite (better-sqlite3 + Drizzle ORM) or flat Markdown files
- **AI**: Pluggable providers — OpenAI, Anthropic, OpenRouter, Ollama, LM Studio
- **Plugins**: Custom loader with sandboxed execution
- **CLI**: Commander.js
- **Testing**: Vitest
- **Build**: Vite

## Contributing

We welcome contributions! See [docs/development/CONTRIBUTING.md](docs/development/CONTRIBUTING.md) for guidelines.

## License

MIT
