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

export interface Technology {
  id: string;
  name: string;
  category: string;
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
  relatedSkills: Skill[];
  relatedTechnologies: Technology[];
}

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
