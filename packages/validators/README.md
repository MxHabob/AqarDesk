# Validators

Shared Zod schemas for property creation, listing creation, and listing search.
Use these schemas at server boundaries as well as in forms when helpful.

The property schema validates the category-specific details shape. The
application service must still persist the property and its detail row
together, associate owners, and authorize listing assignments.
