import axios from 'axios';
import type {
  Account,
  AccountCreate,
  Category,
  Transaction,
  TransactionCreate,
  StockTrade,
  StockTradeCreate,
  StockHolding,
  TransactionStats,
  Budget,
  BudgetCreate,
  BudgetStatus,
  RecurringTransaction,
  RecurringTransactionCreate,
  Reminder,
  ReminderCreate,
  FrequentCategory,
  WeeklyReport,
  Tag,
  TagCreate,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from './types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// 添加请求拦截器，自动添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Accounts
export const getAccounts = () => api.get<Account[]>('/accounts/');
export const getAccount = (id: number) => api.get<Account>(`/accounts/${id}/`);
export const createAccount = (data: AccountCreate) => api.post<Account>('/accounts/', data);
export const updateAccount = (id: number, data: Partial<AccountCreate>) =>
  api.put<Account>(`/accounts/${id}/`, data);
export const deleteAccount = (id: number) => api.delete(`/accounts/${id}/`);

// Categories
export const getCategories = (type?: string) =>
  api.get<Category[]>('/categories/', { params: { type } });

export const createCategory = (data: { name: string; type: string }) =>
  api.post<Category>('/categories/', data);

export const updateCategory = (id: number, data: { name: string; type: string }) =>
  api.put<Category>(`/categories/${id}/`, data);

export const deleteCategory = (id: number) =>
  api.delete(`/categories/${id}/`);

// Transactions
export const getTransactions = (params?: {
  account_id?: number;
  category_id?: number;
  type?: string;
  start_date?: string;
  end_date?: string;
}) => api.get<Transaction[]>('/transactions/', { params });

export const createTransaction = (data: TransactionCreate) =>
  api.post<Transaction>('/transactions/', data);

export const getTransaction = (id: number) =>
  api.get<Transaction>(`/transactions/${id}/`);

export const updateTransaction = (id: number, data: Partial<TransactionCreate>) =>
  api.put<Transaction>(`/transactions/${id}/`, data);

export const deleteTransaction = (id: number) =>
  api.delete(`/transactions/${id}/`);

export const getTransactionStats = (params?: {
  start_date?: string;
  end_date?: string;
}) => api.get<TransactionStats>('/transactions/summary/stats', { params });

// Stocks
export const getStockTrades = (params?: {
  symbol?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
}) => api.get<StockTrade[]>('/stocks/', { params });

export const createStockTrade = (data: StockTradeCreate) =>
  api.post<StockTrade>('/stocks/', data);

export const deleteStockTrade = (id: number) =>
  api.delete(`/stocks/${id}/`);

export const getStockHoldings = () =>
  api.get<StockHolding[]>('/stocks/holdings/list');

// Budgets
export const getBudgets = (params?: { year?: number; month?: number }) =>
  api.get<Budget[]>('/budgets/', { params });

export const getBudgetStatus = (params?: { year?: number; month?: number }) =>
  api.get<BudgetStatus[]>('/budgets/status', { params });

export const createBudget = (data: BudgetCreate) =>
  api.post<Budget>('/budgets/', data);

export const updateBudget = (id: number, data: Partial<BudgetCreate>) =>
  api.put<Budget>(`/budgets/${id}/`, data);

export const deleteBudget = (id: number) =>
  api.delete(`/budgets/${id}/`);

// Recurring Transactions
export const getRecurringTransactions = () =>
  api.get<RecurringTransaction[]>('/recurring/');

export const createRecurringTransaction = (data: RecurringTransactionCreate) =>
  api.post<RecurringTransaction>('/recurring/', data);

export const updateRecurringTransaction = (id: number, data: Partial<RecurringTransactionCreate>) =>
  api.put<RecurringTransaction>(`/recurring/${id}/`, data);

export const deleteRecurringTransaction = (id: number) =>
  api.delete(`/recurring/${id}/`);

// Reminders
export const getReminders = () =>
  api.get<Reminder[]>('/reminders/');

export const createReminder = (data: ReminderCreate) =>
  api.post<Reminder>('/reminders/', data);

export const updateReminder = (id: number, data: Partial<ReminderCreate>) =>
  api.put<Reminder>(`/reminders/${id}/`, data);

export const deleteReminder = (id: number) =>
  api.delete(`/reminders/${id}/`);

// Frequent Categories
export const getFrequentCategories = (params?: { type?: string; limit?: number }) =>
  api.get<FrequentCategory[]>('/transactions/frequent-categories', { params });

// Reports
export const getWeeklyReport = (params?: { start_date?: string }) =>
  api.get<WeeklyReport>('/reports/weekly', { params });

// Tags
export const getTags = () =>
  api.get<Tag[]>('/tags/');

export const createTag = (data: TagCreate) =>
  api.post<Tag>('/tags/', data);

export const updateTag = (id: number, data: Partial<TagCreate>) =>
  api.put<Tag>(`/tags/${id}/`, data);

export const deleteTag = (id: number) =>
  api.delete(`/tags/${id}/`);

// Auth
export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/auth/login', data);

export const register = (data: RegisterRequest) =>
  api.post<AuthResponse>('/auth/register', data);

export const getMe = () =>
  api.get<User>('/auth/me');

export default api;
