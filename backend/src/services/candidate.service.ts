import { runQuery } from '../db/neo4j';
import * as queries from '../queries/candidates.cypher';

export interface Candidate {
  id: string;
  name: string;
  location: string;
  experience: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

/**
 * Fetch all candidates in the system.
 */
export async function getAllCandidates(): Promise<Candidate[]> {
  const result = await runQuery<{ c: any }>(queries.GET_ALL_CANDIDATES);
  return result.map(row => row.c.properties as Candidate);
}

/**
 * Fetch a candidate by ID.
 */
export async function getCandidateById(candidateId: string): Promise<Candidate | null> {
  const result = await runQuery<{ c: any }>(queries.GET_CANDIDATE_BY_ID, { candidateId });
  if (result.length === 0) return null;
  return result[0].c.properties as Candidate;
}

/**
 * Fetch skills possessed by a candidate.
 */
export async function getCandidateSkills(candidateId: string): Promise<Skill[]> {
  const result = await runQuery<{ s: any }>(queries.GET_CANDIDATE_SKILLS, { candidateId });
  return result.map(row => row.s.properties as Skill);
}
