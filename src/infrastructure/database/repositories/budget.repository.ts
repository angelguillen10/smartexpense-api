import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBudgetRepository } from '../../../domain/repositories/budget.repository.interface';
import { Budget } from '../../../domain/entities/budget.entity';
import { BudgetDocument } from '../schemas/budget.schema';

@Injectable()
export class BudgetRepository implements IBudgetRepository {
  constructor(
    @InjectModel(BudgetDocument.name)
    private budgetModel: Model<BudgetDocument>,
  ) {}

  async create(budget: Budget): Promise<Budget> {
    const created = new this.budgetModel(budget);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<Budget | null> {
    const doc = await this.budgetModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Budget[]> {
    const docs = await this.budgetModel.find({ userId }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string,
  ): Promise<Budget | null> {
    const doc = await this.budgetModel.findOne({ userId, category }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async update(id: string, budget: Partial<Budget>): Promise<Budget | null> {
    const updated = await this.budgetModel
      .findByIdAndUpdate(id, budget, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.budgetModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(doc: any): Budget {
    return new Budget({
      id: doc._id.toString(),
      userId: doc.userId,
      category: doc.category,
      limit: doc.limit,
      period: doc.period as 'monthly' | 'weekly' | 'yearly',
      alertThreshold: doc.alertThreshold,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
