# SmartExpense API

API de gestión de gastos personales con categorización asistida por IA.

Construida con NestJS y arquitectura hexagonal: la lógica de dominio no conoce a MongoDB, a OpenAI ni a Express. Los adaptadores se pueden reemplazar sin tocar los casos de uso.

---

## Arquitectura

```
src/
├── domain/              Entidades y contratos. Sin dependencias externas.
│   ├── entities/        User, Expense, Budget
│   └── repositories/    Interfaces que la infraestructura implementa
│
├── application/         Casos de uso y DTOs
│   ├── use-cases/       Auth, Expense, Budget, AI
│   └── dto/             Validación de entrada con class-validator
│
└── infrastructure/      Todo lo que habla con el mundo exterior
    ├── controllers/     Endpoints HTTP
    ├── database/        Esquemas de Mongoose e implementación de repositorios
    ├── auth/            Estrategia JWT y guards
    └── ai/              Cliente de OpenAI
```

La dependencia apunta siempre hacia adentro: infraestructura conoce a aplicación, aplicación conoce a dominio, dominio no conoce a nadie.

---

## Funcionalidad

**Autenticación** — registro y login con JWT, contraseñas con bcrypt, rutas protegidas por guard.

**Gastos** — alta, consulta y categorización. Filtros por rango de fechas y categoría.

**Presupuestos** — límites por categoría con seguimiento de consumo.

**IA** — categorización automática de gastos y análisis de patrones de consumo vía OpenAI.

---

## Stack

NestJS · TypeScript · MongoDB con Mongoose · JWT con Passport · OpenAI · Docker

---

## Correrlo

```bash
cp .env.example .env     # completar las variables
docker compose up -d     # levanta MongoDB
npm install
npm run start:dev
```

La API queda en `http://localhost:3000`.

---

## Decisiones

**Por qué hexagonal en un proyecto chico.** Porque el costo de estructurarlo así es bajo al inicio y alto después. Los casos de uso se testean sin levantar base de datos ni mockear HTTP.

**Por qué los repositorios son interfaces.** `ExpenseUseCase` depende de `IExpenseRepository`, no de Mongoose. Migrar a PostgreSQL es escribir un adaptador nuevo, no reescribir la aplicación.

**Por qué la IA está en infraestructura.** Es un detalle de implementación. Si mañana se cambia OpenAI por otro proveedor, el caso de uso no se entera.
