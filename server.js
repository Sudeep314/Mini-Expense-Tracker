/**
 * server.js — Mini Expense Tracker
 * Member 1: Backend + Integration + Git Lead
 *
 * REST API (in-memory storage):
 *   GET    /api/expenses         → all expenses
 *   POST   /api/expenses         → add expense (with validation)
 *   DELETE /api/expenses/:id     → delete expense
 *   GET    /api/expenses/total   → sum of all amounts
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── In-Memory Data Store ──────────────────────────────────────────────────────
let expenses = [];
let nextId = 1;

// Allowed expense categories
const VALID_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Utilities",
  "Other",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validates a date string (YYYY-MM-DD).
 * Returns true if valid, false otherwise.
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return false;
  // Must match YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  // Check it actually parsed to a real date
  return !isNaN(date.getTime());
}

/**
 * Validates an incoming expense payload.
 * Returns { valid: true } or { valid: false, message: "..." }
 */
function validateExpense({ title, amount, category, date }) {
  if (!title || typeof title !== "string" || title.trim() === "") {
    return { valid: false, message: "Title is required and cannot be empty." };
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { valid: false, message: "Amount must be a number greater than 0." };
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return {
      valid: false,
      message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
    };
  }

  if (!isValidDate(date)) {
    return {
      valid: false,
      message: "Date is required and must be in YYYY-MM-DD format.",
    };
  }

  return { valid: true };
}

// ─── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/expenses/total
 * Returns the sum of all expense amounts.
 * NOTE: Must be defined BEFORE /api/expenses/:id to avoid route conflict.
 */
app.get("/api/expenses/total", (req, res) => {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  res.status(200).json({
    total: parseFloat(total.toFixed(2)),
    count: expenses.length,
  });
});

/**
 * GET /api/expenses
 * Returns all expenses as a JSON array.
 */
app.get("/api/expenses", (req, res) => {
  res.status(200).json(expenses);
});

/**
 * POST /api/expenses
 * Body: { title, amount, category, date }
 * Validates input and adds a new expense.
 */
app.post("/api/expenses", (req, res) => {
  const { title, amount, category, date } = req.body;

  const validation = validateExpense({ title, amount, category, date });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  const newExpense = {
    id: nextId++,
    title: title.trim(),
    amount: parseFloat(parseFloat(amount).toFixed(2)),
    category,
    date,
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

/**
 * DELETE /api/expenses/:id
 * Deletes the expense with the given numeric ID.
 */
app.delete("/api/expenses/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID must be a valid number." });
  }

  const index = expenses.findIndex((exp) => exp.id === id);

  if (index === -1) {
    return res
      .status(404)
      .json({ error: `Expense with ID ${id} not found.` });
  }

  const deleted = expenses.splice(index, 1)[0];
  res.status(200).json({ message: "Expense deleted successfully.", deleted });
});

// ─── 404 Handler for unknown API routes ───────────────────────────────────────
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// ─── Fallback: serve index.html for all non-API routes (SPA support) ──────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Mini Expense Tracker server running at http://localhost:${PORT}`);
  console.log(`📂  Serving static files from: ./public`);
  console.log(`🔌  API base URL: http://localhost:${PORT}/api/expenses`);
});

module.exports = app;
