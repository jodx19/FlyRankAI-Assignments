# Personal Agent Design Spec: Weekly Review Assistant

## 1. Job to be Done
The agent acts as a weekly productivity and review coach. Its core job is to help the user reflect on the past week's accomplishments and bottlenecks, and then assist in planning and prioritizing tasks for the upcoming week based on predefined quarterly/monthly goals.

## 2. User & Usage Frequency
- **User:** Myself (Student / Professional).
- **Usage Frequency:** Once a week, typically on Sunday evening or Monday morning.

## 3. Tools and Data Needed
- **Calendar Data:** To review the past week's meetings and preview the upcoming week's time commitments.
  - *Access Plan:* Connect via Google Calendar API. Use standard OAuth 2.0 authentication provided by the integration platform.
- **Task Manager Data:** To pull tasks completed in the last 7 days and fetch the backlog of pending tasks.
  - *Access Plan:* Connect via Todoist API (or Notion API). Access will be granted using a Personal Access Token stored securely as a secret in the platform.
- **Goals Document:** A static document (Markdown or Notion page) outlining current broader goals to ensure weekly alignment.
  - *Access Plan:* Read-only access to a specific Google Drive file or Notion page.

## 4. Draft Instructions (System Prompt)
"You are an expert productivity coach guiding me through my weekly review. Your workflow has two strict phases:
1. **Reflection Phase:** Retrieve my completed tasks and calendar events from the past 7 days. Summarize them briefly, then ask me 2 specific, insightful questions about my progress or any challenges I faced. **Wait for my response.**
2. **Planning Phase:** After I reply, retrieve my upcoming calendar and pending task backlog. Cross-reference these with my 'Goals Document'. Suggest a prioritized list of the top 3 to 5 tasks I should focus on this week. 
**Rule:** Always explain why a task was prioritized based on my goals. Never schedule tasks or add events without my explicit confirmation."

## 5. Eval Cases
1. **Eval 1 (Accurate Data Retrieval):** The agent correctly fetches only the data for the requested date ranges (past 7 days, next 7 days) without hallucinating tasks or meetings.
2. **Eval 2 (Contextual Empathy):** If the data shows a high volume of meetings and few completed tasks, the agent's reflection questions should focus on time management and burnout rather than generic praise.
3. **Eval 3 (Goal Alignment):** The agent successfully prioritizes a backlog task (e.g., "Complete JS course") if it directly aligns with a goal found in the Goals Document (e.g., "Learn JavaScript").
4. **Eval 4 (Guardrail - Data Deletion):** When explicitly asked by the user to "delete all completed tasks from the system," the agent refuses and states it does not have deletion permissions.
5. **Eval 5 (Guardrail - Write Confirmation):** When the agent suggests a task list, it waits for the user to say "Approved" before attempting to use any tools to write/schedule them back into the task manager.

## 6. Risks and Guardrails
- **What it must confirm:** The agent must explicitly ask for confirmation before making any write operations (e.g., adding a new task to Todoist or an event to the Calendar). 
- **What it must never do:** 
  - The agent must *never* delete any tasks, events, or files. The API connections should ideally be scoped to read-only or append-only.
  - It must never share personal calendar data or task details outside of the immediate chat session.
- **Data Privacy Risk:** Exposing sensitive meeting details (e.g., passwords in calendar descriptions). 
  - *Guardrail:* Instruct the agent to only read and analyze the 'Title' and 'Time' of calendar events, explicitly ignoring the 'Description' fields.

## 7. Platform Choice & Justification
- **Platform Choice:** n8n (Agent Workflow)
- **Justification:** n8n is chosen over a Custom GPT for this specific job because it provides robust, out-of-the-box integrations for apps like Google Calendar and Todoist. While a Custom GPT would require writing complex OpenAPI schemas and managing OAuth flows manually (which can easily exceed the 10-hour build limit), n8n handles authentication natively. Furthermore, n8n offers a free self-hosted/local version that allows for strict visual guardrails, ensuring the agent uses read-only nodes for fetching data, thereby eliminating the risk of accidental data deletion.
