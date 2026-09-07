const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { getGeoData } = require('../utils/geo');
const { triggerWebhook } = require('../utils/email');

const router = express.Router();

router.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
}));

const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5,
  message: { error: 'Too many submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/public/widgets/:id/config
router.get('/widgets/:id/config', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT id, type, title, description, form_fields, button_text, display_options FROM widgets WHERE id = ?', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    let widget = result.rows[0];
    if (widget.form_fields) widget.form_fields = JSON.parse(widget.form_fields);
    if (widget.display_options) widget.display_options = JSON.parse(widget.display_options);

    res.set('Cache-Control', 'public, max-age=300');
    res.json(widget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/public/submissions
router.post('/submissions', submissionLimiter, async (req, res) => {
  try {
    const { widget_id, data, honeypot_field } = req.body;

    // 1. Boundary Validation
    if (!widget_id || typeof widget_id !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing widget_id' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid or missing data payload' });
    }
    if (JSON.stringify(data).length > 5000) {
      return res.status(400).json({ error: 'Payload too large' });
    }

    // 2. Spam Protection
    if (honeypot_field) {
      console.log('[Spam Blocked] Honeypot triggered for widget:', widget_id);
      return res.status(201).json({ success: true, note: 'silently dropped' });
    }

    // 3. Verify widget exists
    const widgetRes = await db.query('SELECT owner_id FROM widgets WHERE id = ?', [widget_id]);
    if (widgetRes.rows.length === 0) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    const owner_id = widgetRes.rows[0].owner_id;

    // 4. Geo Enrichment
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip && ip.includes('::ffff:')) {
      ip = ip.split('::ffff:')[1];
    }
    const geo_data = await getGeoData(ip);

    // 5. Store Submission
    const id = uuidv4();
    await db.query(`
      INSERT INTO submissions (id, widget_id, owner_id, data, ip_address, geo_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, widget_id, owner_id, JSON.stringify(data), ip, geo_data ? JSON.stringify(geo_data) : null]);

    // 6. Safe Side Effect
    triggerWebhook({ id, widget_id, data });

    res.status(201).json({ success: true, submission_id: id });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
