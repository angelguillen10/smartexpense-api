import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ExpenseDocument, ExpenseSchema } from './infrastructure/database/schemas/expense.schema';
import { UserDocument, UserSchema } from './infrastructure/database/schemas/user.schema';
import { BudgetDocument, BudgetSchema } from './infrastructure/database/schemas/budget.schema';

import { ExpenseRepository } from './infrastructure/database/repositories/expense.repository';
import { UserRepository } from './infrastructure/database/repositories/user.repository';
import { BudgetRepository } from './infrastructure/database/repositories/budget.repository';

import { ExpenseUseCase } from './application/use-cases/expense.use-case';
import { AuthUseCase } from './application/use-cases/auth.use-case';
import { BudgetUseCase } from './application/use-cases/budget.use-case';
import { AIUseCase } from './application/use-cases/ai.use-case';

import { ExpenseController } from './infrastructure/controllers/expense.controller';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { BudgetController } from './infrastructure/controllers/budget.controller';
import { AIController } from './infrastructure/controllers/ai.controller';

import { OpenAIService } from './infrastructure/ai/openai.service';

import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    MongooseModule.forFeature([
      { name: ExpenseDocument.name, schema: ExpenseSchema },
      { name: UserDocument.name, schema: UserSchema },
      { name: BudgetDocument.name, schema: BudgetSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [
    ExpenseController,
    AuthController,
    BudgetController,
    AIController,
  ],
  providers: [

    {
      provide: 'IExpenseRepository',
      useClass: ExpenseRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IBudgetRepository',
      useClass: BudgetRepository,
    },

    ExpenseUseCase,
    AuthUseCase,
    BudgetUseCase,
    AIUseCase,

    OpenAIService,

    JwtStrategy,
  ],
})
export class AppModule {}
