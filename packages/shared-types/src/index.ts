// ========================
// ENUMS
// ========================

export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionSource = 'web' | 'bot_free' | 'bot_pro' | 'import' | 'open_finance';
export type UserPlan = 'free' | 'pro';
export type BillRecurrence = 'once' | 'monthly' | 'yearly';
export type OpenFinanceStatus = 'active' | 'error' | 'expired' | 'revoked';

// ========================
// AUTH DTOs
// ========================

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  plan: UserPlan;
  iat?: number;
  exp?: number;
}

// ========================
// USER DTOs
// ========================

export interface UserDto {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  emailVerified: boolean;
  createdAt: string;
}

export interface UpdateUserDto {
  name?: string;
}

// ========================
// CATEGORY DTOs
// ========================

export interface CategoryDto {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  isDefault: boolean;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
  color?: string;
  type: TransactionType;
}

// ========================
// TRANSACTION DTOs
// ========================

export interface TransactionDto {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string; // ISO date
  source: TransactionSource;
  category: CategoryDto | null;
  createdAt: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  description?: string;
  date: string;
  categoryId?: string;
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  amount?: number;
  description?: string;
  date?: string;
  categoryId?: string;
}

export interface TransactionFilters {
  month?: string; // YYYY-MM
  type?: TransactionType;
  categoryId?: string;
  page?: number;
  limit?: number;
}

// ========================
// DASHBOARD DTOs
// ========================

export interface DashboardSummaryDto {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  balance: number;
  previousMonthBalance: number;
  changePercent: number;
}

export interface CategorySpendingDto {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  total: number;
  percent: number;
}

export interface MonthlyEvolutionDto {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
}

// ========================
// TELEGRAM DTOs
// ========================

export interface TelegramLinkCodeDto {
  code: string;
  expiresAt: string;
}

export interface TelegramStatusDto {
  linked: boolean;
  telegramChatId?: number;
  linkedAt?: string;
}

// ========================
// BOT — parsed transaction
// ========================

export interface BotParsedTransaction {
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string; // ISO date
}

// ========================
// BILLS DTOs (Pro)
// ========================

export interface BillDto {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  recurrence: BillRecurrence;
  nextDueDate: string;
  notifyDaysBefore: number;
  isActive: boolean;
  category: CategoryDto | null;
}

export interface CreateBillDto {
  name: string;
  amount: number;
  dueDay: number;
  recurrence?: BillRecurrence;
  notifyDaysBefore?: number;
  categoryId?: string;
}

// ========================
// API RESPONSE WRAPPER
// ========================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
