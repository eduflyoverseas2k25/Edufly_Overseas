import { pool } from './db.js';
import * as migration001 from './migrations/001_fix_theme_defaults.js';

const migrations = [
  { name: '001_fix_theme_defaults', module: migration001 }
];

export async function runMigrations() {
  console.log('Starting database migrations...');
  
  // Create migrations table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Run each migration
  for (const migration of migrations) {
    const { rows } = await pool.query(
      'SELECT * FROM migrations WHERE name = $1',
      [migration.name]
    );
    
    if (rows.length === 0) {
      console.log(`Running migration: ${migration.name}`);
      await migration.module.up(pool);
      await pool.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [migration.name]
      );
      console.log(`✅ Completed: ${migration.name}`);
    } else {
      console.log(`⏭️  Skipped: ${migration.name} (already applied)`);
    }
  }
  
  console.log('All migrations completed!');
}
