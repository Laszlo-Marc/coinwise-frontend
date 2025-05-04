
interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: "income" | "expense";
    user_id: string;
    merchant: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onPress?: () => void;
  }

  export default Transaction;