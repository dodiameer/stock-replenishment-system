import { stockRatio } from "../utils/helpers";
import { ThinkingDots } from "./Icons";
import StockBar from "./StockBar";

export default function InventoryRow({
  item,
  index,
  isEvaluating,
  onEvaluate,
}) {
  const sku = item.sku || item.Product_ID || index;
  const name = item.name || item.Product_Name || "Unknown";
  const category = item.category || "Unknown";
  const supplier_name = item.supplier_name || "Unknown";
  const current = item.current_stock ?? item.Stock_Quantity ?? 0;
  const threshold = item.threshold ?? item.Reorder_Level ?? 0;
  const ratio = stockRatio(current, threshold);
  const urgencyClass =
    ratio < 30 ? "row-critical" : ratio < 60 ? "row-warn" : "";

  return (
    <tr className={urgencyClass} style={{ animationDelay: `${index * 40}ms` }}>
      <td className="sku-cell">{sku}</td>
      <td className="name-cell">{name}</td>
      <td className="name-cell">{category}</td>
      <td className="name-cell">{supplier_name}</td>
      <td className="stock-cell">
        <span className={ratio < 30 ? "danger" : ratio < 60 ? "warn" : "ok"}>
          {current}
        </span>
      </td>
      <td>{threshold}</td>
      <td>
        <StockBar current={current} threshold={threshold} />
      </td>
      <td>
        <button
          className={`evaluate-btn ${isEvaluating ? "loading" : ""}`}
          onClick={() => onEvaluate(item)}
          disabled={isEvaluating}
        >
          {isEvaluating ? (
            <>
              <span>Thinking</span> <ThinkingDots />
            </>
          ) : (
            "Evaluate with AI"
          )}
        </button>
      </td>
    </tr>
  );
}
