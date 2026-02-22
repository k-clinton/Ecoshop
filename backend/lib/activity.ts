import pool from './db';

export async function logActivity(userId: string | number, action: string, entityType: string, entityId?: string, details?: any, ipAddress?: string) {
    try {
        await pool.execute(
            'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress || null]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
