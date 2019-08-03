import Redis from 'ioredis';

class Cache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      // chaves e valores são separadas por ":", como cache:user:2:appointments ...
      keyPrefix: 'cache:',
    });
  }

  set(key, value) {
    // (EX = expire), tempo
    // 60segundos * 60minutos * 24 = 24horas
    return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 60 * 24);
  }

  async get(key) {
    const cached = await this.redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  invalidate(key) {
    return this.redis.del(key);
  }
}

export default new Cache();
