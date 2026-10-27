# Mini Expense Tracker

A collaborative Skill Lab project to build a lightweight expense tracking web application.

Project Status: Backend Completed

## Team

| Member | Role |
|--------|------|
| Member 1 | Backend + API Integration + Git Lead |
| Member 2 | Frontend + UI Styling |

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **API**: REST (JSON over HTTP)
- **Storage**: In-memory array (server-side)

## Project Structure

```
Mini-Expense-Tracker/
├── server.js          # Express server + REST API
├── package.json       # npm config & scripts
├── .gitignore
├── README.md
└── public/
    ├── index.html     # HTML structure (Member 2 styles this)
    ├── style.css      # CSS (Member 2 owns this)
    └── app.js         # Fetch/DOM integration (Member 1)
```

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Fetch all expenses |
| POST | `/api/expenses` | Add a new expense |
| DELETE | `/api/expenses/:id` | Delete expense by ID |
| GET | `/api/expenses/total` | Get total amount |

### Expense Object Schema

```json
{
  "id": 1,
  "title": "Lunch",
  "amount": 80,
  "category": "Food",
  "date": "2026-10-27"
}
```

### Valid Categories

`Food` | `Transport` | `Shopping` | `Entertainment` | `Health` | `Education` | `Utilities` | `Other`

## Getting Started

### Prerequisites

- Node.js v16+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Mini-Expense-Tracker

# Install dependencies
npm install

# Start the server
npm start
```

Server runs at: **http://localhost:3000**

## Validation Rules

The API enforces the following rules on POST requests:

- `title` — required, cannot be empty
- `amount` — must be a number greater than 0
- `category` — must be one of the valid categories listed above
- `date` — required, must be in `YYYY-MM-DD` format

## Git Branches

| Branch | Owner | Purpose |
|--------|-------|---------|
| `main` | — | Production-ready merged code |
| `feature/backend-integration` | Member 1 | Backend, API, JS integration |
| `feature/frontend-styling` | Member 2 | HTML redesign, CSS styling |

## License

ISC
