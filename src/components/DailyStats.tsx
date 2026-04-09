import type {} from 'react';
import { Sale, Expense } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DailyStatsProps {
  sales: Sale[];
  expenses?: Expense[];
}

export function DailyStats({ sales, expenses = [] }: DailyStatsProps) {
  const regularSales = sales.filter(s => s.price_per_bottle === 15);
  const dealerSalesList = sales.filter(s => s.price_per_bottle === 13);

  const regularCount = regularSales.reduce((sum, s) => sum + s.quantity, 0);
  const dealerCount = dealerSalesList.reduce((sum, s) => sum + s.quantity, 0);
  const regularTotal = regularSales.reduce((sum, s) => sum + s.total_amount, 0);
  const dealerTotal = dealerSalesList.reduce((sum, s) => sum + s.total_amount, 0);
  const totalAmount = regularTotal + dealerTotal;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netAmount = totalAmount - totalExpenses;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-white/95 p-6 rounded-xl shadow-lg border border-[#e2e7ff]">
      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
        <p className="text-[#464555] text-sm mb-1">Regular Bottles</p>
        <p className="text-2xl font-bold text-[#483ede]">{regularCount}</p>
        <p className="text-xs text-[#767586] mt-1">{formatCurrency(regularTotal)}</p>
      </div>

      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
        <p className="text-[#464555] text-sm mb-1">Dealer Bottles</p>
        <p className="text-2xl font-bold text-[#712ae2]">{dealerCount}</p>
        <p className="text-xs text-[#767586] mt-1">{formatCurrency(dealerTotal)}</p>
      </div>

      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
        <p className="text-[#464555] text-sm mb-1">Total Bottles</p>
        <p className="text-2xl font-bold text-[#005f89]">{regularCount + dealerCount}</p>
      </div>

      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
        <p className="text-[#464555] text-sm mb-1">Total Sales</p>
        <p className="text-2xl font-bold text-[#3323cc]">{formatCurrency(totalAmount)}</p>
      </div>

      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
        <p className="text-[#464555] text-sm mb-1">Expenses</p>
        <p className="text-2xl font-bold text-[#ba1a1a]">-{formatCurrency(totalExpenses)}</p>
      </div>

      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
        <p className="text-[#464555] text-sm mb-1">Net Sales</p>
        <p className="text-2xl font-bold text-[#005f89]">{formatCurrency(netAmount)}</p>
      </div>
    </div>
  );
}
