import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIUseCase } from '../../application/use-cases/ai.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiUseCase: AIUseCase) {}

  @Post('scan-receipt')
  @UseInterceptors(FileInterceptor('receipt'))
  async scanReceipt(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const fileBase64 = file.buffer.toString('base64');
    const mimeType = file.mimetype;
    return await this.aiUseCase.processReceiptImage(req.user.userId, fileBase64, mimeType);
  }

  @Post('categorize')
  async categorize(@Body('description') description: string) {
    return {
      category: await this.aiUseCase.autoCategorizeExpense(description),
    };
  }

  @Get('predict-expenses')
  async predictExpenses(@Request() req) {
    return await this.aiUseCase.predictNextMonthExpenses(req.user.userId);
  }

  @Get('budget-suggestions')
  async getBudgetSuggestions(
    @Request() req,
    @Query('monthlyIncome') monthlyIncome: string,
  ) {
    return await this.aiUseCase.getBudgetSuggestions(
      req.user.userId,
      parseFloat(monthlyIncome),
    );
  }
}
