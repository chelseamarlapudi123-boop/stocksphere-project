import { subMonths, format } from 'date-fns';

export function generateForecast(sales, productId, branchId, currentStock = null, monthsAhead = 3) {
  // Filter sales for this product and branch, last 18 months (Relaxed for demo)
  const now = new Date();
  const historyRange = subMonths(now, 18);
  
  const relevantSales = sales
    .filter(s => 
      s.productId === productId && 
      (branchId === 'all' || !branchId || s.branchId === branchId) &&
      new Date(s.date) >= historyRange
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (relevantSales.length < 2) {
    return [];
  }

  // Group by month approx
  const monthlySales = {};
  relevantSales.forEach(sale => {
    const monthKey = format(new Date(sale.date), 'yyyy-MM');
    monthlySales[monthKey] = (monthlySales[monthKey] || 0) + sale.quantity;
  });

  const months = Object.keys(monthlySales).sort();
  const quantities = months.map(m => monthlySales[m]);

  if (quantities.length === 0) {
    return [];
  }

  // Calculate average of last 3 months (or all available if < 3)
  const lastThree = quantities.slice(-3);
  const averageValue = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
  const forecastValue = Math.round(averageValue);

  // Generate historical and forecast
  const result = [];

  // Historical data
  for (let i = 0; i < months.length; i++) {
    const isLastHistory = i === months.length - 1;
    result.push({
      month: format(new Date(months[i]), 'MMM'),
      actual: quantities[i],
      // For the VERY LAST historical point, we also set 'predicted' 
      // so the DASHED line connects to the SOLID line.
      predicted: isLastHistory ? quantities[i] : undefined, 
      range: [Math.round(quantities[i] * 0.95), Math.round(quantities[i] * 1.05)],
      inventory: currentStock !== null ? currentStock : undefined
    });
  }

  // Future predictions
  for (let i = 1; i <= monthsAhead; i++) {
    const futureDate = subMonths(new Date(), -i);
    const futureMonth = format(futureDate, 'MMM');
    
    // Add small variation factor (Â±5%) for realism
    const variation = 1 + (Math.random() * 0.1 - 0.05);
    const predicted = Math.round(forecastValue * variation);

    result.push({
      month: futureMonth,
      predicted,
      range: [Math.round(predicted * 0.85), Math.round(predicted * 1.15)],
      inventory: currentStock !== null ? currentStock : undefined
    });
  }

  return result;
}

