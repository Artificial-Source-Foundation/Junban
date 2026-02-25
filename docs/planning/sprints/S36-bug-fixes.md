# Sprint 36 — "Bug Fixes"

**Goal**: Fix three bugs discovered during comprehensive Playwright testing: NLP deadline keyword parsing, right-click context menu wiring, and ultrawide monitor layout.

| ID | Item | Status |
|----|------|--------|
| QA-15 | NLP "deadline friday" keyword doesn't set deadline field | done |
| QA-16 | Right-click context menu on tasks does nothing (component not wired) | done |
| QA-17 | Ultrawide monitors (2560px+): content stretches edge-to-edge | done |
| — | 11 new parser tests (8 extractDeadline unit + 3 parseTask integration) | done |

**Result**: Three bug fixes shipped. NLP parser now supports both "deadline friday" keyword and "!!friday" prefix syntax. Context menu wired through TaskList and all four task views (Inbox, Today, Upcoming, Project) into App.tsx with Edit, Complete, Priority, Move to project, and Delete actions. Main content area constrained to max-w-7xl (1280px) for ultrawide monitors. 1785 passing tests.
