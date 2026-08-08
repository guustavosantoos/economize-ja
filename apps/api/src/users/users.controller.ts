import { Controller, Get, Put, Delete, Body, Req, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do perfil do usuário logado' })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário (ex: nome)' })
  update(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Post('me/export')
  @ApiOperation({ summary: 'Exportar todos os dados do usuário em JSON (LGPD)' })
  exportData(@CurrentUser() user: any, @Req() req: any) {
    return this.usersService.exportData(user.id, req);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Excluir a conta do usuário com soft delete (LGPD)' })
  deleteAccount(@CurrentUser() user: any, @Req() req: any) {
    return this.usersService.deleteAccount(user.id, req);
  }
}
