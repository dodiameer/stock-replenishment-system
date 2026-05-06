import { useState, useEffect, useMemo } from "react";
import { API_BASE } from "../constants";

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

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
  const toggleSort = () => {
    if (sortOrder === "asc") setSortOrder("desc");
    else if (sortOrder === "desc")
      setSortOrder(null); // Reset to default
    else setSortOrder("asc");
  };

  // useMemo recalculates this ONLY when 'items' or 'sortOrder' changes
  const sortedItems = useMemo(() => {
    if (!sortOrder) return items;

    // Create a copy of the array so we don't mutate the original state
    return [...items].sort((a, b) => {
      const stockA = a.current_stock ?? a.Stock_Quantity ?? 0;
      const stockB = b.current_stock ?? b.Stock_Quantity ?? 0;

      return sortOrder === "asc" ? stockA - stockB : stockB - stockA;
    });
  }, [items, sortOrder]);
  return {
    items: sortedItems,
    loading,
    error,
    sortOrder,
    toggleSort,
  };
}
