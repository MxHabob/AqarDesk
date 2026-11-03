# Authentication

Better Auth server and browser clients shared by the web app. Configure
`BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `DATABASE_URL` before starting the
application.

Email/password sign-in and sign-up are disabled. Passwordless email OTP sign-in
is enabled when `RESEND_API_KEY` and `EMAIL_FROM` are configured; email OTP
sign-in verifies ownership of the address before creating a customer account.
New accounts receive the `customer` role. Google sign-in and sign-up are enabled
when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Configure the
Google OAuth redirect URI as `${BETTER_AUTH_URL}/api/auth/callback/google`.

TOTP multi-factor authentication and recovery codes are enabled through Better
Auth. Email OTP sign-in is not offered to accounts with two-factor
authentication enabled. `EMAIL_FROM` must be a sender address verified with
Resend. Do not expose provider credentials to the browser. Provisioning staff
accounts and assigning office roles must be handled by trusted server-side
workflows.
