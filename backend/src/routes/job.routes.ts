import { Router } from 'express';
import * as jobController from '../controllers/job.controller';

const router = Router();

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

export default router;
