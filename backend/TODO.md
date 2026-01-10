# ACTUAL OPERATION

## ON BRANCH : PASSWORD RECOVERY

1.Define the Password Reset Model (Minimal & Safe)

*You need a dedicated reset token, not sessions, not OTP reuse.*

---------------------------------------------------------------------

### ENTITIES

<ResetToken (Collection or Embedded)> OBJECT
Fields:
  userId
  tokenHash
  expiresAt
  consumedAt
  attempts
  createdAt
  ipHash (optional, for auditing)

Rules: (methods)

- One active token per user
- TTL index on expiresAt
- Hard limit on attempts (e.g. 3–5)

--------------------------------------------------------------------;

### ENDPOINTS

`POST /auth/password/forgot`
Purpose: Request reset
Input:
  email, userId

Logic:
 Return Type : Always return 200 OK (no user enumeration)

 If user exists:
  Invalidate previous reset tokens if found
  Generate reset token
  Send email with reset link

`POST /auth/password/verify`
Purpose: Validate reset token
Input:
  token

Logic:
  Check token validity
  Do NOT change password here
  Return a short-lived reset session token
  This prevents password change via link reuse.

`POST /auth/password/reset`
Purpose: Set new password

Requires: (parameter)
 Reset session token

Input: (request body)
 newPassword

Logic:
  Validate reset session
  Update password (hash)

Invalidate:
  reset token
  all active sessions

Return success

------------------------------------------------------;

### API ACCESS

Token Strategy (Keep It Simple)

You need two token types:

1. Reset Token (Email Link)

Random (not JWT)

One-time use

Short TTL (10–15 min)

Stored hashed

2. Reset Session Token (JWT)

Very short TTL (5–10 min)

Scope: password_reset

Cannot access API

-------------------------------------------------------------;

### OTHER TECHNICAL IMPLEMENTATIONS (TASKS)

@AuthService

-Reset Token Lifecycle

-generatePasswordResetToken(userId)

-verifyPasswordResetToken(token)

-consumePasswordResetToken(token)

-Password Change

-updateUserPassword(userId, newPassword)

-invalidateUserSessions(userId)

-Reset Session

-issuePasswordResetSession(userId)

-verifyPasswordResetSession(token)

@Utilities (Reuse Existing Patterns)

Crypto

hashToken(token)

compareToken(raw, hash)

Password hashing via existing strategy

Email

sendPasswordResetEmail(email, resetLink)

--------------------------------------------------------;

### SECURITY CONSTRAINTS

Same response for existing / non-existing emails

Reset token:
  TTL ≤ 15 minutes
  Single-use

Reset session:
  Cannot be refreshed
  Cannot access other endpoints

After password reset:
  Invalidate all sessions
  Revoke trusted devices (optional but recommended)

---------------------------------------------------------;

### Client Flow (Simple & Clean)

Forgot password

Email input

Always show success message

Reset link

Token in URL

Call /verify

Navigate to reset form

Set new password

Submit once

Redirect to login

No special UX states required.

### Mental Check (Very Important)

Password reset is:

Account recovery

Not authentication

Not 2FA

Treat it as a sealed flow with no shared state.
