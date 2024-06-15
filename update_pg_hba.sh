#!/bin/bash
set -e

# Update the pg_hba.conf file to allow trust authentication
echo "host all all all trust" >> "$PGDATA/pg_hba.conf"

# Restart PostgreSQL to apply the changes
pg_ctl restart -D "$PGDATA"
