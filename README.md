# Todo App — Agent-Driven Development Loop & MCP Server

> **Evaluation Task**: AI Automation Engineer (Intern) — Shayan Solutions  
> **Repository**: [github.com/25sheraz/To-do-App](https://github.com/25sheraz/To-do-App)  
> **Linear Project**: [To-do-list](https://linear.app/sheraz-ahmad/project/to-do-list-51860119c343)

---

## 1. Overview

This repository demonstrates a fully automated, agent-driven software development lifecycle built entirely through "vibe coding" (prompting autonomous AI coding agents without hand-editing application code). 

The application is a minimal, elegant Todo App with comprehensive automated test coverage, robust CI/CD, and a custom Model Context Protocol (MCP) server that enables LLMs (such as Claude Code and Codex) to inspect the code and answer architectural questions (e.g., *"where is state stored?"*).

### Implemented Features & Linear Tickets
* **SHE-5**: Add todo item with form validation and input clearing.
* **SHE-6**: Mark todo item as complete/incomplete with dynamic ARIA tags.
* **SHE-7**: Delete single todo items with immediate list sync.
* **SHE-8**: Persist todos and completion states across page reloads using `localStorage`.
* **SHE-9**: Rigorous delete edge-case tests protecting list integrity.
* **SHE-10**: "Clear completed" button in a responsive action toolbar.
* **SHE-11**: Custom Model Context Protocol (MCP) server for external LLM querying.
* **SHE-12**: End-to-end evaluation documentation and README.

---

## 2. The End-to-End Agent Loop

Every feature, bugfix, and test was developed one ticket at a time following this strict, repeatable loop:

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│ 1. FETCH    │ ──> │ 2. BRANCH    │ ──> │ 3. IMPLEMENT  │ ──> │ 4. OPEN PR  │
│ Pull Linear │     │ Isolated git │     │ Code + Tests  │     │ Target main │
│ Move status │     │ off main     │     │ Commit & push │     │ Link Linear │
└─────────────┘     └──────────────┘     └───────────────┘     └─────────────┘
                                                                      │
┌─────────────┐     ┌──────────────┐     ┌───────────────┐            │
│ 8. REPORT   │ <── │ 7. MERGE     │ <── │ 6. REVIEW     │ <── 5. CI ─┘
│ Discovery   │     │ Squash-merge │     │ Automated bot │     GitHub Actions
│ note posted │     │ Delete branch│     │ + self-review │     Tests & Lint
└─────────────┘     └──────────────┘     └───────────────┘
```

1. **FETCH**: The agent pulls the next ticket from Linear, inspects acceptance criteria, and transitions the status to `In Progress`.
2. **BRANCH**: The agent creates an isolated branch off the latest `main` (`feature/<TICKET-ID>-<slug>`). Working directly on `main` is prohibited.
3. **IMPLEMENT**: The agent writes minimal code and comprehensive unit tests, verifying locally with Jest and ESLint.
4. **OPEN PR**: The branch is pushed to GitHub and a PR is opened targeting `main`. The Linear ticket is moved to `In Review` with the PR link attached.
5. **CI**: GitHub Actions executes `ci.yml` (Jest test suite + ESLint with zero-warning threshold).
6. **REVIEW**: An automated code review workflow (`pr-review.yml`) inspects the diff and posts findings. The agent performs a self-review comment verifying all acceptance criteria.
7. **MERGE**: Once CI is green and reviews approve, the PR is squash-merged into `main`, the feature branch is deleted locally and remotely, and the ticket is set to `Done`.
8. **REPORT**: The agent scans the modified area for dead code, risks, or improvements, posting a post-merge discovery note to Linear.

---

## 3. Agents & MCP Servers Used

* **Autonomous Orchestration Agent**: Powered by Google DeepMind's Advanced Agentic Coding system (`Antigravity`).
* **Linear MCP Server**: Integrated via Model Context Protocol to manage issues, state transitions, relations, attachments, and comments autonomously.
* **App Custom MCP Server (`mcp-server/index.js`)**: A custom stdio JSON-RPC 2.0 MCP server built directly into the repository exposing tools and resources for external LLMs.

---

## 4. Connecting the Custom MCP Server

The custom MCP server runs over standard I/O (JSON-RPC 2.0) with **zero external npm runtime dependencies**. It can be connected to any MCP-compliant client.

### Connecting to Claude Code
Add the MCP server to Claude Code using the CLI:
```bash
claude mcp add todo-app node "c:/Users/Sheraz/Desktop/To-do-App/mcp-server/index.js"
```
Or with relative path from the repository root:
```bash
claude mcp add todo-app node "./mcp-server/index.js"
```

### Connecting to OpenAI Codex / Cursor / Claude Desktop
Add the server entry to your MCP client configuration (`claude_desktop_config.json` or equivalent):

```json
{
  "mcpServers": {
    "todo-app": {
      "command": "node",
      "args": ["c:/Users/Sheraz/Desktop/To-do-App/mcp-server/index.js"]
    }
  }
}
```

### Available MCP Tools & Queries
Once connected, you can ask questions directly:
* **"Where is state stored?"**  
  Invokes `get_state_storage_info`: Explains that state is stored in `window.localStorage` under the `"todos"` key, serialized as JSON objects `{ id, text, completed }`, and rehydrated on startup.
* **"What does clear completed do?"**  
  Invokes `query_code`: Retrieves the implementation of `clearCompleted()`, explaining how completed items are bulk-removed and synchronized with storage.
* **"How is the app architected?"**  
  Invokes `get_app_architecture`: Explains the semantic HTML5 layout, CSS custom properties, and `window.__todoApp` public API.
* **"What features are implemented?"**  
  Invokes `list_features`: Summarizes tickets `SHE-5` through `SHE-10`.

---

## 5. Automated Testing & Quality Gates

The repository contains 54 automated unit tests covering DOM behavior, edge cases, storage persistence, and MCP protocol handling:

```bash
# Run all tests
npm test

# Run code linter
npm run lint

# Start the MCP server manually
npm run mcp
```

### Test Coverage Summary
* **SHE-5 (Add)**: 7 tests (creation, input reset, blank rejection, sequence, empty state).
* **SHE-6 (Toggle)**: 6 tests (completion class, checkbox state, labels, aria-labels).
* **SHE-7 (Delete)**: 6 tests (immediate removal, preservation of siblings, empty-state restore).
* **SHE-9 (Delete Edge Cases)**: 5 tests (solo item deletion, first/last/middle items).
* **SHE-8 (Persistence)**: 8 tests (localStorage synchronization, reload rehydration, corrupted JSON handling).
* **SHE-10 (Clear Completed)**: 8 tests (bulk removal, toolbar toggle, empty state sync).
* **SHE-11 (MCP Server)**: 14 tests (protocol handshake, tool execution, resource reading, error handling).

---

## 6. What I Would Do Next With More Time

1. **Category Tags & Due Dates**: Allow users to assign tags/priorities and due dates to todos.
2. **Backend Sync & Conflict Resolution**: Add an optional SQLite or Supabase sync backend for multi-device synchronization with offline fallback.
3. **MCP Interactive Tools**: Expand the MCP server with write tools (e.g. `add_todo_item`, `toggle_todo_item`) so agents can manipulate the live running app via browser devtools bridge.
4. **Automated Visual Regression CI**: Integrate Playwright with visual snapshots into the GitHub Actions CI pipeline.
