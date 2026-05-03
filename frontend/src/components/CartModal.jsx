import { useState, useEffect } from "react";
import { API_BASE } from "../constants";
import { ThinkingDots } from "./Icons";

export default function CartModal({
  cart,
  onApprove,
  onReject,
  onClose,
  onError,
}) {
  const [decision, setDecision] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [currentCart, setCurrentCart] = useState(cart);
  const [loading, setLoading] = useState(false);

  // Calculate the total cost of the basket
  let totalCost = currentCart.reduce((sum, item) => {
    return sum + item.quantity * parseFloat(item.unit_price?.replace("$", ""));
  }, 0);

  function startEvaluation() {
    setLoading(true);
    const basket = cart.map((item) => {
      return {
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
      };
    });
    fetch(`${API_BASE}/api/evaluate-basket`, {
      method: "POST",
      body: JSON.stringify({ basket }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then(({ result }) => {
        setEvaluationResult(result.reasoning_log);
        setCurrentCart(result.updated_basket);
      })
      .catch(onError)
      .finally(() => setLoading(false));
  }

  function handleApprove() {
    setDecision("approved");
    // Send the entire array of items to the approve handler
    onApprove(cart);
  }

  function handleReject() {
    setDecision("rejected");
    if (onReject) onReject();
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
          <div className="modal-tag">Pending Cart</div>
          <h2>Review Order Details</h2>
        </div>

        {/* Display the list of items in the cart */}
        <div
          className="cart-item-list"
          style={{ margin: "15px 0", maxHeight: "200px", overflowY: "auto" }}
        >
          {currentCart.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{item.name || item.Product_Name}</strong>
                <span style={{ marginLeft: "0.75ch" }}>({item.quantity})</span>
              </div>
              <div>
                $
                {(
                  item.quantity * parseFloat(item.unit_price?.replace("$", ""))
                ).toFixed(2)}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              fontWeight: "bold",
              fontSize: "1.1em",
            }}
          >
            <span>Total:</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Only show the AI reasoning log if the AI actually evaluated and adjusted the cart */}
        {evaluationResult && (
          <div className="modal-reasoning">
            <div className="reasoning-label">
              <span className="reasoning-icon">◈</span> AI ADJUSTMENT LOG
            </div>
            <div className="reasoning-text">{evaluationResult}</div>
          </div>
        )}

        {!decision ? (
          <div className="modal-actions">
            <button
              className="btn-approve"
              onClick={startEvaluation}
              disabled={loading || evaluationResult}
            >
              {loading ? (
                <ThinkingDots />
              ) : evaluationResult ? (
                "Evaluation complete"
              ) : (
                "? Evaluate order"
              )}
            </button>
            <button
              className="btn-approve"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? <ThinkingDots /> : "✓ Confirm order"}
            </button>
            <button
              className="btn-reject"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? <ThinkingDots /> : "✕ Cancel Order"}
            </button>
          </div>
        ) : (
          <div className={`decision-banner ${decision}`}>
            {decision === "approved"
              ? `✓ Order for ${cart.length} items submitted successfully`
              : "✕ Order cancelled"}
          </div>
        )}
      </div>
    </div>
  );
}
