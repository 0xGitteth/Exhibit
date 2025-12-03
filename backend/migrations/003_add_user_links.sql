ALTER TABLE users ADD COLUMN show_sensitive_content INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN primary_role TEXT;
ALTER TABLE users ADD COLUMN styles TEXT NOT NULL DEFAULT '[]';
ALTER TABLE users ADD COLUMN agency_affiliation TEXT;
ALTER TABLE users ADD COLUMN company_affiliation TEXT;
ALTER TABLE users ADD COLUMN linked_agencies TEXT NOT NULL DEFAULT '[]';
ALTER TABLE users ADD COLUMN linked_companies TEXT NOT NULL DEFAULT '[]';
ALTER TABLE users ADD COLUMN linked_models TEXT NOT NULL DEFAULT '[]';
