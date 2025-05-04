interface TransactionModel {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  user_id: string;
  merchant: string;
}
export default TransactionModel;
