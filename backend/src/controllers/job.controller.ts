import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/job.service';
import * as candidateService from '../services/candidate.service';

export async function getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters: jobService.JobFilters = {
      search: req.query.search as string,
      location: req.query.location as string,
      technology: req.query.technology as string,
      industry: req.query.industry as string,
    };

    const jobs = await jobService.getAllJobs(filters);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'MISSING_ID', message: 'Job ID parameter is required.' });
      return;
    }

    const jobDetails = await jobService.getJobById(id);
    if (!jobDetails) {
      res.status(404).json({ error: 'JOB_NOT_FOUND', message: `Job with ID ${id} not found.` });
      return;
    }

    res.json(jobDetails);
  } catch (error) {
    next(error);
  }
}

export async function getCandidateRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    // Run direct and indirect recommendation queries in parallel
    const [direct, indirect] = await Promise.all([
      jobService.getRecommendations(id),
      jobService.getIndirectRecommendations(id),
    ]);

    res.json({
      direct,
      indirect,
    });
  } catch (error) {
    next(error);
  }
}
