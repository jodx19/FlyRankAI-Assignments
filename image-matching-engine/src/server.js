import express from 'express';
import db from './db.js';
import { findBestImageForPost } from './matching.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));
// Serve static images
app.use('/images', express.static(path.join(__dirname, '..', 'data', 'images')));

// API to list posts
app.get('/api/posts', (req, res) => {
  try {
    const posts = db.prepare('SELECT id, title, content FROM posts').all();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Get ranked image suggestions with Mismatch Guard applied
app.get('/posts/:id/images', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const suggestion = await findBestImageForPost(postId);
    
    let suggestionId = null;
    // Save suggestion in DB to allow review if a candidate is found
    if (suggestion.status === 'SUGGESTED' && suggestion.candidate) {
      const result = db.prepare(`
        INSERT INTO suggestions (post_id, image_id, score, status, reason)
        VALUES (?, ?, ?, 'pending', ?)
      `).run(postId, suggestion.candidate.id, suggestion.score, suggestion.reason);
      suggestionId = result.lastInsertRowid;
    }

    res.json({
      postId,
      suggestionId,
      suggestion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Approve a suggested pairing
app.post('/suggestions/:id/approve', (req, res) => {
  try {
    const suggestionId = parseInt(req.params.id);
    db.prepare(`UPDATE suggestions SET status = 'approved' WHERE id = ?`).run(suggestionId);
    res.json({ success: true, message: `Suggestion ${suggestionId} approved.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Reject a suggested pairing
app.post('/suggestions/:id/reject', (req, res) => {
  try {
    const suggestionId = parseInt(req.params.id);
    db.prepare(`UPDATE suggestions SET status = 'rejected' WHERE id = ?`).run(suggestionId);
    res.json({ success: true, message: `Suggestion ${suggestionId} rejected.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Review API running on port ${PORT}`);
});
