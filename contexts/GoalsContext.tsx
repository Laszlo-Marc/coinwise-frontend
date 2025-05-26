import { GoalModel } from "@/models/goal";
import { ContributionModel } from "@/models/goal-contribution";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface GoalContextType {
  goals: GoalModel[];
  contributions: ContributionModel[];
  error: string | null;
  addGoal: (goal: GoalModel) => Promise<void>;
  fetchGoals: () => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoal: (id: string, updates: Partial<GoalModel>) => Promise<any>;
  addContribution: (contribution: ContributionModel) => Promise<void>;
  fetchContributions: () => Promise<ContributionModel[]>;
}

const GoalsContext = createContext<GoalContextType | undefined>(undefined);
const API_BASE_URL = "http://192.168.1.156:5000/api";
const GOALS_API_URL = `${API_BASE_URL}/goals`;
const CONTRIBUTIONS_API_URL = `${API_BASE_URL}/contributions`;

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [goals, setGoals] = useState<GoalModel[]>([]);
  const [contributions, setContributions] = useState<ContributionModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGoals = async () => {
      try {
        await fetchGoals();
        await fetchContributions();
      } catch (e) {
        handleApiError(e);
      }
    };

    initializeGoals();
  }, []);
  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    setError("Something went wrong. Please try again.");
  };

  const fetchGoals = async (): Promise<void> => {
    setError(null);

    try {
      const token = await SecureStore.getItem("auth_token");

      const response = await axios.get(`${GOALS_API_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const { data } = response.data;

      setGoals(data);
    } catch (e) {
      handleApiError(e);
    }
  };

  const addGoal = async (goal: GoalModel): Promise<void> => {
    setError(null);
    try {
      const token = await SecureStore.getItem("auth_token");
      const { id, ...dataToSend } = goal;

      const response = await axios.post(`${GOALS_API_URL}/add`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const addedGoal = response.data;
      setGoals((prev) => [addedGoal, ...prev]);
    } catch (e) {
      handleApiError(e);
    }
  };

  const addContribution = async (
    contribution: ContributionModel
  ): Promise<void> => {
    setError(null);
    try {
      const token = await SecureStore.getItem("auth_token");

      const response = await axios.post(
        `${CONTRIBUTIONS_API_URL}/add`,
        contribution,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedGoal: GoalModel = response.data;

      setGoals((prev) =>
        prev.map((gl) => (gl.id === updatedGoal.id ? updatedGoal : gl))
      );
    } catch (e) {
      handleApiError(e);
    }
  };

  const fetchContributions = async (): Promise<ContributionModel[]> => {
    setError(null);
    try {
      const token = await SecureStore.getItem("auth_token");

      const response = await axios.get(`${CONTRIBUTIONS_API_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Contributions fetched:", response.data);

      setContributions(response.data);
      return response.data;
    } catch (e) {
      handleApiError(e);
      return [];
    }
  };

  const updateGoal = async (
    id: string,
    updates: Partial<GoalModel>
  ): Promise<void> => {
    try {
      console.log("Updating goal with ID:", id, "Updates:", updates);
      const token = await SecureStore.getItem("auth_token");
      const response = await axios.put(`${GOALS_API_URL}/edit/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const updatedGoal = response.data;

      setGoals((prev) => prev.map((gl) => (gl.id === id ? updatedGoal : gl)));
    } catch (e) {
      handleApiError(e);
    }
  };

  const deleteGoal = async (id: string): Promise<void> => {
    try {
      const token = await SecureStore.getItem("auth_token");
      await axios.delete(`${GOALS_API_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setGoals((prev) => prev.filter((gl) => gl.id !== id));
    } catch (e) {
      handleApiError(e);
    }
  };

  const contextValue = useMemo(
    () => ({
      goals,
      contributions,
      error,
      addGoal,
      fetchGoals,
      deleteGoal,
      updateGoal,
      addContribution,
      fetchContributions,
    }),
    [goals, error]
  );

  return (
    <GoalsContext.Provider value={contextValue}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = (): GoalContextType => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error("useGoalsContext must be used within a GoalsProvider");
  }
  return context;
};
