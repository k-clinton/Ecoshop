# Email Verification Before User Creation

## Overview
Updated the registration flow to ensure users are only created in the database **after successful email verification**, not during the initial signup.

## Changes Made

### 1. Database Schema
- **New Table**: `pending_registrations` - stores user data temporarily until email is verified
  - Fields: id, email, password, name, role, verification_code, code_expires_at, created_at
  - Unique constraint on email
  - Indexed on verification_code and code_expires_at for performance

### 2. Updated API Endpoints

#### `/api/auth/register.ts`
- **Before**: Created user immediately with `email_verified = false`
- **After**: Stores user data in `pending_registrations` table
- Automatically deletes old pending registrations for the same email if they exist
- Returns `userId` (which is actually the pending registration ID) for verification

#### `/api/auth/verify-email.ts`
- **Before**: Only updated `email_verified` flag on existing user
- **After**: 
  - Checks if verification is for a pending registration
  - If pending: Creates the actual user account and deletes pending registration
  - If existing user: Updates verification status (backward compatible)
- Creates user with `email_verified = true` from the start

#### `/api/auth/resend-code.ts`
- **Before**: Only worked with existing users in the `users` table
- **After**:
  - Checks pending registrations first
  - Updates verification code in `pending_registrations` table if found
  - Falls back to existing user logic for backward compatibility

### 3. Migration Script
- **File**: `backend/scripts/add-pending-registrations-table.js`
- Creates the `pending_registrations` table
- Cleans up expired pending registrations (older than 1 day)
- Can be run safely on existing databases

### 4. Database Setup
- Updated `backend/scripts/setup-database.js` to include the new table in the schema

## Benefits

1. **Security**: Unverified users never exist in the main users table
2. **Data Integrity**: Only verified emails create actual user accounts
3. **Cleanup**: Expired pending registrations can be easily removed
4. **Backward Compatible**: Existing verification flows still work
5. **No Email Spam**: Failed registrations don't create database bloat

## Migration Instructions

### For Existing Databases:
```bash
cd backend
node scripts/add-pending-registrations-table.js
```

### For Fresh Installations:
```bash
cd backend
node scripts/setup-database.js
```

## Testing the Flow

1. **Register**: POST to `/api/auth/register`
   - User data stored in `pending_registrations`
   - No entry in `users` table yet

2. **Verify Email**: POST to `/api/auth/verify-email`
   - User created in `users` table with `email_verified = true`
   - Pending registration deleted
   - Token issued for immediate login

3. **Resend Code**: POST to `/api/auth/resend-code`
   - Updates verification code in `pending_registrations`
   - Works for both pending and existing users

## Cleanup Recommendations

Consider setting up a cron job to periodically clean up expired pending registrations:

```sql
DELETE FROM pending_registrations 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY);
```

Or run the migration script periodically (it includes cleanup).
