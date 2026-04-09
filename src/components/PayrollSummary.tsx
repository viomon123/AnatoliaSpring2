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
  currentMonth: string;
}

export function PayrollSummary({
  sales,
  dealerSales,
  expenses,
  salaryPerBottle,
  attendance,
  currentMonth
}: PayrollSummaryProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Payroll Summary - {monthName}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Sales */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-3xl font-bold text-green-600">₱{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{totalBottles} bottles</p>
        </div>

        {/* Base Salary Calculation */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Base Salary Pool</p>
          <p className="text-3xl font-bold text-blue-600">₱{baseSalary.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{totalBottles} × ₱10</p>
        </div>

        {/* Bonus (20% of base) */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Payroll Bonus (20%)</p>
          <p className="text-3xl font-bold text-purple-600">₱{bonus.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Total employee salaries</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600">₱{totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">
            Water: ₱{waterExpenses.toFixed(2)} | House: ₱{houseExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Employee Salaries */}
      <div className="border-t pt-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Employee Salaries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-700 mb-3">Person 1</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Attendance Days:</span>
                <span className="font-semibold">{person1Days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Share of Bonus:</span>
                <span className="font-semibold">{(person1Share * 100).toFixed(1)}%</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-700 font-semibold">Salary:</span>
                <span className="text-2xl font-bold text-blue-600">₱{person1Salary.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-700 mb-3">Person 2</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Attendance Days:</span>
                <span className="font-semibold">{person2Days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Share of Bonus:</span>
                <span className="font-semibold">{(person2Share * 100).toFixed(1)}%</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-700 font-semibold">Salary:</span>
                <span className="text-2xl font-bold text-purple-600">₱{person2Salary.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-300">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Net Profit (After Salaries & Expenses)</h3>
          <p className="text-3xl font-bold text-gray-800">
            ₱{netProfit.toFixed(2)}
          </p>
        </div>
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <p>Revenue: ₱{totalRevenue.toFixed(2)} - Payroll: ₱{bonus.toFixed(2)} - Expenses: ₱{totalExpenses.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
