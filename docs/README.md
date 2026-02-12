# ASF Docket — Vision & Design

## What is ASF?

**AI Strategic Forum (ASF)** is a community-of-practice for serious AI enthusiasts. **Simple. Smart. Yours.**

ASF focuses on:

- **Curated news and tools** — signal over noise
- **Long-form analysis** — understanding implications, not just announcements
- **Open-source tool building** — practical tools the community can use
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

ASF builds open-source tools for the community. Not internal tools — tools anyone can use, extend, and own.

## What is Docket?

**Build the task manager you've always wanted.**

Docket is an open-source, AI-native task manager with an Obsidian-style plugin system. It's the task manager that doesn't exist yet — one that's beautiful and simple out of the box, has a real AI assistant (not a gimmick), and lets anyone build their own features through plugins they can vibe-code without writing a line of code themselves.

### The Problem

There's no good open-source task manager that's popular, extensible, and AI-native. Here's what exists:

| Tool | Good At | Falls Short |
|------|---------|-------------|
| **Todoist** | Clean UI, reliable, cross-platform | Closed source, subscription, terrible AI and voice input, can't extend it, your data is in their cloud |
| **TickTick** | Feature-rich, good value | Closed source, missing key features, no extensibility |
| **Things 3** | Beautiful design | Apple-only, no plugins, no AI, closed source |
| **Obsidian Tasks** | Great plugin ecosystem | It's a notes app with tasks bolted on, not a task manager |
| **Taskwarrior** | Powerful, open source | Terminal-only, steep learning curve, no AI |
| **Vikunja / Planka** | Self-hosted, open source | No plugin ecosystem, no AI, no vibe-coding story |

**The gap:** No tool combines a clean, simple UX with real AI intelligence, an extensible plugin system, and full data ownership. Docket fills that gap.

### The Vision

Imagine JARVIS, but for tasks:

1. You open Docket. There's a clean, minimal inbox. A sidebar with an AI chat panel.
2. You say: *"I need to finish the quarterly report by Friday, review the budget before tomorrow's 2pm meeting, and pick up groceries on the way home."*
3. The AI creates three tasks with due dates, priorities, and projects. It asks: *"Should the report go under the Work project? Want a reminder an hour before the meeting?"*
4. You check your Today view. The AI has suggested an order: *"I'd tackle the budget review first since it's due earliest. The report can wait until tomorrow morning."*
5. You want a Pomodoro timer. You ask Claude: *"Build me a Docket plugin with a Pomodoro timer."* Claude generates a working plugin. You drop it in the `plugins/` folder. Done.
6. Later, you check your tasks on your phone. Docket Sync (optional, paid) keeps everything in sync across devices. Or you use the free Git sync plugin.

That's the vision. **Simple when you need simple. Powerful when you need powerful. AI when you need AI. And yours — always.**

## Why It Exists

Three frustrations sparked Docket:

### 1. There's no good open-source option

Open-source task managers either look like they're from 2005 or require a PhD to configure. There's nothing with the polish of Todoist and the extensibility of Obsidian. We want to build that.

### 2. AI in existing tools is terrible

Todoist's AI feels like an afterthought — an old model with no agentic capabilities. You can't have a conversation with it. You can't choose your own model. You can't run it locally. We want an AI assistant you can actually *talk to* — one that sees your full context, suggests priorities, schedules your day, asks follow-up questions, and reminds you through whatever channel you're on. And you choose the model: OpenAI, Anthropic, OpenRouter, Ollama, LM Studio — or build your own provider.

### 3. Users should be able to build their own features

Most apps give you what they give you. If a feature doesn't exist, you submit a feature request and hope. Docket takes the Obsidian approach: the core is minimal, and everything else is a plugin. But we go further — the plugin API is so simple and well-documented that **you can ask Claude or ChatGPT to build a plugin for you**. No coding experience required. This is vibe-coding for productivity tools.

## How It Fits in the ASF Ecosystem

ASF builds practical open-source tools for the community:

| Project | What It Does | Status |
|---------|-------------|--------|
| **[ASF Sentinel](https://github.com/asf-org/sentinel)** | Discord bot — AI news curation and server moderation | Active |
| **ASF Docket** | Task manager — AI-native, plugin-driven, local-first | In Development |

Sentinel handles **information flow** — surfacing AI news for the community. Docket handles **personal productivity** — helping individuals manage their work and build their own workflows.

Both projects share:
- ASF values (accuracy, transparency, community ownership)
- Technical foundations (TypeScript, Vitest, Drizzle + SQLite, pnpm)
- Development practices (Conventional Commits, CLAUDE.md for AI-assisted dev)
- The same philosophy: **Simple. Smart. Yours.**

## Design Principles

### 1. Local-First, Private by Default

Data lives on your machine. Docket makes **zero network calls** by default. No accounts, no telemetry, no analytics, no data harvesting. The app works fully offline.

AI features require API keys to providers — but that's your choice, your keys, your data going to your provider. You can run fully local with Ollama for zero data exposure.

**Why:** Privacy by default. No service shutdowns. No "we're changing our pricing." No "we sold your data."

### 2. AI-Native, Not AI-Bolted-On

The AI assistant isn't a checkbox feature. It's a core part of the experience — a conversational interface that understands your tasks, your projects, your schedule. It lives in the sidebar, has voice input, and acts like a real assistant.

But it's also **completely optional**. Docket works perfectly without any AI. You never see an AI feature unless you set up a provider.

**Why:** AI should enhance, not gatekeep. The best AI integration is the one you don't notice until you need it.

### 3. Vibe-Code Extensible

The plugin system is designed for a world where anyone can code — through AI. The API is intentionally simple, heavily documented, and tested against AI code generation. The bar for building a Docket plugin is: *"Can I describe what I want to Claude and get a working plugin back?"* If the answer is no, the API is too complicated.

Inspired by [Pi's extension model](https://github.com/badlogic/pi-mono) and Obsidian's plugin architecture.

**Why:** Extensibility shouldn't require a CS degree. In 2025, everyone can build software through AI. The plugin system should meet users where they are.

### 4. Minimal by Default, Powerful When Needed

The out-of-box experience is clean, fast, and focused. Create a task, check it off, move on. No feature bloat. No configuration walls. The app is a canvas — plugins paint the picture.

**Why:** Different people work differently. A developer wants Git sync and keyboard shortcuts. A PM wants Kanban and time tracking. A student wants Pomodoro and habit tracking. The core app doesn't pick sides.

### 5. Open Source (MIT), Honest Business Model

Fully transparent codebase. Community contributions welcome. MIT license — no restrictions.

Revenue comes from **optional paid sync hosting** (like Obsidian Sync) for users who want cross-device access. The core app is free forever. No freemium tricks, no artificial limitations, no "upgrade to unlock."

**Why:** ASF believes tools for the community should be owned by the community. And a transparent business model builds trust.

### 6. No Vendor Lock-in

Task data is stored in SQLite (standard, readable by any tool) or flat Markdown files (readable by humans). Export is always available in JSON, Markdown, or CSV. Switching away from Docket should be trivial.

**Why:** Respect for users means not trapping them.

## Platform Strategy

| Phase | Platform | How |
|-------|----------|-----|
| **v1** | Desktop (Mac, Windows, Linux) | Tauri — small binary, native performance |
| **v2** | Mobile (iOS, Android) | Native apps + PWA, requires Docket Sync |
| **v3** | Web | Browser app, requires Docket Sync |

Desktop is the focus. Mobile and web come after the sync service is built. Users who want cross-device access before that can use the free Git sync plugin.

## Business Model

| Tier | Price | What You Get |
|------|-------|-------------|
| **Docket** | Free forever | Full app, all features, all plugins, local storage |
| **Docket Sync** | Paid (TBD) | ASF-hosted sync for cross-device access (desktop, mobile, web) |
| **Docket Enterprise** | Paid (future) | Team features, admin controls, SSO |

The core app will never be paywalled. Sync hosting is the only monetization path for the foreseeable future.

## Community & Plugins

### Plugin Store

A community plugin store (like Obsidian's) where users browse, install, and review plugins. All plugins in the store are **reviewed by ASF maintainers** for safety and quality before listing.

### Plugin Development

Anyone can build a plugin:
- **Developers**: Write TypeScript, use the full Plugin API
- **Non-developers**: Describe what you want to Claude/ChatGPT, get a working plugin back
- **The API is the documentation**: If the docs are good enough for AI to generate correct code, they're good enough for humans too

### Contributing to Core

The project welcomes open-source contributions. For now it's a small team, with the community contributing primarily through plugins. As the project grows, core contributions become more structured. See [CONTRIBUTING.md](development/CONTRIBUTING.md).

## What Success Looks Like

- A **beautiful, fast task manager** that people actually switch to from Todoist
- An **AI assistant** that feels like talking to a smart human, not a chatbot
- A **thriving plugin ecosystem** where the community builds what they need
- **Vibe-coding as a first-class workflow**: ask AI, get a plugin, drop it in, done
- A **sustainable project** funded by optional sync hosting, not VC money or dark patterns

See [ROADMAP.md](planning/ROADMAP.md) for the milestone plan and [SPRINTS.md](planning/SPRINTS.md) for current sprint progress.
