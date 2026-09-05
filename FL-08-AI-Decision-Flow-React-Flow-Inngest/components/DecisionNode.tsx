import { Handle, Position, useReactFlow } from 'reactflow';

export default function DecisionNode({ id, data }: { id: string; data: any }) {
  const { setNodes } = useReactFlow();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, prompt: e.target.value },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl shadow-sm p-4 w-[280px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400" />
      
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision Prompt</label>
        <textarea
          className="w-full border border-slate-200 rounded-md p-2 text-sm nodrag"
          value={data.prompt || ''}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. Is this a support request?"
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="w-4 h-4 bg-green-500"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="w-4 h-4 bg-red-500"
        style={{ left: '70%' }}
      />
    </div>
  );
}
