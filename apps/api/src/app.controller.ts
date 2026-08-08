import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Status')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check e boas-vindas' })
  getHealth() {
    return {
      name: 'Economize Já API',
      status: 'online',
      version: '1.0.0',
      docs: '/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
