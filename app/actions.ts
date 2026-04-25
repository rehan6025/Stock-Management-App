"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateStock(input: { productId: string; delta: number }) {
  const { productId, delta } = input;
  if (!Number.isInteger(delta) || delta === 0) return;

  await prisma.product.update({
    where: { id: productId },
    data: { currentStock: { increment: delta } },
  });

  revalidatePath("/");
}

export async function recordSale(input: {
  productId: string;
  quantity: number;
  partyName: string;
  unitPrice: number;
}) {
  const { productId, quantity } = input;
  const partyName = input.partyName.trim();
  if (!Number.isInteger(quantity) || quantity <= 0) return;
  if (!partyName) return;
  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0) return;

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, currentStock: true },
    });
    if (!product) throw new Error("Product not found");
    if (product.currentStock < quantity) throw new Error("Not enough stock");

    const unitPrice = input.unitPrice;
    const totalPrice = unitPrice * quantity;

    await tx.product.update({
      where: { id: productId },
      data: { currentStock: { decrement: quantity } },
    });

    await tx.sale.create({
      data: {
        productId,
        quantity,
        partyName,
        unitPrice,
        totalPrice,
      },
    });
  });

  revalidatePath("/");
}

export async function updateProduct(input: {
  productId: string;
  name: string;
  price: number;
  currentStock: number;
  imageUrl: string | null;
}) {
  const name = input.name.trim();
  const price = input.price;
  const currentStock = input.currentStock;
  const imageUrl = input.imageUrl && input.imageUrl.trim().length ? input.imageUrl.trim() : null;

  if (!name) return;
  if (!Number.isFinite(price) || price < 0) return;
  if (!Number.isInteger(currentStock) || currentStock < 0) return;

  await prisma.product.update({
    where: { id: input.productId },
    data: { name, price, currentStock, imageUrl },
  });

  revalidatePath("/");
}

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const currentStock = Number(formData.get("currentStock") ?? 0);
  const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();
  const imageUrl = imageUrlRaw.length ? imageUrlRaw : null;

  if (!name) return;
  if (!Number.isFinite(price) || price < 0) return;
  if (!Number.isInteger(currentStock) || currentStock < 0) return;

  await prisma.product.create({
    data: { name, price, currentStock, imageUrl },
  });

  revalidatePath("/");
}

export async function deleteProduct(input: { productId: string }) {
  await prisma.product.delete({ where: { id: input.productId } });
  revalidatePath("/");
}

