/**
 * Cypher queries relating to Candidates
 */

export const GET_CANDIDATE_BY_ID = `
  MATCH (c:Candidate {id: $candidateId})
  RETURN c LIMIT 1
`;

export const GET_CANDIDATE_SKILLS = `
  MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)
  RETURN s
  ORDER BY s.name
`;

export const GET_ALL_CANDIDATES = `
  MATCH (c:Candidate)
  RETURN c
  ORDER BY c.name
`;
