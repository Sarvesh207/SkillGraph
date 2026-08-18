import { runQuery } from '../db/neo4j';
import * as queries from '../queries/jobs.cypher';

export interface JobFilters {
  search?: string;
  location?: string;
  technology?: string;
  industry?: string;
}

export interface Company {
  id: string;
  name: string;
  location: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  experienceLevel: string;
  description: string;
}

export interface JobRecommendation {
  job: Job;
  company: Company | null;
  matchedSkills: number;
  totalSkills: number;
  matchScore: number;
}

export interface IndirectRecommendation {
  job: Job;
  company: Company | null;
  relatedSkills: any[];
  relatedTechnologies: any[];
}

/**
 * Fetch a job by ID along with its company, required skills, and technologies.
 */
export async function getJobById(jobId: string) {
  const result = await runQuery<{
    j: any;
    comp: any;
    requiredSkills: any[];
    technologies: any[];
  }>(queries.GET_JOB_BY_ID, { jobId });

  if (result.length === 0) return null;

  const row = result[0];
  return {
    job: row.j.properties as Job,
    company: row.comp ? (row.comp.properties as Company) : null,
    requiredSkills: row.requiredSkills.map(s => s.properties),
    technologies: row.technologies.map(t => t.properties),
  };
}

/**
 * Fetch all jobs matching optional search and filter parameters.
 */
export async function getAllJobs(filters: JobFilters) {
  const params = {
    search: filters.search || '',
    location: filters.location || '',
    technology: filters.technology || '',
    industry: filters.industry || '',
  };

  const result = await runQuery<{
    j: any;
    comp: any;
    skills: any[];
    technologies: any[];
  }>(queries.GET_ALL_JOBS, params);

  return result.map(row => ({
    job: row.j.properties as Job,
    company: row.comp ? (row.comp.properties as Company) : null,
    skills: row.skills.map(s => s.properties),
    technologies: row.technologies.map(t => t.properties),
  }));
}

/**
 * Fetch direct skill-matching job recommendations for a candidate.
 */
export async function getRecommendations(candidateId: string): Promise<JobRecommendation[]> {
  const result = await runQuery<{
    j: any;
    comp: any;
    matchedSkills: number;
    totalSkills: number;
    matchScore: number;
  }>(queries.GET_JOB_RECOMMENDATIONS, { candidateId });

  return result.map(row => ({
    job: row.j.properties as Job,
    company: row.comp ? (row.comp.properties as Company) : null,
    matchedSkills: row.matchedSkills,
    totalSkills: row.totalSkills,
    matchScore: row.matchScore,
  }));
}

/**
 * Fetch indirect recommendations based on skills related to technologies used by jobs.
 */
export async function getIndirectRecommendations(candidateId: string): Promise<IndirectRecommendation[]> {
  const result = await runQuery<{
    j: any;
    company: any;
    relatedSkills: any[];
    relatedTechnologies: any[];
  }>(queries.GET_INDIRECT_RECOMMENDATIONS, { candidateId });

  return result.map(row => ({
    job: row.j.properties as Job,
    company: row.company ? (row.company.properties as Company) : null,
    relatedSkills: row.relatedSkills.map(s => s.properties),
    relatedTechnologies: row.relatedTechnologies.map(t => t.properties),
  }));
}
