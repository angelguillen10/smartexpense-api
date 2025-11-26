import { Budget } from '../entities/budget.entity';

export interface IBudgetRepository {
  create(budget: Budget): Promise<Budget>;
  findById(id: string): Promise<Budget | null>;
  findByUserId(userId: string): Promise<Budget[]>;
  findByUserIdAndCategory(userId: string, category: string): Promise<Budget | null>;
  update(id: string, budget: Partial<Budget>): Promise<Budget | null>;
  delete(id: string): Promise<boolean>;
}
