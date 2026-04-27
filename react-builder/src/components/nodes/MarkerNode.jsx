import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import './MarkerNode.css';

export const StartNode = memo(function StartNode() {
  return (
    <div className="marker-node start">
      <span>Start</span>
      <Handle type="source" position={Position.Right} className="rf-handle" />
    </div>
  );
});

export const EndNode = memo(function EndNode() {
  return (
    <div className="marker-node end">
      <Handle type="target" position={Position.Left} className="rf-handle" />
      <span>End</span>
    </div>
  );
});
