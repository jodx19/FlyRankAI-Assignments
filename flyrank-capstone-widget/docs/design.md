# Design Document

## 1. Database Schema

### `widgets` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier for the widget |
| `owner_id` | String | Tenant ID (who owns this widget) |
| `type` | String | e.g. `signup`, `contact`, `cta` |
| `title` | String | Widget title |
| `description` | Text | Optional description |
| `form_fields` | JSONB | Schema for the fields (e.g. `[{name: 'email', required: true}]`) |
| `button_text` | String | Text on the submit button |
| `display_options`| JSONB | Colors, position, etc. |
| `created_at` | Timestamp | Creation time |
| `updated_at` | Timestamp | Last update time |

### `submissions` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier for the submission |
| `widget_id` | UUID (FK) | Reference to `widgets.id` |
| `owner_id` | String | Tenant ID for isolated querying |
| `data` | JSONB | The submitted form data |
| `ip_address` | String | The IP address of the submitter |
| `geo_data` | JSONB | Enriched Geo-location data (city, country, etc.) |
| `created_at` | Timestamp | Submission time |

---

## 2. API Contracts

### 2.1. Widget Management API (Authenticated)

**GET /api/widgets**
- **Auth:** Required (Bearer Token or simply `x-owner-id` header for simplicity in this capstone)
- **Response:** `200 OK` Array of Widget objects.

**POST /api/widgets**
- **Auth:** Required
- **Body:** `{ type, title, description, form_fields, button_text, display_options }`
- **Response:** `201 Created` Widget object.

**GET /api/widgets/:id**
- **Auth:** Required
- **Response:** `200 OK` Widget object.

### 2.2. Public Widget Delivery (Cached)

**GET /api/public/widgets/:id/config**
- **Auth:** None
- **Headers:** `Cache-Control: max-age=300`
- **Response:** `200 OK`
  ```json
  {
    "id": "uuid",
    "type": "signup",
    "title": "Subscribe",
    "form_fields": [...],
    "button_text": "Join"
  }
  ```

**GET /widget.js?id=:id** (Served statically or via route)
- **Auth:** None
- **Response:** The Javascript bundle that renders the widget.

### 2.3. Public Submission (CORS)

**OPTIONS /api/public/submissions**
- **Response:** `204 No Content` with appropriate CORS headers (`Access-Control-Allow-Origin: *`).

**POST /api/public/submissions**
- **Auth:** None (Public)
- **Body:**
  ```json
  {
    "widget_id": "uuid",
    "data": { "email": "test@example.com" },
    "honeypot_field": "" 
  }
  ```
- **Response:**
  - `201 Created`: `{ "success": true }`
  - `400 Bad Request`: Validation failure.
  - `429 Too Many Requests`: Rate limit exceeded.

### 2.4. Dashboard API (Authenticated)

**GET /api/submissions**
- **Auth:** Required
- **Query Params:** `widget_id` (optional)
- **Response:** `200 OK` Array of submissions with geo_data.
