import { prisma } from "@/lib/prisma";
import { DashboardTabs } from "@/app/components/DashboardTabs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      currentStock: true,
      price: true,
      imageUrl: true,
    },
  });

  const sales = await prisma.sale.findMany({
    orderBy: [{ soldAt: "desc" }],
    take: 30,
    select: {
      id: true,
      soldAt: true,
      quantity: true,
      partyName: true,
      unitPrice: true,
      totalPrice: true,
      product: { select: { name: true } },
    },
  });

  return (
    <DashboardTabs products={products} sales={sales} />
  );
}
