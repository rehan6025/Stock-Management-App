import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { name: "Campa Cola 2L" },
    update: {},
    create: { name: "Campa Cola 2L", currentStock: 24, price: 80, imageUrl: null },
  });

  await prisma.product.upsert({
    where: { name: "Campa Orange 500ml" },
    update: {},
    create: {
      name: "Campa Orange 500ml",
      currentStock: 48,
      price: 35,
      imageUrl: null,
    },
  });

  await prisma.product.upsert({
    where: { name: "Energy Can" },
    update: {},
    create: { name: "Energy Can", currentStock: 36, price: 60, imageUrl: null },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

