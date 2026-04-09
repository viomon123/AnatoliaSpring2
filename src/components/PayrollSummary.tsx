import { useState } from 'react';
import { Sale, Expense } from '../types';

interface Attendance {
  date: string;
  person1: boolean;
  person2: boolean;
}

interface PayrollSummaryProps {
  sales: Sale[];
  dealerSales: Record<string, Sale[]>;
  expenses: Expense[];
  salaryPerBottle: number;
  attendance: Attendance[];
  advances: {
    person1: number;
    person2: number;
  };
  onAdvanceChange: (person: 'person1' | 'person2', amount: number) => void;
  advancePin: string;
  currentMonth: string;
}

export function PayrollSummary({
  sales,
  dealerSales,
  expenses,
  attendance,
  advances,
  onAdvanceChange,
  advancePin,
  currentMonth
}: PayrollSummaryProps) {
  const [isAdvanceUnlocked, setIsAdvanceUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Calculate total bottles sold
  const totalBottles = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  // Calculate base salary (10 pesos per bottle)
  const baseSalary = totalBottles * 10;

  // Calculate bonus (20% of base salary = 2 pesos per bottle)
  const bonus = baseSalary * 0.20;

  // Calculate attendance days
  const person1Days = attendance.filter(a => a.person1).length;
  const person2Days = attendance.filter(a => a.person2).length;
  const totalAttendanceDays = person1Days + person2Days;

  // Calculate salary distribution based on attendance
  // If both attended equally, split 50-50. Otherwise proportional.
  const totalAttendanceShare = totalAttendanceDays || 1; // Prevent division by zero
  const person1Share = totalAttendanceDays > 0 ? person1Days / totalAttendanceShare : 0.5;
  const person2Share = totalAttendanceDays > 0 ? person2Days / totalAttendanceShare : 0.5;

  const person1Salary = bonus * person1Share;
  const person2Salary = bonus * person2Share;
  const person1NetSalary = person1Salary - advances.person1;
  const person2NetSalary = person2Salary - advances.person2;

  // Calculate expenses summary
  const waterExpenses = expenses
    .filter(e => e.category === 'water')
    .reduce((sum, e) => sum + e.amount, 0);

  const houseExpenses = expenses
    .filter(e => e.category === 'house')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = waterExpenses + houseExpenses;

  // Calculate sales summary
  const directSales = sales
    .filter(s => !s.dealer_id)
    .reduce((sum, s) => sum + s.total_amount, 0);

  const dealerTotalSales = Object.values(dealerSales)
    .reduce((sum, dealerSales) => {
      return sum + dealerSales.reduce((ds, s) => ds + s.total_amount, 0);
    }, 0);

  const totalRevenue = directSales + dealerTotalSales;
  const netProfit = totalRevenue - bonus - totalExpenses;

  const monthName = new Date(`${currentMonth}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const unlockAdvanceInputs = () => {
    if (pinInput === advancePin) {
      setIsAdvanceUnlocked(true);
      setPinError('');
      setPinInput('');
      return;
    }

    setPinError('Incorrect PIN');
  };

  return (
    <div className="bg-white/95 rounded-xl shadow-lg border border-[#e2e7ff] p-6">
      <h2 className="text-2xl font-extrabold headline-font text-[#131b2e] mb-6">Payroll Summary - {monthName}</h2>

      <div className="mb-6 p-4 rounded-xl border border-[#c7c4d7] bg-[#f2f3ff]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="font-semibold text-[#3323cc]">Cash Advance Secure Entry</p>
            <p className="text-sm text-[#464555]">
              {isAdvanceUnlocked
                ? 'Unlocked: You can edit salary advances.'
                : 'Locked: Enter PIN to allow advance changes.'}
            </p>
          </div>

          {isAdvanceUnlocked ? (
            <button
              onClick={() => setIsAdvanceUnlocked(false)}
              className="px-4 py-2 bg-[#464555] text-white rounded-lg hover:opacity-90 transition"
            >
              Lock Advances
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError('');
                }}
                placeholder="Enter PIN"
                className="px-3 py-2 border border-[#c7c4d7] rounded-lg bg-white"
              />
              <button
                onClick={unlockAdvanceInputs}
                className="px-4 py-2 primary-gradient text-white rounded-lg transition"
              >
                Unlock
              </button>
            </div>
          )}
        </div>
        {pinError && <p className="text-sm text-red-600 mt-2">{pinError}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Sales */}
        <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
          <p className="text-sm text-[#464555] mb-1">Total Sales</p>
          <p className="text-3xl font-bold text-[#483ede]">₱{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-[#767586] mt-2">{totalBottles} bottles</p>
        </div>

        {/* Base Salary Calculation */}
        <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
          <p className="text-sm text-[#464555] mb-1">Base Salary Pool</p>
          <p className="text-3xl font-bold text-[#005f89]">₱{baseSalary.toFixed(2)}</p>
          <p className="text-xs text-[#767586] mt-2">{totalBottles} × ₱10</p>
        </div>

        {/* Bonus (20% of base) */}
        <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
          <p className="text-sm text-[#464555] mb-1">Payroll Bonus (20%)</p>
          <p className="text-3xl font-bold text-[#712ae2]">₱{bonus.toFixed(2)}</p>
          <p className="text-xs text-[#767586] mt-2">Total employee salaries</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
          <p className="text-sm text-[#464555] mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-[#ba1a1a]">₱{totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-[#767586] mt-2">
            Water: ₱{waterExpenses.toFixed(2)} | House: ₱{houseExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Employee Salaries */}
      <div className="border-t border-[#e2e7ff] pt-6 mb-6">
        <h3 className="font-semibold text-[#131b2e] mb-4">Employee Salaries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
            <h4 className="font-semibold text-[#3323cc] mb-3">Person 1</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Attendance Days:</span>
                <span className="font-semibold">{person1Days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Share of Bonus:</span>
                <span className="font-semibold">{(person1Share * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <label className="text-gray-600">Advance:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={advances.person1}
                  onChange={(e) => onAdvanceChange('person1', Number(e.target.value))}
                  disabled={!isAdvanceUnlocked}
                  className="w-32 px-2 py-1 border border-[#c7c4d7] rounded-lg text-right bg-white"
                />
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-700 font-semibold">Gross Salary:</span>
                <span className="font-semibold text-[#3323cc]">₱{person1Salary.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Less Advance:</span>
                <span className="font-semibold text-red-600">₱{advances.person1.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-700 font-semibold">Net Salary:</span>
                <span className="text-2xl font-bold text-[#0f0069]">₱{person1NetSalary.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
            <h4 className="font-semibold text-[#5a00c6] mb-3">Person 2</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Attendance Days:</span>
                <span className="font-semibold">{person2Days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Share of Bonus:</span>
                <span className="font-semibold">{(person2Share * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <label className="text-gray-600">Advance:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={advances.person2}
                  onChange={(e) => onAdvanceChange('person2', Number(e.target.value))}
                  disabled={!isAdvanceUnlocked}
                  className="w-32 px-2 py-1 border border-[#c7c4d7] rounded-lg text-right bg-white"
                />
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-700 font-semibold">Gross Salary:</span>
                <span className="font-semibold text-[#5a00c6]">₱{person2Salary.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Less Advance:</span>
                <span className="font-semibold text-red-600">₱{advances.person2.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-700 font-semibold">Net Salary:</span>
                <span className="text-2xl font-bold text-[#25005a]">₱{person2NetSalary.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-gradient-to-r from-[#eaedff] to-[#f2f3ff] p-4 rounded-xl border border-[#dae2fd]">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-[#131b2e]">Net Profit (After Salaries & Expenses)</h3>
          <p className="text-3xl font-bold text-[#131b2e]">
            ₱{netProfit.toFixed(2)}
          </p>
        </div>
        <div className="mt-3 text-xs text-[#464555] space-y-1">
          <p>Revenue: ₱{totalRevenue.toFixed(2)} - Payroll: ₱{bonus.toFixed(2)} - Expenses: ₱{totalExpenses.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
