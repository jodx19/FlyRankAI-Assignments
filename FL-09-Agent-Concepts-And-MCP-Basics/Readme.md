# 📂 FL-09: Agent Concepts and MCP Basics

**Track:** FlyRank General AI Fluency
**Developer:** Mahmoud Mostafa El Safi (Mahmoud Al-Safi)
**Objective:** Differentiate between AI Workflows and Agents, integrate an MCP server with Claude, and architect the evolution of a static pipeline into an autonomous agentic system.

## 🎯 1. Workflow vs. Agent & FL-04 Classification

| Concept                  | Description                                                                                                                                                                                                                                                                                                 |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Workflow**             | Orchestrated systems where the control flow is pre-defined by code. LLMs are used as specific nodes within this deterministic path (e.g., extracting JSON, summarizing text) but do not dictate the execution graph.                                                                                        |
| **Agent**                | Autonomous systems where the LLM itself drives the control flow. It dynamically decides which tools to call, analyzes the output, and iterates until the goal is achieved without pre-programmed routing.                                                                                                   |
| **FL-04 Classification** | My FL-04 pipeline was fundamentally a **Workflow**. It followed a strict, step-by-step programmatic execution sequence. The LLM was prompted at specific intervals to process data, but it had no agency to route tasks, recover from arbitrary errors independently, or select alternative external tools. |

## 🔌 2. MCP Connector Setup & Execution Evidence

> **Note to Reviewer:** The ZIP file attached to this submission contains the required video/screenshots of the Claude Desktop MCP configuration and the execution of the 3 tasks.

- **MCP Server Used:** `[Insert the MCP name here, e.g., mcp-server-sqlite or mcp-server-filesystem]`
- **Task 1:** `[Describe task 1, e.g., Read the local directory structure]`
- **Task 2:** `[Describe task 2, e.g., Extract data from a specific local configuration file]`
- **Task 3:** `[Describe task 3, e.g., Analyze the extracted data and summarize it]`

## 🏗️ 3. Evolution: Upgrading FL-04 to an Agent via MCP

**Word Count: ~360 words**

To transform the static FL-04 pipeline into a fully autonomous Agent, the paradigm must shift from rigid programmatic routing to LLM-driven orchestration. This evolution relies heavily on the implementation of the Model Context Protocol (MCP) to securely expose external capabilities to the LLM.

If we examine my standard backend environment—utilizing .NET Clean Architecture, MediatR, and PostgreSQL—a static workflow would typically involve an API endpoint triggering a MediatR command, which sequentially fetches data, sends it to an LLM for formatting, and saves the result. If a failure occurs, the pipeline halts.

To upgrade this into an Agent, I would deploy a custom .NET-based MCP Server acting as a bridge between the LLM and the application's core domain, such as a Hospital Information System (HIS) or a SaaS Quota manager. Instead of writing step-by-step execution code, I would equip the Claude-driven Agent with specific MCP Tools:

1. `CheckUserQuotaTool`: Queries the SaaS database via PostgreSQL.
2. `FetchPatientRecordTool`: Calls the internal .NET API to retrieve HIS data.
3. `GenerateReportTool`: A utility to compile final outputs.

The Agent pipeline would initiate with a high-level prompt: "Analyze patient X's history if the clinic has sufficient API quota, and generate a summary."

Through MCP, the LLM takes over the control flow. It autonomously decides to call the `CheckUserQuotaTool` first. The MCP server processes this request against the PostgreSQL database and returns the result. If the quota is sufficient, the Agent dynamically formulates the next logical step—calling the `FetchPatientRecordTool`. If an error is returned (e.g., "Patient ID not found"), the Agent processes the error, potentially asking the user for clarification, rather than abruptly crashing like a static workflow.

By integrating MCPs, the backend is no longer responsible for orchestrating the AI's thoughts; it simply provides the secure primitives (Tools and Resources). The LLM transitions from being a mere processing node to becoming the central orchestrator, yielding a resilient, dynamic, and truly autonomous engineering pipeline.

## 📊 Conceptual Agent Architecture

````mermaid
graph TD
    A[User Request] --> B{LLM Agent - Claude}
    B -->|Decides to use tool| C[MCP Client]
    C <-->|JSON-RPC over stdio/HTTP| D[Custom .NET MCP Server]
    D -->|Tool: CheckQuota| E[(SaaS PostgreSQL)]
    D -->|Tool: FetchData| F[Internal .NET API]
    B -->|Finalizes response| G[Output to User]# 📂 FL-09: Agent Concepts and MCP Basics

**Track:** FlyRank General AI Fluency
**Developer:** Mahmoud Mostafa El Safi (Mahmoud Al-Safi)
**Objective:** Differentiate between AI Workflows and Agents, integrate an MCP server with Claude, and architect the evolution of a static pipeline into an autonomous agentic system.

## 🎯 1. Workflow vs. Agent & FL-04 Classification

| Concept | Description |
| :--- | :--- |
| **Workflow** | Orchestrated systems where the control flow is pre-defined by code. LLMs are used as specific nodes within this deterministic path (e.g., extracting JSON, summarizing text) but do not dictate the execution graph. |
| **Agent** | Autonomous systems where the LLM itself drives the control flow. It dynamically decides which tools to call, analyzes the output, and iterates until the goal is achieved without pre-programmed routing. |
| **FL-04 Classification** | My FL-04 pipeline was fundamentally a **Workflow**. It followed a strict, step-by-step programmatic execution sequence. The LLM was prompted at specific intervals to process data, but it had no agency to route tasks, recover from arbitrary errors independently, or select alternative external tools. |

## 🔌 2. MCP Connector Setup & Execution Evidence

> **Note to Reviewer:** The ZIP file attached to this submission contains the required video/screenshots of the Claude Desktop MCP configuration and the execution of the 3 tasks.

*   **MCP Server Used:** `[Insert the MCP name here, e.g., mcp-server-sqlite or mcp-server-filesystem]`
*   **Task 1:** `[Describe task 1, e.g., Read the local directory structure]`
*   **Task 2:** `[Describe task 2, e.g., Extract data from a specific local configuration file]`
*   **Task 3:** `[Describe task 3, e.g., Analyze the extracted data and summarize it]`

## 🏗️ 3. Evolution: Upgrading FL-04 to an Agent via MCP

**Word Count: ~360 words**

To transform the static FL-04 pipeline into a fully autonomous Agent, the paradigm must shift from rigid programmatic routing to LLM-driven orchestration. This evolution relies heavily on the implementation of the Model Context Protocol (MCP) to securely expose external capabilities to the LLM.

If we examine my standard backend environment—utilizing .NET Clean Architecture, MediatR, and PostgreSQL—a static workflow would typically involve an API endpoint triggering a MediatR command, which sequentially fetches data, sends it to an LLM for formatting, and saves the result. If a failure occurs, the pipeline halts.

To upgrade this into an Agent, I would deploy a custom .NET-based MCP Server acting as a bridge between the LLM and the application's core domain, such as a Hospital Information System (HIS) or a SaaS Quota manager. Instead of writing step-by-step execution code, I would equip the Claude-driven Agent with specific MCP Tools:
1. `CheckUserQuotaTool`: Queries the SaaS database via PostgreSQL.
2. `FetchPatientRecordTool`: Calls the internal .NET API to retrieve HIS data.
3. `GenerateReportTool`: A utility to compile final outputs.

The Agent pipeline would initiate with a high-level prompt: "Analyze patient X's history if the clinic has sufficient API quota, and generate a summary."

Through MCP, the LLM takes over the control flow. It autonomously decides to call the `CheckUserQuotaTool` first. The MCP server processes this request against the PostgreSQL database and returns the result. If the quota is sufficient, the Agent dynamically formulates the next logical step—calling the `FetchPatientRecordTool`. If an error is returned (e.g., "Patient ID not found"), the Agent processes the error, potentially asking the user for clarification, rather than abruptly crashing like a static workflow.

By integrating MCPs, the backend is no longer responsible for orchestrating the AI's thoughts; it simply provides the secure primitives (Tools and Resources). The LLM transitions from being a mere processing node to becoming the central orchestrator, yielding a resilient, dynamic, and truly autonomous engineering pipeline.

## 📊 Conceptual Agent Architecture

```mermaid
graph TD
    A[User Request] --> B{LLM Agent - Claude}
    B -->|Decides to use tool| C[MCP Client]
    C <-->|JSON-RPC over stdio/HTTP| D[Custom .NET MCP Server]
    D -->|Tool: CheckQuota| E[(SaaS PostgreSQL)]
    D -->|Tool: FetchData| F[Internal .NET API]
    B -->|Finalizes response| G[Output to User]
````
