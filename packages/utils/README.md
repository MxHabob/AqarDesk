# Utilities

Shared locale-aware formatting for monetary values, numbers, dates, and date
times. Currency codes are explicit so values from PostgreSQL can be formatted
without assuming every listing uses SAR. Number and currency formatting default
to `ar-SA`; dates use date-fns with its Arabic locale by default.

Invalid numeric values and unsupported currency/locale options are surfaced
instead of silently formatted with a fallback.
