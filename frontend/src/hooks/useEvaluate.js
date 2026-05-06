export function useEvaluate(addToast, setModal) {
  const [evaluating, setEvaluating] = useState({});
  const handleEvaluate = useCallback(
    async (item) => {
      const handleEvaluate = useCallback(async (item) => {
        const sku = item.Product_ID || item.sku;
        setEvaluating((prev) => ({ ...prev, [sku]: true }));
        try {
          const res = await fetch(`${API_BASE}/api/evaluate-stock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sku }),
          });
          if (!res.ok) throw new Error(`Server error ${res.status}`);
          const result = await res.json();
          setModal({ item, result });
        } catch (err) {
          addToast(`Error: ${err.message}`, "error");
        } finally {
          setEvaluating((prev) => ({ ...prev, [sku]: false }));
        }
      }, []);
    },
    [addToast(), setModal()],
  );
  return { evaluating, handleEvaluate };
}
