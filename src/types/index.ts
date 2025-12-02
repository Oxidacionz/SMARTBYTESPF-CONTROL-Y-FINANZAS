

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
  | 'Shopping';

export interface DirectoryEntity {
  id: string;
  name: string;
  type: 'person' | 'company' | 'platform';
  contact_info?: string;
  user_id?: string;
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  category: Category;
  type: 'asset' | 'liability';
  isMonthly: boolean; 
  dayOfMonth?: number;
  note?: string; 
  customExchangeRate?: number;
  user_id?: string;
  entity_id?: string | null; // Link to Directory
  target_date?: string | null; // YYYY-MM-DD (Expected payment/payoff date)
}

export interface PhysicalAsset {
  id: string;
  name: string;
  estimatedValue: number;
  currency: Currency;
  description?: string;
  purchaseDate?: string;
  user_id?: string;
}

export interface SpecialEvent {
  id: string;
  name: string;
  date: string;
  type: 'birthday' | 'payment' | 'other';
  user_id?: string;
}

export interface ShoppingItem {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
  hasReceipt: boolean;
  user_id?: string;
  entity_id?: string | null;
}

export interface ExchangeRates {
  usd_bcv: number;
  eur_bcv: number;
  usd_binance: number;
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  birth_date?: string;
  avatar_url?: string;
}