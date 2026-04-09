import { Sale, Expense } from '../types';

const SALARY_PERCENTAGE = 0.2;
const BOTTLE_RATE = 10;
const PERSON1_SHARE = 0.55;
const PERSON2_SHARE = 0.45;

export function calculatePayroll(sales: Sale[], expenses: Expense[] = []): { person1: number; person2: number; totalSalary: number; netSales: number; totalExpenses: number } {
  let totalSaleAmount = 0;
  let totalBottles = 0;

  sales.forEach(sale => {
    totalSaleAmount += sale.total_amount;
    totalBottles += sale.quantity;
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const netSales = totalSaleAmount - totalExpenses;

  // Salary is 20% of (total bottles × 10)
  const totalSalary = totalBottles * BOTTLE_RATE * SALARY_PERCENTAGE;

  const person1 = totalSalary * PERSON1_SHARE;
  const person2 = totalSalary * PERSON2_SHARE;

  return { person1, person2, totalSalary, netSales, totalExpenses };
}

export function calculateDealerPayroll(dealerSales: Sale[]): { dealer: number; company: number } {
  let dealerTotal = 0;
  let companyTotal = 0;

  dealerSales.forEach(sale => {
    const bottlesForSalary = sale.quantity * Math.min(10, sale.price_per_bottle);
    const salaryPortion = bottlesForSalary * SALARY_PERCENTAGE;
    dealerTotal += salaryPortion;
    companyTotal += sale.total_amount * SALARY_PERCENTAGE - salaryPortion;
  });

  return { dealer: dealerTotal, company: companyTotal };
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-PH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}