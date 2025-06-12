// app/loading.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { LoadingScreen } from "@/components/mainComponents/LoadingScreen";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useGoals } from "@/contexts/GoalsContext";

const Loading = () => {
  const router = useRouter();

  const { checkSessionValidity, state: authState } = useAuth();
  const { fetchBudgets, fetchBudgetTransactions } = useBudgets();
  const { fetchGoals, fetchContributions } = useGoals();
  const { fetchTransactions } = useTransactionContext();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const isValid = await checkSessionValidity();
      if (!isValid) {
        router.replace("/auth/sign-in");
        return;
      }

      await Promise.all([
        fetchGoals(),
        fetchContributions(),
        fetchBudgets(),
        fetchTransactions(),
        fetchBudgetTransactions(),
      ]);

      setLoading(false);
      router.replace("/home");
    };

    bootstrap();
  }, []);

  if (loading) return <LoadingScreen />;

  return null;
};

export default Loading;
