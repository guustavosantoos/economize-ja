import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria personalizada' })
  create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias padrão e personalizadas do usuário' })
  findAll(@CurrentUser() user: any) {
    return this.categoriesService.findAll(user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria personalizada' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover categoria personalizada' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
