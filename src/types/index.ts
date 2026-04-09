export interface Dealer {
  id: string;
  name: string;
  created_at: string;
}

export interface Sale {
  id: string;
  dealer_id: string | null;
  price_per_bottle: number;
  quantity: number;
  total_amount: number;
  created_at: string;
  dealer_name?: string;
}

export interface Expense {
  id: string;
  category: 'water' | 'house';
  amount: number;
  description?: string;
  created_at: string;
}

export interface Payroll {
  id: string;
  dealer_id: string | null;
  dealer_name: string;
  total_sale: number;
  salary_percentage: number;
  salary_amount: number;
  share_percentage: number;
  share_amount: number;
  created_at: string;
}

export interface Expense {
  id: string;
  category: 'water' | 'house';
  amount: number;
  description?: string;
  created_at: string;
}

export interface DailyStats {
  date: string;
  regular_bottles: number;
  regular_total: number;
  dealer_bottles: number;
  dealer_total: number;
  total_bottles: number;
  total_amount: number;
}
