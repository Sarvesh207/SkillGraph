import { Request, Response, NextFunction } from 'express';
import * as graphService from '../services/graph.service';
import * as candidateService from '../services/candidate.service';
import * as jobService from '../services/job.service';

export async function getCandidateGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'MISSING_ID', message: 'Candidate ID parameter is required.' });
      return;
    }

    // Verify candidate exists
    const candidate = await candidateService.getCandidateById(id);
    if (!candidate) {
      res.status(404).json({ error: 'CANDIDATE_NOT_FOUND', message: `Candidate with ID ${id} not found.` });
      return;
    }

    const graphData = await graphService.getCandidateGraph(id);
    res.json(graphData);
  } catch (error) {
    next(error);
  }
}

export async function getJobMatchGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const candidateId = req.query.candidateId as string;

    if (!jobId) {
      res.status(400).json({ error: 'MISSING_JOB_ID', message: 'Job ID parameter is required.' });
      return;
    }

    if (!candidateId) {
      res.status(400).json({ error: 'MISSING_CANDIDATE_ID', message: 'candidateId query parameter is required.' });
      return;
    }

    // Verify candidate and job exist
    const [candidate, job] = await Promise.all([
      candidateService.getCandidateById(candidateId),
      jobService.getJobById(jobId),
    ]);

    if (!candidate) {
      res.status(404).json({ error: 'CANDIDATE_NOT_FOUND', message: `Candidate with ID ${candidateId} not found.` });
      return;
    }

    if (!job) {
      res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job with ID ${jobId} not found.` });
      return;
    }

    const graphData = await graphService.getJobMatchGraph(candidateId, jobId);
    res.json(graphData);
  } catch (error) {
    next(error);
  }
}
