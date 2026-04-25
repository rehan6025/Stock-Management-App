"use client";

import { useMemo, useState, useTransition } from "react";
import {
    createProduct,
    deleteProduct,
    recordSale,
    updateProduct,
    updateStock,
} from "@/app/actions";

type Product = {
    id: string;
    name: string;
    currentStock: number;
    price: number;
    imageUrl: string | null;
};

type Sale = {
    id: string;
    soldAt: Date;
    quantity: number;
    partyName: string;
    unitPrice: number;
    totalPrice: number;
    product: { name: string };
};

function money(n: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(n);
}

export function DashboardTabs({
    products,
    sales,
}: {
    products: Product[];
    sales: Sale[];
}) {
    const [tab, setTab] = useState<"stock" | "inventory" | "sales">("stock");
    const [pending, start] = useTransition();
    const [sellFor, setSellFor] = useState<Product | null>(null);
    const [sellQty, setSellQty] = useState<string>("1");
    const [sellParty, setSellParty] = useState<string>("");
    const [sellPrice, setSellPrice] = useState<string>("");

    const [editFor, setEditFor] = useState<Product | null>(null);
    const [editName, setEditName] = useState<string>("");
    const [editPrice, setEditPrice] = useState<string>("");
    const [editStock, setEditStock] = useState<string>("");
    const [editImageUrl, setEditImageUrl] = useState<string>("");

    const totalEarned = useMemo(
        () => sales.reduce((sum, s) => sum + s.totalPrice, 0),
        [sales],
    );

    return (
        <div className="min-h-dvh">
            <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
                <div className="mx-auto w-full max-w-xl px-4 py-4">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <div className="text-lg font-semibold leading-6">
                                Campa Stock
                            </div>
                            <div className="text-xs text-zinc-400">
                                {products.length} items • {money(totalEarned)}{" "}
                                recent sales
                            </div>
                        </div>
                        {pending ? (
                            <div className="text-xs text-zinc-400">Saving…</div>
                        ) : null}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <TabButton
                            active={tab === "stock"}
                            onClick={() => setTab("stock")}
                        >
                            Stock
                        </TabButton>
                        <TabButton
                            active={tab === "inventory"}
                            onClick={() => setTab("inventory")}
                        >
                            Inventory
                        </TabButton>
                        <TabButton
                            active={tab === "sales"}
                            onClick={() => setTab("sales")}
                        >
                            Sales Sheet
                        </TabButton>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-xl px-4 py-5 pb-24">
                {tab === "stock" ? (
                    <div className="space-y-3">
                        {products.map((p) => (
                            <div
                                key={p.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-base font-semibold">
                                            {p.name}
                                        </div>
                                        <div className="mt-1 text-sm text-zinc-400">
                                            Stock:{" "}
                                            <span className="text-zinc-100 font-semibold">
                                                {p.currentStock}
                                            </span>{" "}
                                            • Price:{" "}
                                            <span className="text-zinc-100 font-semibold">
                                                {money(p.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    <ActionButton
                                        tone="ghost"
                                        onClick={() =>
                                            start(() =>
                                                updateStock({
                                                    productId: p.id,
                                                    delta: -1,
                                                }),
                                            )
                                        }
                                    >
                                        −1
                                    </ActionButton>
                                    <ActionButton
                                        tone="ghost"
                                        onClick={() =>
                                            start(() =>
                                                updateStock({
                                                    productId: p.id,
                                                    delta: +1,
                                                }),
                                            )
                                        }
                                    >
                                        +1
                                    </ActionButton>
                                    <ActionButton
                                        tone="danger"
                                        onClick={() => {
                                            setSellFor(p);
                                            setSellQty("1");
                                            setSellParty("");
                                            setSellPrice(String(p.price));
                                        }}
                                    >
                                        Sell
                                    </ActionButton>
                                </div>
                            </div>
                        ))}

                        {products.length === 0 ? (
                            <EmptyState
                                title="No products yet"
                                body="Add items from the Inventory tab."
                            />
                        ) : null}
                    </div>
                ) : null}

                {tab === "inventory" ? (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
                            <div className="text-base font-semibold">
                                Add New Item
                            </div>
                            <form
                                action={createProduct}
                                className="mt-4 space-y-3"
                            >
                                <Field label="Name">
                                    <input
                                        name="name"
                                        className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                        placeholder="Campa Cola 2L"
                                        required
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Price (₹)">
                                        <input
                                            name="price"
                                            inputMode="decimal"
                                            className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                            placeholder="80"
                                            required
                                        />
                                    </Field>
                                    <Field label="Start Stock">
                                        <input
                                            name="currentStock"
                                            inputMode="numeric"
                                            className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                            placeholder="24"
                                            required
                                        />
                                    </Field>
                                </div>

                                <Field label="Image URL (optional)">
                                    <input
                                        name="imageUrl"
                                        className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                        placeholder="https://…"
                                    />
                                </Field>

                                <button
                                    className="h-12 w-full rounded-xl bg-emerald-500 text-zinc-950 font-semibold active:scale-[0.99]"
                                    type="submit"
                                >
                                    Add Item
                                </button>
                            </form>
                        </div>

                        <div className="space-y-3">
                            {products.map((p) => (
                                <div
                                    key={p.id}
                                    className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-semibold">
                                                {p.name}
                                            </div>
                                            <div className="text-sm text-zinc-400">
                                                Stock {p.currentStock} •{" "}
                                                {money(p.price)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditFor(p);
                                                    setEditName(p.name);
                                                    setEditPrice(
                                                        String(p.price),
                                                    );
                                                    setEditStock(
                                                        String(p.currentStock),
                                                    );
                                                    setEditImageUrl(
                                                        p.imageUrl ?? "",
                                                    );
                                                }}
                                                className="h-12 min-w-[44px] rounded-xl border border-zinc-700 bg-zinc-950 px-4 font-semibold text-zinc-50 active:scale-[0.99]"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    start(() =>
                                                        deleteProduct({
                                                            productId: p.id,
                                                        }),
                                                    )
                                                }
                                                className="h-12 min-w-[44px] rounded-xl border border-zinc-700 bg-zinc-950 px-4 font-semibold text-red-200 active:scale-[0.99]"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 ? (
                                <EmptyState
                                    title="Inventory is empty"
                                    body="Add your first item above."
                                />
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {tab === "sales" ? (
                    <div className="space-y-3">
                        {sales.map((s) => (
                            <div
                                key={s.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="truncate font-semibold">
                                                {s.product.name}
                                            </div>
                                            <span className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs font-semibold text-zinc-200">
                                                Qty {s.quantity}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-zinc-300">
                                            Party:{" "}
                                            <span className="font-semibold text-zinc-50">
                                                {s.partyName}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-zinc-400">
                                            Unit {money(s.unitPrice)}
                                        </div>
                                        <div className="mt-1 text-xs text-zinc-400">
                                            {new Date(
                                                s.soldAt,
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-semibold">
                                            {money(s.totalPrice)}
                                        </div>
                                        <div className="text-xs text-zinc-400">
                                            Total
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {sales.length === 0 ? (
                            <EmptyState
                                title="No sales yet"
                                body="Use Sell buttons from the Stock tab."
                            />
                        ) : null}
                    </div>
                ) : null}
            </main>

            {sellFor ? (
                <Modal
                    title={`Sell: ${sellFor.name}`}
                    onClose={() => setSellFor(null)}
                    actions={
                        <>
                            <button
                                onClick={() => setSellFor(null)}
                                className="h-12 min-w-[44px] rounded-xl border border-zinc-700 bg-zinc-950 px-4 font-semibold text-zinc-50 active:scale-[0.99]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const qty = Number(sellQty);
                                    const party = sellParty.trim();
                                    const unitPrice = Number(sellPrice);
                                    if (!Number.isInteger(qty) || qty <= 0)
                                        return;
                                    if (!party) return;
                                    if (
                                        !Number.isFinite(unitPrice) ||
                                        unitPrice < 0
                                    )
                                        return;
                                    const pid = sellFor.id;
                                    setSellFor(null);
                                    start(() =>
                                        recordSale({
                                            productId: pid,
                                            quantity: qty,
                                            partyName: party,
                                            unitPrice,
                                        }),
                                    );
                                }}
                                className="h-12 min-w-[44px] rounded-xl bg-emerald-500 px-4 font-semibold text-zinc-950 active:scale-[0.99]"
                            >
                                Confirm Sale
                            </button>
                        </>
                    }
                >
                    <div className="space-y-3">
                        <Field label="Quantity">
                            <input
                                value={sellQty}
                                onChange={(e) => setSellQty(e.target.value)}
                                inputMode="numeric"
                                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                placeholder="1"
                            />
                        </Field>
                        <Field label="Price (₹) for this sale">
                            <input
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                inputMode="decimal"
                                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                placeholder="80"
                            />
                        </Field>
                        <Field label="Party name">
                            <input
                                value={sellParty}
                                onChange={(e) => setSellParty(e.target.value)}
                                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                placeholder="Shop / Customer"
                            />
                        </Field>
                    </div>
                </Modal>
            ) : null}

            {editFor ? (
                <Modal
                    title={`Edit: ${editFor.name}`}
                    onClose={() => setEditFor(null)}
                    actions={
                        <>
                            <button
                                onClick={() => setEditFor(null)}
                                className="h-12 min-w-[44px] rounded-xl border border-zinc-700 bg-zinc-950 px-4 font-semibold text-zinc-50 active:scale-[0.99]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const price = Number(editPrice);
                                    const stock = Number(editStock);
                                    if (!Number.isFinite(price) || price < 0)
                                        return;
                                    if (!Number.isInteger(stock) || stock < 0)
                                        return;
                                    const pid = editFor.id;
                                    setEditFor(null);
                                    start(() =>
                                        updateProduct({
                                            productId: pid,
                                            name: editName,
                                            price,
                                            currentStock: stock,
                                            imageUrl: editImageUrl.trim().length
                                                ? editImageUrl.trim()
                                                : null,
                                        }),
                                    );
                                }}
                                className="h-12 min-w-[44px] rounded-xl bg-emerald-500 px-4 font-semibold text-zinc-950 active:scale-[0.99]"
                            >
                                Save
                            </button>
                        </>
                    }
                >
                    <div className="space-y-3">
                        <Field label="Name">
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Price (₹)">
                                <input
                                    value={editPrice}
                                    onChange={(e) =>
                                        setEditPrice(e.target.value)
                                    }
                                    inputMode="decimal"
                                    className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                />
                            </Field>
                            <Field label="Stock">
                                <input
                                    value={editStock}
                                    onChange={(e) =>
                                        setEditStock(e.target.value)
                                    }
                                    inputMode="numeric"
                                    className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                />
                            </Field>
                        </div>
                        <Field label="Image URL (optional)">
                            <input
                                value={editImageUrl}
                                onChange={(e) =>
                                    setEditImageUrl(e.target.value)
                                }
                                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:ring-2 focus:ring-emerald-400/40"
                                placeholder="https://…"
                            />
                        </Field>
                    </div>
                </Modal>
            ) : null}
        </div>
    );
}

function Modal({
    title,
    children,
    actions,
    onClose,
}: {
    title: string;
    children: React.ReactNode;
    actions: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
            <button
                aria-label="Close"
                className="absolute inset-0"
                onClick={onClose}
            />
            <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-semibold">{title}</div>
                    <button
                        onClick={onClose}
                        className="h-10 min-w-[44px] rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 font-semibold text-zinc-200"
                    >
                        ✕
                    </button>
                </div>
                <div className="mt-4">{children}</div>
                <div className="mt-5 flex gap-2 justify-end">{actions}</div>
            </div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={[
                "h-12 rounded-xl border text-sm font-semibold",
                "min-w-[44px] active:scale-[0.99]",
                active
                    ? "border-emerald-400/60 bg-emerald-500 text-zinc-950"
                    : "border-zinc-800 bg-zinc-900/30 text-zinc-100",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function ActionButton({
    tone,
    onClick,
    children,
}: {
    tone: "ghost" | "danger";
    onClick: () => void;
    children: React.ReactNode;
}) {
    const base =
        "h-12 min-w-[44px] rounded-xl border px-4 font-semibold active:scale-[0.99]";
    const cls =
        tone === "danger"
            ? "border-red-900/60 bg-red-500 text-zinc-950"
            : "border-zinc-700 bg-zinc-950 text-zinc-50";

    return (
        <button onClick={onClick} className={`${base} ${cls}`}>
            {children}
        </button>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block text-sm font-medium text-zinc-200">
            {label}
            <div className="mt-2">{children}</div>
        </label>
    );
}

function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-center">
            <div className="font-semibold">{title}</div>
            <div className="mt-1 text-sm text-zinc-400">{body}</div>
        </div>
    );
}
