import { useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  function addToast(message, type = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  return { toasts, addToast };
}
