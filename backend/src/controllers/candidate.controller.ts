import { Request, Response, NextFunction } from 'express';
import * as candidateService from '../services/candidate.service';

export async function getAllCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const candidates = await candidateService.getAllCandidates();
    res.json(candidates);
  } catch (error) {
    next(error);
  }
}

export async function getCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'MISSING_ID', message: 'Candidate ID parameter is required.' });
      return;
    }

    const candidate = await candidateService.getCandidateById(id);
    if (!candidate) {
      res.status(404).json({ error: 'CANDIDATE_NOT_FOUND', message: `Candidate with ID ${id} not found.` });
      return;
    }

    res.json(candidate);
  } catch (error) {
    next(error);
  }
}

export async function getCandidateSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const skills = await candidateService.getCandidateSkills(id);
    res.json(skills);
  } catch (error) {
    next(error);
  }
}
