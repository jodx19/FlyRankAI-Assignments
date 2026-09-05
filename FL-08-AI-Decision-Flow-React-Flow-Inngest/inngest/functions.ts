import { inngest } from "./client";
import { OpenAI } from "openai";
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", triggers: [{ event: "workflow/run" }] },
  async ({ event, step }) => {
    const statusPath = path.join(process.cwd(), '.workflow-status.json');
    fs.writeFileSync(statusPath, JSON.stringify({ status: 'running', trace: [], error: null }));
    
    try {
      const { nodes, edges } = event.data as any;
      
      const startNodes = nodes.filter((node: any) => 

      !edges.some((edge: any) => edge.target === node.id)
    );

    if (startNodes.length !== 1) {
      throw new Error(`Invalid graph: expected exactly 1 start node, found ${startNodes.length}`);
    }

    let currentNode = startNodes[0];
    const executionTrace = [];
    let stepCount = 0;
    const MAX_STEPS = 50;

    while (currentNode) {
      if (stepCount >= MAX_STEPS) {
        throw new Error("Maximum execution steps exceeded (potential infinite loop)");
      }
      stepCount++;

      const prompt = currentNode.data.prompt;

        const decision = await step.run(`node-${currentNode.id}`, async () => {
          const response = await openai.chat.completions.create({
            model: "qwen/qwen3.8-27b", // Using available model

          messages: [
            {
              role: "system",
              content: "You must respond with EXACTLY ONE WORD: either 'YES' or 'NO'. Do not include any other text, explanation, or punctuation."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0,
        });

        const content = response.choices[0]?.message?.content?.trim().toUpperCase();
        
        if (content !== "YES" && content !== "NO") {
          throw new Error(`Invalid model response: Expected 'YES' or 'NO', but received '${content}'`);
        }

        return content;
      });

      executionTrace.push({
        nodeId: currentNode.id,
        prompt,
        decision,
      });
      
      fs.writeFileSync(statusPath, JSON.stringify({ status: 'running', trace: executionTrace, error: null }));

      const nextEdge = edges.find((edge: any) => 
        edge.source === currentNode.id && edge.sourceHandle?.toLowerCase() === decision.toLowerCase()
      );

      if (!nextEdge) {
        break; // Terminal node reached
      }

      currentNode = nodes.find((n: any) => n.id === nextEdge.target);
    }

    fs.writeFileSync(statusPath, JSON.stringify({ status: 'completed', trace: executionTrace, error: null }));
    return { trace: executionTrace };
    
    } catch (error: any) {
      fs.writeFileSync(statusPath, JSON.stringify({ status: 'error', trace: [], error: error.message }));
      throw error;
    }
  }
);
