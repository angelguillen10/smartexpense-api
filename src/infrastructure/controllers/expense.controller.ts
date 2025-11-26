import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { CreateExpenseDto } from '../../application/dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseUseCase: ExpenseUseCase) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateExpenseDto) {
    return await this.expenseUseCase.createExpense(req.user.userId, dto);
  }

  @Get()
  async getAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return await this.expenseUseCase.getExpensesByDateRange(
        req.user.userId,
        new Date(startDate),
        new Date(endDate),
      );
    }
    return await this.expenseUseCase.getExpensesByUser(req.user.userId);
  }

  @Get('stats/by-category')
  async getStatsByCategory(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.expenseUseCase.getTotalsByCategory(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('stats/monthly-total')
  async getMonthlyTotal(
    @Request() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const total = await this.expenseUseCase.getMonthlyTotal(
      req.user.userId,
      parseInt(year),
      parseInt(month),
    );
    return { total };
  }

  @Get(':id')
  async getOne(@Request() req, @Param('id') id: string) {
    return await this.expenseUseCase.getExpenseById(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateExpenseDto>,
  ) {
    return await this.expenseUseCase.updateExpense(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.expenseUseCase.deleteExpense(id, req.user.userId);
    return { message: 'Expense deleted successfully' };
  }
}
