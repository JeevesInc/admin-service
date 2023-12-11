import { Request, Response } from 'express';
import { Body, JsonController, Post, Req, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { StatusCodes } from 'http-status-codes';
import { getLogger } from '@jeevesinc/jeeves-telemetry';
import { BarReqBody, BarResBody } from '@types';
import { getBarResult } from '@services';

const logger = getLogger();
@JsonController('/bar')
export class BarController {
  @Post('/')
  @OpenAPI({ summary: 'Manipulate bar' })
  @ResponseSchema(BarResBody)
  async postBar(
    @Body({ required: true }) body: BarReqBody,
    @Req() _req: Request,
    @Res() res: Response,
  ) {
    try {
      const { stringInput, numberInput } = body;

      logger.info({
        data: {
          stringInput,
          numberInput,
        },
      });

      const { stringOutput, numberOutput } = await getBarResult({
        stringInput,
        numberInput,
      });

      return res.status(StatusCodes.CREATED).send({ stringOutput, numberOutput });
    } catch (error) {
      logger.info(error);
      return res.status(500).json({
        msg: 'some error occurred',
        status: false,
      });
    }
  }
}
