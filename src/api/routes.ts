import { Router } from 'express';
import fooRouter from './foo-monolith/routes';
import adminRoutes from './admin/routes';

const rootRouter = Router();

rootRouter.use('/foo-monolith', fooRouter);
rootRouter.use('/v2/admin', adminRoutes);
export default rootRouter;
