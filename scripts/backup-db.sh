#!/bin/bash

# Load only the DATABASE_URL from .env file, handling spaces and quotes
if [ -f .env ]; then
  # Extract DATABASE_URL, removing spaces around = and stripping single/double quotes
  DB_URL=$(grep '^DATABASE_URL' .env | cut -d'=' -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//')
fi

# Fallback if not found in .env
if [ -z "$DB_URL" ]; then
  DB_URL=${DATABASE_URL}
fi
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "--- Database Backup Started ---"
echo "Timestamp: ${TIMESTAMP}"

# Run pg_dump
# Note: Since the DATABASE_URL contains the credentials, we can pass it directly to pg_dump
if pg_dump "${DB_URL}" > "${BACKUP_FILE}"; then
  echo "--- Backup Successful ---"
  echo "Backup saved to: ${BACKUP_FILE}"
  
  # Compress the backup (optional but recommended)
  gzip "${BACKUP_FILE}"
  echo "Compressed to: ${BACKUP_FILE}.gz"
else
  echo "--- Backup Failed ---"
  exit 1
fi
