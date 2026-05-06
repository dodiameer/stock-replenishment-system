import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { API_BASE } from "../constants";

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  // New Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
  }, []);

  // Debounce the search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const toggleSort = () => {
    if (sortOrder === "asc") setSortOrder("desc");
    else if (sortOrder === "desc") setSortOrder(null);
    else setSortOrder("asc");
  };

  const fuse = new Fuse(items, {
    keys: [
      "Product_ID",
      "sku",
      "Product_Name",
      "name",
      "category",
      "supplier_name",
    ], // Multi-field indexing
    threshold: 0.3, // Fuzzy matching tolerance (lower is stricter)
  });
  // Process data: Search first, then Sort
  const processedItems = useMemo(() => {
    let result = items;

    // 1. Execute Advanced Search
    if (debouncedQuery.trim() !== "") {
      result = fuse.search(debouncedQuery).map((res) => res.item);
    }

    // 2. Execute Sort
    if (sortOrder) {
      result = [...result].sort((a, b) => {
        const stockA = a.current_stock ?? a.Stock_Quantity ?? 0;
        const stockB = b.current_stock ?? b.Stock_Quantity ?? 0;
        return sortOrder === "asc" ? stockA - stockB : stockB - stockA;
      });
    }

    return result;
  }, [items, debouncedQuery, sortOrder]);

  return {
    items: processedItems,
    loading,
    error,
    sortOrder,
    toggleSort,
    searchQuery,
    setSearchQuery,
  };
}
