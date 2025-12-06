

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
  | 'Shopping'
  | 'Savings';

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
  eur_bcv?: number;
  eur_usd?: number; // Alias o nuevo nombre
  cop_usd?: number; // Nueva moneda
  usd_binance_buy?: number;
  binance_buy?: number; // Alias
  usd_binance_sell?: number;
  binance_sell?: number; // Alias
  lastUpdated?: string; // Legacy
  last_updated?: string; // DB column
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  birth_date?: string;
  avatar_url?: string;
}

export type GoalType = 'savings' | 'income' | 'emergency_fund' | 'specific_fund';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type ContributionFrequency = 'daily' | 'weekly' | 'monthly';

export interface FinancialGoal {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  goal_type: GoalType;
  target_amount: number;
  current_amount: number;
  currency: Currency;
  target_date?: string; // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  status: GoalStatus;
  category?: string;
  auto_contribute?: boolean;
  contribution_frequency?: ContributionFrequency;
  contribution_amount?: number;
}

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type WorkSchedule = 'full_time' | 'part_time' | 'freelance' | 'retired' | 'student';
export type IncomeRange = 'low' | 'medium' | 'high' | 'very_high';
export type RetirementLifestyle = 'modest' | 'comfortable' | 'luxurious';
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';
export type InvestmentExperience = 'none' | 'beginner' | 'intermediate' | 'advanced';
export type RecommendationType = 'budget_distribution' | 'savings_goal' | 'emergency_fund' | 'debt_reduction' | 'investment';
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'accepted' | 'dismissed' | 'completed';

export interface UserFinancialProfile {
  id: string;
  user_id?: string;
  age?: number;
  marital_status?: MaritalStatus;
  num_dependents?: number;
  num_children?: number;
  work_schedule?: WorkSchedule;
  monthly_income_range?: IncomeRange;
  hobbies?: string[];
  main_expenses?: string[];
  retirement_age_goal?: number;
  retirement_lifestyle?: RetirementLifestyle;
  risk_profile?: RiskProfile;
  investment_experience?: InvestmentExperience;
  has_emergency_fund?: boolean;
  emergency_fund_months?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialRecommendation {
  id: string;
  user_id?: string;
  recommendation_type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  metadata?: any;
  created_at?: string;
  expires_at?: string;
  dismissed_at?: string;
}

export interface BudgetDistribution {
  savings: number;
  investment: number;
  expenses: number;
  emergency_fund?: number;
}