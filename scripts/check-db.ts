import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const stores = await prisma.store.findMany()
  console.log('Stores:', stores.map(s => ({ id: s.id, name: s.name })))
  
  const suppliersCount = await prisma.supplier.count()
  console.log('Suppliers:', suppliersCount)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
