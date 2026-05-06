import { useState, useMemo } from "react";
import { criticalCount, warningCount } from "./utils/helpers";
import { BasketIcon } from "./components/Icons";
import { useToasts } from "./hooks/useToasts";
import { useInventory } from "./hooks/useInventory";
import { useEvaluate } from "./hooks/useEvaluate";
import { useCart } from "./hooks/useCart";
import InventoryRow from "./components/InventoryRow";
import AIModal from "./components/AIModal";
import CartModal from "./components/CartModal";
import "./App.css";
import { API_BASE } from "./constants";

export default function App() {
  const [modal, setModal] = useState(null);
  const [cartModal, setCartModal] = useState(null);

  const { toasts, addToast } = useToasts();
  const {
    items,
    loading,
    error,
    sortOrder,
    toggleSort,
    searchQuery,
    setSearchQuery,
  } = useInventory();

  const { evaluating, handleEvaluate } = useEvaluate(addToast, setModal);
  const {
    cart,
    handleApproveItem,
    handleRejectItem,
    handleApproveCart,
    handleRejectCart,
  } = useCart(addToast, setCartModal);

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
          <span className="summary-num danger">{criticalCount(items)}</span>
          <span className="summary-label">CRITICAL</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-num warn">{warningCount(items)}</span>
          <span className="summary-label">WARNING</span>
        </div>
        <div style={{ marginLeft: "auto" }} className="summary-item">
          <button className="evaluate-btn" onClick={() => setCartModal(true)}>
            Show cart
          </button>
        </div>
      </div>
      <div
        className="search-bar-container"
        style={{
          padding: "1rem 2rem",
          background: "white",
          borderBottom: "1px solid #eee",
        }}
      >
        <input
          type="text"
          placeholder="Search by SKU, Product, Category, or Supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
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
            <p className="error-hint">
              Make sure FastAPI is running on port 8000
            </p>
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
                  <th>CATEGORY</th>
                  <th>SUPPLIER</th>
                  <th
                    onClick={toggleSort}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Click to sort by stock amount"
                  >
                    CURRENT STOCK{" "}
                    {sortOrder === "asc"
                      ? "↑"
                      : sortOrder === "desc"
                        ? "↓"
                        : "↕"}
                  </th>
                  <th>REORDER LEVEL</th>
                  <th>LEVEL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <InventoryRow
                    key={item.sku || item.Product_ID || idx}
                    item={item}
                    index={idx}
                    isEvaluating={
                      !!evaluating[item.sku || item.Product_ID || idx]
                    }
                    onEvaluate={handleEvaluate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <AIModal
          item={modal.item}
          result={modal.result}
          onApprove={handleApproveItem}
          onReject={handleRejectItem}
          onClose={() => setModal(null)}
        />
      )}

      {cartModal && (
        <CartModal
          cart={cart}
          onApprove={(approvedCart) =>
            handleApproveCart(approvedCart, () => setCartModal(null))
          }
          onReject={() => handleRejectCart(() => setCartModal(null))}
          onClose={() => setCartModal(null)}
          onError={(err) => addToast(`Error: ${err.message}`, "error")}
        />
      )}

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
