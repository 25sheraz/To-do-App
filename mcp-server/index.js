/**
 * mcp-server/index.js
 *
 * Model Context Protocol (MCP) server for the To-do Application.
 * Exposes tools and resources to LLMs (Claude Code, Codex, Antigravity, Cursor)
 * enabling them to inspect the app's architecture, state management, features,
 * and source code.
 *
 * Protocol: JSON-RPC 2.0 over standard I/O (MCP specification 2024-11-05).
 */

const fs   = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');

/* ── Content Loaders ── */

function getAppJs() {
  try {
    return fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
  } catch (e) {
    return '// app.js not found';
  }
}

function getIndexHtml() {
  try {
    return fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  } catch (e) {
    return '<!-- index.html not found -->';
  }
}

function getStyleCss() {
  try {
    return fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');
  } catch (e) {
    return '/* style.css not found */';
  }
}

/* ── App Knowledge Base ── */

function getStateStorageInfo() {
  return [
    '# State Management & Storage in To-do App',
    '',
    '## 1. Where State is Stored',
    '- **Primary Persistence**: `window.localStorage` under the key `"todos"`.',
    '- **Active In-Memory State**: Rendered directly in the DOM tree within `#todo-list > li.todo-item`.',
    '',
    '## 2. Data Schema in localStorage',
    'State is serialized as a JSON string containing an array of todo objects:',
    '```json',
    '[',
    '  {',
    '    "id": "todo-1",',
    '    "text": "Buy groceries",',
    '    "completed": false',
    '  },',
    '  {',
    '    "id": "todo-2",',
    '    "text": "Write tests",',
    '    "completed": true',
    '  }',
    ']',
    '```',
    '',
    '## 3. Storage Lifecycle',
    '- **Saving (`saveTodos`)**: Called automatically whenever an item is added, toggled, deleted, or bulk-cleared.',
    '- **Rehydration (`loadTodos`)**: Invoked on initial page load / app initialization before `syncEmptyState()`.',
    '- **Resilience**: All `localStorage` read/write calls are wrapped in `try/catch` to prevent runtime crashes in private browsing mode or when storage quota is exceeded.',
    '- **ID Tracking**: Auto-incrementing `nextId` counter recovers from the highest numeric ID in stored items to prevent collisions.',
    '',
    '## 4. Public API Interface',
    'The app exports `saveTodos`, `loadTodos`, and `STORAGE_KEY` on `window.__todoApp` for automated testing and inspection.'
  ].join('\n');
}

function getAppArchitecture() {
  return [
    '# To-do Application Architecture',
    '',
    '## Technology Stack',
    '- **HTML5**: Semantic markup with ARIA accessibility labels (`aria-live="polite"`, `aria-label`).',
    '- **CSS3**: Modern custom properties design system with dark-mode aesthetic, glowing gradients, and smooth transitions.',
    '- **JavaScript**: ES2021 Vanilla JS, encapsulated in an IIFE (`app.js`) without external frontend framework dependencies.',
    '',
    '## DOM Structure',
    '- `#todo-form`: Submission form containing `#todo-input` and `#add-btn`.',
    '- `#todo-list`: Unordered list (`<ul>`) container for `.todo-item` (`<li>`) elements.',
    '- `#empty-state`: Empty-state indicator shown when no tasks exist.',
    '- `#todo-toolbar`: Bottom action bar containing `#clear-completed-btn`, visible only when completed items exist.',
    '',
    '## Public Test API (`window.__todoApp`)',
    '- `addTodo(text, completed, id, shouldSave)`: Creates and appends a list item.',
    '- `toggleTodo(li)`: Flips completion status and updates aria-label.',
    '- `deleteTodo(li)`: Deletes specific item and syncs state.',
    '- `clearCompleted()`: Removes all completed tasks in one click.',
    '- `syncEmptyState()`: Synchronizes empty state visibility with list count.',
    '- `syncClearCompleted()`: Synchronizes clear-completed button visibility.',
    '- `saveTodos()`: Serializes DOM list into localStorage.',
    '- `loadTodos()`: Rehydrates list from localStorage.'
  ].join('\n');
}

function listFeatures() {
  return [
    '# Implemented Features & Linear Tickets',
    '',
    '1. **Add Todo Item (SHE-5)**:',
    '   - Form input + Add button (or Enter key) creates a new task.',
    '   - Blank/whitespace input ignored, input field clears automatically.',
    '',
    '2. **Mark Todo as Complete (SHE-6)**:',
    '   - Clicking checkbox or label toggles complete/incomplete state.',
    '   - Strikethrough styling + greyed text + dynamic ARIA state.',
    '',
    '3. **Delete Todo Item (SHE-7)**:',
    '   - Each item includes a delete button (×) removing the item immediately.',
    '   - Re-displays empty-state when last item is deleted.',
    '',
    '4. **Persist Across Reload (SHE-8)**:',
    '   - Synchronizes todos with `localStorage` on add, toggle, and delete.',
    '   - Restores items and their completed states upon page initialization.',
    '',
    '5. **Delete Edge Cases & List Integrity (SHE-9)**:',
    '   - High-rigor test coverage for deleting first, middle, last, and only items.',
    '',
    '6. **Clear Completed Button (SHE-10)**:',
    '   - One-click bulk removal of all completed items, leaving incomplete tasks intact.',
    '   - Dynamic toolbar visibility that shows only when completed items exist.'
  ].join('\n');
}

function queryCode(query) {
  const q = (query || '').toLowerCase().trim();
  const appJs = getAppJs();

  if (q.includes('state') || q.includes('storage') || q.includes('persist') || q.includes('localstorage')) {
    return getStateStorageInfo();
  }

  if (q.includes('delete') && !q.includes('clear')) {
    const match = appJs.match(/\/\*\*[\s\S]*?\*\/[\s\S]*?function deleteTodo[\s\S]*?^  \}/m);
    return match ? match[0] : 'deleteTodo function not found in app.js';
  }

  if (q.includes('clear') || q.includes('completed')) {
    const match = appJs.match(/\/\*\*[\s\S]*?\*\/[\s\S]*?function clearCompleted[\s\S]*?^  \}/m);
    return match ? match[0] : 'clearCompleted function not found in app.js';
  }

  if (q.includes('add')) {
    const match = appJs.match(/\/\*\*[\s\S]*?\*\/[\s\S]*?function addTodo[\s\S]*?^  \}/m);
    return match ? match[0] : 'addTodo function not found in app.js';
  }

  if (q.includes('toggle')) {
    const match = appJs.match(/\/\*\*[\s\S]*?\*\/[\s\S]*?function toggleTodo[\s\S]*?^  \}/m);
    return match ? match[0] : 'toggleTodo function not found in app.js';
  }

  if (q.includes('html') || q.includes('dom') || q.includes('markup')) {
    return getIndexHtml();
  }

  if (q.includes('css') || q.includes('style')) {
    return getStyleCss();
  }

  // Default: search for occurrences in app.js
  const lines = appJs.split('\n');
  const matchedLines = [];
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(q)) {
      const start = Math.max(0, idx - 2);
      const end = Math.min(lines.length - 1, idx + 2);
      matchedLines.push(`Line ${idx + 1}:\n` + lines.slice(start, end + 1).join('\n'));
    }
  });

  if (matchedLines.length > 0) {
    return matchedLines.slice(0, 5).join('\n---\n');
  }

  return `No code snippets found matching "${query}". Try queries like "state", "addTodo", "deleteTodo", "toggleTodo", "clearCompleted", "html", or "css".`;
}

/* ── Tool Definitions ── */

const TOOLS = [
  {
    name: 'get_state_storage_info',
    description: 'Explains where and how application state is stored, its persistence mechanism, schema, and lifecycle (answers: "where is state stored?").',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: 'get_app_architecture',
    description: 'Returns the architectural overview of the To-do application, including DOM layout, styling, and public API.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: 'query_code',
    description: 'Search or inspect specific functions, event handlers, or components in the To-do app (e.g. "addTodo", "deleteTodo", "toggleTodo", "clearCompleted", "saveTodos", "loadTodos", "storage").',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The function, component, or keyword to query.'
        }
      },
      required: ['query'],
      additionalProperties: false
    }
  },
  {
    name: 'list_features',
    description: 'Lists all implemented features and their corresponding Linear ticket IDs (SHE-5 through SHE-10).',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  }
];

/* ── Resource Definitions ── */

const RESOURCES = [
  {
    uri: 'todo://architecture',
    name: 'Application Architecture',
    description: 'Detailed architecture overview of the To-do application',
    mimeType: 'text/markdown'
  },
  {
    uri: 'todo://state-management',
    name: 'State Management Specification',
    description: 'Explanation of state storage, persistence schema, and lifecycle',
    mimeType: 'text/markdown'
  },
  {
    uri: 'todo://source/app.js',
    name: 'JavaScript Source (app.js)',
    description: 'Complete JavaScript source code of the application',
    mimeType: 'text/javascript'
  },
  {
    uri: 'todo://source/index.html',
    name: 'HTML Document (index.html)',
    description: 'Application HTML markup and structure',
    mimeType: 'text/html'
  }
];

/* ── JSON-RPC 2.0 Dispatcher ── */

function handleRequest(request) {
  const { id, method, params } = request;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: 'todo-app-mcp-server',
            version: '1.0.0'
          }
        }
      };

    case 'notifications/initialized':
      return null;

    case 'ping':
      return { jsonrpc: '2.0', id, result: {} };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      };

    case 'tools/call': {
      const toolName = params ? params.name : null;
      const args     = (params && params.arguments) || {};
      let text       = '';

      if (toolName === 'get_state_storage_info') {
        text = getStateStorageInfo();
      } else if (toolName === 'get_app_architecture') {
        text = getAppArchitecture();
      } else if (toolName === 'list_features') {
        text = listFeatures();
      } else if (toolName === 'query_code') {
        text = queryCode(args.query);
      } else {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Tool not found: ${toolName}`
          }
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text
            }
          ]
        }
      };
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: RESOURCES
        }
      };

    case 'resources/read': {
      const uri = params ? params.uri : null;
      let text  = '';
      let mimeType = 'text/plain';

      if (uri === 'todo://architecture') {
        text = getAppArchitecture();
        mimeType = 'text/markdown';
      } else if (uri === 'todo://state-management') {
        text = getStateStorageInfo();
        mimeType = 'text/markdown';
      } else if (uri === 'todo://source/app.js') {
        text = getAppJs();
        mimeType = 'text/javascript';
      } else if (uri === 'todo://source/index.html') {
        text = getIndexHtml();
        mimeType = 'text/html';
      } else {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32602,
            message: `Resource not found: ${uri}`
          }
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType,
              text
            }
          ]
        }
      };
    }

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      };
  }
}

/* ── Standard I/O Loop ── */

function startStdioServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const request = JSON.parse(trimmed);
      const response = handleRequest(request);
      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (err) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error: invalid JSON'
          }
        }) + '\n'
      );
    }
  });
}

// Start stdio loop when run directly
if (require.main === module) {
  startStdioServer();
}

module.exports = {
  handleRequest,
  getStateStorageInfo,
  getAppArchitecture,
  listFeatures,
  queryCode,
  TOOLS,
  RESOURCES
};
