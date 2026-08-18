// La app solo maneja colones — cualquier transacción que llegue en otra
// moneda (dólares, córdobas, euros, lo que sea) se convierte a colones al
// parsear el correo, con el tipo de cambio del día (ver lib/exchangeRate.ts).
// Sigue siendo un tipo (en vez de borrar el campo) para no tener que tocar
// cada firma de función que hoy recibe una moneda, y por si algún día vuelve
// a hacer falta más de una.
export type Currency = "CRC";
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

export type Theme = "dark" | "light" | "system";

export interface UserSettings {
  user_id: string;
  theme: Theme;
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

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  currency: Currency;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  currency: Currency;
  target_date: string | null;
  created_at: string;
}
