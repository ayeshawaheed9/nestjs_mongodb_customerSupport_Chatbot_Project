// migrate.ts

import { MongoClient } from 'mongodb';
import {up,down} from './20232009-add-status-to-orders';  // Replace with your migration file

const MONGO_URI = 'mongodb://localhost:27017';  // Replace with your MongoDB URI
const DB_NAME = 'test'; 

async function runMigration(direction: 'up' | 'down') {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  if (direction === 'up') {
    console.log('Applying migration...');
    await up(db);  // Apply the migration
  } else if (direction === 'down') {
    console.log('Reverting migration...');
    await down(db);  // Revert the migration
  }

  await client.close();
}

const direction = process.argv[2] as 'up' | 'down';  // Assert the type

if (direction !== 'up' && direction !== 'down') {
  console.error("Invalid argument. Use 'up' or 'down'.");
  process.exit(1);  // Exit with error code
}

runMigration(direction).catch(console.error);