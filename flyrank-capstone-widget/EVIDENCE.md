# Evidence

This file contains proofs for the Capstone Requirements.

### 1. Widget Management (Create Widget)
**Request:**
```
POST /api/widgets
Headers: x-owner-id: tenant_xyz
Body: {"type":"signup","title":"Newsletter","form_fields":[{"name":"email","type":"email"}],"button_text":"Subscribe"}
```
**Response:**
```
{
  "id": "88e62c00-2d1a-44b9-8d13-9e4616347f14",
  "owner_id": "tenant_xyz",
  "type": "signup",
  "title": "Newsletter",
  "description": null,
  "form_fields": [
    {
      "name": "email",
      "type": "email"
    }
  ],
  "button_text": "Subscribe",
  "display_options": {},
  "created_at": "2026-09-07 07:20:24",
  "updated_at": "2026-09-07 07:20:24"
}
```

### 2. Widget Delivery (Cached Config)
**Request:**
```
GET /api/public/widgets/88e62c00-2d1a-44b9-8d13-9e4616347f14/config
```
**Response:**
```
Headers:
Cache-Control: public, max-age=300

Body:
{
  "id": "88e62c00-2d1a-44b9-8d13-9e4616347f14",
  "type": "signup",
  "title": "Newsletter",
  "description": null,
  "form_fields": [
    {
      "name": "email",
      "type": "email"
    }
  ],
  "button_text": "Subscribe",
  "display_options": {}
}
```

### 3. Public Submission API
**Request:**
```
OPTIONS /api/public/submissions
POST /api/public/submissions (Bad Payload)
POST /api/public/submissions (Good Payload)
```
**Response:**
```
CORS Header (Allow-Origin): *

Bad Payload Response (400):
{"error":"Invalid or missing data payload"}

Good Payload Response (201):
{"success":true,"submission_id":"c962b144-6452-492b-a6b0-429ad9716c31"}
```

### 4. Abuse Protection
**Request:**
```
POST /api/public/submissions (Honeypot filled)
POST /api/public/submissions (6 requests rapidly)
```
**Response:**
```
Spam Response:
{"success":true,"note":"silently dropped"}

Rate Limit Response (429):
{"error":"Too many submissions, please try again later."}
```

### 6. Dashboard
**Request:**
```
GET /api/dashboard/submissions
Headers: x-owner-id: tenant_xyz
```
**Response:**
```
[
  {
    "id": "c962b144-6452-492b-a6b0-429ad9716c31",
    "widget_id": "88e62c00-2d1a-44b9-8d13-9e4616347f14",
    "owner_id": "tenant_xyz",
    "data": {
      "email": "test@example.com"
    },
    "ip_address": "::1",
    "geo_data": null,
    "created_at": "2026-09-07 07:20:24"
  },
  {
    "id": "94fc3bac-f330-4c62-b042-f7c4f177b3d4",
    "widget_id": "88e62c00-2d1a-44b9-8d13-9e4616347f14",
    "owner_id": "tenant_xyz",
    "data": {
      "email": "test@example.com"
    },
    "ip_address": "::1",
    "geo_data": null,
    "created_at": "2026-09-07 07:20:24"
  },
  {
    "id": "4585f9cd-1a5d-4816-96c9-8e1aa0968769",
    "widget_id": "88e62c00-2d1a-44b9-8d13-9e4616347f14",
    "owner_id": "tenant_xyz",
    "data": {
      "email": "test@example.com"
    },
    "ip_address": "::1",
    "geo_data": null,
    "created_at": "2026-09-07 07:20:24"
  }
]
```

