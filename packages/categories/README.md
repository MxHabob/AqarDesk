# Categories

Canonical property categories used by the database enum, validators, and UI.
These are structural property types with corresponding detail tables, not
user-created tags. A listing's sale/rent type remains separate from its
property category.

Add a new structural type only together with its database detail model and
migration. User-managed tags, if needed later, should be modeled separately.
