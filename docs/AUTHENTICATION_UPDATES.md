# Authentication Updates - EcoShop

This document outlines all the authentication and security enhancements implemented in the EcoShop application.

## Overview

The following features have been successfully implemented:

1. ✅ Email verification with 6-digit codes sent to user emails
2. ✅ Google OAuth Sign In integration
3. ✅ 10-minute session timeout with automatic logout
4. ✅ Removed demo accounts and created default admin user

---

## 1. Email Verification System

### Backend Implementation

#### New Database Tables
- `email_verification_codes` - Stores verification codes with expiration timestamps

#### New Files
- `backend/lib/email.ts` - Email service using Nodemailer
  - `sendVerificationEmail()` - Sends verification emails with 6-digit codes
  - `generateVerificationCode()` - Generates random 6-digit codes

#### Updated Files
- `backend/pages/api/auth/register.ts` - Modified to send verification codes instead of immediate login
- `backend/pages/api/auth/verify-email.ts` - New endpoint to verify email codes
- `backend/pages/api/auth/resend-code.ts` - New endpoint to resend verification codes
- `backend/pages/api/auth/login.ts` - Updated to check email verification status

#### Configuration Required
Add these environment variables to `backend/.env`:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

**Note:** For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833).

### Frontend Implementation

#### New Files
- `frontend/src/pages/VerifyEmailPage.tsx` - Email verification UI with 6-digit code input

#### Updated Files
- `frontend/src/store/AuthContext.tsx` - Added `verifyEmail()` and `resendCode()` methods
- `frontend/src/services/auth.ts` - Added verification service methods
- `frontend/src/pages/SignUpPage.tsx` - Redirects to verification page after signup
- `frontend/src/App.tsx` - Added `/verify-email` route

#### User Flow
1. User signs up with email, password, and name
2. System sends 6-digit code to email (expires in 10 minutes)
3. User is redirected to verification page
4. User enters the code
5. Upon successful verification, user is logged in

---

## 2. Google OAuth Sign In

### Backend Implementation

#### Dependencies
- `google-auth-library` - Google OAuth verification

#### New Files
- `backend/pages/api/auth/google.ts` - Google OAuth callback endpoint

#### Database Changes
- Added `oauth_provider` field to users table (stores 'google')
- Added `oauth_id` field to users table (stores Google user ID)
- Made `password` field nullable (OAuth users don't have passwords)

#### Configuration Required
Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Setup Instructions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins: `http://localhost:5173`
6. Add authorized redirect URIs: `http://localhost:5173`
7. Copy the Client ID

### Frontend Implementation

#### Dependencies
- `@react-oauth/google` - Google Sign In component

#### Updated Files
- `frontend/src/pages/SignInPage.tsx` - Added Google Sign In button
- `frontend/src/pages/SignUpPage.tsx` - Added Google Sign Up button
- `frontend/src/store/AuthContext.tsx` - Added `signInWithGoogle()` method
- `frontend/src/services/auth.ts` - Added Google authentication service

#### Configuration Required
Add to `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 3. Session Timeout (10 Minutes)

### Backend Implementation

#### Updated Files
- `backend/lib/auth.ts`
  - Changed default token expiry from 7 days to 10 minutes
  - Added `refreshToken()` function for session extension
- `backend/pages/api/auth/refresh.ts` - New endpoint to refresh tokens
- `backend/pages/api/auth/login.ts` - Updates `last_activity` timestamp

#### Database Changes
- Added `last_activity` field to users table

### Frontend Implementation

#### Updated Files
- `frontend/src/services/auth.ts`
  - `startSessionMonitor()` - Monitors user activity and session expiry
  - `stopSessionMonitor()` - Cleans up monitors on logout
  - `updateActivity()` - Updates last activity timestamp
  - Auto-refreshes token at 8 minutes of inactivity
  - Logs out user after 10 minutes of inactivity

#### Monitored Activities
- Mouse clicks
- Keyboard input
- Scrolling
- Touch events

#### Session Flow
1. User logs in → Session monitor starts
2. User activity is tracked continuously
3. At 8 minutes of inactivity → Token automatically refreshed
4. At 10 minutes of inactivity → User logged out and redirected to sign-in page
5. Sign-in page shows "Your session has expired" message

---

## 4. Admin User Configuration

### Changes Made
- **Removed demo accounts:**
  - ❌ `admin@ecoshop.com`
  - ❌ `customer@ecoshop.com`

- **New default admin user:**
  - Email: `omondiclinn@gmail.com`
  - Password: `Admin@2024`
  - Role: admin
  - Email verified: Yes

### File Updated
- `backend/scripts/seed-database.js` - Updated to create only the new admin user

---

## Database Schema Updates

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),                    -- Now nullable for OAuth users
  name VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  email_verified BOOLEAN DEFAULT FALSE,     -- NEW
  oauth_provider VARCHAR(50),               -- NEW
  oauth_id VARCHAR(255),                    -- NEW
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- NEW
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_oauth_provider_id (oauth_provider, oauth_id)
);
```

### Email Verification Codes Table
```sql
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_code (code),
  INDEX idx_expires_at (expires_at)
);
```

---

## Environment Variables Summary

### Backend (`backend/.env`)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecoshop_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Email Configuration (for verification codes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# API Configuration
API_PORT=3001
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## Testing the Implementation

### 1. Test Email Verification
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev

# Steps:
# 1. Go to http://localhost:5173/signup
# 2. Fill in the form and submit
# 3. Check your email for the 6-digit code
# 4. Enter the code on the verification page
# 5. You should be logged in after successful verification
```

### 2. Test Google Sign In
```bash
# Make sure you've configured GOOGLE_CLIENT_ID in both .env files
# 1. Go to http://localhost:5173/signin
# 2. Click "Sign in with Google"
# 3. Complete Google OAuth flow
# 4. You should be logged in
```

### 3. Test Session Timeout
```bash
# 1. Sign in to the application
# 2. Leave the tab idle for 10 minutes
# 3. You should be automatically logged out
# 4. Redirected to sign-in page with expiry message
```

### 4. Test Admin Login
```bash
# Use the new admin credentials:
# Email: omondiclinn@gmail.com
# Password: Admin@2024
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user (sends verification email) | No |
| POST | `/api/auth/verify-email` | Verify email with code | No |
| POST | `/api/auth/resend-code` | Resend verification code | No |
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/google` | Google OAuth sign in | No |
| POST | `/api/auth/refresh` | Refresh authentication token | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Request/Response Examples

#### Register
```json
// Request
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

// Response
{
  "success": true,
  "data": {
    "message": "Registration successful. Please check your email for verification code.",
    "userId": "user-12345",
    "email": "user@example.com",
    "requiresVerification": true
  }
}
```

#### Verify Email
```json
// Request
POST /api/auth/verify-email
{
  "userId": "user-12345",
  "code": "123456"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-12345",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

---

## Security Considerations

1. **Email Verification Codes**
   - 6-digit random codes
   - 10-minute expiration
   - One-time use (deleted after verification)

2. **JWT Tokens**
   - 10-minute expiration
   - Auto-refresh at 8 minutes of activity
   - Stored in localStorage (cleared on logout)

3. **Password Requirements**
   - Minimum 8 characters
   - Must contain at least one number
   - Must contain at least one uppercase letter

4. **Session Security**
   - Activity-based session management
   - Automatic logout after inactivity
   - Token refresh for active users

5. **OAuth Security**
   - Google token verification on backend
   - Email conflict detection
   - Secure user creation/matching

---

## Troubleshooting

### Email Not Sending
- Verify SMTP credentials in `backend/.env`
- For Gmail, ensure you're using an App Password, not your regular password
- Check firewall settings for port 587
- Review backend logs for email errors

### Google Sign In Not Working
- Verify `GOOGLE_CLIENT_ID` matches in both backend and frontend `.env` files
- Check that authorized origins include `http://localhost:5173`
- Ensure Google+ API is enabled in Google Cloud Console
- Clear browser cache and try again

### Session Timeout Too Fast
- The 10-minute timeout is activity-based
- Any mouse, keyboard, scroll, or touch event resets the timer
- Check browser console for session monitoring logs

### Database Issues
- Run `npm run db:setup` to recreate tables
- Run `npm run db:seed` to populate with fresh data
- Admin credentials: `omondiclinn@gmail.com` / `Admin@2024`

---

## Migration Notes

If you have an existing database with users:

1. **Backup your data first!**
2. Run the database setup script to update schema
3. Existing users will need to verify their emails on next login
4. OAuth users can be created by signing in with Google

---

## Future Enhancements

Potential improvements for consideration:

1. Password reset functionality
2. Two-factor authentication (2FA)
3. Email change verification
4. Remember me (extended sessions)
5. Account deletion
6. Admin user management interface
7. Rate limiting on verification attempts
8. SMS verification as alternative
9. Social login with Facebook, GitHub, etc.
10. Session management dashboard (view active sessions)

---

## Summary

All requested features have been successfully implemented:

- ✅ Email verification with codes sent to user emails
- ✅ Google Sign In integration
- ✅ 10-minute session timeout with activity tracking
- ✅ Default admin user with specified email (omondiclinn@gmail.com)
- ✅ Demo accounts removed

The application now has a robust authentication system with modern security practices.
