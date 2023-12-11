import { UserInstance } from '@jeevesinc/sequelize-db-models';
import { models } from '..';

const { users } = models;

export const getAnyOneUser = (): Promise<UserInstance> => users.findOne();
