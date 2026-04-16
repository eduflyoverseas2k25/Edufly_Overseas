import type { Pool } from 'pg';

export async function up(db: Pool): Promise<void> {
  console.log('Running migration: Fix theme defaults to dark...');
  
  // Update existing site_settings row to use dark theme defaults
  await db.query(`
    UPDATE site_settings 
    SET 
      theme_key = COALESCE(NULLIF(theme_key, 'summer'), 'dark'),
      hero_style = 'dark',
      hero_gradient_from = '#1e293b',
      hero_gradient_via = '#334155',
      hero_gradient_to = '#475569'
    WHERE theme_key = 'summer' OR theme_key IS NULL;
  `);
  
  console.log('Migration complete: Theme defaults updated to dark');
}

export async function down(db: Pool): Promise<void> {
  // Rollback - restore old light theme
  await db.query(`
    UPDATE site_settings 
    SET 
      theme_key = 'dark',
      hero_style = 'light',
      hero_gradient_from = '#fff7ed',
      hero_gradient_via = '#fef3c7',
      hero_gradient_to = '#ffedd5'
    WHERE id = 1;
  `);
}
