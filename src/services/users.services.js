import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    logger.info('Attempting to fetch users from database');

    // Check database connection
    if (!db) {
      throw new Error('Database connection not available');
    }

    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);

    logger.info(`Database query successful, found ${result.length} users`);
    return result;
  } catch (e) {
    logger.error('Error getting users from database:', {
      message: e.message,
      stack: e.stack,
      code: e.code,
    });
    throw new Error(`Failed to fetch users: ${e.message}`);
  }
};

export const getUserById = async id => {
  try {
    logger.info(`Attempting to fetch user with ID: ${id} from database`);

    // Check database connection
    if (!db) {
      throw new Error('Database connection not available');
    }

    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new Error('User not found');
    }

    logger.info(`Database query successful, found user with ID: ${id}`);
    return result[0];
  } catch (e) {
    logger.error('Error getting user by ID from database:', {
      message: e.message,
      stack: e.stack,
      code: e.code,
      userId: id,
    });
    throw new Error(`Failed to fetch user: ${e.message}`);
  }
};

export const updateUser = async (id, updates) => {
  try {
    logger.info(`Attempting to update user with ID: ${id}`);

    // Check database connection
    if (!db) {
      throw new Error('Database connection not available');
    }

    // First check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update the user
    const result = await db
      .update(users)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    if (result.length === 0) {
      throw new Error('Failed to update user');
    }

    logger.info(`User with ID: ${id} updated successfully`);
    return result[0];
  } catch (e) {
    logger.error('Error updating user:', {
      message: e.message,
      stack: e.stack,
      code: e.code,
      userId: id,
      updates,
    });
    throw new Error(`Failed to update user: ${e.message}`);
  }
};

export const deleteUser = async id => {
  try {
    logger.info(`Attempting to delete user with ID: ${id}`);

    // Check database connection
    if (!db) {
      throw new Error('Database connection not available');
    }

    // First check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Delete the user
    const result = await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    });

    if (result.length === 0) {
      throw new Error('Failed to delete user');
    }

    logger.info(`User with ID: ${id} deleted successfully`);
    return result[0];
  } catch (e) {
    logger.error('Error deleting user:', {
      message: e.message,
      stack: e.stack,
      code: e.code,
      userId: id,
    });
    throw new Error(`Failed to delete user: ${e.message}`);
  }
};
