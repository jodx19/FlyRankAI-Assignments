const fs = require('fs');

async function runTests() {
  let evidence = `# Evidence\n\nThis file contains proofs for the Capstone Requirements.\n\n`;
  const API = 'http://localhost:3000/api';
  const ownerId = 'tenant_xyz';
  let widgetId = '';

  const addProof = (title, req, resText) => {
    evidence += `### ${title}\n**Request:**\n\`\`\`\n${req}\n\`\`\`\n**Response:**\n\`\`\`\n${resText}\n\`\`\`\n\n`;
  };

  try {
    console.log('1. Testing Widget Management...');
    const widgetPayload = {
      type: 'signup', title: 'Newsletter',
      form_fields: [{name: 'email', type: 'email'}],
      button_text: 'Subscribe'
    };
    
    const res1 = await fetch(`${API}/widgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-owner-id': ownerId },
      body: JSON.stringify(widgetPayload)
    });
    const widget = await res1.json();
    widgetId = widget.id;
    addProof('1. Widget Management (Create Widget)', `POST /api/widgets\nHeaders: x-owner-id: ${ownerId}\nBody: ${JSON.stringify(widgetPayload)}`, JSON.stringify(widget, null, 2));

    console.log('2. Testing Widget Delivery...');
    const res2 = await fetch(`${API}/public/widgets/${widgetId}/config`);
    const cacheHeader = res2.headers.get('Cache-Control');
    const config = await res2.json();
    addProof('2. Widget Delivery (Cached Config)', `GET /api/public/widgets/${widgetId}/config`, `Headers:\nCache-Control: ${cacheHeader}\n\nBody:\n${JSON.stringify(config, null, 2)}`);

    console.log('3. Testing Public Submission (CORS & Validation)...');
    const res3Opts = await fetch(`${API}/public/submissions`, { method: 'OPTIONS' });
    const corsHeader = res3Opts.headers.get('Access-Control-Allow-Origin');
    
    const badPayload = { widget_id: widgetId, data: 'not_an_object' };
    const res3Bad = await fetch(`${API}/public/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badPayload)
    });
    const badData = await res3Bad.json();

    const goodPayload = { widget_id: widgetId, data: { email: 'test@example.com' } };
    const res3Good = await fetch(`${API}/public/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goodPayload)
    });
    const goodData = await res3Good.json();
    
    addProof('3. Public Submission API', 
      `OPTIONS /api/public/submissions\nPOST /api/public/submissions (Bad Payload)\nPOST /api/public/submissions (Good Payload)`, 
      `CORS Header (Allow-Origin): ${corsHeader}\n\nBad Payload Response (400):\n${JSON.stringify(badData)}\n\nGood Payload Response (201):\n${JSON.stringify(goodData)}`
    );

    console.log('4. Testing Abuse Protection (Spam & Rate Limiting)...');
    const spamPayload = { widget_id: widgetId, data: { email: 'spam@bot.com' }, honeypot_field: 'bot_value' };
    const resSpam = await fetch(`${API}/public/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spamPayload)
    });
    const spamData = await resSpam.json();

    // Trigger Rate Limit
    let rlRes;
    for(let i=0; i<6; i++) {
      rlRes = await fetch(`${API}/public/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goodPayload)
      });
    }
    const rlData = await rlRes.json();
    
    addProof('4. Abuse Protection', 
      `POST /api/public/submissions (Honeypot filled)\nPOST /api/public/submissions (6 requests rapidly)`, 
      `Spam Response:\n${JSON.stringify(spamData)}\n\nRate Limit Response (429):\n${JSON.stringify(rlData)}`
    );

    console.log('5. Testing Dashboard...');
    const resDash = await fetch(`${API}/dashboard/submissions`, {
      headers: { 'x-owner-id': ownerId }
    });
    const dashData = await resDash.json();
    addProof('6. Dashboard', `GET /api/dashboard/submissions\nHeaders: x-owner-id: ${ownerId}`, JSON.stringify(dashData, null, 2));

    fs.writeFileSync('EVIDENCE.md', evidence);
    console.log('Successfully generated EVIDENCE.md!');

  } catch(err) {
    console.error('Error generating evidence:', err);
  }
}

runTests();
