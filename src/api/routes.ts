import { Router } from 'express';
import fooRouter from './foo-monolith/routes';

const rootRouter = Router();

rootRouter.use('/foo-monolith', fooRouter);
export default rootRouter;
