# Build Log: Weekly Review Assistant (FL-07)

## Initial Setup
- **Goal:** Build an MVP of the Weekly Review Assistant designed in FL-06.
- **Platform:** n8n (running locally).
- **Core Job:** Help the user reflect on the past week and plan the upcoming week by cross-referencing goals.
- **Data Connection:** Reading a local `goals_document.md` file.

## Deviations from the Original Spec
1. **Tool Reduction:** The original spec called for integrating Google Calendar and Todoist APIs. However, to fit within the 10-hour build limit and get a functional MVP running end-to-end quickly, I am deferring the OAuth/API setups.
2. **Current Tool Focus:** Instead of live API data for tasks/calendar, the agent will rely on user chat input for the "Reflection" phase, but it *will* use a real tool connection (Read File node) to access the `goals_document.md` for the "Planning" phase. This satisfies the "at least one live tool/file/data connection" requirement.

## Build Progress
- **Step 1:** Created the `goals_document.md` to act as the live knowledge base.
- **Step 2:** Created the n8n workflow JSON (`weekly_review_agent.json`) with an AI Agent setup, Chat Trigger, Window Buffer Memory, and a Read File tool to read the goals document.

## Issues and Fixes
- *No issues yet. Pending local import and test run by the user.*

## Next Steps
- Import the workflow into n8n.
- Connect an LLM provider (e.g., OpenAI).
- Run a test conversation and record the screen capture.
