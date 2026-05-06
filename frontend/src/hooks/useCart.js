export function useCart(addToast) {
  const [cart, setCart] = useState([]);

  function handleApproveItem(item, qty) {
    if (qty === 0) {
      return;
    }
    const name = item.Product_Name || item.name;
    addToast(`Added to cart: ${qty} units of ${name}`, "success");

    setCart([...cart, { ...item, quantity: qty }]);
  }

  function handleRejectItem(item) {
    const name = item.Product_Name || item.name;
    addToast(`Order for ${name} rejected`, "neutral");
  }

  function handleApproveCart(approvedCart) {
    // Calculate total units to make the toast more informative
    const totalUnits = approvedCart.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
  }
  function handleRejectCart() {
    addToast("Order cancelled.", "neutral");
  }
  // Close the modal
  setCartModal(null);
  setCart([]);

  return {
    cart,
    setCart,
    handleApproveItem,
    handleRejectItem,
    handleApproveCart,
    handleRejectCart,
  };
}
