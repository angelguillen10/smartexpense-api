import { Expense } from '../entities/expense.entity';

export interface IExpenseRepository {
  create(expense: Expense): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findByUserId(userId: string): Promise<Expense[]>;
  findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]>;
  update(id: string, expense: Partial<Expense>): Promise<Expense | null>;
  delete(id: string): Promise<boolean>;
  getTotalByCategory(userId: string, startDate: Date, endDate: Date): Promise<{ category: string; total: number }[]>;
}
