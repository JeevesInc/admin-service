import { Request, Response } from 'express';
import { getLogger } from '@jeevesinc/jeeves-telemetry';

import { getAllFooLookUp } from '@services';
import { decodeBase64String } from '@utils';

const logger = getLogger();

export const getFoo = async (_req: Request, res: Response) => {
  try {
    const countryLookupData = await getAllFooLookUp();
    // caling some utils function
    const decodeEmail = decodeBase64String('test@tryjeeves.com');
    return res.send({ data: countryLookupData, decodeEmail: decodeEmail, status: true });
  } catch (error) {
    logger.error(error, `Error in getFoo`);
    return res.status(500).json({
      msg: 'some error occurred',
      status: false,
    });
  }
};
