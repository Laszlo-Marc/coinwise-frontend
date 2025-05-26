export type BudgetModel = {
  id?: string;
  user_id?: string;
  category: string;
  amount: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  spent: number;
  limit: number;
  remaining: number;
  period: string;
};
