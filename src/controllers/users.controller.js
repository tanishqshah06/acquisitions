import logger from '#config/logger.js';
import {getAllUsers, getUserById, updateUser, deleteUser} from '#services/users.services.js';
import { db } from '#config/database.js';
import { userIdSchema, updateUserSchema } from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
    try {
        logger.info('Getting users...');
        
        const allUsers = await getAllUsers();
        
        logger.info(`Successfully retrieved ${allUsers.length} users`);
        
        res.json({
            message: 'Successfully retrieved users',
            users: allUsers,
            count: allUsers.length
        });
    }
    catch (e) {
        logger.error('Error in fetchAllUsers:', e.message || e);
        
        if (next && typeof next === 'function') {
            next(e);
        } else {
            res.status(500).json({ 
                error: 'Internal server error',
                message: 'Failed to fetch users'
            });
        }
    }
};

export const fetchUserById = async (req, res, next) => {
    try {
        logger.info(`Getting user by ID: ${req.params.id}`);
        
        // Validate request parameters
        const validationResult = userIdSchema.safeParse({ id: req.params.id });
        
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
            });
        }
        
        const { id } = validationResult.data;
        const user = await getUserById(id);
        
        logger.info(`Successfully retrieved user with ID: ${id}`);
        
        res.json({
            message: 'User retrieved successfully',
            user: user
        });
    }
    catch (e) {
        logger.error('Error in fetchUserById:', e.message || e);
        
        if (e.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with the provided ID'
            });
        }
        
        if (next && typeof next === 'function') {
            next(e);
        } else {
            res.status(500).json({ 
                error: 'Internal server error',
                message: 'Failed to fetch user'
            });
        }
    }
};

export const updateUserById = async (req, res, next) => {
    try {
        logger.info(`Updating user with ID: ${req.params.id}`);
        
        // Validate request parameters
        const idValidationResult = userIdSchema.safeParse({ id: req.params.id });
        if (!idValidationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(idValidationResult.error)
            });
        }
        
        // Validate request body
        const bodyValidationResult = updateUserSchema.safeParse(req.body);
        if (!bodyValidationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(bodyValidationResult.error)
            });
        }
        
        const { id } = idValidationResult.data;
        const updates = bodyValidationResult.data;
        
        // Authentication and authorization checks
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'You must be logged in to update user information'
            });
        }
        
        // Users can only update their own information unless they are admin
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You can only update your own information'
            });
        }
        
        // Only admins can change user roles
        if (updates.role && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only administrators can change user roles'
            });
        }
        
        const updatedUser = await updateUser(id, updates);
        
        logger.info(`Successfully updated user with ID: ${id}`);
        
        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    }
    catch (e) {
        logger.error('Error in updateUserById:', e.message || e);
        
        if (e.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with the provided ID'
            });
        }
        
        if (next && typeof next === 'function') {
            next(e);
        } else {
            res.status(500).json({ 
                error: 'Internal server error',
                message: 'Failed to update user'
            });
        }
    }
};

export const deleteUserById = async (req, res, next) => {
    try {
        logger.info(`Deleting user with ID: ${req.params.id}`);
        
        // Validate request parameters
        const validationResult = userIdSchema.safeParse({ id: req.params.id });
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
            });
        }
        
        const { id } = validationResult.data;
        
        // Note: Authentication and admin authorization are handled by middleware
        // Only authenticated admins can reach this point
        
        // Log admin action for audit purposes
        logger.info(`Admin user ${req.user.email} (ID: ${req.user.id}) deleting user with ID: ${id}`);
        
        // Prevent admin from deleting themselves (optional safety check)
        if (req.user.id === id) {
            return res.status(400).json({
                error: 'Invalid operation',
                message: 'Administrators cannot delete their own account'
            });
        }
        
        const deletedUser = await deleteUser(id);
        
        logger.info(`Successfully deleted user with ID: ${id}`);
        
        res.json({
            message: 'User deleted successfully',
            deletedUser: {
                id: deletedUser.id,
                email: deletedUser.email,
                name: deletedUser.name
            }
        });
    }
    catch (e) {
        logger.error('Error in deleteUserById:', e.message || e);
        
        if (e.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with the provided ID'
            });
        }
        
        if (next && typeof next === 'function') {
            next(e);
        } else {
            res.status(500).json({ 
                error: 'Internal server error',
                message: 'Failed to delete user'
            });
        }
    }
};

// Test endpoint to check database connectivity
export const testDatabase = async (req, res, next) => {
    try {
        logger.info('Testing database connectivity...');
        
        if (!db) {
            throw new Error('Database connection not initialized');
        }
        
        // Simple query to test connection
        const result = await db.execute('SELECT 1 as test');
        
        logger.info('Database connection test successful');
        
        res.json({
            message: 'Database connection successful',
            result: result
        });
    } catch (e) {
        logger.error('Database test failed:', e.message || e);
        
        if (next && typeof next === 'function') {
            next(e);
        } else {
            res.status(500).json({ 
                error: 'Database connection failed',
                message: e.message
            });
        }
    }
};
