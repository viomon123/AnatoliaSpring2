import type {} from 'react';
import { Sale, Expense } from '../types';
import { formatCurrency, calculatePayroll } from '../utils/calculations';

interface PayrollSummaryProps {
  sales: Sale[];
  dealerSales: Record<string, Sale[]>;
  expenses: Expense[];
}

export function PayrollSummary({ sales, dealerSales, expenses }: PayrollSummaryProps) {
  const { person1, person2, totalSalary, netSales, totalExpenses } = calculatePayroll(sales, expenses);
  
  const totalSaleAmount = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-lg">
      {/* Main Payroll */}
      <div className="border-l-4 border-blue-600 pl-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Main Payroll Distribution</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Total Sales Amount:</span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(totalSaleAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Total Expenses:</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex justify-between items-center bg-blue-50 p-2 rounded border-l-2 border-blue-400">
            <span className="text-gray-700 font-semibold">Net Sales:</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(netSales)}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span className="text-gray-700">Total Salary (20%):</span>
            <span className="text-lg font-bold text-orange-600">{formatCurrency(totalSalary)}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Person 1 (55%):</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(person1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Person 2 (45%):</span>
            <span className="text-lg font-bold text-purple-600">{formatCurrency(person2)}</span>
          </div>
        </div>
      </div>

      {/* Dealer Breakdown */}
      <div className="border-l-4 border-purple-600 pl-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Dealer Sales Breakdown</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(dealerSales).length === 0 ? (
            <p className="text-gray-500">No dealer sales yet</p>
          ) : (
            Object.entries(dealerSales).map(([dealerName, dealerSalesList]) => {
              const dealerTotal = dealerSalesList.reduce((sum, sale) => sum + sale.total_amount, 0);
              return (
                <div key={dealerName} className="bg-purple-50 p-2 rounded">
                  <p className="font-semibold text-purple-900">{dealerName}</p>
                  <p className="text-sm text-gray-600">
                    {dealerSalesList.length} transaction(s) - {formatCurrency(dealerTotal)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
