import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { CreateExpenseDto } from '../dto/create-expense.dto';

@Injectable()
export class ExpenseUseCase {
  constructor(
    @Inject('IExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async createExpense(userId: string, dto: CreateExpenseDto): Promise<Expense> {
    const expense = new Expense({
      userId,
      amount: dto.amount,
      category: dto.category,
      description: dto.description,
      date: dto.date,
      receiptUrl: dto.receiptUrl,
      isRecurring: dto.isRecurring || false,
      tags: dto.tags || [],
      aiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.expenseRepository.create(expense);
  }

  async getExpensesByUser(userId: string): Promise<Expense[]> {
    return await this.expenseRepository.findByUserId(userId);
  }

  async getExpenseById(id: string, userId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async getExpensesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    return await this.expenseRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
    );
  }

  async updateExpense(
    id: string,
    userId: string,
    updates: Partial<CreateExpenseDto>,
  ): Promise<Expense> {
    const expense = await this.getExpenseById(id, userId);
    const updated = await this.expenseRepository.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Expense not found');
    }

    return updated;
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    const expense = await this.getExpenseById(id, userId);
    await this.expenseRepository.delete(id);
  }

  async getTotalsByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ category: string; total: number }[]> {
    return await this.expenseRepository.getTotalByCategory(
      userId,
      startDate,
      endDate,
    );
  }

  async getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await this.expenseRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
    );

    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
}
