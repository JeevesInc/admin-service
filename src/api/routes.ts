import { Router } from 'express';
import adminRoutes from './admin/routes';

const rootRouter = Router();

rootRouter.use('/v2/admin', adminRoutes);
export default rootRouter;
