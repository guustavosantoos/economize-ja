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
    const showInDash = (dto as any).showInDashboard ?? true;
    const cat = await this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        icon: dto.icon || (dto.type === 'income' ? 'payments' : 'shopping_bag'),
        color: dto.color || (dto.type === 'income' ? '#10b981' : '#ef4444'),
        userId,
        isDefault: false,
      },
    });

    if (showInDash === false) {
      await this.prisma.$executeRawUnsafe(
        `UPDATE categories SET show_in_dashboard = false WHERE id = $1`,
        cat.id
      );
      (cat as any).showInDashboard = false;
    } else {
      (cat as any).showInDashboard = true;
    }

    return cat;
  }

  async findAll(userId: string) {
    const categories: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT 
        id, 
        user_id as "userId", 
        name, 
        icon, 
        color, 
        type, 
        is_default as "isDefault", 
        COALESCE(show_in_dashboard, true) as "showInDashboard", 
        created_at as "createdAt"
      FROM categories
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY name ASC
    `, userId);

    if (categories.length === 0) {
      await this.prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({
          ...c,
          isDefault: true,
        })),
        skipDuplicates: true,
      });

      return this.findAll(userId);
    }

    return categories;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.type !== undefined) {
      fields.push(`type = $${idx++}::"TransactionType"`);
      values.push(dto.type);
    }
    if (dto.icon !== undefined) {
      fields.push(`icon = $${idx++}`);
      values.push(dto.icon);
    }
    if (dto.color !== undefined) {
      fields.push(`color = $${idx++}`);
      values.push(dto.color);
    }
    if ((dto as any).showInDashboard !== undefined) {
      fields.push(`show_in_dashboard = $${idx++}`);
      values.push(Boolean((dto as any).showInDashboard));
    }

    if (fields.length === 0) return { count: 0 };

    values.push(id);

    const query = `
      UPDATE categories 
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND (user_id = '${userId}' OR is_default = true OR user_id IS NULL)
    `;

    const count = await this.prisma.$executeRawUnsafe(query, ...values);
    return { count };
  }

  async remove(userId: string, id: string) {
    return this.prisma.category.deleteMany({
      where: { id, OR: [{ userId }, { isDefault: true }] },
    });
  }
}
