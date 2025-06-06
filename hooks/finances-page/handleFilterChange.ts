import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import { useCallback, useEffect, useState } from "react";

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

  const [displayedTransactions, setDisplayedTransactions] = useState<
    TransactionModel[]
  >([]);

  const applyFilters = useCallback(
    (filterOptions: FilterOptions) => {
      let filtered = transactions;

      if (
        filterOptions.transactionClass &&
        filterOptions.transactionClass !== "all"
      ) {
        filtered = filtered.filter(
          (tx) => tx.type === filterOptions.transactionClass
        );
      }

      if (
        filterOptions.category &&
        filterOptions.transactionClass === "expense"
      ) {
        filtered = filtered.filter(
          (tx) => tx.category === filterOptions.category
        );
      }

      if (filterOptions.startDate || filterOptions.endDate) {
        filtered = filtered.filter((tx) => {
          const txDate = new Date(tx.date);
          const afterStart = filterOptions.startDate
            ? txDate >= filterOptions.startDate
            : true;
          const beforeEnd = filterOptions.endDate
            ? txDate <= filterOptions.endDate
            : true;
          return afterStart && beforeEnd;
        });
      }

      if (filterOptions.sortBy) {
        filtered = [...filtered].sort((a, b) => {
          let valueA =
            filterOptions.sortBy === "amount"
              ? a.amount
              : new Date(a.date).getTime();
          let valueB =
            filterOptions.sortBy === "amount"
              ? b.amount
              : new Date(b.date).getTime();

          return filterOptions.sortOrder === "asc"
            ? valueA - valueB
            : valueB - valueA;
        });
      }

      setDisplayedTransactions(filtered);
    },
    [transactions]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterOptions>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      applyFilters(updatedFilters);
    },
    [filters, applyFilters]
  );

  useEffect(() => {
    applyFilters(filters);
  }, [transactions, applyFilters, filters]);

  return {
    displayedTransactions,
    handleFilterChange,
    filters,
  };
}
