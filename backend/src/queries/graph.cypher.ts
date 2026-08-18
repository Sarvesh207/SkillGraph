/**
 * Cypher queries relating to Graph Visualizations
 */

// Multi-hop path query: Candidate -> Skill -> Job -> Company
export const GET_CANDIDATE_GRAPH = `
  MATCH path = (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)-[:POSTED_BY]->(company:Company)
  RETURN path
  LIMIT 40
`;

// Specific job match path: Candidate -> Skill -> Job -> Company -> Industry
export const GET_JOB_MATCH_GRAPH = `
  MATCH path = (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job {id: $jobId})-[:POSTED_BY]->(company:Company)-[:OPERATES_IN]->(industry:Industry)
  RETURN path
`;
