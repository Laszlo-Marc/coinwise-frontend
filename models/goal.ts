export type GoalModel = {
  id?: string;
  user_id?: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_contribution_enabled?: boolean;
  auto_contribution_amount?: number;
  contribution_frequency?: string;

  category: string;
};
