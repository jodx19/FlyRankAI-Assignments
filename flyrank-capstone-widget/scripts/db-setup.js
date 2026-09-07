const dbModule = require('../src/db');

async function setup() {
  console.log('Setting up SQLite database...');
  
  try {
    const db = await dbModule.getDb();
    // Create Widgets Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS widgets (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        form_fields TEXT NOT NULL DEFAULT '[]',
        button_text TEXT,
        display_options TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create Submissions Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        widget_id TEXT,
        owner_id TEXT NOT NULL,
        data TEXT NOT NULL,
        ip_address TEXT,
        geo_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(widget_id) REFERENCES widgets(id) ON DELETE CASCADE
      );
    `);

    // Create Indexes
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_widgets_owner ON widgets(owner_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_submissions_widget ON submissions(widget_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_submissions_owner ON submissions(owner_id);`);

    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    process.exit();
  }
}

setup();
