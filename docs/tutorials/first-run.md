# First Run: Your first Junban session

## Goal

Get a local Junban instance running and create your first task.

## Prerequisites

Complete the source install path in [How to install Junban](../how-to/install.md) first. This tutorial assumes dependencies are installed, the default dev database has been migrated, and you can run `pnpm dev`.

If you have already done that, this tutorial should take only a few minutes.

## Steps

### 1) Start Junban

```bash
pnpm dev
```

Open `http://localhost:5173`.

You should see the inbox with natural-language input in the task composer.

### 2) Create your first task

Type a full sentence:

```text
review PR by Friday p2 #work
```

Junban parses this into a task with metadata (title, due date, priority, and tags).

### 3) Confirm it is saved

Run one of the following from another terminal:

```bash
pnpm cli list
pnpm cli list --today
```

If you want to try CLI mode directly, no extra setup is required in this same profile.

## What changed in this first run

- You started the local app.
- You verified persistence by creating and listing a task.

## Where to go next

- Continue learning with [Build your first Junban plugin](your-first-plugin.md).
- If you are now solving a specific task, start at [How-To Guides](../how-to/README.md).
- If you want source setup context, see [Local Development Setup](../guides/SETUP.md).
- If you are after deeper behavior, read the [Technical Reference](../reference/README.md).
