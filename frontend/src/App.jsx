import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function stockRatio(current, threshold) {
  return Math.min((current / threshold) * 100, 100);
}

function StockBar({ current, threshold }) {
  const pct = stockRatio(current, threshold);
  const color = pct < 30 ? "var(--danger)" : pct < 60 ? "var(--warn)" : "var(--ok)";
  return (
    <div className="stock-bar-track">
      <div className="stock-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="thinking-dots">
      <span /><span /><span />
    </span>
  );
}

function BasketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function AIModal({ item, result, onApprove, onReject, onClose }) {
  const [decision, setDecision] = useState(null);

  function handleApprove() {
    setDecision("approved");
    onApprove(item, result.suggested_order_quantity);
  }

  function handleReject() {
    setDecision("rejected");
    onReject(item);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-tag">AI CONSENSUS</div>
          <h2>{item.Product_Name || item.name}</h2>
          <p className="modal-sku">SKU: {item.Product_ID || item.sku}</p>
        </div>

        <div className="modal-quantity-block">
          <div className="quantity-label">SUGGESTED ORDER QUANTITY</div>
          <div className="quantity-value">{result.suggested_order_quantity}</div>
          <div className="quantity-unit">units</div>
        </div>

        <div className="modal-reasoning">
          <div className="reasoning-label">
            <span className="reasoning-icon">◈</span> AGENT REASONING LOG
          </div>
          <div className="reasoning-text">{result.reasoning_log}</div>
        </div>

        {!decision ? (
          <div className="modal-actions">
            <button className="btn-approve" onClick={handleApprove}>✓ Approve Order</button>
            <button className="btn-reject" onClick={handleReject}>✕ Reject</button>
          </div>
        ) : (
          <div className={`decision-banner ${decision}`}>
            {decision === "approved"
              ? `✓ Order of ${result.suggested_order_quantity} units approved`
              : "✕ Order rejected"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState({});
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/inventory/low-stock`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.items || []);
        setItems(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleEvaluate = useCallback(async (item) => {
    const sku = item.Product_ID || item.sku;
    setEvaluating((prev) => ({ ...prev, [sku]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/evaluate-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const result = await res.json();
      setModal({ item, result });
    } catch (err) {
      addToast(`Error: ${err.message}`, "error");
    } finally {
      setEvaluating((prev) => ({ ...prev, [sku]: false }));
    }
  }, []);

  function addToast(message, type = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function handleApprove(item, qty) {
    const name = item.Product_Name || item.name;
    addToast(`Order placed: ${qty} units of ${name}`, "success");
  }

  function handleReject(item) {
    const name = item.Product_Name || item.name;
    addToast(`Order for ${name} rejected`, "neutral");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-mark">
            <BasketIcon />
          </div>
          <div>
            <div className="header-title">REPLENISH</div>
            <div className="header-sub">AI-Powered Stock Decision System</div>
          </div>
        </div>
        <div className="header-right">
          <div className="status-pill">
            <span className="status-dot" />
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      <div className="summary-bar">
        <div className="summary-item">
          <span className="summary-num">{items.length}</span>
          <span className="summary-label">LOW STOCK ALERTS</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-num danger">
            {items.filter((i) => {
              const cur = i.current_stock ?? i.Stock_Quantity ?? 0;
              const thr = i.threshold ?? i.Reorder_Level ?? 1;
              return stockRatio(cur, thr) < 30;
            }).length}
          </span>
          <span className="summary-label">CRITICAL</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-num warn">
            {items.filter((i) => {
              const cur = i.current_stock ?? i.Stock_Quantity ?? 0;
              const thr = i.threshold ?? i.Reorder_Level ?? 1;
              const r = stockRatio(cur, thr);
              return r >= 30 && r < 60;
            }).length}
          </span>
          <span className="summary-label">WARNING</span>
        </div>
      </div>

      <main className="main-content">
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p>Scanning inventory...</p>
          </div>
        )}

        {error && (
          <div className="state-container error">
            <div className="error-icon">!</div>
            <p>Cannot reach backend</p>
            <p className="error-detail">{error}</p>
            <p className="error-hint">Make sure FastAPI is running on port 8000</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="state-container">
            <div className="ok-icon">✓</div>
            <p>All stock levels are healthy</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>PRODUCT</th>
                  <th>CURRENT STOCK</th>
                  <th>REORDER LEVEL</th>
                  <th>LEVEL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const sku = item.sku || item.Product_ID || idx;
                  const name = item.name || item.Product_Name || "Unknown";
                  const current = item.current_stock ?? item.Stock_Quantity ?? 0;
                  const threshold = item.threshold ?? item.Reorder_Level ?? 0;
                  const ratio = stockRatio(current, threshold);
                  const isEvaluating = evaluating[sku];
                  const urgencyClass = ratio < 30 ? "row-critical" : ratio < 60 ? "row-warn" : "";

                  return (
                    <tr key={sku} className={urgencyClass} style={{ animationDelay: `${idx * 40}ms` }}>
                      <td className="sku-cell">{sku}</td>
                      <td className="name-cell">{name}</td>
                      <td className="stock-cell">
                        <span className={ratio < 30 ? "danger" : ratio < 60 ? "warn" : "ok"}>
                          {current}
                        </span>
                      </td>
                      <td>{threshold}</td>
                      <td>
                        <StockBar current={current} threshold={threshold} />
                      </td>
                      <td>
                        <button
                          className={`evaluate-btn ${isEvaluating ? "loading" : ""}`}
                          onClick={() => handleEvaluate(item)}
                          disabled={isEvaluating}
                        >
                          {isEvaluating ? (<>Thinking <ThinkingDots /></>) : "Evaluate with AI"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <AIModal
          item={modal.item}
          result={modal.result}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setModal(null)}
        />
      )}

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}