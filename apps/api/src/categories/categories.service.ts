import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const DEFAULT_CATEGORIES = [
  // Despesas
  { name: 'Alimentação', icon: 'restaurant', color: '#ef4444', type: 'expense' as const },
  { name: 'Transporte', icon: 'directions_car', color: '#f97316', type: 'expense' as const },
  { name: 'Moradia', icon: 'home', color: '#8b5cf6', type: 'expense' as const },
  { name: 'Saúde', icon: 'medical_services', color: '#ec4899', type: 'expense' as const },
  { name: 'Educação', icon: 'school', color: '#3b82f6', type: 'expense' as const },
  { name: 'Lazer & Entretenimento', icon: 'movie', color: '#06b6d4', type: 'expense' as const },
  { name: 'Compras', icon: 'shopping_bag', color: '#a855f7', type: 'expense' as const },
  { name: 'Contas & Serviços', icon: 'receipt_long', color: '#eab308', type: 'expense' as const },
  { name: 'Outros (Despesas)', icon: 'more_horiz', color: '#64748b', type: 'expense' as const },

  // Receitas
  { name: 'Salário', icon: 'payments', color: '#10b981', type: 'income' as const },
  { name: 'Freelance / Serviços', icon: 'work', color: '#14b8a6', type: 'income' as const },
  { name: 'Investimentos', icon: 'trending_up', color: '#22c55e', type: 'income' as const },
  { name: 'Presentes / Bônus', icon: 'card_giftcard', color: '#f59e0b', type: 'income' as const },
  { name: 'Outras Receitas', icon: 'attach_money', color: '#64748b', type: 'income' as const },
];

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        icon: dto.icon || (dto.type === 'income' ? 'payments' : 'shopping_bag'),
        color: dto.color || (dto.type === 'income' ? '#10b981' : '#ef4444'),
        userId,
        isDefault: false,
      },
    });
  }

  async findAll(userId: string) {
    let categories = await this.prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: { name: 'asc' },
    });

    // Se o banco não possuir categorias padrões, realiza a criação automática dos padrões
    if (categories.length === 0) {
      await this.prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({
          ...c,
          isDefault: true,
        })),
        skipDuplicates: true,
      });

      categories = await this.prisma.category.findMany({
        where: { OR: [{ userId }, { userId: null }] },
        orderBy: { name: 'asc' },
      });
    }

    return categories;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.updateMany({
      where: { id, OR: [{ userId }, { isDefault: true }] },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.category.deleteMany({
      where: { id, OR: [{ userId }, { isDefault: true }] },
    });
  }
}
