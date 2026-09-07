const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// Simple Auth Middleware
const authMiddleware = (req, res, next) => {
  const owner_id = req.headers['x-owner-id'];
  if (!owner_id) {
    return res.status(401).json({ error: 'Unauthorized: missing x-owner-id header' });
  }
  req.owner_id = owner_id;
  next();
};

router.use(authMiddleware);

// POST /api/widgets - Create a new widget
router.post('/widgets', async (req, res) => {
  try {
    const { type, title, description, form_fields, button_text, display_options } = req.body;
    
    // Boundary validation
    if (!type || !title) {
      return res.status(400).json({ error: 'type and title are required' });
    }

    const id = uuidv4();
    await db.query(`
      INSERT INTO widgets (id, owner_id, type, title, description, form_fields, button_text, display_options)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, req.owner_id, type, title, description, JSON.stringify(form_fields || []), button_text, JSON.stringify(display_options || {})]);

    const result = await db.query('SELECT * FROM widgets WHERE id = ?', [id]);
    const widget = result.rows[0];
    
    // Parse JSON text back to object
    if (widget.form_fields) widget.form_fields = JSON.parse(widget.form_fields);
    if (widget.display_options) widget.display_options = JSON.parse(widget.display_options);

    res.status(201).json(widget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/widgets - List owner's widgets
router.get('/widgets', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM widgets WHERE owner_id = ?', [req.owner_id]);
    
    const widgets = result.rows.map(w => {
      if (w.form_fields) w.form_fields = JSON.parse(w.form_fields);
      if (w.display_options) w.display_options = JSON.parse(w.display_options);
      return w;
    });

    res.json(widgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Dashboard APIs
// GET /api/dashboard/submissions
router.get('/dashboard/submissions', async (req, res) => {
  try {
    const { widget_id } = req.query;
    
    let query = 'SELECT * FROM submissions WHERE owner_id = ?';
    let params = [req.owner_id];
    
    if (widget_id) {
      query += ' AND widget_id = ?';
      params.push(widget_id);
    }
    
    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    
    const submissions = result.rows.map(s => {
      if (s.data) s.data = JSON.parse(s.data);
      if (s.geo_data) s.geo_data = JSON.parse(s.geo_data);
      return s;
    });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT widget_id, count(*) as submission_count
      FROM submissions 
      WHERE owner_id = ?
      GROUP BY widget_id
    `, [req.owner_id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
