# REPLENISH: AI-Powered Stock Decision System

REPLENISH is a full-stack, AI-driven inventory management application. It replaces static stock alerts with intelligent, multi-agent AI (powered by CrewAI) that automatically evaluates, approves, and optimizes bulk restock orders based on strict company policies (budget limits, warehouse capacity, and perishable goods rules).

## Key Features

- **Intelligent Batch Processing:** Evaluate multiple low-stock items at once using the AI Cart system.
- **Auto-Optimization:** If an order breaches company policy (e.g., exceeds the $1500 cart limit), the AI agent automatically recalculates and reduces quantities to ensure compliance instead of just rejecting the order.
- **Humanized AI Logs:** Receive clear, natural-language reasoning logs explaining exactly _why_ the AI made its purchasing decisions.
- **Advanced Search & Filter:** Instant frontend fuzzy search (via Fuse.js) with multi-field indexing (SKU, Name, Category, Supplier) and typo tolerance.
- **Sorting:** Clickable table headers to instantly sort inventory by stock levels.
- **Cost-Efficient AI Routing:** Environment-variable-based model switching. Uses faster, cheaper models for rapid local testing and heavy-duty 70B models for final production.

## Tech Stack

- **Frontend:** React, Vite, CSS.
- **Backend:** Python, FastAPI.
- **AI & Logic:** CrewAI, LangChain.

## Project Structure

```text
replenish/
├── backend/                  # Python Microservice
│   ├── main.py               # FastAPI server & endpoints
│   ├── ai_engine.py          # CrewAI agents and task definitions
│   ├── company_policy.txt    # RAG knowledge base for the AI
│   └── .env                  # API keys and feature flags
├── grocery-data/             # Mock database (CSV/JSON files)
├── src/                      # React Frontend
│   ├── components/           # Isolated UI components
│   ├── hooks/                # Custom state and API logic
│   └── App.jsx               # Main application layout
├── package.json
└── README.md
```
