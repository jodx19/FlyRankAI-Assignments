import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE,
    url TEXT,
    subject TEXT,
    category TEXT,
    caption TEXT,
    confidence REAL,
    attributes TEXT, -- JSON array of tags
    embedding TEXT, -- JSON array representing vector
    processed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    embedding TEXT -- JSON array
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    image_id INTEGER,
    score REAL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    reason TEXT,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(image_id) REFERENCES images(id)
  );
`);

export default db;
