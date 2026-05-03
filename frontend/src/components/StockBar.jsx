import { stockRatio } from "../utils/helpers";

export default function StockBar({ current, threshold }) {
  const pct = stockRatio(current, threshold);
  const color =
    pct < 30 ? "var(--danger)" : pct < 60 ? "var(--warn)" : "var(--ok)";

  return (
    <div className="stock-bar-track">
      <div
        className="stock-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
