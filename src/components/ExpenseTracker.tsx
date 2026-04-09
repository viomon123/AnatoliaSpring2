import { useState } from 'react';
import { Trash2, Droplet, Home } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency, formatDateTime } from '../utils/calculations';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAdd: (category: 'water' | 'house', amount: number, description?: string) => void;
  onDelete: (expenseId: string) => void;
  isLoading?: boolean;
}

export function ExpenseTracker({ expenses, onAdd, onDelete, isLoading = false }: ExpenseTrackerProps) {
  const [waterAmount, setWaterAmount] = useState('');
  const [houseAmount, setHouseAmount] = useState('');
  const [waterDescription, setWaterDescription] = useState('');
  const [houseDescription, setHouseDescription] = useState('');

  const handleAddWater = () => {
    if (waterAmount && parseFloat(waterAmount) > 0) {
      onAdd('water', parseFloat(waterAmount), waterDescription);
      setWaterAmount('');
      setWaterDescription('');
    }
  };

  const handleAddHouse = () => {
    if (houseAmount && parseFloat(houseAmount) > 0) {
      onAdd('house', parseFloat(houseAmount), houseDescription);
      setHouseAmount('');
      setHouseDescription('');
    }
  };

  const waterExpenses = expenses.filter(e => e.category === 'water');
  const houseExpenses = expenses.filter(e => e.category === 'house');
  const totalWater = waterExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalHouse = houseExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalWater + totalHouse;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Expense Tracking</h2>

      {/* Expense Summary */}
      <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Water Station</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalWater)}</div>
        </div>
        <div className="text-center border-l border-r border-gray-300">
          <div className="text-sm text-gray-600 mb-1">House</div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalHouse)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
        </div>
      </div>

      {/* Expense Input Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Station Expenses */}
        <div className="border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Droplet size={20} className="text-blue-600" />
            <h3 className="font-bold text-blue-900">Water Station</h3>
          </div>
          <div className="space-y-2 mb-3">
            <input
              type="number"
              step="0.01"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              placeholder="Amount (₱)"
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={isLoading}
            />
            <input
              type="text"
              value={waterDescription}
              onChange={(e) => setWaterDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleAddWater}
            disabled={!waterAmount || isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-300"
          >
            Add Water Expense
          </button>
        </div>

        {/* House Expenses */}
        <div className="border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Home size={20} className="text-amber-600" />
            <h3 className="font-bold text-amber-900">House</h3>
          </div>
          <div className="space-y-2 mb-3">
            <input
              type="number"
              step="0.01"
              value={houseAmount}
              onChange={(e) => setHouseAmount(e.target.value)}
              placeholder="Amount (₱)"
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={isLoading}
            />
            <input
              type="text"
              value={houseDescription}
              onChange={(e) => setHouseDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleAddHouse}
            disabled={!houseAmount || isLoading}
            className="w-full bg-amber-600 text-white py-2 rounded font-semibold hover:bg-amber-700 disabled:bg-gray-300"
          >
            Add House Expense
          </button>
        </div>
      </div>

      {/* Expense History */}
      <div className="mt-4">
        <h3 className="font-bold text-gray-800 mb-3">Expense History</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No expenses recorded yet</p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className={`flex justify-between items-start p-3 rounded border-l-4 ${
                  expense.category === 'water'
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-amber-50 border-amber-600'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {expense.category === 'water' ? (
                      <Droplet size={16} className="text-blue-600" />
                    ) : (
                      <Home size={16} className="text-amber-600" />
                    )}
                    <span className="font-semibold text-gray-800 capitalize">{expense.category}</span>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{formatDateTime(expense.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-red-600">{formatCurrency(expense.amount)}</span>
                  <button
                    onClick={() => onDelete(expense.id)}
                    disabled={isLoading}
                    className="p-1 text-red-600 hover:bg-red-100 rounded disabled:text-gray-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
