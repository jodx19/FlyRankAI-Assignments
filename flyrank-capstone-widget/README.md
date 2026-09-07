# Embeddable Widget & Lead-Capture Platform

This is a platform that lets customers create embeddable widgets (signup forms, contact forms, call-to-action popovers) and install them on any website with a single `<script>` tag.

## Architecture

1.  **Widget Owner (authenticated)**:
    `Owner -> Widget Management API -> Widget DB (tenant-isolated) -> embed snippet`
2.  **Customer Website (any origin)**:
    `<script src="widget.js?id=123"> -> GET /widgets/:id/config (public, cached, CORS) -> render widget`
3.  **Website Visitor**:
    `POST /submissions (public, CORS)`
    - Validation (4xx, no 500s)
    - Rate Limit + Spam Check
    - Geo Enrichment (Fallback Chain)
    - Store Submission
    - Email / Webhook Side Effect (safe failure)

## Setup Instructions

1.  Clone the repository or download the source.
2.  Run `npm install`
3.  Copy `.env.example` to `.env` and fill in the values.
4.  Run database migrations / seeding (creates `database.sqlite` locally):
    ```bash
    npm run db:setup
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```

## Limitations

- This is a learning project built without a real CDN or domain. The customer site is mocked using a plain HTML file running on a different port.
- Email sending is mocked or routed to a local mail catcher like Mailpit.
- Rate limiting uses memory storage, which is insufficient for a real multi-node production setup (would need Redis).
