// scripts/seed-audit-logs.ts
import { randomUUID } from 'crypto';
import { insertAuditLog } from '../src/utils/audit';

const userIds = [
  'e7287ee9-1f37-47d4-9ff2-fbf748ca99be',
  '9479c1f4-061e-451a-b7a7-cbd538c9c867',
  '253a0cae-171e-46ff-8662-c3ca13365814',
  'e659d519-45f2-41d6-98fc-08f02ecf2ee9',
  'cb4b1d15-3fe3-4f70-b853-1d31353157d6',
];

const actions = ['LOGIN', 'PAYMENT_INITIATED', 'REGISTRATION', 'GENERATE_ASSESSMENTS'];
const entities: Record<string, string> = {
  LOGIN: 'users',
  PAYMENT_INITIATED: 'payments',
  REGISTRATION: 'users',
  GENERATE_ASSESSMENTS: 'tax_assessments',
};

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148.0.0.0',
  'PostmanRuntime/7.54.0',
  'curl/8.18.0',
];

async function seed() {
  for (let i = 0; i < 100; i++) {
    const userId = userIds[i % userIds.length];
    const action = actions[i % actions.length];
    const entity = entities[action];
    const entityId = randomUUID();   // <-- proper UUID

    const metadata = {
      ip_address: '::1',
      user_agent: userAgents[i % userAgents.length],
    };

    await insertAuditLog({
      userId,
      action,
      entity,
      entityId,
      metadata,
    });

    process.stdout.write(`\r${i + 1} / 100 audit logs created`);
  }

  console.log('\n✅ Done. Now verify the chain – all should be green.');
}

seed().catch(console.error);