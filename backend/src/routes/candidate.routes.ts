import { Router } from 'express';
import * as candidateController from '../controllers/candidate.controller';
import * as jobController from '../controllers/job.controller';

const router = Router();

router.get('/', candidateController.getAllCandidates);
router.get('/:id', candidateController.getCandidate);
router.get('/:id/skills', candidateController.getCandidateSkills);
router.get('/:id/recommendations', jobController.getCandidateRecommendations);

export default router;
