import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  console.log("Initializing database tables...");
  
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      destination TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS destinations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      flag_url TEXT,
      highlights TEXT[] DEFAULT '{}',
      requirements TEXT[] DEFAULT '{}'
    );
    
    CREATE TABLE IF NOT EXISTS programs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      image_url TEXT
    );
    
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT
    );
    
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT
    );
    
    CREATE TABLE IF NOT EXISTS destination_places (
      id SERIAL PRIMARY KEY,
      destination_id INTEGER REFERENCES destinations(id),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      site_name TEXT DEFAULT 'Edufly Overseas',
      tagline TEXT DEFAULT 'Your Gateway to Global Education',
      primary_color TEXT DEFAULT '#ef6e2d',
      secondary_color TEXT DEFAULT '#fdc22c',
      accent_color TEXT DEFAULT '#178ab6',
      text_color TEXT DEFAULT '#333333',
      hero_style TEXT DEFAULT 'light',
      hero_gradient_from TEXT DEFAULT '#ef6e2d',
      hero_gradient_via TEXT DEFAULT '#fdc22c',
      hero_gradient_to TEXT DEFAULT '#178ab6',
      contact_email TEXT DEFAULT 'info@eduflyoverseas.com',
      contact_phone TEXT DEFAULT '+91 12345 67890',
      contact_address TEXT DEFAULT '123 Education Street, Chennai, India',
      footer_text TEXT DEFAULT 'Edufly Overseas - Your trusted partner for international education'
    );
    
    INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  `;
  
  try {
    await pool.query(createTablesSQL);
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
