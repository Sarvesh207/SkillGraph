import type { Candidate, Skill, JobRecommendation, IndirectRecommendation, GraphData, Job, Company, Technology } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Parses response and maps status codes into standard error exceptions.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errData: any;
    try {
      errData = await response.json();
    } catch {
      errData = { message: 'Network request failed' };
    }
    const error = new Error(errData.message || 'An error occurred while fetching data.');
    (error as any).status = response.status;
    (error as any).code = errData.error || 'SERVER_ERROR';
    throw error;
  }
  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Fetch all candidates.
   */
  getCandidates: () =>
    fetch(`${API_BASE_URL}/candidates`).then(res => handleResponse<Candidate[]>(res)),

  /**
   * Fetch candidate profile.
   */
  getCandidateById: (id: string) =>
    fetch(`${API_BASE_URL}/candidates/${id}`).then(res => handleResponse<Candidate>(res)),

  /**
   * Fetch skills of a candidate.
   */
  getCandidateSkills: (id: string) =>
    fetch(`${API_BASE_URL}/candidates/${id}/skills`).then(res => handleResponse<Skill[]>(res)),

  /**
   * Fetch direct and indirect job recommendations.
   */
  getCandidateRecommendations: (id: string) =>
    fetch(`${API_BASE_URL}/candidates/${id}/recommendations`).then(res =>
      handleResponse<{ direct: JobRecommendation[]; indirect: IndirectRecommendation[] }>(res)
    ),

  /**
   * Fetch all jobs with optional filters.
   */
  getJobs: (filters: { search?: string; location?: string; technology?: string; industry?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetch(`${API_BASE_URL}/jobs${queryString}`).then(res =>
      handleResponse<
        Array<{
          job: Job;
          company: Company | null;
          skills: Skill[];
          technologies: Technology[];
        }>
      >(res)
    );
  },

  /**
   * Fetch a job's complete details.
   */
  getJobById: (id: string) =>
    fetch(`${API_BASE_URL}/jobs/${id}`).then(res =>
      handleResponse<{
        job: Job;
        company: Company | null;
        requiredSkills: Skill[];
        technologies: Technology[];
      }>(res)
    ),

  /**
   * Fetch candidate ego-graph data.
   */
  getCandidateGraph: (id: string) =>
    fetch(`${API_BASE_URL}/graph/candidate/${id}`).then(res => handleResponse<GraphData>(res)),

  /**
   * Fetch specific job match graph.
   */
  getJobMatchGraph: (jobId: string, candidateId: string) =>
    fetch(`${API_BASE_URL}/graph/job/${jobId}?candidateId=${candidateId}`).then(res =>
      handleResponse<GraphData>(res)
    ),

  /**
   * Run api/database health check.
   */
  checkHealth: () =>
    fetch(`${API_BASE_URL}/health`).then(res =>
      handleResponse<{ status: string; database: string }>(res)
    ),
};
export default api;
