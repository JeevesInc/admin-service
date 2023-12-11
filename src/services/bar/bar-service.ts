import { getLogger } from '@jeevesinc/jeeves-telemetry';
import { getAnyOneUser } from '@jeeves-repositories';
import { IBarGetResultRequestData, IBarResult } from '@types';
import { addTen } from '@utils';

const logger = getLogger();

export const getBarResult = async (
  getResultReqData: IBarGetResultRequestData,
): Promise<IBarResult> => {
  const { stringInput, numberInput } = getResultReqData;
  const user = await getAnyOneUser();
  logger.info({ userId: user.id });
  const result = {
    stringOutput: stringInput,
    numberOutput: addTen(numberInput),
  };
  return result;
};
