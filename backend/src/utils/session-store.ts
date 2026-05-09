import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const PREFIX = 'ussd_session:';
const TTL = 300; // 5 minutes

export class SessionStore {
  async get(sessionId: string) {
    const raw = await redis.get(PREFIX + sessionId);
    return raw ? JSON.parse(raw) : null;
  }

  async set(sessionId: string, state: any, ttl = TTL) {
    await redis.setex(PREFIX + sessionId, ttl, JSON.stringify(state));
  }

  async delete(sessionId: string) {
    await redis.del(PREFIX + sessionId);
  }
}