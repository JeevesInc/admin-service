import express from 'express';
import { getFoo } from './controllers/get-foo';

const router = express.Router();

router.get('/', getFoo);

export default router;
