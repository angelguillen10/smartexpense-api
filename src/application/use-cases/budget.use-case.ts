import { Injectable, NotFoundException, Inject, ConflictException } from '@nestjs/common';
import { IBudgetRepository } from '../../domain/repositories/budget.repository.interface';
import { Budget } from '../../domain/entities/budget.entity';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { ExpenseUseCase } from './expense.use-case';

export interface BudgetAlert {
  budgetId: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  exceeded: boolean;
}

@Injectable()
export class BudgetUseCase {
  constructor(
    @Inject('IBudgetRepository')
    private readonly budgetRepository: IBudgetRepository,
    private readonly expenseUseCase: ExpenseUseCase,
  ) {}

  async createBudget(userId: string, dto: CreateBudgetDto): Promise<Budget> {

    const existing = await this.budgetRepository.findByUserIdAndCategory(
      userId,
      dto.category,
    );
    if (existing) {
      throw new ConflictException('Budget already exists for this category');
    }

    const budget = new Budget({
      userId,
      category: dto.category,
      limit: dto.limit,
      period: dto.period,
      alertThreshold: dto.alertThreshold || 80,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.budgetRepository.create(budget);
  }

  async getBudgetsByUser(userId: string): Promise<Budget[]> {
    return await this.budgetRepository.findByUserId(userId);
  }

  async updateBudget(
    id: string,
    userId: string,
    updates: Partial<CreateBudgetDto>,
  ): Promise<Budget> {
    const budget = await this.budgetRepository.findById(id);
    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    const updated = await this.budgetRepository.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Budget not found');
    }

    return updated;
  }

  async deleteBudget(id: string, userId: string): Promise<void> {
    const budget = await this.budgetRepository.findById(id);
    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }
    await this.budgetRepository.delete(id);
  }

  async checkBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
    const budgets = await this.budgetRepository.findByUserId(userId);
    const alerts: BudgetAlert[] = [];

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    for (const budget of budgets) {
      let startDate: Date;
      let endDate: Date;

      if (budget.period === 'monthly') {
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
      } else if (budget.period === 'weekly') {
        const today = new Date();
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {

        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59);
      }

      const expenses = await this.expenseUseCase.getExpensesByDateRange(
        userId,
        startDate,
        endDate,
      );

      const spent = expenses
        .filter((e) => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);

      const percentage = (spent / budget.limit) * 100;

      if (percentage >= budget.alertThreshold) {
        alerts.push({
          budgetId: budget.id!,
          category: budget.category,
          limit: budget.limit,
          spent,
          percentage,
          exceeded: spent > budget.limit,
        });
      }
    }

    return alerts;
  }
}
