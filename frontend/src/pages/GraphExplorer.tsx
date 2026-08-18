import React, { useEffect, useState } from 'react';
import { useActiveCandidate } from '../hooks/useActiveCandidate';
import { api } from '../services/api';
import type { GraphNode } from '../types';
import ReactFlow, { 
  type Node, type Edge, Background, Controls, 
  MiniMap, ConnectionLineType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Info, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const GraphExplorer: React.FC = () => {
  const { activeCandidateId } = useActiveCandidate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawNodes, setRawNodes] = useState<GraphNode[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const loadGraph = async () => {
    if (!activeCandidateId) return;
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      const data = await api.getCandidateGraph(activeCandidateId);
      setRawNodes(data.nodes);

      // Simple column layout algorithm
      // Column widths: Candidate (100) -> Skills (350) -> Jobs (650) -> Companies (950)
      const columnPositions: Record<string, number> = {
        Candidate: 80,
        Skill: 320,
        Job: 580,
        Company: 840,
        Technology: 450,
        Industry: 1050,
      };

      const counts: Record<string, number> = {};
      const rfNodes: Node[] = data.nodes.map(node => {
        const label = node.label;
        const x = columnPositions[label] || 500;
        
        // Vertically space out nodes based on label category
        const currentCount = counts[label] || 0;
        counts[label] = currentCount + 1;
        
        // Alternate spacing around Y = 250 center line
        const spacing = 80;
        const offset = Math.ceil(currentCount / 2) * spacing;
        const direction = currentCount % 2 === 0 ? 1 : -1;
        const y = 250 + (currentCount === 0 ? 0 : direction * offset);

        // Styling tokens depending on node type
        let border = '#3f3f46'; // default
        let color = '#ffffff';
        if (label === 'Candidate') { border = '#8b5cf6'; color = '#c084fc'; }
        if (label === 'Skill') { border = '#10b981'; color = '#34d399'; }
        if (label === 'Job') { border = '#3b82f6'; color = '#60a5fa'; }
        if (label === 'Company') { border = '#f59e0b'; color = '#fbbf24'; }
        if (label === 'Technology') { border = '#14b8a6'; color = '#2dd4bf'; }
        if (label === 'Industry') { border = '#ec4899'; color = '#f472b6'; }

        return {
          id: node.id,
          type: label === 'Candidate' ? 'input' : (label === 'Company' ? 'output' : 'default'),
          data: { label: `${label}: ${node.name}` },
          position: { x, y },
          style: {
            background: '#090a16',
            color: color,
            border: `2px solid ${border}`,
            borderRadius: '10px',
            padding: '10px',
            fontWeight: label === 'Candidate' || label === 'Job' ? 'bold' : 'normal',
            fontSize: '11px',
            width: 150,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
          }
        };
      });

      // Map edges to React Flow layout
      const rfEdges: Edge[] = data.edges.map(edge => {
        let edgeColor = '#3f3f46';
        if (edge.type === 'HAS_SKILL') edgeColor = '#8b5cf6';
        if (edge.type === 'REQUIRES') edgeColor = '#10b981';
        if (edge.type === 'POSTED_BY') edgeColor = '#3b82f6';
        if (edge.type === 'OPERATES_IN') edgeColor = '#f59e0b';

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: ConnectionLineType.SmoothStep,
          label: edge.type,
          labelStyle: { fill: '#71717a', fontSize: 7, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#090a16', fillOpacity: 0.8 },
          animated: edge.type === 'HAS_SKILL' || edge.type === 'REQUIRES',
          style: { stroke: edgeColor, strokeWidth: 1.5 },
        };
      });

      setGraphData({ nodes: rfNodes, edges: rfEdges });
    } catch (err: any) {
      console.error('Error loading graph:', err);
      setError(err.code === 'DATABASE_UNAVAILABLE'
        ? 'The graph database is currently unavailable.'
        : 'Failed to retrieve connection graph.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [activeCandidateId]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const matchedNode = rawNodes.find(n => n.id === node.id);
    if (matchedNode) {
      setSelectedNode(matchedNode);
    }
  };

  if (loading && graphData.nodes.length === 0) {
    return <GraphExplorerSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6 flex flex-col h-[calc(100vh-100px)]">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Network className="h-6 w-6 stroke-[2] text-violet-400" />
          Interactive Graph Explorer
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          Explore relationships between candidates, skills, jobs, and companies. Click on nodes to review connection attributes.
        </p>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="bg-error/15 border border-error/30 p-8 rounded-xl max-w-sm text-center">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Error Loading Graph</h2>
            <p className="text-zinc-400 text-xs mb-6">{error}</p>
            <button
              onClick={loadGraph}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* React Flow Canvas */}
          <div className="lg:col-span-3 bg-zinc-950 border border-border rounded-2xl relative overflow-hidden flex flex-col min-h-[400px]">
            <ReactFlow
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeClick={onNodeClick}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#1f2937" gap={18} />
              <Controls className="bg-zinc-900 border-border text-white fill-white stroke-white" />
              <MiniMap 
                nodeColor={n => {
                  if (n.style?.color === '#c084fc') return '#8b5cf6';
                  if (n.style?.color === '#34d399') return '#10b981';
                  if (n.style?.color === '#60a5fa') return '#3b82f6';
                  if (n.style?.color === '#fbbf24') return '#f59e0b';
                  return '#27272a';
                }}
                maskColor="rgba(9, 10, 22, 0.7)"
                className="bg-zinc-900 border border-border rounded-lg"
              />
            </ReactFlow>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-border flex flex-col justify-between overflow-y-auto">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-border text-zinc-400 tracking-wider uppercase font-mono">
                    {selectedNode.label}
                  </span>
                  <Info className="h-4 w-4 text-zinc-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{selectedNode.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">ID: {selectedNode.id}</p>
                </div>
                
                {/* Node Details Fields */}
                <div className="space-y-3 pt-2 text-xs border-t border-border/20">
                  {Object.entries(selectedNode.properties).map(([key, val]) => {
                    if (key === 'id') return null;
                    return (
                      <div key={key}>
                        <span className="text-zinc-500 block capitalize">{key}</span>
                        <span className="text-zinc-300 font-medium leading-relaxed block break-words">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-zinc-500">
                <HelpCircle className="h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-xs">Click a node on the canvas to inspect properties.</p>
              </div>
            )}
            
            <div className="pt-4 border-t border-border/30 mt-6 text-[9px] text-zinc-600 text-center font-mono">
              Use scroll-wheel to zoom. Drag canvas to pan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton Screen
const GraphExplorerSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6 flex flex-col h-[calc(100vh-100px)] animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-zinc-900 rounded" />
        <div className="h-4 w-96 bg-zinc-900 rounded" />
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <div className="lg:col-span-3 bg-zinc-900 rounded-2xl border border-border" />
        <div className="lg:col-span-1 bg-zinc-900 rounded-2xl border border-border" />
      </div>
    </div>
  );
};
export default GraphExplorer;
