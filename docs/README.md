# ASF Docket — Project Overview

## What is ASF?

**AI Strategic Forum (ASF)** is a community-of-practice for serious AI enthusiasts. It focuses on:

- **Curated news and tools** — signal over noise
- **Long-form analysis** — understanding implications, not just announcements
- **Open-source tool building** — practical projects the community can use
- **High-signal discussion** — depth over volume

### ASF Values

| Value | Meaning |
|-------|---------|
| Accuracy > Speed | Get it right, not just first |
| Disclosure > Persuasion | Be transparent about biases, sponsorships, limitations |
| Sources > Vibes | Always cite. Always link. Always verify. |
| Critique ideas, not people | Constructive discourse |
| Label speculation | If it's a guess, say so |
| No hidden promotion | If something is sponsored or affiliated, disclose it |

## What is ASF Docket?

ASF Docket is an **open-source task management application** — a Todoist alternative with an Obsidian-style plugin system. It's free, local-first, extensible, and privacy-respecting.

**Tagline:** "Open-source task management. Yours to extend."

### Core Functionality

- **Task management**: Create, edit, complete, delete tasks with full metadata (due dates, priorities, tags, projects, recurrence)
- **Natural language input**: Type "call dentist next Tuesday at 2pm p1 #health" and Docket parses everything
- **Keyboard-first navigation**: Power users never need to touch the mouse
- **Local storage**: SQLite database or flat Markdown files — your data stays on your machine
- **Plugin system**: Obsidian-inspired architecture where community plugins extend every aspect of the app
- **Theme support**: Light/dark mode plus fully custom CSS themes
- **CLI companion**: Manage tasks from the terminal alongside the desktop app

### Why Another Task Manager?

Most task managers fall into two camps:

1. **Simple but locked down** — great UX, but you can't extend them, your data is in their cloud, and features come when (if) the company decides
2. **Powerful but complex** — org-mode, Taskwarrior, etc. — incredible flexibility for those willing to invest time

Docket aims for a third path: **simple by default, powerful when you need it**. The core app is clean and minimal. Plugins let you add exactly the features you want — Pomodoro timers, Kanban boards, calendar views, AI prioritization — without bloating the base experience.

And your data is always yours. Plain SQLite or Markdown. Export anytime. No account required.

## How It Fits in the ASF Ecosystem

ASF builds open-source tools for the AI community. Each project serves a different need:

| Project | Purpose | Status |
|---------|---------|--------|
| **ASF Sentinel** | Discord bot for AI news curation and server moderation | Active |
| **ASF Docket** | Task management with plugin ecosystem | In Development |

Sentinel handles **information flow** — surfacing AI news for the community. Docket handles **personal productivity** — helping individuals manage their work. Both share ASF's values of transparency, open source, and community ownership.

### Shared Conventions

Both projects use the same technical foundations and development practices:

- TypeScript strict mode
- Vitest for testing
- Drizzle ORM + SQLite
- pnpm package manager
- Conventional Commits
- Comprehensive CLAUDE.md for AI-assisted development

## Design Principles

### 1. Local-First

Data lives on the user's machine. There is no server, no account, no cloud dependency. The app works fully offline. Sync (CalDAV, Git, WebDAV) is available through plugins — always opt-in, never required.

**Why:** Privacy by default. No data harvesting. No service shutdowns. No "we're changing our pricing."

### 2. Plugin Ecosystem

The core app provides task CRUD, projects, tags, priorities, due dates, recurrence, and natural language input. Everything else — views, integrations, workflows — is a plugin.

**Why:** Different people work differently. A developer wants Git sync and keyboard shortcuts. A project manager wants Kanban and time tracking. A student wants Pomodoro and habit tracking. Plugins let everyone build their ideal setup.

### 3. Minimal by Default

The out-of-box experience is clean, fast, and focused. No feature bloat. No configuration walls. Create a task, check it off, move on.

**Why:** Complexity should be opt-in. Most task managers try to be everything to everyone and end up overwhelming.

### 4. Open Source (MIT)

Fully transparent codebase. Community contributions welcome. MIT license means no restrictions on use, modification, or distribution.

**Why:** ASF believes tools for the community should be owned by the community.

### 5. No Vendor Lock-in

Task data is stored in SQLite (standard, readable by any tool) or flat Markdown files (readable by humans). Export is always available. Switching away from Docket should be trivial.

**Why:** Respect for users means not trapping them.

## Vision

**v1.0** delivers a polished task manager with a stable plugin API that a small community can build on.

**Beyond v1.0**, Docket becomes a platform:
- A growing plugin directory with community contributions
- Sync options for multi-device use (CalDAV, Git, WebDAV)
- AI-assisted features via plugins (smart prioritization, auto-scheduling, natural language queries)
- Mobile companion apps
- Team/shared task support via sync plugins

The goal is not to compete with Todoist on features. It's to be the **extensible, private, community-owned** alternative.

See [ROADMAP.md](ROADMAP.md) for the detailed milestone plan.
