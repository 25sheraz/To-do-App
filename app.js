/**
 * app.js — SHE-5 + SHE-6: Add and toggle todo items
 *
 * Features (SHE-5):
 *  - Text input + "Add" button (or Enter key) creates a new unchecked item
 *  - Input clears after adding
 *  - Empty / whitespace-only submissions are ignored
 *
 * Features (SHE-6):
 *  - Clicking the checkbox OR the label toggles complete/incomplete
 *  - Completed items get a "completed" class → strikethrough + greyed text
 *  - aria-label updates to reflect current state after toggle
 */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const form      = document.getElementById('todo-form');
  const input     = document.getElementById('todo-input');
  const list      = document.getElementById('todo-list');
  const emptyMsg  = document.getElementById('empty-state');

  let nextId = 1;

  /* ── Helpers ── */

  /**
   * Show / hide the empty-state message based on list length.
   */
  function syncEmptyState() {
    if (list.children.length === 0) {
      emptyMsg.classList.remove('hidden');
    } else {
      emptyMsg.classList.add('hidden');
    }
  }

  /**
   * Toggle a todo item's complete / incomplete state (SHE-6).
   * Updates the checkbox, the "completed" CSS class, and the aria-label.
   * @param {HTMLElement} li - The <li> todo item element.
   */
  function toggleTodo(li) {
    const checkbox = li.querySelector('.todo-checkbox');
    const label    = li.querySelector('.todo-label');

    checkbox.checked = !checkbox.checked;
    li.classList.toggle('completed', checkbox.checked);

    // Keep aria-label meaningful after toggle
    const action = checkbox.checked ? 'Mark as incomplete' : 'Mark as complete';
    checkbox.setAttribute('aria-label', `${action}: "${label.textContent}"`);
  }

  /**
   * Create and append a new todo <li> element.
   * @param {string} text - The trimmed todo text.
   * @returns {HTMLElement} The created list item.
   */
  function addTodo(text) {
    const id       = `todo-${nextId++}`;
    const li       = document.createElement('li');
    li.className   = 'todo-item';
    li.dataset.id  = id;

    const checkbox        = document.createElement('input');
    checkbox.type         = 'checkbox';
    checkbox.className    = 'todo-checkbox';
    checkbox.id           = `chk-${id}`;
    checkbox.checked      = false;
    checkbox.setAttribute('aria-label', `Mark as complete: "${text}"`);

    const label       = document.createElement('label');
    label.className   = 'todo-label';
    label.htmlFor     = `chk-${id}`;
    label.textContent = text;

    // SHE-6: checkbox change drives the visual toggle
    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
      const action = checkbox.checked ? 'Mark as incomplete' : 'Mark as complete';
      checkbox.setAttribute('aria-label', `${action}: "${text}"`);
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);

    syncEmptyState();
    return li;
  }

  /* ── Form submission ── */

  /**
   * Handle the add-todo form submit event.
   * Ignores empty / whitespace-only input.
   * Clears the input field after a successful add.
   * @param {SubmitEvent} e
   */
  function handleSubmit(e) {
    e.preventDefault();

    const text = input.value.trim();

    if (!text) {
      input.focus();
      return;
    }

    addTodo(text);

    input.value = '';
    input.focus();
  }

  form.addEventListener('submit', handleSubmit);

  /* ── Initial render ── */
  syncEmptyState();

  /* ── Public API (used by tests) ── */
  window.__todoApp = { addTodo, toggleTodo, syncEmptyState };
})();
