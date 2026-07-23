export type Currency = "CRC" | "USD";
export type TransactionType = "INCOME" | "EXPENSE";
export type BankName =
  | "BAC"
  | "BCR"
  | "BNCR"
  | "Promerica"
  | "Davivienda"
  | "BP"
  | "MUCAP"
  | "PayPal"
  | "Efectivo"
  | "Otro";

export interface Transaction {
  id: string;
  user_id: string;
  gmail_message_id: string | null;
  bank_name: BankName;
  amount: number;
  currency: Currency;
  description: string | null;
  category: string | null;
  type: TransactionType;
  is_automated: boolean;
  transaction_date: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  default_currency: Currency;
  notifications_enabled: boolean;
  updated_at: string;
}

export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  created_at: string;
}
