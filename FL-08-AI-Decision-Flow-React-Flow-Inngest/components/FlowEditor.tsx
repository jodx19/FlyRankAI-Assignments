"use client";

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import DecisionNode from './DecisionNode';

const nodeTypes = { decision: DecisionNode };

function Flow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [trace, setTrace] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const savedNodes = localStorage.getItem('decision-flow-nodes');
    const savedEdges = localStorage.getItem('decision-flow-edges');
    if (savedNodes) {
      try { setNodes(JSON.parse(savedNodes)); } catch (e) {}
    }
    if (savedEdges) {
      try { setEdges(JSON.parse(savedEdges)); } catch (e) {}
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('decision-flow-nodes', JSON.stringify(nodes));
      localStorage.setItem('decision-flow-edges', JSON.stringify(edges));
    }
  }, [nodes, edges, isMounted]);

  // Update nodes and edges style based on trace
  const visitedNodeIds = trace.map(t => t.nodeId);
  const highlightedNodes = nodes.map(n => ({
    ...n,
    style: {
      ...n.style,
      border: visitedNodeIds.includes(n.id) ? '2px solid #a855f7' : '1px solid #e5e7eb',
      boxShadow: visitedNodeIds.includes(n.id) ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none',
    }
  }));

  const highlightedEdges = edges.map(e => {
    // Find if this edge connects two consecutive nodes in the trace
    let isTraversed = false;
    for (let i = 0; i < trace.length; i++) {
      const step = trace[i];
      if (e.source === step.nodeId && e.sourceHandle?.toLowerCase() === step.decision.toLowerCase()) {
        isTraversed = true;
        break;
      }
    }
    return {
      ...e,
      animated: isTraversed
    };
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const isYes = params.sourceHandle === 'yes';
      const edge = {
        ...params,
        id: `e-${params.source}-${params.sourceHandle}-${params.target}`,
        label: isYes ? 'YES' : 'NO',
        style: { stroke: isYes ? '#22c55e' : '#ef4444', strokeWidth: 2 },
        labelStyle: { fill: isYes ? '#22c55e' : '#ef4444', fontWeight: 700 },
        animated: false,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    []
  );

  const addNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'decision',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { prompt: 'New Decision' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    setError(null);
    setTrace([]);

    try {
      const res = await fetch('/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to start workflow");
        setIsRunning(false);
        return;
      }

      // Poll for status
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/run-workflow');
          const data = await statusRes.json();
          if (data.status === 'completed') {
            setTrace(data.trace || []);
            setIsRunning(false);
            clearInterval(poll);
          } else if (data.status === 'error') {
            setError(data.error || "Unknown error occurred");
            setTrace(data.trace || []);
            setIsRunning(false);
            clearInterval(poll);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1000);
    } catch (e: any) {
      setError(e.message);
      setIsRunning(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-full h-full relative flex flex-col" style={{ width: '100%', height: '100%' }}>
      <div className="flex-1 relative">
        <ReactFlow
          nodes={highlightedNodes}
          edges={highlightedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={addNode}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
          >
            Add Decision Node
          </button>
          <button
            onClick={runWorkflow}
            disabled={isRunning}
            className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
        </div>
      </div>
      
      {/* Logs and Error Panel */}
      <div className="h-64 border-t bg-gray-50 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Execution Logs</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        {trace.length > 0 ? (
          <ul className="space-y-2">
            {trace.map((step, idx) => (
              <li key={idx} className="p-3 bg-white border rounded shadow-sm">
                <span className="font-medium text-gray-500">Step {idx + 1} (Node {step.nodeId}):</span>
                <p className="mt-1 text-gray-800">Prompt: {step.prompt}</p>
                <p className="mt-1 font-bold">Decision: <span className={step.decision === 'YES' ? 'text-green-600' : 'text-red-600'}>{step.decision}</span></p>
              </li>
            ))}
          </ul>
        ) : (
          !error && !isRunning && <p className="text-gray-500">No logs to display. Run the workflow to see execution trace.</p>
        )}
        {isRunning && <p className="text-gray-500">Waiting for execution to complete...</p>}
      </div>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
