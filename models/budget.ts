export type BudgetModel = {
  id?: string;
  user_id?: string;
  category: string;
  amount: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  title: string;
  is_reccuring?: boolean;
  reccuring_frequency?: string;
  spent: number;
  remaining: number;
  description?: string;
};
