import { Get, JsonController } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
class HealthCheckResponse {
  status!: string;
}

@JsonController('/health-check')
export class HealthCheckController {
  @Get('/')
  @OpenAPI({ summary: 'Health check API' })
  @ResponseSchema(HealthCheckResponse)
  async healthCheck() {
    return { status: 'ok' };
  }
}
