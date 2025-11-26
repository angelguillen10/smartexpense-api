import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BudgetUseCase } from '../../application/use-cases/budget.use-case';
import { CreateBudgetDto } from '../../application/dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetUseCase: BudgetUseCase) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateBudgetDto) {
    return await this.budgetUseCase.createBudget(req.user.userId, dto);
  }

  @Get()
  async getAll(@Request() req) {
    return await this.budgetUseCase.getBudgetsByUser(req.user.userId);
  }

  @Get('alerts')
  async getAlerts(@Request() req) {
    return await this.budgetUseCase.checkBudgetAlerts(req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateBudgetDto>,
  ) {
    return await this.budgetUseCase.updateBudget(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.budgetUseCase.deleteBudget(id, req.user.userId);
    return { message: 'Budget deleted successfully' };
  }
}
