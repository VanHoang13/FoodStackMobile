/**
 * Mock Data Configuration
 * Replaces database connections with mock data
 */

const { logger } = require('./logger.config');
const mockData = require('../data/mockData');

// =====================================================
// Mock Database Implementation
// =====================================================

/**
 * Mock database client that simulates database operations
 */
class MockDatabase {
  constructor() {
    this.connected = false;
    this.data = mockData;
  }

  async connect() {
    this.connected = true;
    logger.info('Mock database connected successfully');
    return true;
  }

  async disconnect() {
    this.connected = false;
    logger.info('Mock database disconnected');
    return true;
  }

  // Simulate Prisma-like queries
  async findMany(table, options = {}) {
    const data = this.data[`mock${table.charAt(0).toUpperCase() + table.slice(1)}`] || [];
    
    if (options.where) {
      return data.filter(item => {
        return Object.keys(options.where).every(key => {
          return item[key] === options.where[key];
        });
      });
    }
    
    return data;
  }

  async findUnique(table, options = {}) {
    const data = this.data[`mock${table.charAt(0).toUpperCase() + table.slice(1)}`] || [];
    
    if (options.where) {
      return data.find(item => {
        return Object.keys(options.where).every(key => {
          return item[key] === options.where[key];
        });
      });
    }
    
    return data[0] || null;
  }

  async create(table, options = {}) {
    const data = this.data[`mock${table.charAt(0).toUpperCase() + table.slice(1)}`] || [];
    const newItem = {
      id: mockData.generateId(),
      ...options.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.push(newItem);
    return newItem;
  }

  async update(table, options = {}) {
    const data = this.data[`mock${table.charAt(0).toUpperCase() + table.slice(1)}`] || [];
    const index = data.findIndex(item => {
      return Object.keys(options.where).every(key => {
        return item[key] === options.where[key];
      });
    });
    
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...options.data,
        updated_at: new Date().toISOString()
      };
      return data[index];
    }
    
    return null;
  }

  async delete(table, options = {}) {
    const data = this.data[`mock${table.charAt(0).toUpperCase() + table.slice(1)}`] || [];
    const index = data.findIndex(item => {
      return Object.keys(options.where).every(key => {
        return item[key] === options.where[key];
      });
    });
    
    if (index !== -1) {
      const deleted = data.splice(index, 1)[0];
      return deleted;
    }
    
    return null;
  }
}

// Create mock database instance
const mockDb = new MockDatabase();

// Mock Redis implementation
class MockRedis {
  constructor() {
    this.data = new Map();
    this.connected = false;
  }

  async connect() {
    this.connected = true;
    logger.info('Mock Redis connected');
    return 'OK';
  }

  async quit() {
    this.connected = false;
    logger.info('Mock Redis disconnected');
    return 'OK';
  }

  async ping() {
    return 'PONG';
  }

  async set(key, value, ...args) {
    this.data.set(key, value);
    return 'OK';
  }

  async setex(key, seconds, value) {
    this.data.set(key, value);
    // Mock expiration - in real implementation would use setTimeout
    setTimeout(() => {
      this.data.delete(key);
    }, seconds * 1000);
    return 'OK';
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async del(key) {
    return this.data.delete(key) ? 1 : 0;
  }

  async incr(key) {
    const current = parseInt(this.data.get(key) || '0');
    const newValue = current + 1;
    this.data.set(key, newValue.toString());
    return newValue;
  }

  async exists(key) {
    return this.data.has(key) ? 1 : 0;
  }

  async expire(key, seconds) {
    // Mock expiration - in real implementation would use setTimeout
    setTimeout(() => {
      this.data.delete(key);
    }, seconds * 1000);
    return 1;
  }

  // Event emitter methods for compatibility
  on(event, callback) {
    // Mock event handling
    if (event === 'connect') {
      setTimeout(callback, 100);
    }
  }

  emit(event, ...args) {
    // Mock event emission
  }
}

// Create mock Redis instances
const redis = new MockRedis();
const redisPubSub = new MockRedis();

// =====================================================
// Mock Database Health Check
// =====================================================

/**
 * Check health of mock databases
 * @returns {Promise<{postgres: boolean, mongodb: boolean, redis: boolean}>}
 */
const checkDatabaseHealth = async () => {
  const health = {
    postgres: mockDb.connected,
    mongodb: true, // Always true for mock
    redis: redis.connected,
  };

  logger.info('Mock database health check', health);
  return health;
};

// =====================================================
// Initialize Mock Databases
// =====================================================

/**
 * Initialize all mock database connections
 * @returns {Promise<void>}
 */
const initializeDatabases = async () => {
  try {
    // Connect mock database
    await mockDb.connect();
    await redis.connect();
    await redisPubSub.connect();

    // Verify all connections
    const health = await checkDatabaseHealth();
    
    logger.info('All mock databases initialized successfully', health);
  } catch (error) {
    logger.error('Mock database initialization failed', { error });
    throw error;
  }
};

// =====================================================
// Compatibility Layer
// =====================================================

// Create Prisma-like interface for backward compatibility
const prisma = {
  // Table accessors
  restaurants: {
    findMany: (options) => mockDb.findMany('restaurants', options),
    findUnique: (options) => mockDb.findUnique('restaurants', options),
    create: (options) => mockDb.create('restaurants', options),
    update: (options) => mockDb.update('restaurants', options),
    delete: (options) => mockDb.delete('restaurants', options),
  },
  branches: {
    findMany: (options) => mockDb.findMany('branches', options),
    findUnique: (options) => mockDb.findUnique('branches', options),
    create: (options) => mockDb.create('branches', options),
    update: (options) => mockDb.update('branches', options),
    delete: (options) => mockDb.delete('branches', options),
  },
  tables: {
    findMany: (options) => mockDb.findMany('tables', options),
    findUnique: (options) => mockDb.findUnique('tables', options),
    create: (options) => mockDb.create('tables', options),
    update: (options) => mockDb.update('tables', options),
    delete: (options) => mockDb.delete('tables', options),
  },
  categories: {
    findMany: (options) => mockDb.findMany('categories', options),
    findUnique: (options) => mockDb.findUnique('categories', options),
    create: (options) => mockDb.create('categories', options),
    update: (options) => mockDb.update('categories', options),
    delete: (options) => mockDb.delete('categories', options),
  },
  menu_items: {
    findMany: (options) => mockDb.findMany('menuItems', options),
    findUnique: (options) => mockDb.findUnique('menuItems', options),
    create: (options) => mockDb.create('menuItems', options),
    update: (options) => mockDb.update('menuItems', options),
    delete: (options) => mockDb.delete('menuItems', options),
  },
  orders: {
    findMany: (options) => mockDb.findMany('orders', options),
    findUnique: (options) => mockDb.findUnique('orders', options),
    create: (options) => mockDb.create('orders', options),
    update: (options) => mockDb.update('orders', options),
    delete: (options) => mockDb.delete('orders', options),
  },
  order_items: {
    findMany: (options) => mockDb.findMany('orderItems', options),
    findUnique: (options) => mockDb.findUnique('orderItems', options),
    create: (options) => mockDb.create('orderItems', options),
    update: (options) => mockDb.update('orderItems', options),
    delete: (options) => mockDb.delete('orderItems', options),
  },
  payments: {
    findMany: (options) => mockDb.findMany('payments', options),
    findUnique: (options) => mockDb.findUnique('payments', options),
    create: (options) => mockDb.create('payments', options),
    update: (options) => mockDb.update('payments', options),
    delete: (options) => mockDb.delete('payments', options),
  },
  users: {
    findMany: async (options) => {
      const data = mockData.mockUsers || [];
      let filtered = data;
      
      // Apply where conditions
      if (options?.where) {
        filtered = data.filter(item => {
          return Object.keys(options.where).every(key => {
            if (key === 'role' && options.where[key]?.in) {
              return options.where[key].in.includes(item[key]);
            }
            if (key === 'restaurant_id') {
              return item.restaurant_id === options.where[key];
            }
            if (key === 'status') {
              return item.status === options.where[key];
            }
            if (key === 'OR') {
              return options.where[key].some(condition => {
                return Object.keys(condition).some(condKey => {
                  if (condition[condKey]?.contains) {
                    return item[condKey]?.toLowerCase().includes(condition[condKey].contains.toLowerCase());
                  }
                  return item[condKey] === condition[condKey];
                });
              });
            }
            return item[key] === options.where[key];
          });
        });
      }
      
      // Apply ordering
      if (options?.orderBy) {
        const orderKey = Object.keys(options.orderBy)[0];
        const orderDirection = options.orderBy[orderKey];
        filtered.sort((a, b) => {
          if (orderDirection === 'desc') {
            return new Date(b[orderKey]) - new Date(a[orderKey]);
          }
          return new Date(a[orderKey]) - new Date(b[orderKey]);
        });
      }
      
      // Apply pagination
      if (options?.skip !== undefined && options?.take !== undefined) {
        filtered = filtered.slice(options.skip, options.skip + options.take);
      }
      
      // Apply select
      if (options?.select) {
        filtered = filtered.map(item => {
          const selected = {};
          Object.keys(options.select).forEach(key => {
            if (options.select[key]) {
              selected[key] = item[key];
            }
          });
          return selected;
        });
      }
      
      return filtered;
    },
    findUnique: (options) => mockDb.findUnique('users', options),
    create: (options) => mockDb.create('users', options),
    update: (options) => mockDb.update('users', options),
    delete: (options) => mockDb.delete('users', options),
    count: async (options) => {
      const data = mockData.mockUsers || [];
      
      if (options?.where) {
        const filtered = data.filter(item => {
          return Object.keys(options.where).every(key => {
            if (key === 'role' && options.where[key]?.in) {
              return options.where[key].in.includes(item[key]);
            }
            if (key === 'restaurant_id') {
              return item.restaurant_id === options.where[key];
            }
            if (key === 'status') {
              return item.status === options.where[key];
            }
            return item[key] === options.where[key];
          });
        });
        return filtered.length;
      }
      return data.length;
    },
  },

  // Transaction support
  $transaction: async (operations) => {
    const results = [];
    for (const operation of operations) {
      results.push(await operation);
    }
    return results;
  },

  // Utility methods
  $disconnect: () => mockDb.disconnect(),
  $queryRaw: () => Promise.resolve([{ result: 1 }]),
};

module.exports = {
  prisma,
  redis,
  redisPubSub,
  checkDatabaseHealth,
  initializeDatabases,
  mockDb,
};
