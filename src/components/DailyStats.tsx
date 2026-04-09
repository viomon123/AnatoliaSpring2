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
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-white p-6 rounded-lg shadow-lg">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
        <p className="text-gray-600 text-sm mb-1">Regular Bottles</p>
        <p className="text-2xl font-bold text-blue-600">{regularCount}</p>
        <p className="text-xs text-gray-500 mt-1">{formatCurrency(regularTotal)}</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-600">
        <p className="text-gray-600 text-sm mb-1">Dealer Bottles</p>
        <p className="text-2xl font-bold text-purple-600">{dealerCount}</p>
        <p className="text-xs text-gray-500 mt-1">{formatCurrency(dealerTotal)}</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-600">
        <p className="text-gray-600 text-sm mb-1">Total Bottles</p>
        <p className="text-2xl font-bold text-green-600">{regularCount + dealerCount}</p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-l-4 border-orange-600">
        <p className="text-gray-600 text-sm mb-1">Total Sales</p>
        <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalAmount)}</p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-l-4 border-red-600">
        <p className="text-gray-600 text-sm mb-1">Expenses</p>
        <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border-l-4 border-cyan-600">
        <p className="text-gray-600 text-sm mb-1">Net Sales</p>
        <p className="text-2xl font-bold text-cyan-600">{formatCurrency(netAmount)}</p>
      </div>
    </div>
  );
}
