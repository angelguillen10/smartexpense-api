export class Budget {
  id?: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'weekly' | 'yearly';
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Budget>) {
    Object.assign(this, partial);
  }
}
