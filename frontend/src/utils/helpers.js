export function stockRatio(current, threshold) {
  return Math.min((current / threshold) * 100, 100);
}

export const criticalCount = (items) =>
  items.filter((i) => {
    const cur = i.current_stock ?? i.Stock_Quantity ?? 0;
    const thr = i.threshold ?? i.Reorder_Level ?? 1;
    return stockRatio(cur, thr) < 30;
  }).length;

export const warningCount = (items) =>
  items.filter((i) => {
    const cur = i.current_stock ?? i.Stock_Quantity ?? 0;
    const thr = i.threshold ?? i.Reorder_Level ?? 1;
    const r = stockRatio(cur, thr);
    return r >= 30 && r < 60;
  }).length;
