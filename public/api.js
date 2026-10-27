/**
 * api.js — Fetch API Integration Layer
 * Member 1: Backend + Integration + Git Lead
 * =============================================
 * This file is intentionally named api.js (NOT script.js or app.js)
 * to avoid merge conflicts with Member 2's UI script (script.js).
 *
 * After merging both branches, Member 2's script.js handles UI events,
 * and this file handles all Fetch API communication with the backend.
 *
 * Assumes the following DOM element IDs exist
 * (defined in index.html, styled by Member 2):
 *
 *   #expense-form    — <form> for adding expenses
 *   #title           — <input> for expense title
 *   #amount          — <input> for expense amount
 *   #category        — <select> for expense category
 *   #date            — <input type="date">
 *   #expense-list    — <tbody> where rows are rendered
 *   #total-amount    — <span> showing the total
 *   #form-error      — <p> for showing error messages
 *   #form-success    — <p> for showing success messages
 *   #no-expenses-msg — <p> shown when list is empty
 *
 * POST-MERGE NOTE for Member 2:
 *   If your script.js already handles form submit / delete button clicks,
 *   remove the event listeners at the bottom of this file and call
 *   submitExpense() / deleteExpense() directly from your script.js instead.
 */

// ─── API Base URL ──────────────────────────────────────────────────────────────
const API_BASE = "/api/expenses";

// ─── DOM References ────────────────────────────────────────────────────────────
const expenseForm     = document.getElementById("expense-form");
const titleInput      = document.getElementById("title");
const amountInput     = document.getElementById("amount");
const categoryInput   = document.getElementById("category");
const dateInput       = document.getElementById("date");
const expenseList     = document.getElementById("expense-list");
const totalAmountEl   = document.getElementById("total-amount");
const formError       = document.getElementById("form-error");
const formSuccess     = document.getElementById("form-success");
const noExpensesMsg   = document.getElementById("no-expenses-msg");

// ─── Utility: Show / Hide messages ────────────────────────────────────────────

function showError(message) {
  formError.textContent = message;
  formError.style.display = "block";
  formSuccess.style.display = "none";
  // Auto-clear after 4 seconds
  setTimeout(() => { formError.style.display = "none"; }, 4000);
}

function showSuccess(message) {
  formSuccess.textContent = message;
  formSuccess.style.display = "block";
  formError.style.display = "none";
  setTimeout(() => { formSuccess.style.display = "none"; }, 3000);
}

// ─── 1. Load All Expenses ─────────────────────────────────────────────────────

/**
 * Fetches all expenses from GET /api/expenses and renders them
 * in the #expense-list tbody. Also refreshes the total.
 */
async function loadExpenses() {
  try {
    const response = await fetch(API_BASE);

    if (!response.ok) {
      const data = await response.json();
      showError(data.error || "Failed to load expenses.");
      return;
    }

    const expenses = await response.json();
    renderExpenses(expenses);
    await refreshTotal();

  } catch (err) {
    showError("Network error: Could not connect to the server.");
    console.error("loadExpenses error:", err);
  }
}

// ─── 2. Render Expenses to DOM ────────────────────────────────────────────────

/**
 * Clears and re-renders all expense rows in #expense-list.
 * @param {Array} expenses - Array of expense objects from the API
 */
function renderExpenses(expenses) {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    noExpensesMsg.style.display = "block";
    return;
  }

  noExpensesMsg.style.display = "none";

  expenses.forEach((expense) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", expense.id);

    row.innerHTML = `
      <td>${expense.id}</td>
      <td>${escapeHTML(expense.title)}</td>
      <td>₹${expense.amount.toFixed(2)}</td>
      <td>${escapeHTML(expense.category)}</td>
      <td>${expense.date}</td>
      <td>
        <button
          class="delete-btn"
          data-id="${expense.id}"
          onclick="deleteExpense(${expense.id})"
          aria-label="Delete expense ${expense.id}"
        >Delete</button>
      </td>
    `;

    expenseList.appendChild(row);
  });
}

// ─── 3. Submit (Add) Expense ──────────────────────────────────────────────────

/**
 * Reads form inputs and POSTs a new expense to /api/expenses.
 * On success, reloads the expense list and resets the form.
 * Can be called directly from Member 2's script.js after merge.
 */
async function submitExpense(event) {
  event.preventDefault();

  const payload = {
    title:    titleInput.value.trim(),
    amount:   parseFloat(amountInput.value),
    category: categoryInput.value,
    date:     dateInput.value,
  };

  // Basic client-side check before hitting the server
  if (!payload.title) {
    showError("Please enter a title.");
    return;
  }
  if (!payload.amount || payload.amount <= 0) {
    showError("Please enter a valid amount greater than 0.");
    return;
  }
  if (!payload.category) {
    showError("Please select a category.");
    return;
  }
  if (!payload.date) {
    showError("Please select a date.");
    return;
  }

  try {
    const response = await fetch(API_BASE, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Failed to add expense.");
      return;
    }

    showSuccess(`Expense "${data.title}" added successfully!`);
    expenseForm.reset();
    await loadExpenses(); // Reload list + total

  } catch (err) {
    showError("Network error: Could not connect to the server.");
    console.error("submitExpense error:", err);
  }
}

// ─── 4. Delete Expense ────────────────────────────────────────────────────────

/**
 * Sends DELETE /api/expenses/:id and removes the row from the DOM.
 * Can be called directly from Member 2's script.js after merge.
 * @param {number} id - The expense ID to delete
 */
async function deleteExpense(id) {
  if (!confirm(`Are you sure you want to delete expense #${id}?`)) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Failed to delete expense.");
      return;
    }

    showSuccess(`Expense #${id} deleted.`);
    await loadExpenses(); // Reload list + total

  } catch (err) {
    showError("Network error: Could not connect to the server.");
    console.error("deleteExpense error:", err);
  }
}

// ─── 5. Refresh Total ─────────────────────────────────────────────────────────

/**
 * Fetches the current total from GET /api/expenses/total
 * and updates the #total-amount element.
 * Can be called directly from Member 2's script.js after merge.
 */
async function refreshTotal() {
  try {
    const response = await fetch(`${API_BASE}/total`);

    if (!response.ok) return;

    const data = await response.json();
    totalAmountEl.textContent = `₹${data.total.toFixed(2)}`;

  } catch (err) {
    console.error("refreshTotal error:", err);
  }
}

// ─── Utility: Prevent XSS ────────────────────────────────────────────────────

/**
 * Escapes HTML special characters to prevent XSS when inserting
 * user-supplied strings into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
// POST-MERGE NOTE: If Member 2's script.js attaches its own submit listener,
// remove these two lines to avoid duplicate handlers.
expenseForm.addEventListener("submit", submitExpense);

// ─── Init: Load expenses when page is ready ───────────────────────────────────
document.addEventListener("DOMContentLoaded", loadExpenses);
