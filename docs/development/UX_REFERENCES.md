# UX References

Apps and patterns to use as reference for Saydo's layout, design, and user experience.

## Tier 1 — Primary References

### Todoist — Clean task input
- Natural language parsing UX (exactly what Saydo's parser does)
- Inbox → Today → Upcoming view pattern
- Quick-add modal with keyboard shortcut
- How they handle priorities, labels, and projects inline

### Things 3 (macOS/iOS) — Minimal design
- Gorgeous whitespace and typography
- "Today" and "Upcoming" views done perfectly
- Headings within projects (grouping without sub-projects)
- How powerful features stay hidden until needed

### Obsidian — Plugin system & community model
- Settings panel per plugin
- Command palette UX
- Community plugin browser/store
- How they handle themes + customization
- Direct reference for Saydo's plugin architecture UX

## Tier 2 — Learn Specific Patterns

### TickTick — AI + calendar integration
- Calendar view alongside tasks
- Habit tracker integration
- How they blend Pomodoro, calendar, and tasks without clutter
- Voice input UX

### Linear — Keyboard-first design
- Command palette (Cmd+K) — reference for `CommandPalette.tsx`
- Keyboard navigation everywhere
- Status/priority/label selectors as popover menus
- Snappy animations and transitions

### Notion — Flexible views
- Table, board, calendar, list views of the same dataset
- Slash command input pattern
- Sidebar navigation structure
- How they handle "blocks" (relevant for plugin-rendered content)

## Tier 3 — Niche Inspirations

| App | Learn From |
|-----|-----------|
| **Superlist** | Collaboration UX, smooth animations, split-view |
| **Amie** | Calendar + tasks unified, gorgeous date picker |
| **Akiflow** | Command bar as the primary input, time-blocking |
| **Apple Reminders** | How dead-simple defaults win casual users |
| **Google Tasks** | Minimal sidebar integration pattern |

## Key UX Patterns

1. **Quick add** — Global shortcut opens a floating input (Todoist, Linear)
2. **Command palette** — Cmd+K for everything (Linear, Obsidian)
3. **Inline parsing feedback** — Show detected date/priority/tags as pills while typing (Todoist)
4. **Progressive disclosure** — Simple by default, details on click/expand (Things 3)
5. **Keyboard-first, mouse-friendly** — Every action has a shortcut but nothing requires one (Linear)
6. **Sidebar nav** — Inbox, Today, Upcoming, then Projects/Tags (Todoist, Things 3)

## Saydo's Target Blend

- **Things 3's visual philosophy** — clean, minimal, opinionated
- **Todoist's input UX** — natural language parsing with inline feedback
- **Obsidian's extensibility model** — plugin store, command palette, community themes
- **Linear's interactions** — keyboard shortcuts and animations
