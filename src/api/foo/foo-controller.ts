import { Request, Response } from 'express';
import { Body, Get, JsonController, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { StatusCodes } from 'http-status-codes';
import { getLogger } from '@jeevesinc/jeeves-telemetry';
import { isClientUserAuthorized } from '@middlewares';
import { createFooLookUp, getAllFooLookUp } from '@services';
import { FooReqBody, FooResBody, GetFooResBody } from '@types';
import { decodeBase64String } from '@utils';

const logger = getLogger();

@JsonController('/foo')
export class FooController {
  @Post('/')
  @OpenAPI({ summary: 'Create new Foo' })
  @ResponseSchema(FooResBody)
  async createFoo(
    @Body({ required: true }) body: FooReqBody,
    @Req() _req: Request,
    @Res() res: Response,
  ) {
    try {
      await createFooLookUp(body);
      return res
        .status(StatusCodes.CREATED)
        .send({ msg: 'data inserted successfully', status: true, body: body });
    } catch (error) {
      logger.error(error, `Error in createCountryLookUp payload:${JSON.stringify(body)}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: 'some error occurred',
        status: false,
      });
    }
  }
  @Get('/')
  @OpenAPI({ summary: 'Return a list of Foo', security: [{ 'x-auth-token': [] }] })
  @ResponseSchema(GetFooResBody, { isArray: true })
  @UseBefore(isClientUserAuthorized({}))
  async getFoo(@Req() _req: Request, @Res() res: Response) {
    try {
      const countryLookupData = await getAllFooLookUp();
      // caling some utils function
      const decodeEmail = decodeBase64String('test@tryjeeves.com');
      return res
        .status(StatusCodes.OK)
        .send({ data: countryLookupData, decodeEmail: decodeEmail, status: true });
    } catch (error) {
      logger.info(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: 'some error occurred',
        status: false,
      });
    }
  }
}
