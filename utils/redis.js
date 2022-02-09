const redis = require('redis');
const util = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('connect', () => {
    }).on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async delall() {
    const delallAsync = util.promisify(this.client.flushall).bind(this.client);
    return delallAsync();
  }

  async get(str) {
    const getAsync = util.promisify(this.client.get).bind(this.client);
    return getAsync(str);
  }

  async set(str, val, dur) {
    const setAsync = util.promisify(this.client.set).bind(this.client);
    return setAsync(str, val, 'EX', dur);
  }

  async del(str) {
    const delAsync = util.promisify(this.client.del).bind(this.client);
    return delAsync(str);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
