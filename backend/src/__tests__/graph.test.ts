import { getCandidateGraph } from '../services/graph.service';
import { runQuery } from '../db/neo4j';

// Mock the neo4j query execution
jest.mock('../db/neo4j', () => ({
  runQuery: jest.fn(),
  getDriver: jest.fn(),
  closeDriver: jest.fn(),
}));

describe('Graph Service - extractGraphFromPaths', () => {
  it('should parse complex nested Neo4j path structures into flat nodes and edges list', async () => {
    // Simulated path segments structure returned by runQuery
    const mockDbResult = [
      {
        path: {
          start: { _type: 'node', id: 'cand_sarah', labels: ['Candidate'], properties: { name: 'Sarah Jenkins', location: 'SF' } },
          end: { _type: 'node', id: 'comp_technova', labels: ['Company'], properties: { name: 'TechNova', location: 'SF' } },
          segments: [
            {
              start: { _type: 'node', id: 'cand_sarah', labels: ['Candidate'], properties: { name: 'Sarah Jenkins', location: 'SF' } },
              end: { _type: 'node', id: 'skill_react', labels: ['Skill'], properties: { name: 'React', category: 'Frontend' } },
              relationship: { _type: 'relationship', id: 'rel1', start: 'cand_sarah', end: 'skill_react', type: 'HAS_SKILL', properties: {} }
            },
            {
              start: { _type: 'node', id: 'skill_react', labels: ['Skill'], properties: { name: 'React', category: 'Frontend' } },
              end: { _type: 'node', id: 'job_tn_1', labels: ['Job'], properties: { title: 'Senior Frontend Architect' } },
              relationship: { _type: 'relationship', id: 'rel2', start: 'job_tn_1', end: 'skill_react', type: 'REQUIRES', properties: {} }
            },
            {
              start: { _type: 'node', id: 'job_tn_1', labels: ['Job'], properties: { title: 'Senior Frontend Architect' } },
              end: { _type: 'node', id: 'comp_technova', labels: ['Company'], properties: { name: 'TechNova', location: 'SF' } },
              relationship: { _type: 'relationship', id: 'rel3', start: 'job_tn_1', end: 'comp_technova', type: 'POSTED_BY', properties: {} }
            }
          ]
        }
      }
    ];

    (runQuery as jest.Mock).mockResolvedValue(mockDbResult);

    const result = await getCandidateGraph('cand_sarah');

    // Asserts
    expect(result).toBeDefined();
    
    // Check nodes are collected and deduplicated
    expect(result.nodes.length).toBe(4);
    
    // Check Candidate Node mapping
    const candidate = result.nodes.find(n => n.id === 'cand_sarah');
    expect(candidate).toBeDefined();
    expect(candidate?.label).toBe('Candidate');
    expect(candidate?.name).toBe('Sarah Jenkins');
    expect(candidate?.properties.location).toBe('SF');

    // Check Job Node mapping (title maps to name fallback)
    const job = result.nodes.find(n => n.id === 'job_tn_1');
    expect(job).toBeDefined();
    expect(job?.label).toBe('Job');
    expect(job?.name).toBe('Senior Frontend Architect');

    // Check Edges parsing
    expect(result.edges.length).toBe(3);
    const hasSkillEdge = result.edges.find(e => e.id === 'rel1');
    expect(hasSkillEdge).toBeDefined();
    expect(hasSkillEdge?.source).toBe('cand_sarah');
    expect(hasSkillEdge?.target).toBe('skill_react');
    expect(hasSkillEdge?.type).toBe('HAS_SKILL');
  });

  it('should return empty nodes and edges if query returns empty path set', async () => {
    (runQuery as jest.Mock).mockResolvedValue([]);

    const result = await getCandidateGraph('cand_dummy');
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});
