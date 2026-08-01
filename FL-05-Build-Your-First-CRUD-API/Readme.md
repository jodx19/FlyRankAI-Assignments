# Task Management API (Node.js & Express)

A lightweight in-memory CRUD REST API built with Express.js as part of the FlyRank Backend AI Engineering program.

---

## 🚀 How to Install and Run

1. **Clone the repository:**

   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd FlyRankAI-Assignments/FL-05-Build-Your-First-CRUD-API
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the server:**

   ```bash
   node server.js
   ```

4. **Access Swagger Documentation:**
   Open [http://localhost:3000/docs](http://localhost:3000/docs) in your browser.

---

## 📌 Endpoints Summary

| Method   | Endpoint     | Description         | Expected Status Codes                        |
| :------- | :----------- | :------------------ | :------------------------------------------- |
| `GET`    | `/`          | API Metadata        | `200 OK`                                     |
| `GET`    | `/health`    | Health Check        | `200 OK`                                     |
| `GET`    | `/tasks`     | List all tasks      | `200 OK`                                     |
| `GET`    | `/tasks/:id` | Get task by ID      | `200 OK`, `404 Not Found`                    |
| `POST`   | `/tasks`     | Create a new task   | `201 Created`, `400 Bad Request`             |
| `PUT`    | `/tasks/:id` | Update task details | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete a task       | `204 No Content`, `404 Not Found`            |

---

## 🧪 Sample Request & Response (`curl -i`)

### Create Task (`POST /tasks`):

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk"}'
```

**Response:**

```http
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 38
Date: Thu, 30 Jul 2026 17:00:00 GMT
Connection: keep-alive

{"id":4,"title":"Buy milk","done":false}
```

---

## 📄 Interactive OpenAPI Documentation

Interactive testing is available via Swagger UI at `/docs`.
