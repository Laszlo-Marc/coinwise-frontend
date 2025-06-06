import { createContext, useContext } from "react";

interface StatsContextType {}
const StatsContext = createContext<StatsContextType | undefined>(undefined);
const API_BASE_URL = "http://192.168.1.156:5000/api";
const STATS_API_URL = `${API_BASE_URL}/stats`;
const StatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StatsContext.Provider value={{}}>{children}</StatsContext.Provider>;
};

export const useStatsContext = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error("useStatsContext must be used within a StatsProvider");
  }
  return context;
};
