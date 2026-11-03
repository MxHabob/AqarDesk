# Authentication

Better Auth server and browser clients shared by the web app. Configure
`BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `DATABASE_URL` before starting the
application.

Email/password authentication is enabled for existing accounts; public
password sign-up is disabled. Google sign-in is enabled when both
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Configure the Google
OAuth redirect URI as `${BETTER_AUTH_URL}/api/auth/callback/google`.

TOTP multi-factor authentication is enabled through Better Auth. Apply the
database migration before enabling it in production. Provisioning staff
accounts and enforcing their office roles must be handled by trusted
server-side workflows.
