import { API_BASE_URL } from "@/constants/api";
import {
  BudgetStats,
  DepositStats,
  ExpenseStats,
  GoalStats,
  IncomeStats,
  StatsOverview,
  TransferStats,
} from "@/models/stats";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const STATS_API_URL = `${API_BASE_URL}/stats`;
interface StatsContextType {
  statsOverview: StatsOverview | null;
  expenseStats: ExpenseStats | null;
  incomeStats: IncomeStats | null;
  transferStats: TransferStats | null;
  depositStats: DepositStats | null;
  budgetStats: BudgetStats | null;
  goalStats: GoalStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [statsOverview, setStatsOverview] = useState<StatsOverview | null>(
    null
  );
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [incomeStats, setIncomeStats] = useState<IncomeStats | null>(null);
  const [transferStats, setTransferStats] = useState<TransferStats | null>(
    null
  );
  const [depositStats, setDepositStats] = useState<DepositStats | null>(null);
  const [budgetStats, setBudgetStats] = useState<BudgetStats | null>(null);
  const [goalStats, setGoalStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync("auth_token");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        overviewRes,
        expensesRes,
        incomeRes,
        transferRes,
        depositRes,
        budgetRes,
        goalRes,
      ] = await Promise.all([
        axios.get<StatsOverview>(`${STATS_API_URL}/overview`, { headers }),
        axios.get<ExpenseStats>(`${STATS_API_URL}/expenses/full`, { headers }),
        axios.get<IncomeStats>(`${STATS_API_URL}/income/full`, { headers }),
        axios.get<TransferStats>(`${STATS_API_URL}/transfers/full`, {
          headers,
        }),
        axios.get<DepositStats>(`${STATS_API_URL}/deposits/full`, { headers }),
        axios.get<BudgetStats>(`${STATS_API_URL}/budgets`, { headers }),
        axios.get<GoalStats>(`${STATS_API_URL}/goals`, { headers }),
      ]);

      setStatsOverview(overviewRes.data);
      setExpenseStats(expensesRes.data);
      setIncomeStats(incomeRes.data);
      setTransferStats(transferRes.data);
      setDepositStats(depositRes.data);
      setBudgetStats(budgetRes.data);
      setGoalStats(goalRes.data);
      console.log("Overview:", overviewRes.data);
      console.log("Expenses:", expensesRes.data);
      console.log("Income:", incomeRes.data);
      console.log("Transfers:", transferRes.data);
      console.log("Deposits:", depositRes.data);
      console.log("Budgets:", budgetRes.data);
      console.log("Goals:", goalRes.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err.message || "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <StatsContext.Provider
      value={{
        statsOverview,
        expenseStats,
        incomeStats,
        transferStats,
        depositStats,
        budgetStats,
        goalStats,
        loading,
        error,
        refreshStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
};

export const useStatsContext = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStatsContext must be used within a StatsProvider");
  }
  return context;
};
