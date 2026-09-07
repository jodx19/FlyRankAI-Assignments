(function() {
  const SCRIPT_URL = new URL(document.currentScript.src);
  const WIDGET_ID = SCRIPT_URL.searchParams.get('id');
  const API_BASE = SCRIPT_URL.origin;

  if (!WIDGET_ID) {
    console.error('Widget ID is required in the script src URL');
    return;
  }

  async function loadWidget() {
    try {
      const res = await fetch(`${API_BASE}/api/public/widgets/${WIDGET_ID}/config`);
      if (!res.ok) throw new Error('Failed to load widget config');
      const config = await res.json();
      renderWidget(config);
    } catch (err) {
      console.error('Widget Error:', err);
    }
  }

  function renderWidget(config) {
    const container = document.createElement('div');
    container.style.cssText = `
      border: 1px solid #ccc;
      padding: 20px;
      border-radius: 8px;
      max-width: 300px;
      background: #f9f9f9;
      font-family: sans-serif;
      margin: 20px 0;
    `;

    const title = document.createElement('h3');
    title.textContent = config.title || 'Subscribe';
    container.appendChild(title);

    if (config.description) {
      const desc = document.createElement('p');
      desc.textContent = config.description;
      desc.style.fontSize = '14px';
      container.appendChild(desc);
    }

    const form = document.createElement('form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });

      // Submission Payload
      const payload = {
        widget_id: WIDGET_ID,
        data: data,
        honeypot_field: data['hidden_spam_field'] || ''
      };

      try {
        const subRes = await fetch(`${API_BASE}/api/public/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (subRes.ok) {
          form.innerHTML = '<p style="color: green">Thank you for submitting!</p>';
        } else {
          const errorMsg = await subRes.json();
          alert('Submission failed: ' + (errorMsg.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Network error, try again.');
      }
    };

    // Render Fields
    const fields = config.form_fields || [{ name: 'email', type: 'email', required: true }];
    fields.forEach(field => {
      const input = document.createElement('input');
      input.type = field.type || 'text';
      input.name = field.name;
      input.placeholder = field.placeholder || field.name;
      input.required = field.required;
      input.style.cssText = 'display: block; width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box;';
      form.appendChild(input);
    });

    // Honeypot Field
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'hidden_spam_field';
    honeypot.style.display = 'none'; // hidden from real users
    form.appendChild(honeypot);

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = config.button_text || 'Submit';
    btn.style.cssText = 'background: #007bff; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; width: 100%;';
    form.appendChild(btn);

    container.appendChild(form);
    
    // Auto-inject into the div with id="flyrank-widget-container" if it exists, otherwise body
    const target = document.getElementById('flyrank-widget-container') || document.body;
    target.appendChild(container);
  }

  // Init
  loadWidget();
})();
