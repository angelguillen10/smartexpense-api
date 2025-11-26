import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IExpenseRepository } from '../../../domain/repositories/expense.repository.interface';
import { Expense } from '../../../domain/entities/expense.entity';
import { ExpenseDocument } from '../schemas/expense.schema';

@Injectable()
export class ExpenseRepository implements IExpenseRepository {
  constructor(
    @InjectModel(ExpenseDocument.name)
    private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(expense: Expense): Promise<Expense> {
    const created = new this.expenseModel(expense);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<Expense | null> {
    const doc = await this.expenseModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Expense[]> {
    const docs = await this.expenseModel
      .find({ userId })
      .sort({ date: -1 })
      .exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    const docs = await this.expenseModel
      .find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(id: string, expense: Partial<Expense>): Promise<Expense | null> {
    const updated = await this.expenseModel
      .findByIdAndUpdate(id, expense, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.expenseModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getTotalByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ category: string; total: number }[]> {
    const result = await this.expenseModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          _id: 0,
        },
      },
    ]);
    return result;
  }

  private toEntity(doc: any): Expense {
    return new Expense({
      id: doc._id.toString(),
      userId: doc.userId,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      receiptUrl: doc.receiptUrl,
      isRecurring: doc.isRecurring,
      tags: doc.tags,
      aiGenerated: doc.aiGenerated,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
