server/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.middleware.ts
│   │   ├── taxpayer/
│   │   │   ├── taxpayer.controller.ts
│   │   │   ├── taxpayer.service.ts
│   │   │   └── taxpayer.routes.ts
│   │   ├── tax/
│   │   │   ├── tax.controller.ts
│   │   │   ├── tax.service.ts
│   │   │   └── tax.routes.ts
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.routes.ts
│   │   └── reconciliation/
│   │       ├── reconciliation.controller.ts
│   │       ├── reconciliation.service.ts
│   │       └── reconciliation.routes.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rateLimiter.ts
│   │   └── validation.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── response.ts
│   └── app.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json