/**
 * tests/todo.test.js
 * Unit tests for SHE-5: Add a new todo item
 *
 * Runs in Jest's jsdom environment (configured in package.json).
 *
 * Covers:
 *  1. Adds a new todo item to the list
 *  2. New items are unchecked by default
 *  3. Input clears after a successful add
 *  4. Empty / whitespace-only submissions are ignored
 *  5. Multiple items can be added sequentially
 *  6. Empty-state message hides once a todo is added
 *  7. Empty-state message shows when list is empty
 */

const fs   = require('fs');
const path = require('path');

/* ── Setup: inject HTML + app.js before each test ── */
beforeEach(() => {
  // Load and inject the HTML structure into the jsdom document
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

  // Extract just the <body> content so we don't double-wrap html/head/body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  document.body.innerHTML = bodyMatch ? bodyMatch[1] : html;

  // Remove any existing script tags (we'll eval the app code directly)
  document.querySelectorAll('script').forEach((s) => s.remove());

  // Execute app.js in the jsdom window context
  const appCode = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');

  // eslint-disable-next-line no-eval
  window.eval(appCode);
});

afterEach(() => {
  // Clean up window.__todoApp between tests
  delete window.__todoApp;
});

/* ── Helpers ── */
function getForm()       { return document.getElementById('todo-form'); }
function getInput()      { return document.getElementById('todo-input'); }
function getList()       { return document.getElementById('todo-list'); }
function getEmptyState() { return document.getElementById('empty-state'); }

/** Type text into the input and submit the form */
function submitTodo(text) {
  const input = getInput();
  const form  = getForm();
  input.value = text;
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

/* ── Tests ── */
describe('SHE-5: Add a new todo item', () => {

  test('adds a new todo item to the list', () => {
    submitTodo('Buy groceries');
    expect(getList().children.length).toBe(1);
    expect(getList().querySelector('.todo-label').textContent).toBe('Buy groceries');
  });

  test('new todo item is unchecked by default', () => {
    submitTodo('Read a book');
    const checkbox = getList().querySelector('.todo-checkbox');
    expect(checkbox.checked).toBe(false);
  });

  test('input clears after adding a todo', () => {
    submitTodo('Go for a walk');
    expect(getInput().value).toBe('');
  });

  test('ignores empty submissions (blank string)', () => {
    submitTodo('');
    expect(getList().children.length).toBe(0);
  });

  test('ignores whitespace-only submissions', () => {
    submitTodo('   ');
    expect(getList().children.length).toBe(0);
  });

  test('adds multiple todos and each is unchecked', () => {
    submitTodo('Task one');
    submitTodo('Task two');
    submitTodo('Task three');
    expect(getList().children.length).toBe(3);
    getList().querySelectorAll('.todo-checkbox').forEach((cb) => {
      expect(cb.checked).toBe(false);
    });
  });

  test('hides empty-state message once a todo is added', () => {
    expect(getEmptyState().classList.contains('hidden')).toBe(false);
    submitTodo('Something to do');
    expect(getEmptyState().classList.contains('hidden')).toBe(true);
  });
});
