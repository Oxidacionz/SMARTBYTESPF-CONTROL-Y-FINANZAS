
export type Currency = 'USD' | 'VES' | 'EUR';

export type Category =
  | 'Bank'
  | 'Wallet'
  | 'Crypto'
  | 'Cash'
  | 'Debt'
  | 'Expense'
  | 'Receivable'
  | 'Income'
  | 'Shopping' // For one-off purchases
  | 'Savings'; // For savings goals

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  category: Category;
  type: 'asset' | 'liability';
  isMonthly: boolean;
  dayOfMonth?: number; // 1-31, for recurring expenses
  note?: string;
  customExchangeRate?: number;
}

export interface PhysicalAsset {
  id: string;
  name: string;
  estimatedValue: number;
  currency: Currency;
  description?: string;
  purchaseDate?: string;
}

export interface SpecialEvent {
  id: string;
  name: string;
  date: string; // MM-DD or YYYY-MM-DD
  type: 'birthday' | 'payment' | 'other';
}

export interface ShoppingItem {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
  hasReceipt: boolean; // Placeholder for file logic
}

export interface ExchangeRates {
  usd_bcv: number;
  eur_bcv: number;
  usd_binance_buy?: number;
  usd_binance_sell?: number;
  usd_binance?: number; // Deprecated, mantener para compatibilidad
  lastUpdated: string;
}
