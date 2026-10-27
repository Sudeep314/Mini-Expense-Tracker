// =====================================================
// Mini Expense Tracker - Frontend UI (Member 2)
// This file only handles DOM / UI work.
// NO fetch() calls here - the backend teammate will add them.
// =====================================================

// ---------- Grab elements from the page ----------
const expenseForm = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const formError = document.getElementById("form-error");

const expenseList = document.getElementById("expense-list");
const expenseTable = document.getElementById("expense-table");
const emptyState = document.getElementById("empty-state");
const emptyText = document.getElementById("empty-text");

const totalAmount = document.getElementById("total-amount");
const periodLabel = document.getElementById("period-label");
const weekTotal = document.getElementById("week-total");
const monthTotal = document.getElementById("month-total");
const yearTotal = document.getElementById("year-total");

const tabs = document.querySelectorAll(".tab");

// ---------- UI state ----------
// All expenses currently known by the UI (the backend will fill this later)
let expenses = [];

// Which period tab is selected: "all", "week", "month" or "year"
let currentPeriod = "all";

const PERIOD_NAMES = {
  all: "All Time",
  week: "This Week",
  month: "This Month",
  year: "This Year",
};


// =====================================================
// DATE HELPERS
// =====================================================

// Today's date as "YYYY-MM-DD" (used as the default in the date input)
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// Turn "YYYY-MM-DD" into a Date at local midnight
function parseDate(dateString) {
  const parts = dateString.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Is this date inside the chosen period?
// week = Monday to Sunday of the current week
function isInPeriod(dateString, period) {
  if (period === "all") {
    return true;
  }

  const date = parseDate(dateString);
  const now = new Date();

  if (period === "year") {
    return date.getFullYear() === now.getFullYear();
  }

  if (period === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  if (period === "week") {
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysSinceMonday = (now.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return date >= startOfWeek && date < endOfWeek;
  }

  return true;
}

// Show "27 Oct 2026"
function formatDate(dateString) {
  return parseDate(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Format a number like ₹1,250.00
function formatCurrency(value) {
  return "₹" + value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Expenses that match the selected tab, newest first
function getVisibleExpenses() {
  return expenses
    .filter(function (expense) {
      return isInPeriod(expense.date, currentPeriod);
    })
    .sort(function (a, b) {
      return parseDate(b.date) - parseDate(a.date);
    });
}

// Add up the amounts for one period
function sumForPeriod(period) {
  let total = 0;
  expenses.forEach(function (expense) {
    if (isInPeriod(expense.date, period)) {
      total += expense.amount;
    }
  });
  return total;
}


// =====================================================
// UI HELPER FUNCTIONS (my work)
// =====================================================

// 1. Collect form values into one object
function getFormValues() {
  return {
    title: titleInput.value.trim(),
    amount: parseFloat(amountInput.value),
    category: categorySelect.value,
    date: dateInput.value,
  };
}

// 2. Clear the form after adding
function clearForm() {
  expenseForm.reset();
  dateInput.value = getTodayString();
  formError.hidden = true;
  titleInput.focus();
}

// Show a small error message under the form
function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

// 3. Create one table row for an expense
function createExpenseRow(expense) {
  const row = document.createElement("tr");
  row.dataset.id = expense.id;

  const titleCell = document.createElement("td");
  titleCell.textContent = expense.title;

  const categoryCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = "category-badge";
  badge.textContent = expense.category;
  categoryCell.appendChild(badge);

  const dateCell = document.createElement("td");
  dateCell.className = "date-cell";
  dateCell.textContent = formatDate(expense.date);

  const amountCell = document.createElement("td");
  amountCell.className = "num";
  amountCell.textContent = formatCurrency(expense.amount);

  const actionCell = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", function () {
    deleteExpense(expense.id);
  });
  actionCell.appendChild(deleteBtn);

  row.append(titleCell, categoryCell, dateCell, amountCell, actionCell);
  return row;
}

// Draw the table rows for the selected period
function renderExpenses() {
  expenseList.innerHTML = "";
  getVisibleExpenses().forEach(function (expense) {
    expenseList.appendChild(createExpenseRow(expense));
  });
  refreshUI();
}

// 4. Remove a row visually
function removeExpenseRow(id) {
  const row = expenseList.querySelector('tr[data-id="' + id + '"]');
  if (row) {
    row.remove();
  }
}

// 5. Update the displayed total (for the selected period)
function updateTotal() {
  let total = 0;
  getVisibleExpenses().forEach(function (expense) {
    total += expense.amount;
  });
  totalAmount.textContent = formatCurrency(total);
  periodLabel.textContent = "· " + PERIOD_NAMES[currentPeriod];
}

// Update the weekly / monthly / yearly summary cards
function updateSummaries() {
  weekTotal.textContent = formatCurrency(sumForPeriod("week"));
  monthTotal.textContent = formatCurrency(sumForPeriod("month"));
  yearTotal.textContent = formatCurrency(sumForPeriod("year"));
}

// Show the table or the empty state, and refresh all numbers
function refreshUI() {
  const hasRows = expenseList.children.length > 0;
  expenseTable.hidden = !hasRows;
  emptyState.hidden = hasRows;

  if (!hasRows) {
    emptyText.textContent =
      expenses.length === 0
        ? "Add your first expense using the form above."
        : "No expenses found for " + PERIOD_NAMES[currentPeriod].toLowerCase() + ".";
  }

  updateTotal();
  updateSummaries();
}

// Switch the period tab (All / Weekly / Monthly / Yearly)
function setPeriod(period) {
  currentPeriod = period;

  tabs.forEach(function (tab) {
    const isActive = tab.dataset.period === period;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", isActive);
  });

  renderExpenses();
}


// =====================================================
// PLACEHOLDER FUNCTIONS (backend teammate connects these)
// =====================================================

// Load all expenses when the page opens.
// TODO (backend teammate): fetch expenses from the server,
// put them into the `expenses` array, then call renderExpenses().
function loadExpenses() {
  // Nothing to load yet - the UI starts empty.
  renderExpenses();
}

// Add a new expense.
// TODO (backend teammate): send `expense` to the server,
// then push the saved expense (with its real id) into `expenses`.
function addExpense(expense) {
  // Temporary id so the UI works without a backend.
  expense.id = Date.now();
  expenses.push(expense);

  renderExpenses();
  clearForm();
}

// Delete an expense.
// TODO (backend teammate): tell the server to delete this id,
// then remove it from `expenses` once it succeeds.
function deleteExpense(id) {
  expenses = expenses.filter(function (expense) {
    return expense.id !== id;
  });

  removeExpenseRow(id);
  refreshUI();
}


// =====================================================
// EVENTS
// =====================================================

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const expense = getFormValues();

  if (expense.title === "") {
    showError("Please enter a title.");
    return;
  }
  if (isNaN(expense.amount) || expense.amount <= 0) {
    showError("Please enter an amount greater than 0.");
    return;
  }
  if (expense.category === "") {
    showError("Please choose a category.");
    return;
  }
  if (expense.date === "") {
    showError("Please pick a date.");
    return;
  }

  addExpense(expense);
});

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    setPeriod(tab.dataset.period);
  });
});

// Run when the page loads
dateInput.value = getTodayString();
loadExpenses();
