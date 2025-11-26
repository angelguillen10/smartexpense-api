import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ExpenseDocument extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  receiptUrl?: string;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  aiGenerated: boolean;
}

export const ExpenseSchema = SchemaFactory.createForClass(ExpenseDocument);
