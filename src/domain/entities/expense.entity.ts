export class Expense {
  id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  receiptUrl?: string;
  isRecurring: boolean;
  tags: string[];
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Expense>) {
    Object.assign(this, partial);
  }
}
