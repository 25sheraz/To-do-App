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
   * @param {HTMLElement} li - The <li> todo item element.
   */
  function toggleTodo(li) {
    const checkbox = li.querySelector('.todo-checkbox');
    const label    = li.querySelector('.todo-label');

    checkbox.checked = !checkbox.checked;
    li.classList.toggle('completed', checkbox.checked);

    const action = checkbox.checked ? 'Mark as incomplete' : 'Mark as complete';
    checkbox.setAttribute('aria-label', `${action}: "${label.textContent}"`);
  }

  /**
   * Delete a todo item from the list (SHE-7).
   * Removes the <li> immediately and syncs the empty-state message.
   * @param {HTMLElement} li - The <li> todo item element to remove.
   */
  function deleteTodo(li) {
    li.remove();
    syncEmptyState();
  }

  /**
   * Create and append a new todo <li> element.
   * @param {string} text - The trimmed todo text.
   * @returns {HTMLElement} The created list item.
   */
  function addTodo(text) {
    const id      = `todo-${nextId++}`;
    const li      = document.createElement('li');
    li.className  = 'todo-item';
    li.dataset.id = id;

    /* Checkbox (SHE-5 / SHE-6) */
    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.id        = `chk-${id}`;
    checkbox.checked   = false;
    checkbox.setAttribute('aria-label', `Mark as complete: "${text}"`);

    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
      const action = checkbox.checked ? 'Mark as incomplete' : 'Mark as complete';
      checkbox.setAttribute('aria-label', `${action}: "${text}"`);
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
    return li;
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
  syncEmptyState();

  /* ── Public API (used by tests) ── */
  window.__todoApp = { addTodo, toggleTodo, deleteTodo, syncEmptyState };
})();
