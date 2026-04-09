import { useState, useEffect } from 'react';
import { Sale, Dealer, Expense } from './types';
import { supabase } from './utils/supabase';
import { QuickAdd } from './components/QuickAdd';
import { DealerManager } from './components/DealerManager';
import { TransactionLog } from './components/TransactionLog';
import { PayrollSummary } from './components/PayrollSummary';
import { DailyStats } from './components/DailyStats';
import { ExpenseTracker } from './components/ExpenseTracker';
import { AttendanceTracker } from './AttendanceTracker';
import './App.css';

// Salary configuration: 2 pesos per bottle (20% of 10 pesos)
const SALARY_PER_BOTTLE = 2;
const ADVANCE_PIN = import.meta.env.VITE_ADVANCE_PIN || '1234';

interface Attendance {
  date: string;
  person1: boolean;
  person2: boolean;
}

interface MonthlyData {
  month: string; // YYYY-MM format
  sales: Sale[];
  expenses: Expense[];
  attendance: Attendance[];
  advances?: {
    person1: number;
    person2: number;
  };
}

function App() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [advances, setAdvances] = useState({ person1: 0, person2: 0 });
  const [, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const currentMonth = getCurrentMonth();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      
      // Load dealers
      const { data: dealersData } = await supabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (dealersData) setDealers(dealersData);

      // Load monthly data
      const { data: monthlyDataFromDb } = await supabase
        .from('monthly_data')
        .select('*')
        .eq('month', currentMonth)
        .single();

      if (monthlyDataFromDb) {
        setSales(monthlyDataFromDb.sales || []);
        setExpenses(monthlyDataFromDb.expenses || []);
        setAttendance(monthlyDataFromDb.attendance || []);
        setAdvances(monthlyDataFromDb.advances || { person1: 0, person2: 0 });
      } else {
        // Initialize empty data for new month
        setSales([]);
        setExpenses([]);
        setAttendance([]);
        setAdvances({ person1: 0, person2: 0 });
      }

      // Load all historical monthly data
      const { data: allMonthlyData } = await supabase
        .from('monthly_data')
        .select('*')
        .order('month', { ascending: false });
      
      if (allMonthlyData) setMonthlyData(allMonthlyData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Make sure Supabase is configured.');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveMonthlyData() {
    if (!supabase) {
      // Local storage fallback
      const data: MonthlyData = { month: currentMonth, sales, expenses, attendance, advances };
      const existing = JSON.parse(localStorage.getItem('monthlyData') || '[]');
      const filtered = existing.filter((m: MonthlyData) => m.month !== currentMonth);
      localStorage.setItem('monthlyData', JSON.stringify([...filtered, data]));
      return;
    }

    try {
      const dataToSave: MonthlyData = { month: currentMonth, sales, expenses, attendance, advances };
      const { error } = await supabase
        .from('monthly_data')
        .upsert([dataToSave], { onConflict: 'month' });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving monthly data:', err);
    }
  }

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveMonthlyData();
    }, 1000);
    return () => clearTimeout(timer);
  }, [sales, expenses, attendance, advances]);

  function handleAdvanceChange(person: 'person1' | 'person2', amount: number) {
    const sanitizedAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
    setAdvances(prev => ({
      ...prev,
      [person]: sanitizedAmount
    }));
  }

  async function handleAddSale(quantity: number) {
    if (!supabase) {
      alert('Supabase not configured. Using local storage.');
      addSaleLocal(quantity);
      return;
    }

    try {
      setIsLoading(true);
      const pricePerBottle = 15;
      const totalAmount = quantity * pricePerBottle;

      const { data, error } = await supabase
        .from('sales')
        .insert([
          {
            quantity,
            price_per_bottle: pricePerBottle,
            total_amount: totalAmount,
            dealer_id: null,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      if (data) {
        setSales([data[0], ...sales]);
      }
    } catch (err) {
      console.error('Error adding sale:', err);
      alert('Failed to add sale');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddBottlesByDealer(dealerId: string, quantity: number) {
    if (!supabase) {
      alert('Supabase not configured. Using local storage.');
      addDealerSaleLocal(dealerId, quantity);
      return;
    }

    try {
      setIsLoading(true);
      const pricePerBottle = 13;
      const totalAmount = quantity * pricePerBottle;

      const { data, error } = await supabase
        .from('sales')
        .insert([
          {
            dealer_id: dealerId,
            quantity,
            price_per_bottle: pricePerBottle,
            total_amount: totalAmount,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      if (data) {
        setSales([data[0], ...sales]);
      }
    } catch (err) {
      console.error('Error adding dealer sale:', err);
      alert('Failed to add bottles for dealer');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddDealer(dealerName: string) {
    if (!supabase) {
      alert('Supabase not configured. Using local storage.');
      addDealerLocal(dealerName);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dealers')
        .insert([{ name: dealerName, created_at: new Date().toISOString() }])
        .select();

      if (error) throw error;
      if (data) {
        setDealers([data[0], ...dealers]);
      }
    } catch (err) {
      console.error('Error adding dealer:', err);
      alert('Failed to add dealer');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteDealer(dealerId: string) {
    if (!supabase) {
      deleteDealerLocal(dealerId);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('dealers')
        .delete()
        .eq('id', dealerId);

      if (error) throw error;
      setDealers(dealers.filter(d => d.id !== dealerId));
    } catch (err) {
      console.error('Error deleting dealer:', err);
      alert('Failed to delete dealer');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteSale(saleId: string) {
    if (!supabase) {
      deleteSaleLocal(saleId);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (error) throw error;
      setSales(sales.filter(s => s.id !== saleId));
    } catch (err) {
      console.error('Error deleting sale:', err);
      alert('Failed to delete sale');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddExpense(category: 'water' | 'house', amount: number, description?: string) {
    if (!supabase) {
      addExpenseLocal(category, amount, description);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            category,
            amount,
            description: description || null,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      if (data) {
        setExpenses([data[0], ...expenses]);
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!supabase) {
      deleteExpenseLocal(expenseId);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAttendanceToggle(date: string, person: 'person1' | 'person2') {
    const existingAttendance = attendance.find(a => a.date === date);
    
    let updated: Attendance;
    if (existingAttendance) {
      updated = {
        ...existingAttendance,
        [person]: !existingAttendance[person]
      };
      setAttendance(attendance.map(a => a.date === date ? updated : a));
    } else {
      updated = {
        date,
        person1: person === 'person1',
        person2: person === 'person2'
      };
      setAttendance([...attendance, updated]);
    }
  }

  // Local storage fallback functions
  function addSaleLocal(quantity: number) {
    const newSale: Sale = {
      id: Date.now().toString(),
      dealer_id: null,
      price_per_bottle: 15,
      quantity,
      total_amount: quantity * 15,
      created_at: new Date().toISOString()
    };
    setSales([newSale, ...sales]);
    localStorage.setItem('sales', JSON.stringify([newSale, ...sales]));
  }

  function addDealerSaleLocal(dealerId: string, quantity: number) {
    const newSale: Sale = {
      id: Date.now().toString(),
      dealer_id: dealerId,
      price_per_bottle: 13,
      quantity,
      total_amount: quantity * 13,
      created_at: new Date().toISOString()
    };
    setSales([newSale, ...sales]);
    localStorage.setItem('sales', JSON.stringify([newSale, ...sales]));
  }

  function addDealerLocal(name: string) {
    const newDealer: Dealer = {
      id: Date.now().toString(),
      name,
      created_at: new Date().toISOString()
    };
    setDealers([newDealer, ...dealers]);
    localStorage.setItem('dealers', JSON.stringify([newDealer, ...dealers]));
  }

  function deleteSaleLocal(saleId: string) {
    const updated = sales.filter(s => s.id !== saleId);
    setSales(updated);
    localStorage.setItem('sales', JSON.stringify(updated));
  }

  function deleteDealerLocal(dealerId: string) {
    const updated = dealers.filter(d => d.id !== dealerId);
    setDealers(updated);
    localStorage.setItem('dealers', JSON.stringify(updated));
  }

  function addExpenseLocal(category: 'water' | 'house', amount: number, description?: string) {
    const newExpense: Expense = {
      id: Date.now().toString(),
      category,
      amount,
      description: description || undefined,
      created_at: new Date().toISOString()
    };
    setExpenses([newExpense, ...expenses]);
    localStorage.setItem('expenses', JSON.stringify([newExpense, ...expenses]));
  }

  function deleteExpenseLocal(expenseId: string) {
    const updated = expenses.filter(e => e.id !== expenseId);
    setExpenses(updated);
    localStorage.setItem('expenses', JSON.stringify(updated));
  }

  const dealerSales = dealers.reduce((acc, dealer) => {
    acc[dealer.name] = sales.filter(s => s.dealer_id === dealer.id);
    return acc;
  }, {} as Record<string, Sale[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">🍾 Anatolia Spring</h1>
          <p className="text-blue-100">Bottle Sales & Payroll Tracking System</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        <DailyStats sales={sales} expenses={expenses} />
        
        <QuickAdd onAdd={handleAddSale} isLoading={isLoading} />
        
        <ExpenseTracker expenses={expenses} onAdd={handleAddExpense} onDelete={handleDeleteExpense} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionLog sales={sales} dealers={dealers} onDelete={handleDeleteSale} isLoading={isLoading} />
          </div>
          <div>
            <DealerManager dealers={dealers} sales={sales} onAdd={handleAddDealer} onAddBottles={handleAddBottlesByDealer} onDelete={handleDeleteDealer} isLoading={isLoading} />
          </div>
        </div>

        <PayrollSummary 
          sales={sales} 
          dealerSales={dealerSales} 
          expenses={expenses} 
          salaryPerBottle={SALARY_PER_BOTTLE}
          attendance={attendance}
          advances={advances}
          onAdvanceChange={handleAdvanceChange}
          advancePin={ADVANCE_PIN}
          currentMonth={currentMonth}
        />
        
        <AttendanceTracker 
          attendance={attendance} 
          onToggle={handleAttendanceToggle}
          currentMonth={currentMonth}
        />
      </main>

      <footer className="bg-gray-800 text-gray-400 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2026 Anatolia Spring. All sales are logged with timestamps for complete transparency.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
