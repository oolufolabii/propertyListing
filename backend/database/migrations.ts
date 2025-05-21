import { sqlite } from "https://esm.town/v/stevekrouse/sqlite?v=13";

// Table names - use these constants throughout the app
export const PROPERTIES_TABLE = "properties_v1";
export const PROPERTY_IMAGES_TABLE = "property_images_v1";
export const ADMIN_USERS_TABLE = "admin_users_v1";

// Create tables if they don't exist
export async function runMigrations() {
  // Properties table
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${PROPERTIES_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      bedrooms INTEGER,
      bathrooms INTEGER,
      area REAL,
      featured BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Property images table
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${PROPERTY_IMAGES_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (property_id) REFERENCES ${PROPERTIES_TABLE} (id) ON DELETE CASCADE
    )
  `);

  // Admin users table
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${ADMIN_USERS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Check if admin user exists, if not create default admin
  const adminExists = await sqlite.execute(
    `SELECT COUNT(*) as count FROM ${ADMIN_USERS_TABLE}`
  );
  
  if (adminExists.rows[0].count === 0) {
    // Create default admin user (username: admin, password: admin123)
    // In production, use a secure password and proper hashing
    await sqlite.execute(
      `INSERT INTO ${ADMIN_USERS_TABLE} (username, password_hash) VALUES (?, ?)`,
      ["admin", "admin123"]
    );
  }
}
