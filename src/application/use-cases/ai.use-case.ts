import { Injectable } from '@nestjs/common';
import { OpenAIService, ReceiptAnalysis } from '../../infrastructure/ai/openai.service';
import { ExpenseUseCase } from './expense.use-case';
import { Expense } from '../../domain/entities/expense.entity';

@Injectable()
export class AIUseCase {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly expenseUseCase: ExpenseUseCase,
  ) {}

  async processReceiptImage(
    userId: string,
    imageBase64: string,
    mimeType?: string,
  ): Promise<{ expense: Expense; analysis: ReceiptAnalysis }> {
    const analysis = await this.openaiService.analyzeReceipt(imageBase64, mimeType);

    const expense = await this.expenseUseCase.createExpense(userId, {
      amount: analysis.amount,
      category: analysis.category,
      description: analysis.description,
      date: new Date(analysis.date),
      isRecurring: false,
      tags: analysis.merchant ? [analysis.merchant] : [],
    });

    return { expense, analysis };
  }

  async autoCategorizeExpense(description: string): Promise<string> {
    return await this.openaiService.categorizeExpense(description);
  }

  async predictNextMonthExpenses(userId: string): Promise<{
    predictions: { category: string; predicted: number }[];
    total: number;
  }> {

    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const expenses = await this.expenseUseCase.getExpensesByDateRange(
      userId,
      threeMonthsAgo,
      now,
    );

    const predictions = await this.openaiService.predictNextMonthExpenses(expenses);
    const total = predictions.reduce((sum, p) => sum + p.predicted, 0);

    return { predictions, total };
  }

  async getBudgetSuggestions(
    userId: string,
    monthlyIncome: number,
  ): Promise<{ category: string; suggested: number; reason: string }[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const totals = await this.expenseUseCase.getTotalsByCategory(
      userId,
      startOfMonth,
      endOfMonth,
    );

    return await this.openaiService.generateBudgetSuggestions(
      monthlyIncome,
      totals,
    );
  }
}
