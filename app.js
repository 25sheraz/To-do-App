/**
 * app.js — SHE-5 + SHE-6 + SHE-7: Add, toggle, and delete todo items
 *
 * Features (SHE-5):
 *  - Text input + "Add" button (or Enter key) creates a new unchecked item
 *  - Input clears after adding; empty/whitespace submissions ignored
 *
 * Features (SHE-6):
 *  - Clicking checkbox or label toggles complete/incomplete
 *  - Completed items get "completed" class → strikethrough + greyed text
 *  - aria-label updates to reflect current state after toggle
 *
 * Features (SHE-7):
 *  - Each item has a delete button (×)
 *  - Clicking it removes that item immediately, no confirmation needed
 *  - Empty-state message re-appears when the last item is deleted
 */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const form     = document.getElementById('todo-form');
  const input    = document.getElementById('todo-input');
  const list     = document.getElementById('todo-list');
  const emptyMsg = document.getElementById('empty-state');

  const STORAGE_KEY = 'todos';
  let nextId = 1;

  /* ── Helpers ── */

  /**
   * Save current list items into localStorage (SHE-8).
   */
  function saveTodos() {
    try {
      const items = Array.from(list.children).map((li) => {
        const checkbox = li.querySelector('.todo-checkbox');
        const label    = li.querySelector('.todo-label');
        return {
          id: li.dataset.id,
          text: label ? label.textContent : '',
          completed: checkbox ? checkbox.checked : false
        };
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // Storage unavailable or quota exceeded
    }
  }

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
   * @param {HTMLElement} li - The <li> todo item element.
   */
  function toggleTodo(li) {
    const checkbox = li.querySelector('.todo-checkbox');
    const label    = li.querySelector('.todo-label');

    checkbox.checked = !checkbox.checked;
    li.classList.toggle('completed', checkbox.checked);

    const action = checkbox.checked ? 'Mark as incomplete' : 'Mark as complete';
    checkbox.setAttribute('aria-label', `${action}: "${label.textContent}"`);
    saveTodos();
  }

  /**
   * Delete a todo item from the list (SHE-7).
   * Removes the <li> immediately and syncs the empty-state message.
   * @param {HTMLElement} li - The <li> todo item element to remove.
   */
  function deleteTodo(li) {
    li.remove();
    syncEmptyState();
    saveTodos();
  }

  /**
   * Create and append a new todo <li> element.
   * @param {string} text - The trimmed todo text.
   * @param {boolean} [completed=false] - Whether the item is completed.
   * @param {string|null} [existingId=null] - Pre-existing ID when loading from storage.
   * @param {boolean} [shouldSave=true] - Whether to persist to localStorage.
   * @returns {HTMLElement} The created list item.
   */
  function addTodo(text, completed = false, existingId = null, shouldSave = true) {
    let id = existingId;
    if (!id) {
      id = `todo-${nextId++}`;
    } else {
      const numMatch = id.match(/\d+$/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (!isNaN(num) && num >= nextId) {
          nextId = num + 1;
        }
      }
    }

    const li      = document.createElement('li');
    li.className  = 'todo-item';
    if (completed) {
      li.classList.add('completed');
    }
    li.dataset.id = id;

    /* Checkbox (SHE-5 / SHE-6) */
    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.id        = `chk-${id}`;
    checkbox.checked   = Boolean(completed);
    const initialAction = completed ? 'Mark as incomplete' : 'Mark as complete';
    checkbox.setAttribute('aria-label', `${initialAction}: "${text}"`);

    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
      const action = checkbox.checked ? 'Mark as incomplete' : 'Mark as complete';
      checkbox.setAttribute('aria-label', `${action}: "${text}"`);
      saveTodos();
    });

    /* Label (SHE-5 / SHE-6) */
    const label       = document.createElement('label');
    label.className   = 'todo-label';
    label.htmlFor     = `chk-${id}`;
    label.textContent = text;

    /* Delete button (SHE-7) */
    const deleteBtn   = document.createElement('button');
    deleteBtn.type    = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', `Delete "${text}"`);

    deleteBtn.addEventListener('click', () => {
      deleteTodo(li);
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(deleteBtn);
    list.appendChild(li);

    syncEmptyState();
    if (shouldSave) {
      saveTodos();
    }
    return li;
  }

  /**
   * Load and render todos from localStorage (SHE-8).
   */
  function loadTodos() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item && typeof item.text === 'string') {
            addTodo(item.text, Boolean(item.completed), item.id, false);
          }
        });
      }
    } catch (e) {
      // Ignore invalid JSON / corrupted storage
    }
  }

  /* ── Form submission ── */

  /**
   * Handle the add-todo form submit event.
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
  loadTodos();
  syncEmptyState();

  /* ── Public API (used by tests) ── */
  window.__todoApp = { addTodo, toggleTodo, deleteTodo, syncEmptyState, saveTodos, loadTodos, STORAGE_KEY };
})();
