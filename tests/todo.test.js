/**
 * tests/todo.test.js
 * Unit tests for SHE-5 + SHE-6 + SHE-7 + SHE-9
 *
 * Runs in Jest's jsdom environment (configured in package.json).
 *
 * SHE-5: Add a new todo item (7 tests)
 * SHE-6: Mark a todo item as complete (6 tests)
 * SHE-7: Delete a todo item (6 tests)
 * SHE-9: Delete edge cases – list integrity (5 tests)
 */

const fs   = require('fs');
const path = require('path');

function reloadApp() {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  document.body.innerHTML = bodyMatch ? bodyMatch[1] : html;
  document.querySelectorAll('script').forEach((s) => s.remove());
  const appCode = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(appCode);
}

/* ── Setup ── */
beforeEach(() => {
  window.localStorage.clear();
  reloadApp();
});

afterEach(() => {
  window.localStorage.clear();
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

/* ─────────────────────────────────────────────
   SHE-5: Add a new todo item
───────────────────────────────────────────── */
describe('SHE-5: Add a new todo item', () => {

  test('adds a new todo item to the list', () => {
    submitTodo('Buy groceries');
    expect(getList().children.length).toBe(1);
    expect(getList().querySelector('.todo-label').textContent).toBe('Buy groceries');
  });

  test('new todo item is unchecked by default', () => {
    submitTodo('Read a book');
    expect(getList().querySelector('.todo-checkbox').checked).toBe(false);
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

  test('adds multiple todos sequentially', () => {
    submitTodo('Task one');
    submitTodo('Task two');
    submitTodo('Task three');
    expect(getList().children.length).toBe(3);
  });

  test('hides empty-state message once a todo is added', () => {
    expect(getEmptyState().classList.contains('hidden')).toBe(false);
    submitTodo('Something to do');
    expect(getEmptyState().classList.contains('hidden')).toBe(true);
  });
});

/* ─────────────────────────────────────────────
   SHE-6: Mark a todo item as complete
───────────────────────────────────────────── */
describe('SHE-6: Mark a todo item as complete', () => {

  test('checking the checkbox adds "completed" class', () => {
    submitTodo('Exercise');
    const li       = getList().children[0];
    const checkbox = li.querySelector('.todo-checkbox');
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

  test('toggleTodo() twice returns item to unchecked state', () => {
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

/* ─────────────────────────────────────────────
   SHE-7: Delete a todo item
───────────────────────────────────────────── */
describe('SHE-7: Delete a todo item', () => {

  test('each todo item has a delete button', () => {
    submitTodo('Task with delete');
    const li = getList().children[0];
    expect(li.querySelector('.delete-btn')).not.toBeNull();
  });

  test('clicking delete button removes that item from the list', () => {
    submitTodo('Remove me');
    const li        = getList().children[0];
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.click();
    expect(getList().children.length).toBe(0);
  });

  test('deleteTodo() removes the item immediately', () => {
    submitTodo('Delete via API');
    const li = getList().children[0];
    window.__todoApp.deleteTodo(li);
    expect(getList().children.length).toBe(0);
  });

  test('deleting one item leaves others untouched', () => {
    submitTodo('Keep me');
    submitTodo('Delete me');
    submitTodo('Keep me too');
    const items = getList().children;
    const deleteBtn = items[1].querySelector('.delete-btn');
    deleteBtn.click();
    expect(getList().children.length).toBe(2);
    expect(getList().children[0].querySelector('.todo-label').textContent).toBe('Keep me');
    expect(getList().children[1].querySelector('.todo-label').textContent).toBe('Keep me too');
  });

  test('empty-state message reappears after last item is deleted', () => {
    submitTodo('Only task');
    expect(getEmptyState().classList.contains('hidden')).toBe(true);
    const deleteBtn = getList().children[0].querySelector('.delete-btn');
    deleteBtn.click();
    expect(getEmptyState().classList.contains('hidden')).toBe(false);
  });

  test('delete button has an aria-label for accessibility', () => {
    submitTodo('Accessible task');
    const deleteBtn = getList().children[0].querySelector('.delete-btn');
    expect(deleteBtn.getAttribute('aria-label')).toContain('Delete');
  });
});

/* ─────────────────────────────────────────────
   SHE-9: Delete edge cases – list integrity
───────────────────────────────────────────── */
describe('SHE-9: Delete edge cases – list integrity', () => {

  test('deleting the only item leaves the list completely empty', () => {
    submitTodo('Solo task');
    const li = getList().children[0];
    window.__todoApp.deleteTodo(li);
    expect(getList().children.length).toBe(0);
  });

  test('deleting first item of many leaves remaining items untouched', () => {
    submitTodo('First');
    submitTodo('Second');
    submitTodo('Third');
    const firstLi = getList().children[0];
    window.__todoApp.deleteTodo(firstLi);
    expect(getList().children.length).toBe(2);
    expect(getList().children[0].querySelector('.todo-label').textContent).toBe('Second');
    expect(getList().children[1].querySelector('.todo-label').textContent).toBe('Third');
  });

  test('deleting last item of many leaves remaining items untouched', () => {
    submitTodo('Alpha');
    submitTodo('Beta');
    submitTodo('Gamma');
    const lastLi = getList().children[2];
    window.__todoApp.deleteTodo(lastLi);
    expect(getList().children.length).toBe(2);
    expect(getList().children[0].querySelector('.todo-label').textContent).toBe('Alpha');
    expect(getList().children[1].querySelector('.todo-label').textContent).toBe('Beta');
  });

  test('deleting all items one by one restores empty-state after the last deletion', () => {
    submitTodo('Task A');
    submitTodo('Task B');
    expect(getEmptyState().classList.contains('hidden')).toBe(true);

    window.__todoApp.deleteTodo(getList().children[0]); // remove "Task A"
    expect(getEmptyState().classList.contains('hidden')).toBe(true); // still has Task B

    window.__todoApp.deleteTodo(getList().children[0]); // remove "Task B"
    expect(getEmptyState().classList.contains('hidden')).toBe(false); // empty again
  });

  test('completed item can be deleted and does not affect incomplete siblings', () => {
    submitTodo('Keep this (incomplete)');
    submitTodo('Delete this (complete)');

    const completedLi = getList().children[1];
    window.__todoApp.toggleTodo(completedLi);
    expect(completedLi.classList.contains('completed')).toBe(true);

    window.__todoApp.deleteTodo(completedLi);
    expect(getList().children.length).toBe(1);
    expect(getList().children[0].classList.contains('completed')).toBe(false);
    expect(getList().children[0].querySelector('.todo-label').textContent).toBe('Keep this (incomplete)');
  });
});

/* ─────────────────────────────────────────────
   SHE-8: Persist todos across page reload
───────────────────────────────────────────── */
describe('SHE-8: Persist todos across page reload', () => {

  test('saves newly added todos to localStorage', () => {
    submitTodo('Persistent task');
    const stored = JSON.parse(window.localStorage.getItem('todos'));
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.length).toBe(1);
    expect(stored[0].text).toBe('Persistent task');
    expect(stored[0].completed).toBe(false);
    expect(typeof stored[0].id).toBe('string');
  });

  test('updates localStorage when a todo is toggled complete', () => {
    submitTodo('Task to complete');
    const li = getList().children[0];
    window.__todoApp.toggleTodo(li);

    const stored = JSON.parse(window.localStorage.getItem('todos'));
    expect(stored[0].completed).toBe(true);
  });

  test('updates localStorage when a todo is toggled back to incomplete', () => {
    submitTodo('Toggle twice');
    const li = getList().children[0];
    window.__todoApp.toggleTodo(li);
    window.__todoApp.toggleTodo(li);

    const stored = JSON.parse(window.localStorage.getItem('todos'));
    expect(stored[0].completed).toBe(false);
  });

  test('updates localStorage when a todo is deleted', () => {
    submitTodo('Keep');
    submitTodo('Remove');
    const liToRemove = getList().children[1];
    window.__todoApp.deleteTodo(liToRemove);

    const stored = JSON.parse(window.localStorage.getItem('todos'));
    expect(stored.length).toBe(1);
    expect(stored[0].text).toBe('Keep');
  });

  test('reloads todos from localStorage on app re-initialization', () => {
    submitTodo('First item');
    submitTodo('Second item');
    window.__todoApp.toggleTodo(getList().children[0]);

    // Simulate page reload
    reloadApp();

    expect(getList().children.length).toBe(2);
    expect(getList().children[0].querySelector('.todo-label').textContent).toBe('First item');
    expect(getList().children[0].classList.contains('completed')).toBe(true);
    expect(getList().children[0].querySelector('.todo-checkbox').checked).toBe(true);
    expect(getList().children[1].querySelector('.todo-label').textContent).toBe('Second item');
    expect(getList().children[1].classList.contains('completed')).toBe(false);
    expect(getList().children[1].querySelector('.todo-checkbox').checked).toBe(false);
    expect(getEmptyState().classList.contains('hidden')).toBe(true);
  });

  test('preserves the order of todos across reload', () => {
    submitTodo('Alpha');
    submitTodo('Beta');
    submitTodo('Gamma');

    reloadApp();

    const labels = Array.from(getList().querySelectorAll('.todo-label')).map((l) => l.textContent);
    expect(labels).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  test('handles empty localStorage cleanly on load', () => {
    reloadApp();
    expect(getList().children.length).toBe(0);
    expect(getEmptyState().classList.contains('hidden')).toBe(false);
  });

  test('handles corrupted/invalid JSON in localStorage gracefully without throwing', () => {
    window.localStorage.setItem('todos', '{{invalid-json');
    expect(() => reloadApp()).not.toThrow();
    expect(getList().children.length).toBe(0);
    expect(getEmptyState().classList.contains('hidden')).toBe(false);
  });
});
