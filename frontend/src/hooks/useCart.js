import { useState } from "react";

export function useCart(addToast) {
  const [cart, setCart] = useState([]);

  function handleApproveItem(item, qty) {
    if (qty === 0) return;
    const name = item.Product_Name || item.name;
    addToast(`Added to cart: ${qty} units of ${name}`, "success");
    setCart((prev) => [...prev, { ...item, quantity: qty }]);
  }

  function handleRejectItem(item) {
    const name = item.Product_Name || item.name;
    addToast(`Order for ${name} rejected`, "neutral");
  }

  function handleApproveCart(approvedCart, onDone) {
    const totalUnits = approvedCart.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    addToast(
      `Success: Order placed for ${approvedCart.length} items (${totalUnits} total units).`,
      "success",
    );
    setCart([]);
    onDone?.();
  }

  function handleRejectCart(onDone) {
    addToast("Order cancelled.", "neutral");
    setCart([]);
    onDone?.();
  }

  return {
    cart,
    handleApproveItem,
    handleRejectItem,
    handleApproveCart,
    handleRejectCart,
  };
}
