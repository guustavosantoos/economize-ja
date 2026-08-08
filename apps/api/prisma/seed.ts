import { PrismaClient, TransactionType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Test@1234', { memoryCost: 65536, timeCost: 3, parallelism: 4 });
  const user = await prisma.user.create({
    data: {
      email: 'teste@economizeja.com',
      name: 'Teste',
      passwordHash,
      plan: 'pro'
    }
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Alimentação', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Moradia', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Transporte', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Educação', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Lazer', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Saúde', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Vestuário', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Pets', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Outros', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Salário', type: TransactionType.income, userId: user.id } }),
    prisma.category.create({ data: { name: 'Investimentos', type: TransactionType.income, userId: user.id } }),
    prisma.category.create({ data: { name: 'Vendas', type: TransactionType.income, userId: user.id } }),
  ]);

  const expenseCategory = categories.find(c => c.type === 'expense');
  const incomeCategory = categories.find(c => c.type === 'income');

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: i % 3 === 0 ? incomeCategory!.id : expenseCategory!.id,
        type: i % 3 === 0 ? TransactionType.income : TransactionType.expense,
        amount: Math.random() * 1000 + 10,
        description: 'Transação ' + i,
        date
      }
    });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
