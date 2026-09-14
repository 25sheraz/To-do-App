/**
 * tests/todo.test.js
 * Unit tests for SHE-5 + SHE-6
 *
 * Runs in Jest's jsdom environment (configured in package.json).
 *
 * SHE-5 covers:
 *  1. Adds a new todo item to the list
 *  2. New items are unchecked by default
 *  3. Input clears after a successful add
 *  4. Empty / whitespace-only submissions are ignored
 *  5. Multiple items can be added sequentially
 *  6. Empty-state message hides once a todo is added
 *
 * SHE-6 covers:
 *  7.  Checking the checkbox adds "completed" class to the item
 *  8.  Unchecking removes "completed" class
 *  9.  toggleTodo() flips checked state and class
 *  10. toggleTodo() twice returns item to original state
 *  11. Completed item label text is unchanged
 *  12. aria-label updates to "Mark as incomplete" after checking
 */

const fs   = require('fs');
const path = require('path');

/* ── Setup: inject HTML + app.js before each test ── */
beforeEach(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  document.body.innerHTML = bodyMatch ? bodyMatch[1] : html;
  document.querySelectorAll('script').forEach((s) => s.remove());
  const appCode = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(appCode);
});

afterEach(() => {
  delete window.__todoApp;
});

/* ── Helpers ── */
function getForm()       { return document.getElementById('todo-form'); }
function getInput()      { return document.getElementById('todo-input'); }
function getList()       { return document.getElementById('todo-list'); }
function getEmptyState() { return document.getElementById('empty-state'); }

function submitTodo(text) {
  const input = getInput();
  const form  = getForm();
  input.value = text;
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

/* ── SHE-5: Add a new todo item ── */
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

/* ── SHE-6: Mark a todo item as complete ── */
describe('SHE-6: Mark a todo item as complete', () => {

  test('checking the checkbox adds "completed" class to the item', () => {
    submitTodo('Exercise');
    const li       = getList().children[0];
    const checkbox = li.querySelector('.todo-checkbox');

    expect(li.classList.contains('completed')).toBe(false);
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(li.classList.contains('completed')).toBe(true);
  });

  test('unchecking removes "completed" class', () => {
    submitTodo('Meditate');
    const li       = getList().children[0];
    const checkbox = li.querySelector('.todo-checkbox');

    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(li.classList.contains('completed')).toBe(true);

    checkbox.checked = false;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(li.classList.contains('completed')).toBe(false);
  });

  test('toggleTodo() flips checked state and adds completed class', () => {
    submitTodo('Write tests');
    const li = getList().children[0];

    window.__todoApp.toggleTodo(li);
    expect(li.querySelector('.todo-checkbox').checked).toBe(true);
    expect(li.classList.contains('completed')).toBe(true);
  });

  test('toggleTodo() twice returns item to original unchecked state', () => {
    submitTodo('Clean desk');
    const li = getList().children[0];

    window.__todoApp.toggleTodo(li);
    window.__todoApp.toggleTodo(li);

    expect(li.querySelector('.todo-checkbox').checked).toBe(false);
    expect(li.classList.contains('completed')).toBe(false);
  });

  test('completed item label text remains unchanged', () => {
    submitTodo('Read docs');
    const li = getList().children[0];
    window.__todoApp.toggleTodo(li);
    expect(li.querySelector('.todo-label').textContent).toBe('Read docs');
  });

  test('aria-label updates to "Mark as incomplete" after checking', () => {
    submitTodo('Ship feature');
    const li       = getList().children[0];
    const checkbox = li.querySelector('.todo-checkbox');

    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(checkbox.getAttribute('aria-label')).toContain('Mark as incomplete');
  });
});
