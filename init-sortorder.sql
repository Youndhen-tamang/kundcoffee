-- Initialize sortOrder for existing Spaces (set to 0 by default)
UPDATE "Space" 
SET "sortOrder" = 0 
WHERE "sortOrder" IS NULL;

-- Initialize sortOrder for existing Tables (set to 0 by default)
UPDATE "Table" 
SET "sortOrder" = 0 
WHERE "sortOrder" IS NULL;
