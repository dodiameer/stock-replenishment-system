import { useState, useEffect, useCallback } from "react";

export default function AIModal({
  item,
  result,
  onApprove,
  onReject,
  onClose,
}) {
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
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <div className="modal-tag">AI CONSENSUS</div>
          <h2>{item.Product_Name || item.name}</h2>
          <p className="modal-sku">SKU: {item.Product_ID || item.sku}</p>
        </div>

        <div className="modal-quantity-block">
          <div className="quantity-label">SUGGESTED ORDER QUANTITY</div>
          <div className="quantity-value">
            {result.suggested_order_quantity}
          </div>
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
            <button className="btn-approve" onClick={handleApprove}>
              ✓ Approve Order
            </button>
            <button className="btn-reject" onClick={handleReject}>
              ✕ Reject
            </button>
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
