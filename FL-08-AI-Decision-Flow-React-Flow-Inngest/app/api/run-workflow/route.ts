import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodes, edges } = body;

    const statusPath = path.join(process.cwd(), '.workflow-status.json');
    fs.writeFileSync(statusPath, JSON.stringify({ status: 'idle', trace: [], error: null }));

    await inngest.send({
      name: "workflow/run",
      data: {
        nodes,
        edges,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to run workflow:", error);
    return NextResponse.json(
      { error: "Failed to trigger workflow" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const statusPath = path.join(process.cwd(), '.workflow-status.json');
    if (fs.existsSync(statusPath)) {
      const data = fs.readFileSync(statusPath, 'utf8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ status: 'idle', trace: [], error: null });
  } catch (e) {
    return NextResponse.json({ status: 'idle', trace: [], error: null });
  }
}
