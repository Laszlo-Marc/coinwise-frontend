import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import { useCallback, useMemo, useState } from "react";

type FilterOptions = {
  transactionClass?: TransactionType | null;
  category?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  sortBy?: "amount" | "date";
  sortOrder?: "asc" | "desc";
};

export function useTransactionFilters(transactions: TransactionModel[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    transactionClass: "expense",
    sortBy: "date",
    sortOrder: "desc",
  });

  const displayedTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filters.transactionClass && filters.transactionClass !== "all") {
      filtered = filtered.filter((tx) => tx.type === filters.transactionClass);
    }

    if (filters.category && filters.transactionClass === "expense") {
      filtered = filtered.filter((tx) => tx.category === filters.category);
    }

    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date);
        const afterStart = filters.startDate
          ? txDate >= filters.startDate
          : true;
        const beforeEnd = filters.endDate ? txDate <= filters.endDate : true;
        return afterStart && beforeEnd;
      });
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const valA =
          filters.sortBy === "amount" ? a.amount : new Date(a.date).getTime();
        const valB =
          filters.sortBy === "amount" ? b.amount : new Date(b.date).getTime();
        return filters.sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    return filtered;
  }, [transactions, filters]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterOptions>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  return {
    displayedTransactions,
    handleFilterChange,
    filters,
  };
}
