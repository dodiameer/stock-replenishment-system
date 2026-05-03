import { useState } from "react";

export default function CartModal({ cart, onApprove, onReject, onClose }) {
  const [decision, setDecision] = useState(null);
  const [result, setResult] = useState(null);

  // Calculate the total cost of the basket
  const totalCost = cart.reduce(
    (sum, item) =>
      sum + item.quantity * parseFloat(item.unit_price.replace("$", "")),
    0,
  );

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
          {cart.map((item, idx) => (
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
                  item.quantity * parseFloat(item.unit_price.replace("$", ""))
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
        {result && result.reasoning_log && (
          <div className="modal-reasoning">
            <div className="reasoning-label">
              <span className="reasoning-icon">◈</span> AI ADJUSTMENT LOG
            </div>
            <div className="reasoning-text">{result.reasoning_log}</div>
          </div>
        )}

        {!decision ? (
          <div className="modal-actions">
            <button className="btn-approve" onClick={handleApprove}>
              ✓ Submit Full Order
            </button>
            <button className="btn-reject" onClick={handleReject}>
              ✕ Cancel
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
