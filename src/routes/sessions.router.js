import { Router } from 'express';
import {
  current,
  login,
  register,
} from '../controllers/sessions.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current', current);

export default router;
