export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

export interface AccountCreate {
  name: string;
  type: string;
  balance?: number;
}

export interface Category {
  id: number;
  name: string;
  type: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number;
  amount: number;
  type: string;
  date: string;
  note: string;
  account_name?: string;
  category_name?: string;
  tags: Tag[];
}

export interface TransactionCreate {
  account_id: number;
  category_id: number;
  amount: number;
  type: string;
  date: string;
  note?: string;
  tag_ids?: number[];
}

export interface StockTrade {
  id: number;
  symbol: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  fee: number;
  date: string;
}

export interface StockTradeCreate {
  symbol: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  fee?: number;
  date: string;
}

export interface StockHolding {
  symbol: string;
  name: string;
  quantity: number;
  cost_price: number;
  total_cost: number;
}

export interface TransactionStats {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
}

export interface Budget {
  id: number;
  category_id: number | null;
  category_name: string;
  amount: number;
  period: string;
  year: number;
  month: number | null;
}

export interface BudgetCreate {
  category_id: number | null;
  amount: number;
  period: string;
  year: number;
  month: number | null;
}

export interface BudgetStatus {
  id: number | null;
  category_id: number | null;
  category_name: string;
  budget_amount: number;
  used_amount: number;
  remaining_amount: number;
  percentage: number;
  period: string;
  year: number;
  month: number | null;
}

export interface RecurringTransaction {
  id: number;
  account_id: number;
  category_id: number;
  account_name: string;
  category_name: string;
  amount: number;
  type: string;
  note: string;
  frequency: string;
  day_of_month: number | null;
  day_of_week: number | null;
  is_active: boolean;
  last_created: string | null;
}

export interface RecurringTransactionCreate {
  account_id: number;
  category_id: number;
  amount: number;
  type: string;
  note?: string;
  frequency: string;
  day_of_month?: number;
  day_of_week?: number;
  is_active?: boolean;
}

export interface Reminder {
  id: number;
  name: string;
  amount: number;
  type: string;
  category_id: number | null;
  category_name: string | null;
  account_id: number | null;
  account_name: string | null;
  reminder_date: string;
  repeat_type: string;
  is_active: boolean;
}

export interface ReminderCreate {
  name: string;
  amount: number;
  type: string;
  category_id?: number | null;
  account_id?: number | null;
  reminder_date: string;
  repeat_type: string;
  is_active?: boolean;
}

export interface FrequentCategory {
  id: number;
  name: string;
  type: string;
  count: number;
}

export interface WeeklyReport {
  start_date: string;
  end_date: string;
  total_income: number;
  total_expense: number;
  balance: number;
  category_breakdown: {
    category_id: number;
    category_name: string;
    amount: number;
    percentage: number;
  }[];
  daily_breakdown: {
    date: string;
    weekday: string;
    income: number;
    expense: number;
  }[];
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
