import { useState, useEffect } from "react";
import { API_BASE } from "../constants";

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/inventory/low-stock`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items || [];
        setItems(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []); // <-- this empty array is critical, without it the fetch runs on every render

  return { items, loading, error };
}
