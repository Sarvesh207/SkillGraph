import { Router } from 'express';
import * as graphController from '../controllers/graph.controller';

const router = Router();

router.get('/candidate/:id', graphController.getCandidateGraph);
router.get('/job/:jobId', graphController.getJobMatchGraph);

export default router;
