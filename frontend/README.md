# Stock Replenishment Dashboard

React frontend for the AI-Powered Stock Replenishment System.

## Setup

```bash
npm install
npm run dev
```

The app runs on http://localhost:5173 and connects to the FastAPI backend at http://127.0.0.1:8000.

## Requirements


```bash
# In the backend folder:
uvicorn main:app --reload
```

## What it does

- **Dashboard**: On load, fetches all low-stock items from `GET /api/inventory/low-stock` and displays them in a table with stock level bars.
- **Evaluate button**: Each row has an "Evaluate with AI" button that sends a `POST /api/evaluate-stock` request with the item's SKU. The button shows a "Thinking..." animation while the CrewAI agents are working.
- **AI Modal**: When the agents respond, a modal appears showing the `suggested_order_quantity` and the full `reasoning_log`.
- **Approve / Reject**: Manager can approve or reject the order. For MVP, approval shows a success toast notification.

## File structure

```
src/
  App.jsx   — all components and logic
  App.css   — all styles
```

## API contract

GET  /api/inventory/low-stock     → returns array of inventory items
POST /api/evaluate-stock          → body: { "sku": "..." } → returns { suggested_order_quantity, reasoning_log }
