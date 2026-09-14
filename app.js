/**
 * app.js — SHE-5: Add a new todo item
 *
 * Features:
 *  - Text input + "Add" button (or Enter key) creates a new unchecked item
 *  - Input clears after adding
 *  - Empty / whitespace-only submissions are ignored
 *  - Clicking the item or its checkbox toggles complete/incomplete
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
    checkbox.checked      = false;          // SHE-5: unchecked by default
    checkbox.setAttribute('aria-label', `Mark "${text}" as complete`);

    const label            = document.createElement('label');
    label.className        = 'todo-label';
    label.htmlFor          = `chk-${id}`;
    label.textContent      = text;

    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
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

    // SHE-5: ignore empty submissions
    if (!text) {
      input.focus();
      return;
    }

    addTodo(text);

    // SHE-5: clear input after adding
    input.value = '';
    input.focus();
  }

  form.addEventListener('submit', handleSubmit);

  /* ── Initial render ── */
  syncEmptyState();

  /* ── Public API (used by tests) ── */
  window.__todoApp = { addTodo, syncEmptyState };
})();
