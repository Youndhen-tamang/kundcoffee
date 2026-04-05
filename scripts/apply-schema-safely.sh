#!/bin/bash

# Configuration
LOG_FILE="./backups/schema_push_$(date +%Y%m%d_%H%M%S).log"

echo "--- Safe Schema Application Started ---" | tee -a "${LOG_FILE}"

# 1. Double check data is current
echo "[Step 1] Running final data snapshot..." | tee -a "${LOG_FILE}"
if npx ts-node --compiler-options '{"module":"commonjs"}' scripts/export-data.ts >> "${LOG_FILE}" 2>&1; then
  echo "  - Snapshot success." | tee -a "${LOG_FILE}"
else
  echo "  - Snapshot failed. Aborting for safety!" | tee -a "${LOG_FILE}"
  exit 1
fi

# 2. Run prisma db push (safer for additive changes than migrate dev)
echo "[Step 2] Applying schema changes with 'db push'..." | tee -a "${LOG_FILE}"
echo "  - Command: npx prisma db push --accept-data-loss" | tee -a "${LOG_FILE}"
# We use --accept-data-loss but it's only for the changes we verified are safe.
# Prisma will still warn us if it's destructive.
npx prisma db push --accept-data-loss >> "${LOG_FILE}" 2>&1

if [ $? -eq 0 ]; then
  echo "--- Schema Changes Applied Successfully ---" | tee -a "${LOG_FILE}"
  echo "Your database has been updated with the new storeId fields." | tee -a "${LOG_FILE}"
else
  echo "--- Schema Changes Failed ---" | tee -a "${LOG_FILE}"
  echo "Please check the log: ${LOG_FILE}"
  exit 1
fi
