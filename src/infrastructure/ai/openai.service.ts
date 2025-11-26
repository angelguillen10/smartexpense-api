import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ReceiptAnalysis {
  amount: number;
  category: string;
  description: string;
  date: string;
  merchant?: string;
}

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeReceipt(fileBase64: string, mimeType?: string): Promise<ReceiptAnalysis> {
    try {

      const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${fileBase64}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at analyzing receipt images. Extract the following information: total amount, merchant name, date, and items purchased. Return ONLY a valid JSON object with keys: amount (number), category (string), description (string), date (YYYY-MM-DD format), merchant (string).',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this receipt and extract the information.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0].message.content || '{}';

      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(cleanContent);

      return {
        amount: parsed.amount || 0,
        category: parsed.category || parsed.merchant || 'Other',
        description: parsed.description || parsed.merchant || 'Receipt scan',
        date: parsed.date || new Date().toISOString().split('T')[0],
        merchant: parsed.merchant,
      };
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      throw new Error('Failed to analyze receipt');
    }
  }

  async categorizeExpense(description: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expense categorization expert. Categorize the expense into one of these categories: Food, Transport, Entertainment, Shopping, Bills, Health, Education, Travel, Other. Return ONLY the category name, nothing else.',
          },
          {
            role: 'user',
            content: `Categorize this expense: "${description}"`,
          },
        ],
        max_tokens: 20,
      });

      const category = response.choices[0].message.content?.trim() || 'Other';
      return category;
    } catch (error) {
      console.error('Error categorizing expense:', error);
      return 'Other';
    }
  }

  async predictNextMonthExpenses(
    expenses: { category: string; amount: number; date: Date }[],
  ): Promise<{ category: string; predicted: number }[]> {
    try {
      const expenseData = JSON.stringify(
        expenses.map((e) => ({
          category: e.category,
          amount: e.amount,
          date: e.date.toISOString().split('T')[0],
        })),
      );

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial analyst. Based on historical expense data, predict next month\'s expenses by category. Return ONLY a valid JSON array with objects containing: category (string) and predicted (number). Base predictions on trends and patterns.',
          },
          {
            role: 'user',
            content: `Analyze this expense history and predict next month's expenses: ${expenseData}`,
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0].message.content || '[]';
      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return parsed;
    } catch (error) {
      console.error('Error predicting expenses:', error);
      return [];
    }
  }

  async generateBudgetSuggestions(
    monthlyIncome: number,
    currentExpenses: { category: string; total: number }[],
  ): Promise<{ category: string; suggested: number; reason: string }[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial advisor. Based on monthly income and current expenses, suggest budget limits for each category. Return ONLY a valid JSON array with objects containing: category (string), suggested (number), reason (string).',
          },
          {
            role: 'user',
            content: `Monthly income: $${monthlyIncome}. Current expenses: ${JSON.stringify(currentExpenses)}. Suggest budget limits.`,
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || '[]';
      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return parsed;
    } catch (error) {
      console.error('Error generating budget suggestions:', error);
      return [];
    }
  }
}
