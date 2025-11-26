import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BudgetDocument extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  limit: number;

  @Prop({ required: true, enum: ['monthly', 'weekly', 'yearly'] })
  period: string;

  @Prop({ default: 80 })
  alertThreshold: number;
}

export const BudgetSchema = SchemaFactory.createForClass(BudgetDocument);

BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });
