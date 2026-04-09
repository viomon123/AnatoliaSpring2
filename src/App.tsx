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
        .maybeSingle();

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
      const dataWithAdvances: MonthlyData = { month: currentMonth, sales, expenses, attendance, advances };
      const { error } = await supabase
        .from('monthly_data')
        .upsert([dataWithAdvances], { onConflict: 'month' });

      if (error) {
        // Backward-compatible fallback for DBs that do not yet have "advances" column.
        const { error: fallbackError } = await supabase
          .from('monthly_data')
          .upsert([{ month: currentMonth, sales, expenses, attendance }], { onConflict: 'month' });

        if (fallbackError) throw fallbackError;
      }
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full bg-[#faf8ff]/85 glass-header border-b border-[#e2e7ff]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold headline-font bg-gradient-to-br from-[#483ede] to-[#625bf8] bg-clip-text text-transparent">
              Anatolia Spring
            </h1>
            <p className="text-sm text-[#464555] font-medium">Payroll & Attendance Portal</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="bg-[#f2f3ff] px-4 py-2 rounded-lg text-sm font-semibold text-[#3323cc]">
              {new Date(`${currentMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button className="primary-gradient text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg shadow-indigo-200/60">
              Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <div className="bg-[#ffdad6] border-l-4 border-[#ba1a1a] p-4 rounded-lg">
            <p className="text-[#93000a] font-medium">{error}</p>
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

      <footer className="bg-[#eaedff] border-t border-[#dae2fd] text-[#464555] py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm font-medium">
          <p>© 2026 Anatolia Spring. All sales are logged with timestamps for complete transparency.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
