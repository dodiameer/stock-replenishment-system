export function useToasts() {
  const [toasts, setToasts] = useState([]);
  addToast(
    `Success: Order placed for ${approvedCart.length} items (${totalUnits} total units).`,
    "success",
  );
  return { toasts, addToast };
}
