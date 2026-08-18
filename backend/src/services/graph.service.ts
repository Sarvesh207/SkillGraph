import { runQuery } from '../db/neo4j';
import * as queries from '../queries/graph.cypher';

export interface GraphNode {
  id: string;
  label: string;
  name: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Extracts unique nodes and edges from Neo4j paths returned by runQuery.
 */
function extractGraphFromPaths(rows: Array<{ path: any }>): GraphData {
  const nodesMap = new Map<string, GraphNode>();
  const edgesMap = new Map<string, GraphEdge>();

  const addNode = (nodeObj: any) => {
    if (!nodeObj || nodeObj._type !== 'node') return;
    const id = String(nodeObj.id);
    const label = nodeObj.labels[0] || 'Unknown';
    const properties = nodeObj.properties || {};
    const name = properties.name || properties.title || id;

    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, label, name, properties });
    }
  };

  const addEdge = (relObj: any) => {
    if (!relObj || relObj._type !== 'relationship') return;
    const id = String(relObj.id);
    const source = String(relObj.start);
    const target = String(relObj.end);
    const type = relObj.type;
    const properties = relObj.properties || {};

    if (!edgesMap.has(id)) {
      edgesMap.set(id, { id, source, target, type, properties });
    }
  };

  for (const row of rows) {
    const path = row.path;
    if (!path) continue;

    // Parse path components
    addNode(path.start);
    addNode(path.end);

    if (Array.isArray(path.segments)) {
      for (const seg of path.segments) {
        addNode(seg.start);
        addNode(seg.end);
        addEdge(seg.relationship);
      }
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges: Array.from(edgesMap.values()),
  };
}

/**
 * Fetch the candidate's multi-hop connection subgraph.
 */
export async function getCandidateGraph(candidateId: string): Promise<GraphData> {
  const rows = await runQuery<{ path: any }>(queries.GET_CANDIDATE_GRAPH, { candidateId });
  return extractGraphFromPaths(rows);
}

/**
 * Fetch the visual connection chain between a specific candidate and a job.
 */
export async function getJobMatchGraph(candidateId: string, jobId: string): Promise<GraphData> {
  const rows = await runQuery<{ path: any }>(queries.GET_JOB_MATCH_GRAPH, { candidateId, jobId });
  return extractGraphFromPaths(rows);
}
