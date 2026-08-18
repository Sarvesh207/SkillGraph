/**
 * Cypher queries relating to Jobs
 */

export const GET_JOB_BY_ID = `
  MATCH (j:Job {id: $jobId})
  OPTIONAL MATCH (j)-[:POSTED_BY]->(comp:Company)
  OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
  OPTIONAL MATCH (j)-[:USES]->(t:Technology)
  RETURN j, comp, collect(DISTINCT s) AS requiredSkills, collect(DISTINCT t) AS technologies
  LIMIT 1
`;

export const GET_ALL_JOBS = `
  MATCH (j:Job)-[:POSTED_BY]->(comp:Company)
  OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
  OPTIONAL MATCH (j)-[:USES]->(t:Technology)
  OPTIONAL MATCH (comp)-[:OPERATES_IN]->(ind:Industry)
  WITH j, comp, collect(DISTINCT s) AS skills, collect(DISTINCT t) AS technologies, collect(DISTINCT ind) AS industries
  WHERE ($search IS NULL OR $search = '' OR toLower(j.title) CONTAINS toLower($search) OR toLower(j.description) CONTAINS toLower($search) OR toLower(comp.name) CONTAINS toLower($search))
    AND ($location IS NULL OR $location = '' OR toLower(j.location) CONTAINS toLower($location) OR toLower(comp.location) CONTAINS toLower($location))
    AND ($technology IS NULL OR $technology = '' OR any(tech IN technologies WHERE tech.name = $technology OR tech.id = $technology))
    AND ($industry IS NULL OR $industry = '' OR any(ind IN industries WHERE ind.name = $industry OR ind.id = $industry))
  RETURN j, comp, skills, technologies
  ORDER BY j.title
`;

export const GET_JOB_RECOMMENDATIONS = `
  MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
  WITH j, COUNT(DISTINCT s) AS matchedSkills
  MATCH (j)-[:REQUIRES]->(required:Skill)
  WITH j, matchedSkills, COUNT(DISTINCT required) AS totalSkills
  OPTIONAL MATCH (j)-[:POSTED_BY]->(comp:Company)
  RETURN 
    j, 
    comp,
    matchedSkills, 
    totalSkills, 
    ROUND(100.0 * matchedSkills / totalSkills) AS matchScore
  ORDER BY matchScore DESC
  LIMIT 10
`;

export const GET_INDIRECT_RECOMMENDATIONS = `
  MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(candidateSkill:Skill)-[:RELATED_TO]->(technology:Technology)<-[:USES]-(j:Job)
  // Ensure we exclude jobs that the candidate already has direct matches for (optional, but shows better recommendations)
  WHERE NOT (j)-[:REQUIRES]->(candidateSkill)
  OPTIONAL MATCH (j)-[:POSTED_BY]->(company:Company)
  RETURN DISTINCT
    j,
    company,
    collect(DISTINCT candidateSkill) AS relatedSkills,
    collect(DISTINCT technology) AS relatedTechnologies
  ORDER BY company.name
  LIMIT 10
`;
