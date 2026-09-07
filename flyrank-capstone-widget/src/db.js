const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

module.exports = {
  // A helper query method that acts like the pg query
  query: async (text, params) => {
    const db = await getDb();
    
    // SQLite doesn't return the rows directly on INSERT when using .run(), 
    // but the app expects pg-like structure { rows: [...] }
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await db.all(text, params);
      return { rows };
    } else {
      // For INSERT, UPDATE, DELETE
      const result = await db.run(text, params);
      
      // If there's a RETURNING clause in SQLite (supported in 3.35+), .all() is needed.
      // We'll try to handle it. Actually, .all() works for INSERT ... RETURNING too.
      if (text.toUpperCase().includes('RETURNING')) {
         const rows = await db.all(text, params);
         return { rows };
      }
      return { rows: [] };
    }
  },
  getDb
};
