# Notifications

PostgreSQL-backed, per-user in-app notifications. The package supports creating
notifications, cursor-paginated listing, and marking one or all as read.
Notification rows are scoped by `userId`; API handlers must take that ID from
the authenticated session, never from untrusted request input.

Apply the generated database migration before using these functions. This
package does not add Redis, email delivery, or background workers.
