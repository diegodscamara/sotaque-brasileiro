#!/bin/bash

# Set the database connection details
DB_HOST="127.0.0.1"
DB_PORT="54322"
DB_NAME="postgres"
DB_USER="postgres"

# Set the output directory for schema files
OUTPUT_DIR="$(pwd)"

# Retrieve the list of tables
TABLES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")

# Iterate over each table and retrieve its schema definition
for TABLE in $TABLES; do
  echo "Generating schema for table: $TABLE"
  PGPASSFILE=~/.pgpass psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\d+ $TABLE" > "$OUTPUT_DIR/$TABLE.sql"
done

echo "Schema files generated successfully."
